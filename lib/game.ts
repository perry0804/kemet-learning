import powerRows from '../data/powers.json';
import godRows from '../data/gods.json';
import mapData from '../data/map.json';
import diRows from '../data/di.json';

export type Color = '红' | '蓝' | '白' | '黑' | '琥珀';
export type Zone = {
  id: string;
  name: string;
  type: 'district' | 'desert' | 'temple' | 'sanctuary';
  x: number;
  y: number;
  city?: number | null;
  district?: number | null;
  obelisk?: boolean;
  port?: 'trade' | 'military' | null;
  portCity?: number | null;
  income?: number;
  delta?: boolean;
  neighbors: string[];
};
export const ZONES: Zone[] = mapData.zones as Zone[];
export const zone = (id: string) => ZONES.find((z) => z.id === id)!;
export const COLORS: Color[] = ['红', '蓝', '白', '黑', '琥珀'];
export const FACTION_COLORS = [
  '#bd7539',
  '#788b58',
  '#a86346',
  '#53788b',
  '#748277',
  '#806885',
];
export const POWERS = powerRows.filter((p) => p.category === '常规');
export const GODS = godRows;
export const tile = (id: string) => POWERS.find((t) => t.id === id)!;
export const SLOTS = [
  { name: '移动', action: 'move', row: 3 },
  { name: '招募', action: 'recruit', row: 3 },
  { name: '建造', action: 'build', row: 2 },
  { name: '移动', action: 'move', row: 2 },
  { name: '祈祷', action: 'pray', row: 2 },
  { name: '购买', action: 'buy', row: 1 },
  { name: '购买', action: 'buy', row: 1 },
  { name: '购买', action: 'buy', row: 1 },
  { name: '祈祷', action: 'pray', row: 1 },
] as const;
export type BattleCard = {
  id: string;
  name: string;
  strength: number;
  damage: number;
  shield: number;
  selfDamage?: number;
  trueDamage?: number;
  absolute?: number;
  immune?: boolean;
  returnAll?: boolean;
};
export const CARDS: BattleCard[] = [
  { id: 'b0', name: '强攻', strength: 4, damage: 1, shield: 0 },
  { id: 'b1', name: '突击', strength: 3, damage: 2, shield: 0 },
  { id: 'b2', name: '杀伤', strength: 1, damage: 3, shield: 0 },
  { id: 'b3', name: '攻守兼备', strength: 2, damage: 2, shield: 1 },
  { id: 'b4', name: '坚守', strength: 2, damage: 0, shield: 2 },
  { id: 'b5', name: '稳进', strength: 3, damage: 0, shield: 1 },
  {
    id: 'b6',
    name: '拼死一搏',
    strength: 5,
    damage: 0,
    shield: 0,
    selfDamage: 2,
  },
  { id: 'b7', name: '盾墙', strength: 1, damage: 1, shield: 3 },
  { id: 'chariot', name: '战车风暴', strength: 3, damage: 3, shield: 0 },
  { id: 'tortoise', name: '龟甲防御', strength: 3, damage: 0, shield: 3 },
  {
    id: 'onyx',
    name: '黑玛瑙之盾',
    strength: 2,
    damage: 0,
    shield: 0,
    immune: true,
  },
  {
    id: 'sobek',
    name: '索贝克之怒',
    strength: 4,
    damage: 0,
    shield: 0,
    returnAll: true,
  },
];
export const card = (id: string) => CARDS.find((c) => c.id === id)!;
export type DI = {
  id: string;
  name: string;
  phase: 'battle' | 'day' | 'move';
  cost: number;
  count: number;
  strength?: number;
  damage?: number;
  shield?: number;
  recruit?: number;
  pp?: number;
  move?: number;
  rain?: boolean;
  transfer?: boolean;
  effect: string;
};
export const DI_CARDS: DI[] = diRows as DI[];
export const di = (id: string) =>
  DI_CARDS.find((d) => d.id === id.split(':')[0]);
export type Army = {
  id: string;
  owner: number;
  zone: string;
  n: number;
  kind: 'troop' | 'god';
  creature?: string;
  servants: string[];
};
export type Player = {
  id: number;
  god: number;
  city: number;
  pp: number;
  vp: number;
  reserve: number;
  pyramids: { color: Color | null; level: number; zone: string }[];
  powers: string[];
  hand: string[];
  deck: string[];
  played: string[];
  burned: string[];
  di: string[];
  veterans: number;
  used: { slot: number; kind: 'normal' | 'silver' }[];
  goldUsed: boolean;
  silverUsed: boolean;
  repeatUsed: boolean;
  bought: Color[];
  godUnlocked: boolean;
};
export type Battle = {
  location: string;
  attacker: string;
  defender: string;
  attackerOwner: number;
  defenderOwner: number;
  aiCards: Record<string, { play: string; burn: string; di: string[] }>;
  choices: Record<string, { play: string; burn: string; di: string[] }>;
  stage: 'choose' | 'aftermath';
  result?: BattleResult;
  origin: string;
};
export type BattleResult = {
  aStrength: number;
  dStrength: number;
  aDamage: number;
  dDamage: number;
  aShield: number;
  dShield: number;
  aLoss: number;
  dLoss: number;
  aLeft: number;
  dLeft: number;
  winner: number;
  battlePoints: number;
  bonusPoints: number;
  aVeterans: number;
  dVeterans: number;
  playA: string;
  playD: string;
  notes: string[];
};
export type Game = {
  version: 2;
  phase: 'setup' | 'day' | 'battle' | 'night' | 'order' | 'finished';
  round: number;
  players: Player[];
  armies: Army[];
  market: Record<string, number>;
  order: number[];
  cursor: number;
  normalDone: boolean;
  goldMode?: string;
  pending?: Battle;
  battleQueue: { a: string; d: string; origin: string }[];
  rise: boolean;
  winner: number | null;
  logs: { id: number; text: string; round: number }[];
  seed: number;
  nextId: number;
  diDeck: string[];
  diDiscard: string[];
  orderDraft?: {
    pickers: number[];
    index: number;
    available: number[];
    chosen: Record<number, number>;
  };
  lastBattle?: BattleResult;
  error?: string;
  lastMove?: { from: string; to: string; owner: number };
};
export type Command = {
  type: string;
  slot?: number;
  kind?: 'normal' | 'silver' | 'gold';
  tileId?: string;
  pyramid?: number;
  level?: number;
  color?: Color;
  armyId?: string;
  target?: string;
  count?: number;
  companions?: boolean;
  placements?: { zone: string; n: number }[];
  godZone?: string;
  play?: string;
  burn?: string;
  diIds?: string[];
  recall?: boolean;
  retreat?: string;
  night?: NightOptions;
  position?: number;
  replace?: string;
  creatureId?: string;
  servantId?: string;
  discard?: string[];
};
export type NightOptions = {
  sanctuary: boolean;
  delta: boolean;
  money: number;
  cards: number;
  recruits: number;
  recruitZone: string;
  freePyramid: number;
};
const CREATURE_NAMES = new Set([
  '荒漠沙蛇',
  '木乃伊',
  '凤凰',
  '圣甲虫',
  '巨型毒蝎',
  '远古圣象',
  '人面狮身斯芬克斯',
  '羊头狮身斯芬克斯',
  '鹰头狮身斯芬克斯',
  '灵魂吞噬者',
  '豺狼',
  '猫',
]);
export const isCreature = (id: string) => CREATURE_NAMES.has(tile(id)?.name);
export const isServant = (id: string) => tile(id)?.name.startsWith('仆从');
export const owns = (p: Player, name: string) =>
  p.powers.some((id) => tile(id).name === name);
export const active = (s: Game) => s.players[s.order[s.cursor]];
export const normalUsed = (p: Player) =>
  p.used.filter((u) => u.kind === 'normal').length;
export const troopsAt = (s: Game, id: string) =>
  s.armies.filter((a) => a.zone === id && a.n > 0);
export const ownerAt = (s: Game, id: string) =>
  troopsAt(s, id)[0]?.owner ??
  (zone(id)?.type === 'district'
    ? (s.players.find((p) => p.city === zone(id).city)?.id ?? -1)
    : -1);
export const homeZones = (s: Game, p: Player) =>
  ZONES.filter((z) => z.type === 'district' && z.city === p.city);
export const troopLimit = (p: Player) => (owns(p, '人多势众') ? 7 : 5);
export const score = (s: Game, p: Player) =>
  p.vp +
  ZONES.filter((z) => z.type === 'temple' && ownerAt(s, z.id) === p.id).length +
  s.players
    .flatMap((q) => q.pyramids)
    .filter((t) => t.level === 4 && ownerAt(s, t.zone) === p.id).length;
