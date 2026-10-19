const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Path to sample fallback games
const sampleGamesPath = path.join(__dirname, 'data', 'sample-games.json');
let sampleGames = { success: true, data: [] };
try {
  if (fs.existsSync(sampleGamesPath)) {
    sampleGames = JSON.parse(fs.readFileSync(sampleGamesPath, 'utf8'));
  }
} catch (err) {
  console.error('Failed to load sample games:', err.message);
}

// In-memory cache for live Gamezop API response
let apiCache = {
  data: null,
  timestamp: 0,
  tokenUsed: null
};
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Helper to get configured token
function getApiToken(req) {
  // 1. Authorization header from client
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const headerToken = authHeader.replace('Bearer ', '').trim();
    if (headerToken && headerToken !== '<token>' && headerToken !== 'YOUR_TOKEN_HERE') {
      return headerToken;
    }
  }

  // 2. Query param ?token=...
  if (req.query && req.query.token) {
    const qToken = req.query.token.trim();
    if (qToken && qToken !== '<token>') {
      return qToken;
    }
  }

  // 3. Environment variable GAMEZOP_TOKEN
  const envToken = process.env.GAMEZOP_TOKEN;
  if (envToken && envToken.trim() && envToken !== '<token>') {
    return envToken.trim();
  }

  return null;
}

// Endpoint: Fetch Games
app.get('/api/games', async (req, res) => {
  const token = getApiToken(req);
  const forceRefresh = req.query.refresh === 'true';

  // If a valid token is provided, fetch from live Gamezop API
  if (token) {
    const isCacheValid = 
      !forceRefresh && 
      apiCache.data && 
      apiCache.tokenUsed === token && 
      (Date.now() - apiCache.timestamp < CACHE_TTL_MS);

    if (isCacheValid) {
      return res.json({
        success: true,
        source: 'live (cached)',
        data: apiCache.data,
        total: apiCache.data.length,
        cachedAt: new Date(apiCache.timestamp).toISOString()
      });
    }

    try {
      console.log('Fetching live games from Gamezop v3 API with provided token...');
      const response = await fetch('https://api.gamezop.com/v3/games', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const json = await response.json().catch(() => null);

      if (!response.ok || (json && json.success === false)) {
        const errorMsg = (json && json.message) || `Gamezop API error (HTTP ${response.status})`;
        console.warn('Gamezop API error:', errorMsg);
        return res.status(response.status >= 400 && response.status < 500 ? response.status : 502).json({
          success: false,
          error: errorMsg,
          status: response.status,
          message: 'Unable to fetch games with this Bearer token. You can switch to Demo Mode or enter a valid publisher token.',
          raw: json
        });
      }

      if (json && Array.isArray(json.data)) {
        // Update cache
        apiCache = {
          data: json.data,
          timestamp: Date.now(),
          tokenUsed: token
        };

        return res.json({
          success: true,
          source: 'live',
          data: json.data,
          total: json.data.length,
          fetchedAt: new Date().toISOString()
        });
      } else {
        return res.status(502).json({
          success: false,
          error: 'Unexpected response format from Gamezop API',
          raw: json
        });
      }
    } catch (err) {
      console.error('Error contacting Gamezop API:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Network error connecting to https://api.gamezop.com/v3/games',
        message: err.message
      });
    }
  }

  // If no token is provided, return rich demo catalog
  return res.json({
    success: true,
    source: 'demo',
    message: 'Running in Demo Mode with 250+ preloaded Gamezop games. Connect your API token in Settings to fetch your live publisher catalog.',
    data: sampleGames.data,
    total: sampleGames.data.length
  });
});

// Endpoint: Check API & Token status
app.get('/api/status', (req, res) => {
  const currentToken = process.env.GAMEZOP_TOKEN ? process.env.GAMEZOP_TOKEN.trim() : null;
  const hasToken = Boolean(currentToken && currentToken !== '<token>');

  res.json({
    hasToken,
    tokenPreview: hasToken ? `${currentToken.slice(0, 4)}••••${currentToken.slice(-4)}` : null,
    source: hasToken ? 'live' : 'demo',
    isCached: Boolean(apiCache.data),
    cacheAgeSeconds: apiCache.timestamp ? Math.round((Date.now() - apiCache.timestamp) / 1000) : null,
    sampleGamesCount: sampleGames.data.length
  });
});

