const fs = require('fs');
const path = require('path');

const rawFile = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\d891ea13-8765-4f1b-a6a3-41a69f95d033\\scratch\\all_games.json';
const targetDir = path.join(__dirname, 'data');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const rawList = JSON.parse(fs.readFileSync(rawFile, 'utf8'));

function inferCategory(name, desc) {
  const text = (name + ' ' + desc).toLowerCase();
  if (/solitaire|chess|mahjong|sudoku|puzzle|gems|trivia|crossword|math|word|brain|divide|merge/.test(text)) {
    return { id: 2, name: 'Puzzle' };
  }
  if (/ludo|carrom|card|blackjack|board|dice|domino|rummy/.test(text)) {
    return { id: 5, name: 'Board & Card' };
  }
  if (/cricket|racing|car |cars|drift|penalty|football|soccer|basket|sports|speed|skate/.test(text)) {
    return { id: 4, name: 'Sports & Racing' };
  }
  if (/fight|siege|viking|battle|war|assassin|hunter|shoot|sniper|gun|zombie|combat|action|flight|sword/.test(text)) {
    return { id: 3, name: 'Action' };
  }
  if (/salon|dress|fashion|chic|spa|care|makeup|cooking|chef|bakery|baby|cute|pet/.test(text)) {
    return { id: 6, name: 'Casual' };
  }
  if (/bubble|runner|dash|jump|hop|bounce|crush|fruit|arcade|tap|brick|blast|stack/.test(text)) {
    return { id: 1, name: 'Arcade' };
  }
  return { id: 7, name: 'Strategy' };
}

function inferOrientation(name, desc) {
  const text = (name + ' ' + desc).toLowerCase();
  if (/solitaire|bubble|stack|runner|jump|dash|tap|swipe|crush|salon|dress/.test(text)) {
    return 'portrait';
  }
  return 'landscape';
}

const formatted = rawList.map((g) => {
  const category = inferCategory(g.name || '', g.description || '');
  const orientation = inferOrientation(g.name || '', g.description || '');
  const code = g.code;
  return {
    id: g.id || undefined,
    code: code,
    url: `https://www.gamezop.com/g/${code}`,
    name: g.name || 'Game ' + code,
    description: g.description || 'Enjoy playing ' + (g.name || 'this game') + ' instantly in your browser!',
    screen_orientation: orientation,
    has_integrated_ads: true,
    category: category,
    playCount: g.playCount || '1M+',
    stats: g.stats || {
      averageRating: 4.2,
      playCount: 1500000,
      likeCount: 950
    },
    images: {
      cover: `https://static.gamezop.com/${code}/cover.jpg`,
      brick: `https://static.gamezop.com/${code}/brick.png`,
      thumb: `https://static.gamezop.com/${code}/thumb.png`,
      wall: `https://static.gamezop.com/${code}/wall.png`,
      square: `https://static.gamezop.com/${code}/square.png`,
      tall: `https://static.gamezop.com/${code}/450x800.png`,
      screenshots: [
        `https://static.gamezop.com/${code}/game-1.png`,
        `https://static.gamezop.com/${code}/game-2.png`
      ]
    }
  };
});

// Also make sure Hextris is included at top or near top
if (!formatted.some(g => g.code === 'Ey5Wzu1MZ9l')) {
  formatted.unshift({
    code: 'Ey5Wzu1MZ9l',
    url: 'https://www.gamezop.com/g/Ey5Wzu1MZ9l',
    name: 'Hextris',
    description: 'Rotate the Hexagon to match colours, prevent the blocks from stacking on incorrect counterparts.',
    screen_orientation: 'portrait',
    has_integrated_ads: true,
    category: { id: 1, name: 'Arcade' },
    playCount: '15M',
    stats: { averageRating: 4.5, playCount: 15200000, likeCount: 8400 },
    images: {
      cover: 'https://static.gamezop.com/Ey5Wzu1MZ9l/cover.jpg',
      brick: 'https://static.gamezop.com/Ey5Wzu1MZ9l/brick.png',
      thumb: 'https://static.gamezop.com/Ey5Wzu1MZ9l/thumb.png',
      wall: 'https://static.gamezop.com/Ey5Wzu1MZ9l/wall.png',
      square: 'https://static.gamezop.com/Ey5Wzu1MZ9l/square.png',
      tall: 'https://static.gamezop.com/Ey5Wzu1MZ9l/450x800.png',
      screenshots: []
    }
  });
}

const finalData = {
  success: true,
  data: formatted
};

fs.writeFileSync(path.join(__dirname, 'data', 'sample-games.json'), JSON.stringify(finalData, null, 2));
console.log(`Successfully generated data/sample-games.json with ${formatted.length} games!`);