function rng(s: Game) {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
function shuffled<T>(s: Game, a: T[]) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rng(s) * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
function log(s: Game, text: string) {
  s.logs.unshift({ id: s.nextId++, text, round: s.round });
  s.logs = s.logs.slice(0, 140);
}
export const pname = (p: Player) => GODS[p.god].name_zh;
function gain(s: Game, p: Player, n: number, battle = false) {
  if (n > 0)
    p.pp = Math.min(11, p.pp + n + (!battle && owns(p, '神圣之力') ? 2 : 0));
}
export function price(p: Player, n: number) {
  return Math.max(0, n - (n > 0 && owns(p, '拉神的祭司') ? 1 : 0));
}
export function buyPrice(p: Player, id: string, extra = 0) {
  return price(
    p,
    Math.max(0, tile(id).level - (owns(p, '女祭司') ? 1 : 0)) + extra,
  );
}
export function buildPrice(p: Player, i: number, to: number) {
  let n = 0;
  for (let l = p.pyramids[i].level + 1; l <= to; l++)
    n += Math.max(0, l - (owns(p, '魔法支援') ? 1 : 0));
  return price(p, n);
}
function draw(s: Game, p: Player, n = 1) {
  for (let i = 0; i < n; i++) {
    if (!s.diDeck.length) {
      s.diDeck = shuffled(s, s.diDiscard);
      s.diDiscard = [];
    }
    const c = s.diDeck.pop();
    if (c) p.di.push(c);
  }
}
function putArmy(
  s: Game,
  p: Player,
  z: string,
  n: number,
  kind: 'troop' | 'god' = 'troop',
) {
  const same = s.armies.find(
    (a) => a.owner === p.id && a.zone === z && a.kind === kind,
  );
  if (same) {
    same.n += n;
    return same;
  }
  const a: Army = {
    id: 'a' + s.nextId++,
    owner: p.id,
    zone: z,
    n,
    kind,
    servants: [],
  };
  s.armies.push(a);
  return a;
}
function removeArmy(s: Game, a: Army) {
  s.armies = s.armies.filter((x) => x.id !== a.id);
}
function kill(s: Game, a: Army, n: number) {
  const actual = Math.min(a.n, n);
  a.n -= actual;
  if (a.kind === 'troop') s.players[a.owner].reserve += actual;
  if (a.n <= 0) removeArmy(s, a);
  return actual;
}
function riseAndVictory(s: Game, check = false) {
  if (s.players.some((p) => score(s, p) >= 4)) s.rise = true;
  if (check && s.phase === 'day') {
    const p = active(s),
      n = score(s, p);
    if (n >= 9 && s.players.every((q) => score(s, q) <= n)) {
      s.phase = 'finished';
      s.winner = p.id;
      log(s, `${pname(p)}以 ${n} 分赢得本局。`);
    }
  }
}
export function newGame(
  god = 0,
  main: Color = '蓝',
  secondary: Color = '白',
  seed = Date.now(),
): Game {
  const s: Game = {
    version: 2,
    phase: 'setup',
    round: 1,
    players: [],
    armies: [],
    market: {},
    order: [],
    cursor: 0,
    normalDone: false,
    battleQueue: [],
    rise: false,
    winner: null,
    logs: [],
    seed: seed >>> 0,
    nextId: 1,
    diDeck: [],
    diDiscard: [],
  };
  const gods = [god, ...[0, 1, 2, 3, 4, 5].filter((g) => g !== god)];
  for (let i = 0; i < 6; i++) {
    const city = i,
      homes = ZONES.filter(
        (z) => z.type === 'district' && z.city === city,
      ).sort((a, b) => (a.district ?? 0) - (b.district ?? 0));
    const mains: Color[] = ['红', '蓝', '黑', '琥珀', '红', '蓝'];
    const m = i === 0 ? main : mains[i],
      secondaryColor = i === 0 ? secondary : '白';
    const deck = CARDS.slice(0, 8).map((c) => c.id);
    const p: Player = {
      id: i,
      god: gods[i],
      city,
      pp: 7,
      vp: 0,
      reserve: 2,
      pyramids: homes.map((z, j) => ({
        zone: z.id,
        level: j === 0 ? 2 : j === 1 ? 1 : 0,
        color: j === 0 ? m : j === 1 ? secondaryColor : null,
      })),
      powers: [],
      hand: [...deck],
      deck,
      played: [],
      burned: [],
      di: [],
      veterans: 0,
      used: [],
      goldUsed: false,
      silverUsed: false,
      repeatUsed: false,
      bought: [],
      godUnlocked: false,
    };
    s.players.push(p);
    homes.slice(0, 2).forEach((z) => putArmy(s, p, z.id, 5));
  }
  POWERS.forEach((t) => (s.market[t.id] = t.copies));
  s.order = shuffled(s, [0, 1, 2, 3, 4, 5]);
  DI_CARDS.forEach((d) => {
    for (let i = 0; i < d.count; i++) s.diDeck.push(d.id + ':' + i);
  });
  s.diDeck = shuffled(s, s.diDeck);
  s.players.forEach((p) => {
    draw(s, p, 2);
    p.di.push('diversion:' + p.id);
  });
  const reverse = [...s.order].reverse();
  for (const id of reverse) {
    if (id === 0) break;
    const p = s.players[id],
      choices = freeChoices(s, p);
    const best = choices.sort(
      (a, b) => powerValue(s, p, b.id) - powerValue(s, p, a.id),
    )[0];
    if (best) givePower(s, p, best.id);
  }
  log(
    s,
    '开局：六位神各自为战，起始 7 祈祷值、10 士兵上场。请选择免费一级能力。',
  );
  return s;
}
export function freeChoices(s: Game, p = s.players[0]) {
  return POWERS.filter(
    (t) =>
      t.level === 1 &&
      s.market[t.id] > 0 &&
      p.pyramids.some((py) => py.color === t.color && py.level > 0),
  );
}
export function canSlot(
  s: Game,
  p: Player,
  slot: number,
  kind: 'normal' | 'silver' = 'normal',
) {
  if (s.phase !== 'day' || active(s).id !== p.id || !SLOTS[slot]) return false;
  if (kind === 'normal' && (s.normalDone || normalUsed(p) >= 5)) return false;
  if (kind === 'silver' && (p.silverUsed || !owns(p, '神的旨意'))) return false;
  const occupied = p.used.filter((u) => u.slot === slot);
  if (
    occupied.length &&
    !(
      kind === 'normal' &&
      p.godUnlocked &&
      GODS[p.god].name === 'Ouadjet' &&
      !p.repeatUsed &&
      occupied.some((u) => u.kind === 'normal')
    )
  )
    return false;
  const rows = new Set([
    ...p.used.map((u) => SLOTS[u.slot].row),
    SLOTS[slot].row,
  ]);
  const remaining =
    5 -
    normalUsed(p) -
    (kind === 'normal' ? 1 : 0) +
    (kind === 'normal' && !p.silverUsed && owns(p, '神的旨意') ? 1 : 0);
  return 3 - rows.size <= remaining;
}
export function slotsFor(
  s: Game,
  p: Player,
  action: string,
  kind: 'normal' | 'silver' = 'normal',
) {
  return SLOTS.map((x, i) => ({ x, i }))
    .filter(({ x, i }) => x.action === action && canSlot(s, p, i, kind))
    .map(({ i }) => i);
}
function consume(
  s: Game,
  p: Player,
  slot: number,
  kind: 'normal' | 'silver' | 'gold' = 'normal',
) {
  if (kind === 'gold') {
    if (p.goldUsed) throw Error('本轮金色行动已使用');
    p.goldUsed = true;
    return;
  }
  if (!canSlot(s, p, slot, kind))
    throw Error('这个行动格目前不可使用，请留出三层各一格。');
  if (p.used.some((u) => u.slot === slot)) p.repeatUsed = true;
  p.used.push({ slot, kind });
  if (kind === 'silver') p.silverUsed = true;
  else s.normalDone = true;
}
export function hasPyramid(s: Game, p: Player, color: string, level: number) {
  return s.players
    .flatMap((q) => q.pyramids)
    .some(
      (py) =>
        py.color === color && py.level >= level && ownerAt(s, py.zone) === p.id,
    );
}
export function buySlot(
  s: Game,
  p: Player,
  id: string,
  kind: 'normal' | 'silver' = 'normal',
) {
  const c = tile(id)?.color;
  const matching = p.pyramids.findIndex((py) => py.color === c);
  const candidates = slotsFor(s, p, 'buy', kind);
  return matching >= 0
    ? candidates.includes(5 + matching)
      ? 5 + matching
      : -1
    : (candidates[0] ?? -1);
}
export function canBuy(
  s: Game,
  p: Player,
  id: string,
  kind: 'normal' | 'silver' | 'gold' = 'normal',
) {
  const t = tile(id);
  if (
    !t ||
    s.market[id] <= 0 ||
    p.powers.some((x) => tile(x).name === t.name) ||
    !hasPyramid(s, p, t.color, t.level)
  )
    return false;
  if (kind !== 'gold' && p.bought.includes(t.color as Color)) return false;
  return (
    p.pp >= buyPrice(p, id, kind === 'gold' ? 1 : 0) &&
    (kind === 'gold'
      ? owns(p, '双重仪式') && !p.goldUsed
      : buySlot(s, p, id, kind) >= 0)
  );
}
export function canGod(
  s: Game,
  p: Player,
  kind: 'normal' | 'silver' = 'normal',
) {
  return (
    !p.godUnlocked &&
    s.rise &&
    p.pp >= 4 &&
    p.pyramids.some((py, i) => py.level === 4 && canSlot(s, p, 5 + i, kind)) &&
    homeZones(s, p).some(
      (z) => !troopsAt(s, z.id).some((a) => a.owner === p.id),
    )
  );
}
export function availableCompanions(s: Game, p: Player, servant = false) {
  return p.powers.filter(
    (id) =>
      (servant ? isServant(id) : isCreature(id)) &&
      !s.armies.some((a) =>
        servant ? a.servants.includes(id) : a.creature === id,
      ),
  );
}
function autoAttach(s: Game, p: Player, a: Army) {
  if (
    a.kind === 'god' ||
    zone(a.zone).type !== 'district' ||
    zone(a.zone).city !== p.city
  )
    return;
  if (!a.creature) a.creature = availableCompanions(s, p)[0];
  if (!a.servants.length) {
    const id = availableCompanions(s, p, true)[0];
    if (id) a.servants.push(id);
  }
}
function replaceBattleCard(p: Player, newId: string, remove?: string) {
  const old =
    remove && p.deck.includes(remove)
      ? remove
      : p.deck.includes('b4')
        ? 'b4'
        : p.deck[p.deck.length - 1];
  p.deck = p.deck.filter((c) => c !== old);
  p.deck.push(newId);
  p.hand = [...p.deck];
  p.played = [];
  p.burned = [];
}
function givePower(
  s: Game,
  p: Player,
  id: string,
  target?: string,
  replace?: string,
) {
  const t = tile(id);
  s.market[id]--;
  p.powers.push(id);
  if (t.name === '主宰' || t.name === '人面狮身斯芬克斯') p.vp++;
  if (t.name.includes('族佣兵')) {
    p.reserve += 3;
    const z =
      target &&
      zone(target)?.type === 'district' &&
      zone(target).city === p.city
        ? target
        : homeZones(s, p).find(
            (z) =>
              !troopsAt(s, z.id).some(
                (a) => a.owner !== p.id || a.kind === 'god',
              ),
          )?.id;
    if (z) {
      const own = s.armies.find((a) => a.owner === p.id && a.zone === z),
        n = Math.min(3, troopLimit(p) - (own?.n ?? 0));
      if (n > 0) {
        p.reserve -= n;
        const merc = putArmy(s, p, z, n);
        queueBattle(s, merc, z);
      }
    }
  }
  const replacements: Record<string, string> = {
    战车风暴: 'chariot',
    龟甲防御: 'tortoise',
    黑玛瑙之盾: 'onyx',
  };
  if (replacements[t.name]) replaceBattleCard(p, replacements[t.name], replace);
  if (isCreature(id) || isServant(id)) {
    const a = s.armies.find(
      (a) =>
        a.owner === p.id &&
        a.kind === 'troop' &&
        zone(a.zone).city === p.city &&
        (target ? a.zone === target : true) &&
        (isCreature(id)
          ? !a.creature
          : a.servants.length <
            (t.name === '仆从梅里普塔赫' ||
            a.servants.some((id) => tile(id).name === '仆从梅里普塔赫')
              ? 2
              : 1)),
    );
    if (a) {
      if (isCreature(id)) a.creature = id;
      else a.servants.push(id);
    }
  }
}
export function armyStats(s: Game, a: Army, attacking = true, opponent?: Army) {
  const p = s.players[a.owner],
    name = a.creature ? tile(a.creature).name : '',
    cancel = !!(
      opponent?.creature && tile(opponent.creature).name === '荒漠沙蛇'
    );
  const cr = cancel ? '' : name;
  let strength = a.kind === 'god' ? 7 : a.n,
    damage = 0,
    shield = 0,
    trueDamage = 0,
    move = 1;
  if (attacking && owns(p, '冲锋！')) strength++;
  if (owns(p, '奈斯之刃')) strength++;
  if (owns(p, '屠杀')) damage++;
  if (owns(p, '奈斯之盾')) shield++;
  if (!attacking && owns(p, '防御！')) strength++;
  if (owns(p, '狂野之怒')) {
    strength++;
    damage++;
    move++;
  }
  if (owns(p, '玛芙代特的祭司')) move++;
  if (!attacking && owns(p, '致命陷阱')) {
    strength++;
    trueDamage++;
  }
  if (owns(p, '先发制人')) {
    if (attacking) strength++;
    damage++;
    trueDamage++;
  }
  const creatureBoost: Record<string, number[]> = {
    荒漠沙蛇: [0, 0, 0, 1],
    木乃伊: [2, 0, 0, 1],
    凤凰: [1, 0, 0, 1],
    圣甲虫: [2, 0, 0, 2],
    巨型毒蝎: [2, 2, 0, 1],
    远古圣象: [1, 0, 1, 1],
    人面狮身斯芬克斯: [2, 0, 0, 1],
    羊头狮身斯芬克斯: [1, 0, 0, 1],
    鹰头狮身斯芬克斯: [2, 0, 0, 0],
    灵魂吞噬者: [2, 0, 0, 1],
    豺狼: [1, 0, 0, 1],
    猫: [2, 0, 1, 1],
  };
  if (creatureBoost[cr]) {
    const b = creatureBoost[cr];
    strength += b[0];
    damage += b[1];
    shield += b[2];
    move += b[3];
  }
  for (const id of a.servants) {
    const n = tile(id).name;
    if (n.includes('移动与港口')) move++;
    if (n === '仆从玛萨哈塔') shield++;
    if (n === '仆从梅里普塔赫') strength += 2;
    if (n === '仆从帕塔莫斯' && zone(a.zone).delta) strength++;
  }
  if (zone(a.zone).type === 'district' && zone(a.zone).city === p.city) {
    strength++;
    if (p.godUnlocked && GODS[p.god].name === 'Anubis') strength++;
  }
  if (a.kind === 'god') {
    const g = GODS[p.god].name;
    if (g !== 'Horus') move++;
    if (g === 'Bastet') shield++;
    if (g === 'Sobek' && attacking) damage++;
  }
  return { strength, damage, shield, trueDamage, move };
}
export type MoveOption = {
  target: string;
  cost: number;
  path: string[];
  teleported: boolean;
};
export function moves(
  s: Game,
  a: Army,
  count = a.n,
  withCompanions = true,
  noTeleport = false,
  ignoreWalls = false,
  diIds: string[] = [],
): MoveOption[] {
  const p = s.players[a.owner],
    stats = armyStats(s, a),
    start = zone(a.zone),
    god = a.kind === 'god' ? GODS[p.god].name : '',
    creature = a.creature ? tile(a.creature).name : '';
  const transfer = diIds.some((id) => di(id)?.transfer),
    extraMove = diIds.reduce((n, id) => n + (di(id)?.move ?? 0), 0);
  const options = new Map<string, MoveOption>();
  const queue = [
    {
      id: a.zone,
      left: stats.move + extraMove,
      tele: false,
      cost: 0,
      path: [a.zone],
      cityEntered: false,
    },
  ];
  const seen = new Set<string>();
  while (queue.length) {
    const cur = queue.shift()!;
    const z = zone(cur.id),
      key = [cur.id, cur.left, cur.tele, cur.cityEntered, cur.cost].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    if (cur.id !== a.zone) {
      const friends = troopsAt(s, cur.id).filter(
        (x) => x.owner === p.id && x.id !== a.id,
      );
      const okay =
        a.kind === 'god'
          ? friends.length === 0
          : friends.every((x) => x.kind === 'troop') &&
            friends.reduce((n, x) => n + x.n, 0) + count <= troopLimit(p) &&
            (!withCompanions ||
              friends.every(
                (x) =>
                  (!a.creature || !x.creature || a.creature === x.creature) &&
                  x.servants.length + a.servants.length <=
                    ([...x.servants, ...a.servants].some(
                      (id) => tile(id).name === '仆从梅里普塔赫',
                    )
                      ? 2
                      : 1),
              ));
      if (okay && cur.cost <= p.pp) {
        const prev = options.get(cur.id);
        if (!prev || prev.cost > cur.cost)
          options.set(cur.id, {
            target: cur.id,
            cost: cur.cost,
            path: cur.path,
            teleported: cur.tele,
          });
      }
      if (troopsAt(s, cur.id).some((x) => x.owner !== p.id)) continue;
    }
    const add = (to: string, tele: boolean) => {
      const dest = zone(to);
      if (!dest) return;
      const enemyDistrict = dest.type === 'district' && dest.city !== p.city;
      const canClimb = creature === '凤凰' || ignoreWalls;
      if (enemyDistrict && !canClimb && !start.neighbors.includes(to)) return;
      if (enemyDistrict && cur.cityEntered) return;
      let fee = 0;
      if (tele) {
        fee =
          transfer || creature === '鹰头狮身斯芬克斯' || god === 'Horus'
            ? 0
            : 2 - (owns(p, '空间传送') ? 1 : 0);
        if (
          a.servants.some((id) => tile(id).name === '仆从帕塔莫斯') &&
          (z.delta || dest.delta)
        )
          fee--;
        fee = price(p, Math.max(0, fee));
      }
      const guarding = troopsAt(s, to).find(
        (x) =>
          x.owner !== p.id &&
          x.creature &&
          tile(x.creature).name === '羊头狮身斯芬克斯',
      );
      if (guarding) fee += price(p, 1);
      if (cur.cost + fee > p.pp) return;
      queue.push({
        id: to,
        left: cur.left - (tele ? 0 : 1),
        tele: cur.tele || tele,
        cost: cur.cost + fee,
        path: [...cur.path, to],
        cityEntered: cur.cityEntered || enemyDistrict,
      });
    };
    if (cur.left > 0) {
      const destinations = new Set(z.neighbors);
      if (z.port) {
        ZONES.filter(
          (t) =>
            t.port === 'trade' ||
            (t.port === 'military' && t.portCity === p.city) ||
            (a.servants.some((id) => tile(id).name.includes('移动与港口')) &&
              t.port),
        ).forEach((t) => destinations.add(t.id));
      }
      destinations.forEach((t) => add(t, false));
    }
    if (!cur.tele && !noTeleport) {
      const onPyramid = s.players.some((q) =>
        q.pyramids.some((py) => py.zone === z.id && py.level > 0),
      );
      const can =
        transfer ||
        god === 'Horus' ||
        onPyramid ||
        ((owns(p, '空间传送') || creature === '鹰头狮身斯芬克斯') && z.obelisk);
      if (can)
        ZONES.filter(
          (t) =>
            t.id !== cur.id &&
            (god === 'Horus'
              ? !(t.type === 'district' && t.city !== p.city)
              : t.obelisk),
        ).forEach((t) => add(t.id, true));
    }
  }
  return [...options.values()];
}
function chooseBattle(s: Game, p: Player, a: Army, attacking: boolean) {
  const ranked = [...p.hand].sort((x, y) => {
    const val = (id: string) => {
      const c = card(id);
      return (
        c.strength * 2.4 +
        c.shield * 0.9 +
        c.damage * 0.6 -
        (c.selfDamage ?? 0) * 1.8
      );
    };
    return val(y) - val(x);
  });
  const play = ranked[0],
    burn = ranked[ranked.length - 1];
  const available = p.di
    .filter((id) => di(id)?.phase === 'battle' && (di(id)?.cost ?? 99) <= p.pp)
    .sort((x, y) => {
      const val = (id: string) => {
        const q = di(id)!;
        return (
          (q.strength ?? 0) * 2 + (q.shield ?? 0) * 0.8 + (q.damage ?? 0) * 0.6
        );
      };
      return val(y) - val(x);
    });
  const chosen = available.slice(0, attacking ? 2 : 1);
  let cost = 0;
  const ds = chosen.filter((id) => {
    cost += price(p, di(id)!.cost);
    return cost <= p.pp;
  });
  return { play, burn, di: ds };
}
function queueBattle(s: Game, a: Army, origin: string) {
  const enemy = s.armies.find(
    (d) => d.owner !== a.owner && d.zone === a.zone && d.n > 0,
  );
  if (enemy) s.battleQueue.push({ a: a.id, d: enemy.id, origin });
}
function nextBattle(s: Game) {
  const q = s.battleQueue.shift();
  if (!q) {
    s.pending = undefined;
    s.phase = 'day';
    riseAndVictory(s);
    return;
  }
  const a = s.armies.find((x) => x.id === q.a),
    d = s.armies.find((x) => x.id === q.d);
  if (!a || !d) {
    nextBattle(s);
    return;
  }
  const ap = s.players[a.owner];
  if (owns(ap, '全力出击')) gain(s, ap, 2, true);
  if (owns(ap, '塔沃瑞特的祭司')) draw(s, ap);
  s.pending = {
    attacker: a.id,
    defender: d.id,
    attackerOwner: a.owner,
    defenderOwner: d.owner,
    location: a.zone,
    origin: q.origin,
    aiCards: {},
    choices: {},
    stage: 'choose',
  } as Battle;
  [a, d].forEach((army, i) => {
    const p = s.players[army.owner];
    if (p.id !== 0)
      s.pending!.aiCards[p.id] = chooseBattle(s, p, army, i === 0);
  });
  s.phase = 'battle';
  log(
    s,
    `${pname(ap)}进攻${pname(s.players[d.owner])}的${zone(a.zone).name}。`,
  );
}
function battleStat(
  s: Game,
  a: Army,
  other: Army,
  choice: { play: string; di: string[] },
  attack: boolean,
) {
  const base = armyStats(s, a, attack, other),
    c = card(choice.play);
  let strength = base.strength + c.strength,
    damage = base.damage + c.damage,
    shield = base.shield + c.shield,
    trueDamage = base.trueDamage + (c.trueDamage ?? 0);
  for (const id of choice.di) {
    const q = di(id);
    if (q) {
      strength += q.strength ?? 0;
      damage += q.damage ?? 0;
      shield += q.shield ?? 0;
    }
  }
  return {
    strength,
    damage,
    shield,
    trueDamage,
    selfDamage: c.selfDamage ?? 0,
    immune: c.immune ?? false,
    absolute: c.absolute ?? 0,
  };
}
export function revealableEnemyCard(s: Game) {
  const b = s.pending;
  if (!b) return null;
  const human = s.players[0];
  if (!owns(human, '秘密侦查')) return null;
  const other = b.attackerOwner === 0 ? b.defenderOwner : b.attackerOwner;
  return b.aiCards[other]?.play ?? null;
}
function resolveBattle(s: Game) {
  const b = s.pending!,
    a = s.armies.find((x) => x.id === b.attacker)!,
    d = s.armies.find((x) => x.id === b.defender)!;
  if (!a || !d) {
    nextBattle(s);
    return;
  }
  const ap = s.players[a.owner],
    dp = s.players[d.owner];
  const ac = b.choices[a.owner] ?? b.aiCards[a.owner],
    dc = b.choices[d.owner] ?? b.aiCards[d.owner];
  if (!ac || !dc) throw Error('双方必须先选好出牌与暗弃。');
  for (const [p, c] of [
    [ap, ac],
    [dp, dc],
  ] as const) {
    if (
      !p.hand.includes(c.play) ||
      !p.hand.includes(c.burn) ||
      c.play === c.burn
    )
      throw Error('请选择两张不同的战斗牌。');
    let cost = 0;
    for (const id of c.di) {
      const q = di(id);
      if (!p.di.includes(id) || q?.phase !== 'battle')
        throw Error('神谕选择无效');
      cost += price(p, q.cost);
    }
    if (cost > p.pp) throw Error('祈祷值不足以支付所选神谕');
    p.pp -= cost;
    p.hand = p.hand.filter((id) => id !== c.play && id !== c.burn);
    p.played.push(c.play);
    p.burned.push(c.burn);
    for (const id of c.di) {
      if (di(id)?.id !== 'diversion') {
        p.di = p.di.filter((x) => x !== id);
        s.diDiscard.push(id);
      }
    }
  }
  const notes: string[] = [];
  for (const [p, army, choice] of [
    [ap, a, ac],
    [dp, d, dc],
  ] as const) {
    if (army.kind === 'god' && GODS[p.god].name === 'Seth') {
      const before = new Set(p.di);
      draw(s, p, 2);
      const drawn = p.di.filter((id) => !before.has(id));
      if (!drawn.length) continue;
      const battle = drawn
        .filter((id) => di(id)?.phase === 'battle')
        .sort((x, y) => (di(y)?.strength ?? 0) - (di(x)?.strength ?? 0));
      const keep = battle[0] ?? drawn[0];
      for (const id of drawn) {
        if (id !== keep || battle.length) {
          p.di = p.di.filter((x) => x !== id);
          s.diDiscard.push(id);
        }
      }
      if (battle.length) {
        choice.di.push(keep);
        notes.push('赛特触发：自动选择一张战斗神谕免费使用。');
      } else notes.push('赛特触发：保留一张非战斗神谕。');
    }
  }
  const as = battleStat(s, a, d, ac, true),
    ds = battleStat(s, d, a, dc, false);
  for (const [p, stats, other] of [
    [ap, as, ds],
    [dp, ds, as],
  ] as const) {
    if (
      owns(p, '神圣伤痕') &&
      p.di.some((id) => di(id)?.id !== 'diversion') &&
      stats.strength <= other.strength
    ) {
      const usable = p.di.filter((id) => di(id)?.id !== 'diversion');
      const n = Math.min(
        usable.length,
        other.strength - stats.strength + (p.id === ap.id ? 1 : 0),
      );
      if (n > 0) {
        const discard = usable.slice(-n);
        p.di = p.di.filter((id) => !discard.includes(id));
        s.diDiscard.push(...discard);
        stats.strength += n;
        notes.push(`${pname(p)}自动弃 ${n} 张神谕，以神圣伤痕增加战力。`);
      }
    }
  }
  for (const [army, stats] of [
    [a, as],
    [d, ds],
  ] as const) {
    if (army.servants.some((id) => tile(id).name === '仆从巴卡坦')) {
      const opponent = army.id === a.id ? ds : as;
      const convert = Math.min(
        card(army.id === a.id ? ac.play : dc.play).shield,
        Math.max(0, stats.shield - opponent.damage),
      );
      stats.shield -= convert;
      stats.damage += convert;
    }
  }
  const attackWins = as.strength > ds.strength,
    winner = attackWins ? ap.id : dp.id;
  const damages = (army: Army, own: typeof as, opp: typeof as) => {
    const allowed = Math.max(0, army.n - own.absolute);
    const enemy = Math.min(
      allowed,
      opp.trueDamage + (own.immune ? 0 : Math.max(0, opp.damage - own.shield)),
    );
    const self = Math.min(allowed - enemy, own.selfDamage);
    return { enemy, self, total: enemy + self };
  };
  const al = damages(a, as, ds),
    dl = damages(d, ds, as);
  const aOld = { ...a, servants: [...a.servants] },
    dOld = { ...d, servants: [...d.servants] };
  kill(s, a, al.total);
  kill(s, d, dl.total);
  if (owns(ap, '战争荣耀')) gain(s, ap, al.enemy, true);
  if (owns(dp, '战争荣耀')) gain(s, dp, dl.enemy, true);
  if (owns(ap, '神圣欲望')) gain(s, ap, dl.enemy * 2, true);
  if (owns(dp, '神圣欲望')) gain(s, dp, al.enemy * 2, true);
  const aLeft = Math.max(0, aOld.n - al.total),
    dLeft = Math.max(0, dOld.n - dl.total);
  let aPoints = attackWins && aLeft > 0 ? 1 : 0,
    dPoints = !attackWins && dLeft > 0 && owns(dp, '以守为攻') ? 1 : 0,
    bonus = 0;
  for (const [army, p, won, loss, kills] of [
    [aOld, ap, attackWins, al.total, dl.enemy],
    [dOld, dp, !attackWins, dl.total, al.enemy],
  ] as const) {
    const cr = army.creature ? tile(army.creature).name : '';
    const canceled =
      (army.id === aOld.id ? dOld : aOld).creature &&
      tile((army.id === aOld.id ? dOld : aOld).creature!).name === '荒漠沙蛇';
    if (!canceled) {
      if (cr === '豺狼') draw(s, p, Math.floor(kills / 2));
      if (
        won &&
        ((cr === '灵魂吞噬者' && kills >= 2) || (cr === '猫' && loss === 0))
      ) {
        if (p.id === ap.id) aPoints++;
        else dPoints++;
        bonus++;
      }
    }
  }
  ap.vp += aPoints;
  dp.vp += dPoints;
  const av = aPoints ? 0 : 1,
    dv = (attackWins ? 0 : 1) + (dPoints ? 0 : 1);
  ap.veterans += av;
  dp.veterans += dv;
  b.result = {
    aStrength: as.strength,
    dStrength: ds.strength,
    aDamage: as.damage + as.trueDamage,
    dDamage: ds.damage + ds.trueDamage,
    aShield: as.shield,
    dShield: ds.shield,
    aLoss: al.total,
    dLoss: dl.total,
    aLeft,
    dLeft,
    winner,
    battlePoints: aPoints,
    bonusPoints: bonus,
    aVeterans: av,
    dVeterans: dv,
    playA: ac.play,
    playD: dc.play,
    notes,
  };
  (b as Battle & { snapshots: Army[]; dPoints: number }).snapshots = [
    aOld,
    dOld,
  ];
  (b as Battle & { dPoints: number }).dPoints = dPoints;
  b.stage = 'aftermath';
  s.lastBattle = b.result;
  log(
    s,
    `${as.strength} 比 ${ds.strength}，${pname(s.players[winner])}获胜；伤亡后剩 ${aLeft} / ${dLeft}，战斗分 +${aPoints} / +${dPoints}。`,
  );
  riseAndVictory(s);
}
export function retreatOptions(s: Game, a: Army) {
  return zone(a.zone).neighbors.filter(
    (id) =>
      !troopsAt(s, id).length &&
      !(
        zone(id).type === 'district' &&
        zone(id).city !== s.players[a.owner].city
      ),
  );
}
function recallArmy(s: Game, a: Army) {
  if (a.kind === 'god') {
    removeArmy(s, a);
    return;
  }
  const p = s.players[a.owner],
    n = a.n;
  p.reserve += n;
  removeArmy(s, a);
  gain(s, p, Math.max(0, n - 1) + (owns(p, '强制召回') ? 2 : 0), true);
  log(s, `${pname(p)}召回 ${n} 名士兵。`);
}
function finishBattle(s: Game, cmd: Command) {
  const b = s.pending!,
    r = b.result!,
    snap = (b as Battle & { snapshots: Army[] }).snapshots;
  const winnerId = r.winner;
  let winnerArmy = s.armies.find(
    (a) => a.id === (winnerId === b.attackerOwner ? b.attacker : b.defender),
  );
  let loserArmy = s.armies.find(
    (a) => a.id === (winnerId === b.attackerOwner ? b.defender : b.attacker),
  );
  const recalled = new Set<number>();
  if (loserArmy) {
    const p = s.players[loserArmy.owner],
      opts = retreatOptions(s, loserArmy);
    const wantsRecall =
      loserArmy.owner === 0
        ? !!cmd.recall
        : loserArmy.kind === 'troop' && (loserArmy.n < 3 || opts.length === 0);
    if (loserArmy.kind === 'troop' && wantsRecall) {
      recalled.add(p.id);
      recallArmy(s, loserArmy);
    } else {
      let dest =
        winnerId === 0 && cmd.retreat && opts.includes(cmd.retreat)
          ? cmd.retreat
          : opts.sort(
              (x, y) =>
                (zone(y).type === 'desert' ? 1 : 0) -
                (zone(x).type === 'desert' ? 1 : 0),
            )[0];
      if (loserArmy.servants.some((id) => tile(id).name === '仆从玛萨哈塔'))
        dest =
          homeZones(s, p).find((z) => !troopsAt(s, z.id).length)?.id ?? dest;
      if (dest) {
        loserArmy.zone = dest;
        log(s, `${pname(p)}撤退至${zone(dest).name}。`);
      } else {
        recalled.add(p.id);
        recallArmy(s, loserArmy);
      }
    }
  }
  if (winnerArmy) {
    const p = s.players[winnerId],
      wantsRecall =
        winnerId === 0
          ? !!cmd.recall
          : winnerArmy.kind === 'troop' &&
            winnerArmy.n < 2 &&
            zone(winnerArmy.zone).type !== 'temple';
    if (winnerArmy.kind === 'troop' && wantsRecall) {
      recalled.add(p.id);
      recallArmy(s, winnerArmy);
    } else if (zone(winnerArmy.zone).type === 'temple')
      collectServantTemple(s, winnerArmy);
  }
  for (const [i, old] of snap.entries()) {
    const p = s.players[old.owner],
      live = s.armies.find((a) => a.id === old.id),
      played = i === 0 ? r.playA : r.playD;
    if (live && owns(p, '坚守阵地') && !recalled.has(p.id)) {
      p.hand = [...p.deck];
      p.played = [];
      p.burned = [];
      if (live.kind === 'troop' && p.reserve > 0 && live.n < troopLimit(p)) {
        p.reserve--;
        live.n++;
      }
    }
    if (old.kind === 'god' && GODS[p.god].name === 'Anubis') {
      const ownLoss = i === 0 ? r.aLoss : r.dLoss,
        otherLoss = i === 0 ? r.dLoss : r.aLoss;
      let available = Math.min(p.reserve, ownLoss + otherLoss);
      for (const z of homeZones(s, p)) {
        if (!available) break;
        if (troopsAt(s, z.id).some((a) => a.owner !== p.id || a.kind === 'god'))
          continue;
        const a = s.armies.find((a) => a.owner === p.id && a.zone === z.id);
        const n = Math.min(available, troopLimit(p) - (a?.n ?? 0));
        if (n) {
          putArmy(s, p, z.id, n);
          p.reserve -= n;
          available -= n;
        }
      }
    }
    if (live?.kind === 'god' && GODS[p.god].name === 'Horus') live.n = 3;
    if (p.id === winnerId && owns(p, '战利品')) {
      const oppChoice =
        b.choices[i === 0 ? b.defenderOwner : b.attackerOwner] ??
        b.aiCards[i === 0 ? b.defenderOwner : b.attackerOwner];
      if (oppChoice?.di.length) draw(s, p, 2);
    }
    if (p.hand.length === 0 || card(played).returnAll) {
      p.hand = [...p.deck];
      p.played = [];
      p.burned = [];
    }
  }
  riseAndVictory(s);
  nextBattle(s);
}
function collectServantTemple(s: Game, a: Army) {
  if (a.servants.some((id) => tile(id).name === '仆从赫卡伊布')) {
    const z = zone(a.zone),
      p = s.players[a.owner];
    if (z.delta) {
      if (a.n >= 1) {
        kill(s, a, 1);
        gain(s, p, 5);
      }
    } else gain(s, p, z.income ?? 0);
  }
}
function moveArmy(
  s: Game,
  p: Player,
  cmd: Command,
  noTeleport = false,
  ignoreWalls = false,
) {
  const a = s.armies.find((x) => x.id === cmd.armyId && x.owner === p.id);
  if (!a) throw Error('请选择自己的军团');
  const n = Math.min(a.n, Math.max(1, cmd.count ?? a.n));
  if (a.kind === 'god' && n !== a.n) throw Error('神祇不能拆分生命移动');
  const withCompanions = cmd.companions !== false;
  const moveCards = cmd.diIds ?? [];
  for (const id of moveCards) {
    if (!p.di.includes(id) || di(id)?.phase !== 'move')
      throw Error('只能使用手中的移动神谕');
  }
  const option = moves(
    s,
    a,
    n,
    withCompanions,
    noTeleport,
    ignoreWalls,
    moveCards,
  ).find((o) => o.target === cmd.target);
  if (!option) throw Error('目标不在当前合法移动范围内');
  const origin = a.zone;
  p.pp -= option.cost;
  for (const id of moveCards) {
    p.di = p.di.filter((x) => x !== id);
    s.diDiscard.push(id);
  }
  let moving = a;
  if (n < a.n) {
    a.n -= n;
    moving = {
      id: 'a' + s.nextId++,
      owner: p.id,
      zone: origin,
      n,
      kind: 'troop',
      servants: [],
    };
    s.armies.push(moving);
    if (withCompanions) {
      moving.creature = a.creature;
      a.creature = undefined;
      moving.servants = [...a.servants];
      a.servants = [];
    }
  } else if (!withCompanions && (a.creature || a.servants.length))
    throw Error('整队离开时，同行单位必须随军团离开');
  const target = cmd.target!;
  moving.zone = target;
  const friendly = s.armies.find(
    (x) => x.id !== moving.id && x.owner === p.id && x.zone === target,
  );
  if (friendly) {
    friendly.n += moving.n;
    friendly.creature ??= moving.creature;
    friendly.servants.push(...moving.servants);
    removeArmy(s, moving);
    moving = friendly;
  }
  s.lastMove = { from: origin, to: target, owner: p.id };
  log(
    s,
    `${pname(p)}${option.teleported ? '传送并移动' : '移动'}至${zone(target).name}${option.cost ? `，花费 ${option.cost} 祈祷值` : ''}。`,
  );
  queueBattle(s, moving, origin);
  if (
    !s.battleQueue.length &&
    zone(target).type === 'temple' &&
    target !== origin
  )
    collectServantTemple(s, moving);
}
export function defaultNight(s: Game, p: Player): NightOptions {
  const homes = homeZones(s, p),
    z =
      homes.find(
        (z) =>
          !troopsAt(s, z.id).some((a) => a.owner !== p.id || a.kind === 'god'),
      )?.id ?? homes[0].id;
  let recruits = Math.min(p.veterans, p.reserve, 3);
  const existing = troopsAt(s, z).find((a) => a.owner === p.id);
  recruits = Math.min(recruits, troopLimit(p) - (existing?.n ?? 0));
  return {
    sanctuary: true,
    delta: true,
    money: p.veterans - recruits,
    cards: 0,
    recruits,
    recruitZone: z,
    freePyramid: p.pyramids.findIndex((py) => py.level < 4),
  };
}
function resolveNight(s: Game, human: NightOptions) {
  const opts = s.players.map((p) => (p.id === 0 ? human : defaultNight(s, p)));
  for (const p of s.players) {
    const n = opts[p.id];
    if (
      n.money < 0 ||
      n.cards < 0 ||
      n.recruits < 0 ||
      n.money + n.cards * 2 + n.recruits > p.veterans
    )
      throw Error('老兵分配超出可用数量');
  }
  // All players finish one night step before the next step begins.
  for (const p of s.players) {
    const a = s.armies.find(
      (a) => a.owner === p.id && zone(a.zone).type === 'sanctuary',
    );
    if (a && opts[p.id].sanctuary) {
      const free = owns(p, '仆从帕塔莫斯');
      if (free || a.n >= 2) {
        if (!free) kill(s, a, 2);
        p.vp++;
        log(s, `${pname(p)}在圣所献祭，获得 1 永久分。`);
      }
    }
  }
  for (const p of s.players) {
    const a = s.armies.find(
      (a) =>
        a.owner === p.id &&
        zone(a.zone).type === 'temple' &&
        zone(a.zone).delta,
    );
    if (a && opts[p.id].delta) {
      if (!owns(p, '仆从帕塔莫斯')) kill(s, a, 1);
      gain(s, p, 5);
    }
  }
  for (const p of s.players) {
    const temples = s.armies.filter(
      (a) => a.owner === p.id && zone(a.zone).type === 'temple',
    );
    if (
      temples.length >= 2 ||
      temples.some((a) => a.kind === 'god' && GODS[p.god].name === 'Bastet')
    ) {
      p.vp++;
      log(s, `${pname(p)}神庙控制结算，获得 1 永久分。`);
    }
  }
  for (const p of s.players) {
    const amount = ZONES.filter(
      (z) => z.type === 'temple' && !z.delta && ownerAt(s, z.id) === p.id,
    ).reduce((n, z) => n + (z.income ?? 0), 0);
    gain(s, p, amount);
  }
  for (const p of s.players) {
    const n = opts[p.id];
    gain(s, p, 2 + n.money + (owns(p, '阿蒙神的祭司') ? 7 : 0));
    p.veterans -= n.money;
  }
  for (const p of s.players) {
    const n = opts[p.id];
    draw(
      s,
      p,
      1 + n.cards + (owns(p, '神的恩赐') ? 1 : 0) + (owns(p, '木乃伊') ? 1 : 0),
    );
    p.veterans -= n.cards * 2;
    if (owns(p, '预见')) {
      draw(s, p, 4);
      const sorted = p.di
        .filter((id) => di(id)?.id !== 'diversion')
        .sort(
          (x, y) =>
            (di(x)?.strength ?? 0) +
            (di(x)?.shield ?? 0) -
            (di(y)?.strength ?? 0) -
            (di(y)?.shield ?? 0),
        );
      const drop = sorted.slice(0, 4);
      p.di = p.di.filter((x) => !drop.includes(x));
      s.diDiscard.push(...drop);
    }
  }
  for (const p of s.players) {
    const n = opts[p.id],
      z = zone(n.recruitZone);
    if (
      n.recruits &&
      z?.type === 'district' &&
      z.city === p.city &&
      !troopsAt(s, z.id).some((a) => a.owner !== p.id || a.kind === 'god')
    ) {
      const a = troopsAt(s, z.id).find((a) => a.owner === p.id);
      const qty = Math.min(n.recruits, p.reserve, troopLimit(p) - (a?.n ?? 0));
      if (qty) {
        const troop = putArmy(s, p, z.id, qty);
        p.reserve -= qty;
        p.veterans -= qty;
        autoAttach(s, p, troop);
      }
    }
  }
  for (const p of s.players) {
    p.veterans = 0;
    p.used = [];
    p.goldUsed = false;
    p.silverUsed = false;
    p.repeatUsed = false;
    p.bought = [];
    if (owns(p, '神之手')) {
      const i = opts[p.id].freePyramid;
      if (i >= 0 && p.pyramids[i]?.level > 0 && p.pyramids[i].level < 4)
        p.pyramids[i].level++;
    }
  }
  riseAndVictory(s);
  const old = [...s.order];
  const pickers = [...s.players]
    .sort(
      (a, b) =>
        score(s, a) - score(s, b) || old.indexOf(a.id) - old.indexOf(b.id),
    )
    .map((p) => p.id);
  s.orderDraft = {
    pickers,
    index: 0,
    available: [0, 1, 2, 3, 4, 5],
    chosen: {},
  };
  s.phase = 'order';
  log(s, `第 ${s.round} 轮黑夜结算完成，重新选择顺位。`);
}
function advance(s: Game) {
  if (!s.normalDone) throw Error('本回合还需要放置一个普通行动标记');
  s.normalDone = false;
  const remaining = s.players.filter((p) => normalUsed(p) < 5);
  if (!remaining.length) {
    s.phase = 'night';
    return;
  }
  for (let n = 1; n <= 6; n++) {
    const c = (s.cursor + n) % 6;
    if (normalUsed(s.players[s.order[c]]) < 5) {
      s.cursor = c;
      break;
    }
  }
  riseAndVictory(s, true);
}
export function apply(s0: Game, cmd: Command): Game {
  const s = structuredClone(s0);
  s.error = undefined;
  try {
    if (cmd.type === 'setup') {
      const p = s.players[0];
      if (!freeChoices(s, p).some((t) => t.id === cmd.tileId))
        throw Error('请选择仍可用的免费一级能力');
      givePower(s, p, cmd.tileId!);
      const reverse = [...s.order].reverse(),
        i = reverse.indexOf(0);
      for (const id of reverse.slice(i + 1)) {
        const q = s.players[id],
          best = freeChoices(s, q).sort(
            (a, b) => powerValue(s, q, b.id) - powerValue(s, q, a.id),
          )[0];
        if (best) givePower(s, q, best.id);
      }
      s.phase = 'day';
      s.cursor = 0;
      log(s, `你选择了${tile(cmd.tileId!).name}，第一轮开始。`);
      return s;
    }
    if (cmd.type === 'night') {
      if (s.phase !== 'night') throw Error('当前不是黑夜');
      resolveNight(s, cmd.night ?? defaultNight(s, s.players[0]));
      return s;
    }
    if (cmd.type === 'order') {
      const d = s.orderDraft;
      if (s.phase !== 'order' || !d || !d.available.includes(cmd.position!))
        throw Error('顺位不可选');
      const pid = d.pickers[d.index];
      d.chosen[cmd.position!] = pid;
      d.available = d.available.filter((i) => i !== cmd.position);
      d.index++;
      if (d.index === 6) {
        s.order = [0, 1, 2, 3, 4, 5].map((i) => d.chosen[i]);
        s.orderDraft = undefined;
        s.round++;
        s.cursor = 0;
        s.normalDone = false;
        s.phase = 'day';
        riseAndVictory(s, true);
      }
      return s;
    }
    if (cmd.type === 'battle') {
      if (s.phase !== 'battle' || s.pending?.stage !== 'choose')
        throw Error('当前没有待出牌战斗');
      const b = s.pending;
      const humanIn = b.attackerOwner === 0 || b.defenderOwner === 0;
      if (humanIn)
        b.choices[0] = {
          play: cmd.play!,
          burn: cmd.burn!,
          di: cmd.diIds ?? [],
        };
      resolveBattle(s);
      return s;
    }
    if (cmd.type === 'aftermath') {
      if (s.pending?.stage !== 'aftermath') throw Error('请先结算战斗');
      finishBattle(s, cmd);
      return s;
    }
    if (s.phase !== 'day') throw Error('当前阶段不能进行普通行动');
    const p = active(s);
    const kind = cmd.kind ?? 'normal';
    if (cmd.type === 'end') {
      advance(s);
      return s;
    }
    if (cmd.type === 'attach') {
      const a = s.armies.find(
        (a) =>
          a.id === cmd.armyId &&
          a.owner === p.id &&
          a.kind === 'troop' &&
          zone(a.zone).type === 'district' &&
          zone(a.zone).city === p.city,
      );
      if (!a || s.normalDone) throw Error('请在自己的城区、放普通标记前调配');
      if (
        cmd.creatureId &&
        p.powers.includes(cmd.creatureId) &&
        isCreature(cmd.creatureId)
      ) {
        s.armies.forEach((x) => {
          if (x.creature === cmd.creatureId) x.creature = undefined;
        });
        a.creature = cmd.creatureId;
      }
      if (
        cmd.servantId &&
        p.powers.includes(cmd.servantId) &&
        isServant(cmd.servantId)
      ) {
        s.armies.forEach(
          (x) => (x.servants = x.servants.filter((id) => id !== cmd.servantId)),
        );
        a.servants = [cmd.servantId];
      }
      return s;
    }
    if (cmd.type === 'di') {
      const id = cmd.diIds?.[0],
        q = id ? di(id) : undefined;
      if (!id || !q || !p.di.includes(id) || q.phase !== 'day')
        throw Error('请选择当前可用的白昼神谕');
      const cost = price(p, q.cost);
      if (p.pp < cost) throw Error('祈祷值不足');
      p.pp -= cost;
      p.di = p.di.filter((x) => x !== id);
      s.diDiscard.push(id);
      if (q.pp) gain(s, p, q.pp);
      if (q.rain) {
        const a = s.armies.find(
          (a) => a.zone === cmd.target && a.owner !== p.id,
        );
        if (!a) throw Error('请选择一个敌方军团地区');
        kill(s, a, 1);
      }
      if (q.recruit) {
        const z = cmd.target ? zone(cmd.target) : undefined;
        const friendly = z
          ? s.armies.find((a) => a.zone === z.id && a.owner === p.id)
          : undefined;
        if (
          !z ||
          !((z.type === 'district' && z.city === p.city) || friendly) ||
          friendly?.kind === 'god'
        )
          throw Error('先选择自家城区或普通军团');
        const n = Math.min(
          cmd.count ?? q.recruit,
          q.recruit,
          p.reserve,
          troopLimit(p) - (friendly?.n ?? 0),
        );
        if (n > 0) {
          p.reserve -= n;
          const army = putArmy(s, p, z.id, n);
          autoAttach(s, p, army);
          queueBattle(s, army, z.id);
        }
      }
      log(s, `${pname(p)}使用${q.name}。`);
      riseAndVictory(s);
      if (s.battleQueue.length) nextBattle(s);
      return s;
    }
    let slot = cmd.slot ?? -1;
    const goldName = cmd.tileId ? tile(cmd.tileId)?.name : '';
    if (kind === 'gold' && cmd.type !== 'buy') {
      if (
        !cmd.tileId ||
        !p.powers.includes(cmd.tileId) ||
        !tile(cmd.tileId).phase.includes('金色')
      )
        throw Error('没有这项金色行动能力');
    }
    if (cmd.type === 'buy') {
      const id = cmd.tileId!;
      if (!canBuy(s, p, id, kind))
        throw Error('购买条件未满足：颜色、等级、同色次数、空格或费用');
      if (kind !== 'gold') slot = buySlot(s, p, id, kind);
      consume(s, p, slot, kind);
      p.pp -= buyPrice(p, id, kind === 'gold' ? 1 : 0);
      givePower(s, p, id, cmd.target, cmd.replace);
      p.bought.push(tile(id).color as Color);
      log(s, `${pname(p)}购买${tile(id).color}色 ${tile(id).name}。`);
    } else if (cmd.type === 'god') {
      if (!canGod(s, p, kind === 'gold' ? 'normal' : kind))
        throw Error('神祇条件：有人曾到4分、自城四级塔、对应空格、4祈祷');
      const i = p.pyramids.findIndex(
        (py, i) =>
          py.level === 4 &&
          canSlot(s, p, 5 + i, kind === 'silver' ? 'silver' : 'normal'),
      );
      const z =
        cmd.target ??
        homeZones(s, p).find(
          (z) => !troopsAt(s, z.id).some((a) => a.owner === p.id),
        )?.id;
      if (
        !z ||
        zone(z).city !== p.city ||
        troopsAt(s, z).some((a) => a.owner === p.id)
      )
        throw Error('神祇需要自家没有己方军团的城区');
      consume(s, p, 5 + i, kind);
      p.pp -= 4;
      p.godUnlocked = true;
      const a = putArmy(s, p, z, GODS[p.god].life_max, 'god');
      if (GODS[p.god].name === 'Sobek')
        replaceBattleCard(p, 'sobek', cmd.replace);
      queueBattle(s, a, z);
      log(s, `${pname(p)}降临战场。`);
    } else {
      if (slot < 0)
        slot =
          slotsFor(
            s,
            p,
            cmd.type,
            kind === 'silver' ? 'silver' : 'normal',
          )[0] ?? -1;
      if (
        kind !== 'gold' &&
        SLOTS[slot]?.action !== cmd.type &&
        cmd.type !== 'pass'
      )
        throw Error('行动与选中的格子不匹配');
      if (cmd.type === 'build') {
        const i = cmd.pyramid ?? 0,
          to = cmd.level ?? 0,
          py = p.pyramids[i];
        if (!py || to <= py.level || to > 4)
          throw Error('请选择更高的金字塔等级');
        if (
          !py.level &&
          (!cmd.color || p.pyramids.some((x) => x.color === cmd.color))
        )
          throw Error('新金字塔需选择不同颜色');
        const cost = buildPrice(p, i, to);
        if (cost > p.pp) throw Error('祈祷值不足');
        consume(s, p, slot, kind);
        p.pp -= cost;
        if (!py.level) py.color = cmd.color!;
        py.level = to;
        log(
          s,
          `${pname(p)}把${py.color}色金字塔升至 ${to} 级，花费 ${cost} 祈祷。`,
        );
      } else if (cmd.type === 'pray') {
        consume(s, p, slot, kind);
        gain(s, p, 2 + (owns(p, '祭司') ? 1 : 0));
        if (owns(p, '强化祈祷')) {
          const z =
            cmd.target ??
            homeZones(s, p).find(
              (z) =>
                !troopsAt(s, z.id).some(
                  (a) => a.owner !== p.id || a.kind === 'god',
                ),
            )?.id;
          if (z) {
            const old = s.armies.find((a) => a.owner === p.id && a.zone === z),
              n = Math.min(2, p.reserve, troopLimit(p) - (old?.n ?? 0));
            if (n > 0) {
              const a = putArmy(s, p, z, n);
              p.reserve -= n;
              autoAttach(s, p, a);
              queueBattle(s, a, z);
            }
          }
        }
        log(s, `${pname(p)}祈祷，现有 ${p.pp} 祈祷值。`);
      } else if (cmd.type === 'move') {
        if (
          goldName === '勇士参拜' &&
          !s.armies.find((a) => a.id === cmd.armyId)?.servants.length
        )
          throw Error('勇士参拜只能移动有仆从的军团');
        consume(s, p, slot, kind);
        moveArmy(s, p, cmd, goldName === '急速行军', goldName === '奇袭');
      } else if (cmd.type === 'recruit') {
        const placements = cmd.placements ?? [];
        if (
          goldName === '勇士参拜' &&
          (cmd.godZone ||
            !placements.every((pl) => {
              const a = s.armies.find(
                (a) => a.owner === p.id && a.zone === pl.zone,
              );
              return (
                !!a?.servants.length ||
                (zone(pl.zone)?.type === 'district' &&
                  zone(pl.zone).city === p.city &&
                  availableCompanions(s, p, true).length > 0)
              );
            }))
        )
          throw Error('勇士参拜的招募需要与仆从同队');
        let total = 0;
        const used = new Set<string>();
        for (const pl of placements) {
          if (used.has(pl.zone) || pl.n < 0 || !Number.isInteger(pl.n))
            throw Error('招募数量无效');
          used.add(pl.zone);
          const z = zone(pl.zone),
            friendly = s.armies.find(
              (a) => a.owner === p.id && a.zone === pl.zone,
            );
          if (
            !z ||
            !(
              (z.type === 'district' && z.city === p.city) ||
              (owns(p, '本地征募') && friendly)
            ) ||
            friendly?.kind === 'god' ||
            (friendly?.n ?? 0) + pl.n > troopLimit(p)
          )
            throw Error('招募地点或军团上限不合法');
          total += pl.n;
        }
        const free = owns(p, '全力增援')
          ? total
          : (owns(p, '招募令') ? 3 : 0) + (owns(p, '本地征募') ? 1 : 0);
        const cost = price(p, Math.max(0, total - free));
        if (total > p.reserve || cost > p.pp)
          throw Error('供应区士兵或祈祷值不足');
        if (
          cmd.godZone &&
          (!p.godUnlocked ||
            s.armies.some((a) => a.owner === p.id && a.kind === 'god') ||
            zone(cmd.godZone).city !== p.city ||
            troopsAt(s, cmd.godZone).some((a) => a.owner === p.id) ||
            placements.some((x) => x.zone === cmd.godZone && x.n > 0))
        )
          throw Error('神祇重新部署地点不合法');
        consume(s, p, slot, kind);
        p.pp -= cost;
        p.reserve -= total;
        for (const pl of placements) {
          if (pl.n) {
            const a = putArmy(s, p, pl.zone, pl.n);
            autoAttach(s, p, a);
            queueBattle(s, a, pl.zone);
          }
        }
        if (cmd.godZone) {
          const a = putArmy(s, p, cmd.godZone, GODS[p.god].life_max, 'god');
          queueBattle(s, a, cmd.godZone);
        }
        log(
          s,
          `${pname(p)}招募 ${total} 名士兵${cmd.godZone ? '，并重新部署神祇' : ''}。`,
        );
      } else if (cmd.type === 'pass') {
        consume(s, p, slot, kind);
        log(s, `${pname(p)}放置行动标记，本次不执行效果。`);
      } else throw Error('未知行动');
    }
    riseAndVictory(s);
    if (s.battleQueue.length) nextBattle(s);
    return s;
  } catch (e) {
    return { ...s0, error: e instanceof Error ? e.message : '行动未完成' };
  }
}

export function powerValue(s: Game, p: Player, id: string) {
  const t = tile(id),
    n = t.name;
  let v = t.level * 0.45 + 1;
  const values: Record<string, number> = {
    女祭司: 6.4,
    祭司: 4.7,
    '冲锋！': 5.4,
    玛芙代特的祭司: 3.2,
    远古圣象: 8,
    凤凰: 7,
    圣甲虫: 6.5,
    奈斯之刃: 6,
    屠杀: 3.5,
    空间传送: 5,
    魔法支援: p.pyramids.some((x) => x.level < 3) ? 4.8 : 1,
    主宰: score(s, p) >= 6 ? 10 : 1,
    神的旨意: 7.8,
    以守为攻: 5.5,
    秘密侦查: 6.3,
    人多势众: 3.4,
    强化祈祷: 5.5,
    战争荣耀: 3.3,
    全力出击: 5.5,
    鹰头狮身斯芬克斯: 7.5,
    灵魂吞噬者: 9,
    狂野之怒: 8.5,
    神圣之力: 7,
    豺狼: 6.3,
    仆从赫卡伊布: 6.1,
    仆从梅里普塔赫: 5.8,
    猫: 8.5,
    人面狮身斯芬克斯: 8,
    先发制人: 8.5,
    阿蒙神的祭司: 5,
    神圣意志: 6.7,
    急速行军: 5.6,
    战车风暴: 4.2,
    龟甲防御: 4.4,
    奈斯之盾: 4.2,
  };
  v = values[n] ?? v;
  if (isCreature(id) && p.powers.some(isCreature)) v *= 0.52;
  if (t.level >= 3 && p.pp - buyPrice(p, id) < 2) v -= 1;
  if (n.includes('佣兵')) v = p.reserve < 3 ? 4 : 2;
  return v;
}
export function aiAction(s: Game): Command {
  if (s.phase === 'battle')
    return { type: s.pending?.stage === 'choose' ? 'battle' : 'aftermath' };
  if (s.phase === 'order')
    return { type: 'order', position: s.orderDraft!.available[0] };
  const p = active(s);
  if (!s.normalDone) {
    const prayer = p.di.find((id) => di(id)?.pp);
    if (prayer && p.pp < 7) return { type: 'di', diIds: [prayer] };
    const support = p.di.find((id) => di(id)?.recruit);
    if (support && p.reserve > 0) {
      const a = s.armies.find(
        (a) => a.owner === p.id && a.kind === 'troop' && a.n < troopLimit(p),
      );
      if (a) return { type: 'di', diIds: [support], target: a.zone };
    }
    const rain = p.di.find(
      (id) => di(id)?.rain && (di(id)?.cost ?? 99) <= p.pp,
    );
    if (rain) {
      const enemy = s.armies
        .filter(
          (a) =>
            a.owner !== p.id && a.n === 1 && zone(a.zone).type === 'temple',
        )
        .sort(
          (a, b) => score(s, s.players[b.owner]) - score(s, s.players[a.owner]),
        )[0];
      if (enemy) return { type: 'di', diIds: [rain], target: enemy.zone };
    }
  }
  if (s.normalDone) {
    const golds = p.powers.filter((id) => tile(id).phase.includes('金色'));
    if (!p.goldUsed) {
      for (const id of golds) {
        const name = tile(id).name;
        if (name === '双重仪式') {
          const best = POWERS.filter((t) => canBuy(s, p, t.id, 'gold')).sort(
            (a, b) => powerValue(s, p, b.id) - powerValue(s, p, a.id),
          )[0];
          if (best && powerValue(s, p, best.id) > 3)
            return { type: 'buy', kind: 'gold', tileId: best.id };
        }
        if (['神圣意志', '急速行军', '奇袭', '勇士参拜'].includes(name)) {
          const move = bestAIMove(
            s,
            p,
            name === '急速行军',
            name === '奇袭',
            name === '勇士参拜',
          );
          if (move && move.value > 3) {
            const c: Command = { ...move.command, kind: 'gold', tileId: id };
            if (!apply(s, c).error) return c;
          }
        }
      }
    }
    if (!p.silverUsed && owns(p, '神的旨意'))
      return chooseNormalAI(s, p, 'silver');
    return { type: 'end' };
  }
  return chooseNormalAI(s, p, 'normal');
}
function bestAIMove(
  s: Game,
  p: Player,
  noTeleport = false,
  ignoreWalls = false,
  requireServant = false,
) {
  let best: { value: number; command: Command } | null = null;
  for (const a of s.armies.filter(
    (a) => a.owner === p.id && (!requireServant || a.servants.length > 0),
  )) {
    for (const m of moves(s, a, a.n, true, noTeleport, ignoreWalls)) {
      const z = zone(m.target),
        enemy = s.armies.find((x) => x.zone === m.target && x.owner !== p.id);
      let value = 0;
      if (z.type === 'temple') value = 4.8 + (z.income ?? 0) * 0.35;
      if (z.type === 'sanctuary') value = a.n >= 3 ? 4 : 1;
      if (z.type === 'district') {
        const py = s.players
          .flatMap((q) => q.pyramids)
          .find((py) => py.zone === z.id);
        value = py?.level === 4 ? 6 : 0;
      }
      if (enemy) {
        const original = a.zone;
        const moved = { ...a, zone: m.target };
        const attack =
          armyStats(s, moved, true, enemy).strength +
          Math.max(
            ...p.hand.map(
              (c) => card(c).strength - (card(c).selfDamage ?? 0) * 0.4,
            ),
          );
        const defend = armyStats(s, enemy, false, moved).strength + 2.7;
        value += attack > defend ? 4 : attack > defend - 1 ? 1 : -5;
        if (score(s, s.players[enemy.owner]) >= 8) value += 4;
        a.zone = original;
      }
      const cur = zone(a.zone);
      if (cur.type === 'temple' && !enemy) value -= 2;
      if (cur.type === 'sanctuary' && a.n >= 3 && !enemy) value -= 2.5;
      if (ownerAt(s, m.target) === p.id) value -= 4;
      if (a.n < 3 && a.kind === 'troop') value -= 1.5;
      value -= m.cost * 0.25;
      value += (rng({ ...s }) - 0.5) * 0.1;
      if (value > (best?.value ?? -Infinity))
        best = {
          value,
          command: {
            type: 'move',
            armyId: a.id,
            target: m.target,
            count: a.n,
            companions: true,
          },
        };
    }
  }
  return best;
}
function chooseNormalAI(
  s: Game,
  p: Player,
  kind: 'normal' | 'silver',
): Command {
  const options: { value: number; command: Command }[] = [];
  const moveslots = slotsFor(s, p, 'move', kind);
  if (moveslots.length) {
    const b = bestAIMove(s, p);
    if (b)
      options.push({
        value: b.value,
        command: { ...b.command, slot: moveslots[0], kind },
      });
  }
  for (const t of POWERS)
    if (canBuy(s, p, t.id, kind))
      options.push({
        value: powerValue(s, p, t.id),
        command: { type: 'buy', tileId: t.id, kind },
      });
  if (canGod(s, p, kind))
    options.push({ value: 7.5, command: { type: 'god', kind } });
  const build = slotsFor(s, p, 'build', kind)[0];
  if (build !== undefined) {
    p.pyramids.forEach((py, i) => {
      if (py.level >= 4) return;
      const to = py.level + 1,
        col =
          py.color ??
          COLORS.find((c) => !p.pyramids.some((x) => x.color === c))!;
      const cost = buildPrice(p, i, to);
      if (cost > p.pp) return;
      const next = POWERS.filter(
        (t) =>
          t.color === col &&
          t.level <= to &&
          t.level > py.level &&
          s.market[t.id] > 0 &&
          !p.powers.some((id) => tile(id).name === t.name),
      );
      const best = Math.max(0, ...next.map((t) => powerValue(s, p, t.id)));
      let v = best * 0.6 - (p.pp - cost < 2 ? 1.4 : 0);
      if (to === 4) v += s.rise && !p.godUnlocked ? 3 : 1.5;
      if (score(s, p) >= 8 && to === 4) v += 8;
      options.push({
        value: v,
        command: {
          type: 'build',
          pyramid: i,
          level: to,
          color: col,
          slot: build,
          kind,
        },
      });
    });
  }
  const recruit = slotsFor(s, p, 'recruit', kind)[0];
  if (recruit !== undefined) {
    const safe = homeZones(s, p).filter(
      (z) =>
        !troopsAt(s, z.id).some((a) => a.kind === 'god' || a.owner !== p.id),
    );
    const z = safe.find((z) => troopsAt(s, z.id).length) ?? safe[0];
    if (z) {
      const existing = troopsAt(s, z.id).find((a) => a.owner === p.id);
      const free = (owns(p, '招募令') ? 3 : 0) + (owns(p, '本地征募') ? 1 : 0);
      const n = Math.min(
        p.reserve,
        troopLimit(p) - (existing?.n ?? 0),
        owns(p, '全力增援') ? 20 : p.pp + free,
      );
      if (n > 0) {
        const field = s.armies
          .filter((a) => a.owner === p.id && a.kind === 'troop')
          .reduce((n, a) => n + a.n, 0);
        options.push({
          value: field < 6 ? 8 : field < 9 ? 5 : 1.6,
          command: {
            type: 'recruit',
            placements: [{ zone: z.id, n }],
            slot: recruit,
            kind,
          },
        });
      }
      if (
        p.godUnlocked &&
        !s.armies.some((a) => a.owner === p.id && a.kind === 'god')
      ) {
        const empty = safe.find((z) => !troopsAt(s, z.id).length);
        if (empty)
          options.push({
            value: 8.5,
            command: {
              type: 'recruit',
              placements: [],
              godZone: empty.id,
              slot: recruit,
              kind,
            },
          });
      }
    }
  }
  const pray = slotsFor(s, p, 'pray', kind)[0];
  if (pray !== undefined)
    options.push({
      value: p.pp < 2 ? 9 : p.pp < 4 ? 6 : p.pp < 7 ? 3.5 : 0.5,
      command: { type: 'pray', slot: pray, kind },
    });
  options.sort((a, b) => b.value - a.value);
  for (const o of options) {
    const result = apply(s, o.command);
    if (!result.error) return o.command;
  }
  const fallback = SLOTS.findIndex((_, i) => canSlot(s, p, i, kind));
  return { type: 'pass', slot: fallback, kind };
}
export function validateGame(s: Game) {
  const issues: string[] = [];
  for (const p of s.players) {
    if (p.pp < 0 || p.pp > 11) issues.push('PP ' + p.id);
    if (normalUsed(p) > 5) issues.push('actions ' + p.id);
    const n = s.armies
      .filter((a) => a.owner === p.id && a.kind === 'troop')
      .reduce((n, a) => n + a.n, 0);
    const supply =
      12 + p.powers.filter((id) => tile(id).name.includes('族佣兵')).length * 3;
    if (n + p.reserve !== supply)
      issues.push(`soldiers ${p.id} ${n + p.reserve}/${supply}`);
    if (new Set(p.hand).size !== p.hand.length) issues.push('hand duplicate');
    if (
      p.deck.length !== 8 ||
      new Set(p.deck).size !== 8 ||
      p.hand.length + p.played.length + p.burned.length !== 8
    )
      issues.push('battle deck ' + p.id);
    if (
      s.phase !== 'battle' &&
      s.armies.some(
        (a) => a.owner === p.id && a.kind === 'troop' && a.n > troopLimit(p),
      )
    )
      issues.push('troop limit ' + p.id);
  }
  const allDI = [
    ...s.diDeck,
    ...s.diDiscard,
    ...s.players.flatMap((p) => p.di),
  ];
  if (
    allDI.filter((id) => !id.startsWith('diversion:')).length !== 33 ||
    new Set(allDI).size !== allDI.length
  )
    issues.push('DI conservation');
  if (s.diDiscard.some((id) => id.startsWith('diversion:')))
    issues.push('diversion discarded');
  return issues;
}