// Endpoint: Update token in .env and runtime
app.post('/api/config/token', async (req, res) => {
  const { token } = req.body;
  if (!token || typeof token !== 'string' || !token.trim()) {
    return res.status(400).json({ success: false, message: 'Please provide a non-empty token string.' });
  }

  const cleanToken = token.trim();

  // Test token with Gamezop API
  try {
    const testResponse = await fetch('https://api.gamezop.com/v3/games', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Accept': 'application/json'
      }
    });

    const testJson = await testResponse.json().catch(() => null);

    if (!testResponse.ok || (testJson && testJson.success === false)) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: (testJson && testJson.message) || `Token verification failed (HTTP ${testResponse.status}).`,
        raw: testJson
      });
    }

    // Token is valid! Update process.env and save to .env file
    process.env.GAMEZOP_TOKEN = cleanToken;
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      if (/GAMEZOP_TOKEN=.*/.test(envContent)) {
        envContent = envContent.replace(/GAMEZOP_TOKEN=.*/, `GAMEZOP_TOKEN=${cleanToken}`);
      } else {
        envContent += `\nGAMEZOP_TOKEN=${cleanToken}\n`;
      }
    } else {
      envContent = `GAMEZOP_TOKEN=${cleanToken}\nPORT=${PORT}\n`;
    }
    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

    // Populate cache with live data
    if (testJson && Array.isArray(testJson.data)) {
      apiCache = {
        data: testJson.data,
        timestamp: Date.now(),
        tokenUsed: cleanToken
      };
    }

    return res.json({
      success: true,
      verified: true,
      message: 'Token verified and saved successfully! Game catalog loaded.',
      totalGames: testJson.data ? testJson.data.length : 0
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Failed to test token against Gamezop API: ${err.message}`
    });
  }
});

// Endpoint: Minecraft Server Status (Displays real data only when a valid status API / server IP is configured)
app.get('/api/server-status', async (req, res) => {
  const customApiUrl = process.env.STATUS_API_URL && process.env.STATUS_API_URL.trim();
  const serverIp = process.env.MINECRAFT_SERVER_IP && process.env.MINECRAFT_SERVER_IP.trim();

  // If no server IP or custom status API is configured, return configured: false
  if (!customApiUrl && !serverIp) {
    return res.json({
      configured: false,
      status: 'unconfigured',
      message: 'Status API is not configured. Configure a Minecraft Server IP or Status API endpoint in settings to view live data.'
    });
  }

  // 1. If a custom status API URL is provided
  if (customApiUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const apiRes = await fetch(customApiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!apiRes.ok) {
        return res.json({
          configured: true,
          online: false,
          error: `API returned HTTP ${apiRes.status}`,
          endpoint: customApiUrl
        });
      }
      const data = await apiRes.json();
      return res.json({
        configured: true,
        source: 'custom_api',
        data
      });
    } catch (err) {
      return res.json({
        configured: true,
        online: false,
        error: err.message,
        endpoint: customApiUrl
      });
    }
  }

  // 2. Query real Minecraft server status using standard status provider
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    // Use api.mcstatus.io (fast, reliable public java status API)
    const mcRes = await fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(serverIp)}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (mcRes.ok) {
      const data = await mcRes.json();
      return res.json({
        configured: true,
        online: Boolean(data.online),
        serverIp,
        players: data.players || { online: 0, max: 0 },
        version: data.version ? (data.version.name_clean || data.version.name_raw || data.version.name) : '1.8 - 1.21.x',
        motd: data.motd ? (data.motd.clean || data.motd.raw) : 'CrackEx Network • The Premier Esports Experience',
        icon: data.icon || null,
        latency: data.latency || null,
        fetchedAt: new Date().toISOString()
      });
    } else {
      // Fallback to mcsrvstat
      const fbController = new AbortController();
      const fbTimeout = setTimeout(() => fbController.abort(), 5000);
      const fbRes = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(serverIp)}`, {
        signal: fbController.signal
      });
      clearTimeout(fbTimeout);
      const fbData = await fbRes.json();
      return res.json({
        configured: true,
        online: Boolean(fbData.online),
        serverIp,
        players: fbData.players || { online: 0, max: 0 },
        version: fbData.version || '1.8 - 1.21.x',
        motd: fbData.motd ? (fbData.motd.clean ? fbData.motd.clean.join(' ') : '') : 'CrackEx Network',
        icon: fbData.icon || null,
        latency: null,
        fetchedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    return res.json({
      configured: true,
      online: false,
      serverIp,
      error: `Could not reach server status: ${err.message}`,
      fetchedAt: new Date().toISOString()
    });
  }
});

// Endpoint: Update Minecraft Server IP / Status API
app.post('/api/config/server-ip', (req, res) => {
  const { serverIp, statusApiUrl } = req.body;
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

  if (serverIp !== undefined) {
    const cleanIp = (serverIp || '').trim();
    if (cleanIp) {
      process.env.MINECRAFT_SERVER_IP = cleanIp;
      if (/MINECRAFT_SERVER_IP=.*/.test(envContent)) {
        envContent = envContent.replace(/MINECRAFT_SERVER_IP=.*/, `MINECRAFT_SERVER_IP=${cleanIp}`);
      } else {
        envContent += `\nMINECRAFT_SERVER_IP=${cleanIp}\n`;
      }
    } else {
      delete process.env.MINECRAFT_SERVER_IP;
      envContent = envContent.replace(/MINECRAFT_SERVER_IP=.*/g, '');
    }
  }

  if (statusApiUrl !== undefined) {
    const cleanUrl = (statusApiUrl || '').trim();
    if (cleanUrl) {
      process.env.STATUS_API_URL = cleanUrl;
      if (/STATUS_API_URL=.*/.test(envContent)) {
        envContent = envContent.replace(/STATUS_API_URL=.*/, `STATUS_API_URL=${cleanUrl}`);
      } else {
        envContent += `\nSTATUS_API_URL=${cleanUrl}\n`;
      }
    } else {
      delete process.env.STATUS_API_URL;
      envContent = envContent.replace(/STATUS_API_URL=.*/g, '');
    }
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
  res.json({
    success: true,
    serverIp: process.env.MINECRAFT_SERVER_IP || null,
    statusApiUrl: process.env.STATUS_API_URL || null,
    configured: Boolean(process.env.MINECRAFT_SERVER_IP || process.env.STATUS_API_URL)
  });
});

// Endpoint: Reset to demo mode / Clear token
app.post('/api/config/clear-token', (req, res) => {
  delete process.env.GAMEZOP_TOKEN;
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/GAMEZOP_TOKEN=.*/g, '');
    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
  }
  apiCache = { data: null, timestamp: 0, tokenUsed: null };
  res.json({ success: true, message: 'Switched back to Demo Mode.' });
});

// Single-page fallback for any non-API route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`⚔️ CrackEx Network Portal is running at:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`===============================================`);
});
