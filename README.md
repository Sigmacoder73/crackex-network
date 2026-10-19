# ⚔️ CrackEx Network - Official Website

The official, high-performance web platform for **CrackEx Network** — the premier competitive Minecraft server.

Built with an authentic visual identity directly derived from the official CrackEx Network logo: **Obsidian Black, Deep Plum, Vibrant Hot Pink, Bright Logo Pink, Brilliant Golden Yellow, Rich Golden Orange, and Warm White**.

---

## 🎨 Official Color Palette & Design System

| Color Token | Hex Code | Role in Brand Identity |
| :--- | :--- | :--- |
| **Obsidian Black** | `#080609` | Dominant primary background |
| **Deep Plum** | `#241025` | Dimensional panels, borders, beveled outlines, layered surfaces |
| **Vibrant Hot Pink** | `#FF168F` | Primary accent, primary CTA buttons, interactive glows |
| **Bright Logo Pink** | `#F43EAA` | Gradients, radiant highlights, and active states |
| **Brilliant Golden Yellow** | `#FFE82E` | Key headings, icons, CTA accents, sword aesthetics |
| **Rich Golden Orange** | `#FF9F0A` | Gradient shadows, 3D depth bevels |
| **Warm White** | `#FFF9E8` | High-contrast readable typography |

---

## 🚀 Quick Start

The portal runs via Node.js Express on port `3000`:

```bash
# 1. Install dependencies
npm install

# 2. Run CrackEx Network
npm start
```

Then visit:
👉 **`http://localhost:3000`**

---

## 🌐 Server Telemetry & Configuration

- **Default Server IP**: `mc.crackex.xyz` (Java Port: `25565`, Bedrock Port: `19132`)
- **Official Discord**: [https://crackex.xyz/discord](https://crackex.xyz/discord)
- **Server Status Panel**: Displays real data when a valid Minecraft server or Status API is configured.
- When unconfigured, it runs in graceful **Standby Mode** without showing misleading data.
- You can configure the live Minecraft server IP or custom status endpoint from the in-app **Settings (⚙️)** modal or via `.env`:

```env
MINECRAFT_SERVER_IP=mc.crackex.xyz
STATUS_API_URL=
PORT=3000
```

---

## 🎮 Game Modes

1. 🌲 **Survival** - Enhanced semi-vanilla survival with land claiming, player warps, and player-driven economy.
2. ❤️‍🔥 **Lifesteal** - High-stakes survival where eliminating enemies steals their maximum hearts.
3. 🔮 **More Coming Soon** - Exciting new gamemodes and competitive arenas currently in development.
