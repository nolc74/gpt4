export const GAME_CONFIG = Object.freeze({
  title: "마력탄: 유물의 계승자",
  floor: 1,
  autoFireInterval: 0.5,
  projectileSpeed: 520,
  projectileRadius: 7,
  playerMoveSpeed: 230,
  monsterSpawnLimit: 6,
  relicKeyDropChance: 0.01
});

export const INITIAL_PLAYER = Object.freeze({
  level: 1,
  exp: 0,
  expToNext: 100,
  gold: 0,
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  attack: 10,
  attackSpeed: 2,
  vitality: 1,
  magic: 1,
  strength: 1,
  agility: 1,
  sense: 1,
  spirit: 1,
  kills: 0,
  relicKeys: 0,
  relics: []
});

export const MONSTERS = Object.freeze({
  meadowHare: {
    id: "MON_001",
    name: "초원의 뿔토끼",
    level: 1,
    hp: 55,
    attack: 5,
    defense: 1,
    exp: 12,
    gold: 6,
    speed: 43,
    radius: 19,
    color: "#c4a9df",
    abilities: []
  },
  manaSlime: {
    id: "MON_002",
    name: "마력 이슬 슬라임",
    level: 1,
    hp: 78,
    attack: 4,
    defense: 2,
    exp: 16,
    gold: 8,
    speed: 29,
    radius: 22,
    color: "#77c9c3",
    abilities: ["slow"]
  }
});

export function expRequired(level) {
  return Math.ceil(100 * Math.pow(level, 1.5));
}
