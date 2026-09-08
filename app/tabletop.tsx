'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Swords,
  Coins,
  Users,
  Layers,
  Sun,
  Moon,
  Crown,
  BookOpen,
  Pause,
  Play,
  RotateCcw,
  ArrowRight,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Flag,
  Shield,
  Flame,
  Eye,
  EyeOff,
  ChevronDown,
  Undo2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import TabletopScene from './tabletop-scene';
import {
  newGame,
  apply,
  active,
  score,
  pname,
  normalUsed,
  SLOTS,
  COLORS,
  GODS,
  POWERS,
  FACTION_COLORS,
  ZONES,
  zone,
  tile,
  card,
  CARDS,
  DI_CARDS,
  di,
  owns,
  isCreature,
  isServant,
  availableCompanions,
  canSlot,
  canBuy,
  buyPrice,
  buildPrice,
  canGod,
  moves,
  retreatOptions,
  defaultNight,
  homeZones,
  troopLimit,
  aiAction,
  revealableEnemyCard,
  type Game,
  type Command,
  type Color,
  type NightOptions,
} from '@/lib/game';
const SAVE = 'kemet.table.v2';
const colorStyles: Record<string, string> = {
  红: '#b55843',
  蓝: '#497f9a',
  白: '#a99366',
  黑: '#3d5550',
  琥珀: '#ba8739',
};
function NumberControl({
  value,
  onChange,
  max = 11,
  min = 0,
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  min?: number;
}) {
  return (
    <span className="number-control">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="减少"
        disabled={value <= min}
      >
        <Minus size={14} />
      </button>
      <strong>{value}</strong>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="增加"
        disabled={value >= max}
      >
        <Plus size={14} />
      </button>
    </span>
  );
}
function ColorPicker({
  value,
  onChange,
  exclude,
}: {
  value: string;
  onChange: (c: Color) => void;
  exclude?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v as Color)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {COLORS.filter((c) => c !== exclude).map((c) => (
          <SelectItem key={c} value={c}>
            {c}色金字塔
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function CardArt({ id }: { id: string }) {
  const t = tile(id),
    a = t.art as typeof t.art & { sourceWidth?: number; sourceHeight?: number };
  const sw = a.sourceWidth ?? 4032,
    sh = a.sourceHeight ?? (t.color === '琥珀' ? 4032 : 3024);
  return (
    <div
      className="tile-art"
      role="img"
      aria-label={t.name}
      style={{
        backgroundImage: `url('${a.src}')`,
        backgroundSize: `${(sw / a.width) * 100}% ${(sh / a.height) * 100}%`,
        backgroundPosition: `${(a.x / (sw - a.width)) * 100}% ${(a.y / (sh - a.height)) * 100}%`,
        aspectRatio: `${a.width}/${a.height}`,
      }}
    />
  );
}
export default function Tabletop() {
  const [game, setGame] = useState<Game>(() => newGame(0, '蓝', '白', 41729)),
    [ready, setReady] = useState(false),
    [started, setStarted] = useState(false),
    [paused, setPaused] = useState(false),
    [selected, setSelected] = useState<string | null>(null),
    [mode, setMode] = useState<'move' | null>(null),
    [slot, setSlot] = useState(0),
    [kind, setKind] = useState<'normal' | 'silver' | 'gold'>('normal'),
    [modal, setModal] = useState<string | null>(null),
    [mainColor, setMainColor] = useState<Color>('蓝'),
    [secondColor, setSecondColor] = useState<Color>('白'),
    [godChoice, setGodChoice] = useState(0),
    [count, setCount] = useState(5),
    [withCompanions, setWithCompanions] = useState(true),
    [marketColor, setMarketColor] = useState('全部'),
    [selectedTile, setSelectedTile] = useState<string | null>(null),
    [tower, setTower] = useState(0),
    [toLevel, setToLevel] = useState(3),
    [newColor, setNewColor] = useState<Color>('红'),
    [recruit, setRecruit] = useState<Record<string, number>>({}),
    [godZone, setGodZone] = useState(''),
    [playCard, setPlayCard] = useState(''),
    [burnCard, setBurnCard] = useState(''),
    [selectedDI, setSelectedDI] = useState<string[]>([]),
    [recall, setRecall] = useState(false),
    [retreat, setRetreat] = useState(''),
    [night, setNight] = useState<NightOptions | null>(null),
    [history, setHistory] = useState<Game[]>([]),
    [inspectPlayer, setInspectPlayer] = useState(0),
    [goldTile, setGoldTile] = useState<string | undefined>(),
    [rulesTab, setRulesTab] = useState('quick'),
    [replaceCard, setReplaceCard] = useState('b4');
  const human = game.players[0],
    acting = active(game),
    myTurn = game.phase === 'day' && acting.id === 0,
    selectedArmy = game.armies.find(
      (a) => a.zone === selected && a.owner === 0,
    ),
    targets = useMemo(
      () =>
        mode === 'move' && selectedArmy
          ? moves(
              game,
              selectedArmy,
              count,
              withCompanions,
              goldTile ? tile(goldTile).name === '急速行军' : false,
              goldTile ? tile(goldTile).name === '奇袭' : false,
              selectedDI,
            )
          : [],
      [game, mode, selectedArmy, count, withCompanions, goldTile, selectedDI],
    );
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.version === 2 && saved.players?.length === 6) {
          setGame(saved);
          setStarted(true);
        }
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready && started)
      try {
        localStorage.setItem(SAVE, JSON.stringify(game));
      } catch {}
  }, [game, ready, started]);
  const send = (cmd: Command) => {
    setHistory((h) => [game, ...h].slice(0, 20));
    const next = apply(game, cmd);
    setGame(next);
    if (!next.error) {
      setModal(null);
      setMode(null);
      setGoldTile(undefined);
      setSelectedDI([]);
    }
    return next;
  };
  useEffect(() => {
    if (
      !ready ||
      !started ||
      paused ||
      game.phase === 'finished' ||
      game.phase === 'setup' ||
      game.phase === 'night'
    )
      return;
    const humanBattle =
      game.phase === 'battle' &&
      (game.pending?.attackerOwner === 0 || game.pending?.defenderOwner === 0);
    if (humanBattle) return;
    if (
      game.phase === 'order' &&
      game.orderDraft?.pickers[game.orderDraft.index] === 0
    )
      return;
    if (game.phase === 'day' && active(game).id === 0) return;
    const timer = setTimeout(
      () => {
        setGame((old) => {
          const cmd = aiAction(old),
            next = apply(old, cmd);
          if (next.error && old.phase === 'day') {
            return apply(
              old,
              old.normalDone
                ? { type: 'end' }
                : {
                    type: 'pass',
                    slot: SLOTS.findIndex((_, i) =>
                      canSlot(old, active(old), i),
                    ),
                  },
            );
          }
          return next;
        });
      },
      game.phase === 'battle' ? 1100 : 850,
    );
    return () => clearTimeout(timer);
  }, [game, ready, started, paused]);
  useEffect(() => {
    setPlayCard('');
    setBurnCard('');
    setSelectedDI([]);
    setRecall(false);
    setRetreat('');
  }, [game.pending?.attacker, game.pending?.defender, game.pending?.stage]);
  useEffect(() => {
    if (game.phase === 'night') setNight(defaultNight(game, game.players[0]));
  }, [game.phase, game.round]);
  function start() {
    const next = newGame(godChoice, mainColor, secondColor);
    setGame(next);
    setStarted(true);
    setHistory([]);
    setSelected(null);
    setModal(null);
    setMode(null);
    setPaused(false);
  }
  function onZone(id: string) {
    if (
      mode === 'move' &&
      selectedArmy &&
      targets.some((t) => t.target === id)
    ) {
      send({
        type: 'move',
        armyId: selectedArmy.id,
        target: id,
        count,
        companions: withCompanions,
        slot,
        kind,
        tileId: goldTile,
        diIds: selectedDI,
      });
      return;
    }
    setSelected(id);
    const a = game.armies.find((a) => a.zone === id && a.owner === 0);
    if (a) setCount(a.n);
    if (mode === 'move' && !a) setMode(null);
  }
  function openSlot(i: number, as: 'normal' | 'silver' = 'normal') {
    if (!canSlot(game, human, i, as)) return;
    setSlot(i);
    setKind(as);
    setGoldTile(undefined);
    setSelectedDI([]);
    const action = SLOTS[i].action;
    if (action === 'pray') {
      send({ type: 'pray', slot: i, kind: as, target: selected ?? undefined });
      return;
    }
    if (action === 'move') {
      setMode('move');
      if (selectedArmy) setCount(selectedArmy.n);
      else {
        const a = game.armies.find((a) => a.owner === 0);
        if (a) {
          setSelected(a.zone);
          setCount(a.n);
        }
      }
      return;
    }
    if (action === 'buy') {
      setMarketColor(human.pyramids[i - 5]?.color ?? '全部');
      setSelectedTile(null);
      setModal('market');
      return;
    }
    if (action === 'build') {
      setTower(0);
      setToLevel(Math.min(4, human.pyramids[0].level + 1));
      setNewColor(
        COLORS.find((c) => !human.pyramids.some((p) => p.color === c)) ?? '红',
      );
      setModal('build');
      return;
    }
    setRecruit({});
    setGodZone('');
    setModal('recruit');
  }
  function openGold(id: string) {
    const n = tile(id).name;
    setKind('gold');
    setGoldTile(id);
    if (n === '双重仪式') {
      setModal('market');
      setMarketColor('全部');
      setSelectedTile(null);
    } else if (['急速行军', '奇袭', '神圣意志', '勇士参拜'].includes(n)) {
      setModal('gold-action');
    }
  }
  const isHumanBattle =
      started &&
      game.phase === 'battle' &&
      (game.pending!.attackerOwner === 0 || game.pending!.defenderOwner === 0),
    result = game.pending?.result;
  const ownGodArmy = game.armies.find((a) => a.owner === 0 && a.kind === 'god');
  const battleEnemyCard = revealableEnemyCard(game);
  const battleLoserArmy = game.pending?.result
    ? game.armies.find(
        (a) =>
          a.id ===
          (game.pending!.result!.winner === game.pending!.attackerOwner
            ? game.pending!.defender
            : game.pending!.attacker),
      )
    : undefined;
  const godInfo = GODS[human.god];
  const winnerPlayer = game.players[game.winner ?? 0];
  const nextPlayer = game.order[(game.cursor + 1) % 6];
  const market = POWERS.filter(
    (p) => marketColor === '全部' || p.color === marketColor,
  );
  const title =
    game.phase === 'finished'
      ? '本局结束'
      : game.phase === 'setup'
        ? '选择起手能力'
        : game.phase === 'night'
          ? '黑夜结算'
          : game.phase === 'order'
            ? '选择下一轮顺位'
            : game.phase === 'battle'
              ? '战斗进行中'
              : myTurn
                ? game.normalDone
                  ? '可使用额外行动，或结束本次回合'
                  : '轮到你行动'
                : `${pname(acting)}正在行动`;
  return (
    <div className="game-app">
      <header className="game-top">
        <a className="game-brand" href="/">
          <span>K</span>
          <div>
            圣域 <b>血与沙</b>
          </div>
        </a>
        <div className="round-label">
          {game.phase === 'night' ? <Moon size={17} /> : <Sun size={17} />}第{' '}
          {game.round} 轮<span>{title}</span>
        </div>
        <div className="game-top-actions">
          <button
            onClick={() => setPaused((v) => !v)}
            aria-label={paused ? '继续电脑行动' : '暂停电脑行动'}
          >
            {paused ? <Play size={17} /> : <Pause size={17} />}
            <span>{paused ? '继续' : '暂停'}</span>
          </button>
          <button onClick={() => setModal('rules')}>
            <BookOpen size={17} />
            <span>规则</span>
          </button>
          <button onClick={() => setModal('restart')}>
            <RotateCcw size={17} />
            <span>新局</span>
          </button>
        </div>
      </header>
      <div className="player-strip">
        {game.players.map((p) => (
          <button
            key={p.id}
            className={`player-chip ${acting.id === p.id && game.phase === 'day' ? 'current' : ''} ${p.id === 0 ? 'human' : ''}`}
            onClick={() => {
              setInspectPlayer(p.id);
              setModal('player');
            }}
            style={
              { '--faction': FACTION_COLORS[p.god] } as React.CSSProperties
            }
          >
            <span className="player-seal">{GODS[p.god].name.slice(0, 1)}</span>
            <span className="player-identity">
              {pname(p)}
              <small>
                {p.id === 0 ? '你' : '电脑'} · {p.pp} 祈祷
              </small>
            </span>
            <strong>
              {score(game, p)}
              <small>分</small>
            </strong>
            <span className="action-pips">
              {Array.from({ length: 5 }, (_, i) => (
                <i key={i} className={i < normalUsed(p) ? 'used' : ''} />
              ))}
            </span>
          </button>
        ))}
      </div>
      <div className="game-workspace">
        <div className="board-column">
          <TabletopScene
            game={game}
            selected={selected}
            targets={targets}
            onZone={onZone}
          />
          <div className="board-status">
            <span className={`live-dot ${myTurn ? 'mine' : ''}`} />
            <strong>{title}</strong>
            <span>
              {mode === 'move'
                ? '点击绿色目标执行移动'
                : selected
                  ? zone(selected).name
                  : '点选地图上的棋子或地区'}
            </span>
            {paused ? <b>电脑已暂停</b> : null}
          </div>
          {game.error ? (
            <div className="game-error" role="alert">
              {game.error}
              <button
                onClick={() => setGame((s) => ({ ...s, error: undefined }))}
              >
                知道了
              </button>
            </div>
          ) : null}
          <div className="army-dock">
            {selected ? (
              <>
                <div>
                  <p className="eyebrow">已选地区</p>
                  <h3>{zone(selected).name}</h3>
                  <p>
                    {game.armies
                      .filter((a) => a.zone === selected)
                      .map(
                        (a) =>
                          `${pname(game.players[a.owner])} · ${a.kind === 'god' ? '神祇生命' : '士兵'} ${a.n}`,
                      )
                      .join(' / ') || '当前没有军团'}
                  </p>
                </div>
                {selectedArmy && mode === 'move' ? (
                  <>
                    <div className="move-amount">
                      <label>
                        移动{selectedArmy.kind === 'god' ? '神祇' : '士兵'}
                      </label>
                      <NumberControl
                        value={count}
                        min={selectedArmy.kind === 'god' ? selectedArmy.n : 1}
                        max={selectedArmy.n}
                        onChange={setCount}
                      />
                      {selectedArmy.creature || selectedArmy.servants.length ? (
                        <label className="tiny-toggle">
                          <Switch
                            checked={withCompanions}
                            onCheckedChange={setWithCompanions}
                          />
                          同行单位一起移动
                        </label>
                      ) : null}
                    </div>
                    <div className="move-spells">
                      {human.di
                        .filter((id) => di(id)?.phase === 'move')
                        .map((id) => (
                          <button
                            key={id}
                            title={di(id)?.effect}
                            className={
                              selectedDI.includes(id) ? 'selected' : ''
                            }
                            onClick={() =>
                              setSelectedDI((ds) =>
                                ds.includes(id)
                                  ? ds.filter((x) => x !== id)
                                  : [...ds, id],
                              )
                            }
                          >
                            {di(id)?.name}
                          </button>
                        ))}
                    </div>
                    <div className="move-count">
                      <strong>{targets.length}</strong>
                      <span>个合法目标</span>
                    </div>
                    <Button variant="outline" onClick={() => setMode(null)}>
                      取消移动
                    </Button>
                  </>
                ) : selectedArmy ? (
                  <div className="army-tags">
                    {selectedArmy.creature ? (
                      <span>神兽 · {tile(selectedArmy.creature).name}</span>
                    ) : null}
                    {selectedArmy.servants.map((id) => (
                      <span key={id}>仆从 · {tile(id).name}</span>
                    ))}
                    {myTurn && zone(selectedArmy.zone).type === 'district' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setModal('attach')}
                      >
                        调配同行单位
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="dock-help">
                <Swords size={22} />
                <p>
                  先点选你的军团，再使用个人面板的移动格。
                  <small>
                    电脑也受费用、移动范围、军团上限和行动标记限制。
                  </small>
                </p>
              </div>
            )}
          </div>
        </div>
        <aside className="game-panel">
          <div className="you-heading">
            <span className="eyebrow">你的势力</span>
            <h2>
              {pname(human)}
              <small> {godInfo.name}</small>
            </h2>
          </div>
          <div className="resource-grid">
            <div>
              <Coins size={18} />
              <strong>{human.pp}</strong>
              <span>祈祷值</span>
            </div>
            <div>
              <Users size={18} />
              <strong>{human.reserve}</strong>
              <span>待招募</span>
            </div>
            <div>
              <Flag size={18} />
              <strong>{score(game, human)}</strong>
              <span>总分 / 9</span>
            </div>
          </div>
          <div className="personal-heading">
            <h3>你的行动面板</h3>
            <span>{5 - normalUsed(human)} 个普通标记</span>
          </div>
          <div className="personal-board">
            {[3, 2, 1].map((row) => (
              <div className={'action-row row-' + row} key={row}>
                {SLOTS.map((s, i) =>
                  s.row === row ? (
                    <button
                      key={i}
                      className={`${human.used.some((u) => u.slot === i) ? 'occupied' : ''} ${mode === 'move' && slot === i ? 'selected' : ''}`}
                      disabled={!myTurn || !canSlot(game, human, i)}
                      onClick={() => openSlot(i)}
                    >
                      <span>
                        {s.action === 'move' ? (
                          <ArrowRight />
                        ) : s.action === 'recruit' ? (
                          <Users />
                        ) : s.action === 'pray' ? (
                          <Coins />
                        ) : s.action === 'build' ? (
                          <Layers />
                        ) : (
                          <ShoppingBag />
                        )}
                      </span>
                      <b>{s.name}</b>
                      {s.action === 'buy' ? (
                        <i
                          style={{
                            background:
                              colorStyles[human.pyramids[i - 5]?.color ?? '白'],
                          }}
                        >
                          {human.pyramids[i - 5]?.color ?? '—'}
                        </i>
                      ) : null}
                      {human.used.some((u) => u.slot === i) ? (
                        <em>
                          <Check size={13} />
                        </em>
                      ) : null}
                    </button>
                  ) : null,
                )}
              </div>
            ))}
          </div>
          <p className="balance-note">上、中、下三层，结束时各至少一个标记。</p>
          {myTurn && owns(human, '神的旨意') && !human.silverUsed ? (
            <div className="extra-actions">
              <label>银色额外行动</label>
              {SLOTS.map((s, i) =>
                canSlot(game, human, i, 'silver') ? (
                  <button key={i} onClick={() => openSlot(i, 'silver')}>
                    {s.row}层{s.name}
                  </button>
                ) : null,
              )}
            </div>
          ) : null}
          {myTurn &&
          !human.goldUsed &&
          human.powers.some((id) => tile(id).phase.includes('金色')) ? (
            <div className="extra-actions">
              <label>金色额外行动</label>
              {human.powers
                .filter((id) => tile(id).phase.includes('金色'))
                .map((id) => (
                  <button key={id} onClick={() => openGold(id)}>
                    {tile(id).name}
                  </button>
                ))}
            </div>
          ) : null}
          <Button
            className="end-turn"
            disabled={!myTurn || !game.normalDone}
            onClick={() => send({ type: 'end' })}
          >
            结束本次回合
            <ArrowRight size={17} />
          </Button>
          <div className="panel-shortcuts">
            <button
              onClick={() => {
                setKind('normal');
                setMarketColor('全部');
                setSelectedTile(null);
                setModal('market');
              }}
            >
              <ShoppingBag size={17} />
              能力市场{' '}
              <b>{POWERS.reduce((n, p) => n + game.market[p.id], 0)}</b>
            </button>
            <button onClick={() => setModal('di')}>
              <Sparkles size={17} />
              神谕手牌 <b>{human.di.length}</b>
            </button>
            <button onClick={() => setModal('god')}>
              <Crown size={17} />
              神祇入场{' '}
              <b>
                {human.godUnlocked
                  ? ownGodArmy
                    ? '在场'
                    : '可重部署'
                  : '未解锁'}
              </b>
            </button>
          </div>
          <div className="tiny-score">
            <span>
              永久分 <b>{human.vp}</b>
            </span>
            <span>
              临时分 <b>{score(game, human) - human.vp}</b>
            </span>
            <span>
              老兵 <b>{human.veterans}</b>
            </span>
          </div>
          <div className="game-log">
            <h3>战局记录</h3>
            {game.logs.slice(0, 5).map((l) => (
              <p key={l.id}>
                <span>{l.round}</span>
                {l.text}
              </p>
            ))}
          </div>
          <div className="panel-footer">
            <button
              disabled={!history.length}
              onClick={() => {
                setGame(history[0]);
                setHistory((h) => h.slice(1));
                setPaused(true);
              }}
            >
              <Undo2 size={14} />
              撤回我的上一步
            </button>
            <span>此设备自动保存</span>
          </div>
        </aside>
      </div>
      <Dialog open={!started && ready} onOpenChange={() => {}}>
        <DialogContent
          className="game-dialog setup-dialog"
          showCloseButton={false}
        >
          <DialogHeader>
            <p className="eyebrow">一位玩家 · 五位电脑对手</p>
            <DialogTitle>选择你的神，坐上游戏桌。</DialogTitle>
            <DialogDescription>
              六人各自作战，9 分获胜。神祇初始不在场，达到条件后再降临。
            </DialogDescription>
          </DialogHeader>
          <div className="god-choices">
            {GODS.map((g, i) => (
              <button
                key={g.name}
                className={godChoice === i ? 'selected' : ''}
                onClick={() => setGodChoice(i)}
                style={
                  { '--faction': FACTION_COLORS[i] } as React.CSSProperties
                }
              >
                <span>{g.name.slice(0, 1)}</span>
                <b>{g.name_zh}</b>
                <small>{g.name}</small>
              </button>
            ))}
          </div>
          <div className="setup-colors">
            <div>
              <label>主金字塔 · 2 级</label>
              <ColorPicker
                value={mainColor}
                exclude={secondColor}
                onChange={setMainColor}
              />
            </div>
            <div>
              <label>辅金字塔 · 1 级</label>
              <ColorPicker
                value={secondColor}
                exclude={mainColor}
                onChange={setSecondColor}
              />
            </div>
          </div>
          <p className="setup-tip">
            首局建议：蓝二级＋白一级，争取远古圣象。开局顺序随机，免费一级能力按逆序选择。
          </p>
          <Button className="gold-button" onClick={start}>
            布置六人对局
            <ArrowRight size={18} />
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={started && game.phase === 'setup'} onOpenChange={() => {}}>
        <DialogContent className="game-dialog" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>选一块免费的一级能力</DialogTitle>
            <DialogDescription>
              本局行动顺序：
              {game.order.map((id) => pname(game.players[id])).join(' → ')}
              。你从自己的金字塔颜色中选择。
            </DialogDescription>
          </DialogHeader>
          <div className="free-grid">
            {POWERS.filter(
              (t) =>
                t.level === 1 &&
                game.market[t.id] > 0 &&
                human.pyramids.some(
                  (py) => py.color === t.color && py.level > 0,
                ),
            ).map((t) => (
              <button
                key={t.id}
                className="free-tile"
                onClick={() => send({ type: 'setup', tileId: t.id })}
              >
                <CardArt id={t.id} />
                <div>
                  <h3>{t.name}</h3>
                  <span>
                    {t.color} · 余 {game.market[t.id]} 块
                  </span>
                  <p>{t.effect}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={modal === 'market'}
        onOpenChange={(o) => !o && setModal(null)}
      >
        <DialogContent className="game-dialog market-dialog">
          <DialogHeader>
            <DialogTitle>五色能力市场</DialogTitle>
            <DialogDescription>
              控制对应等级的同色金字塔，才能购买。当前 {human.pp} 祈祷值。
            </DialogDescription>
          </DialogHeader>
          <Tabs
            value={marketColor}
            onValueChange={(v) => setMarketColor(String(v))}
            className="market-tabs"
          >
            <TabsList>
              {['全部', ...COLORS].map((c) => (
                <TabsTrigger key={c} value={c}>
                  {c === '全部' ? '全部' : c + '色'}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="market-layout">
            <div className="market-grid">
              {market.map((t) => (
                <button
                  className={`market-tile ${selectedTile === t.id ? 'selected' : ''} ${game.market[t.id] === 0 ? 'sold' : ''}`}
                  key={t.id}
                  onClick={() => setSelectedTile(t.id)}
                >
                  <CardArt id={t.id} />
                  <span
                    className="tile-level"
                    style={{ background: colorStyles[t.color] }}
                  >
                    {t.level}
                  </span>
                  <strong>{t.name}</strong>
                  <small>
                    {game.market[t.id]
                      ? `余 ${game.market[t.id]} · ${buyPrice(human, t.id)} 祈祷`
                      : '已售完'}
                  </small>
                </button>
              ))}
            </div>
            <aside className="tile-detail">
              {selectedTile ? (
                <>
                  <CardArt id={selectedTile} />
                  <p className="eyebrow">
                    {tile(selectedTile).color}色 · {tile(selectedTile).level}级
                  </p>
                  <h2>{tile(selectedTile).name}</h2>
                  <span className="phase-chip">{tile(selectedTile).phase}</span>
                  <p>{tile(selectedTile).effect}</p>
                  {['战车风暴', '龟甲防御', '黑玛瑙之盾'].includes(
                    tile(selectedTile).name,
                  ) ? (
                    <Select
                      value={
                        human.deck.includes(replaceCard)
                          ? replaceCard
                          : human.deck[0]
                      }
                      onValueChange={(v) => v && setReplaceCard(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {human.deck.map((id) => (
                          <SelectItem key={id} value={id}>
                            移除 {card(id).strength} 力 / {card(id).damage} 伤 /{' '}
                            {card(id).shield} 盾
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                  {tile(selectedTile).uncertain.length ? (
                    <small>{tile(selectedTile).uncertain.join('；')}</small>
                  ) : null}
                  <Button
                    className="gold-button"
                    disabled={
                      !myTurn || !canBuy(game, human, selectedTile, kind)
                    }
                    onClick={() =>
                      send({
                        type: 'buy',
                        tileId: selectedTile,
                        kind,
                        target: selected ?? undefined,
                        replace: human.deck.includes(replaceCard)
                          ? replaceCard
                          : human.deck[0],
                      })
                    }
                  >
                    购买 ·{' '}
                    {buyPrice(human, selectedTile, kind === 'gold' ? 1 : 0)}{' '}
                    祈祷
                  </Button>
                  {!canBuy(game, human, selectedTile, kind) ? (
                    <small>
                      检查塔色和等级、同色购买次数、空行动格及费用。
                    </small>
                  ) : null}
                </>
              ) : (
                <div className="choose-tile">
                  <ShoppingBag size={30} />
                  <p>点一块能力，看效果和购买条件。</p>
                </div>
              )}
            </aside>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={modal === 'build'}
        onOpenChange={(o) => !o && setModal(null)}
      >
        <DialogContent className="game-dialog small-dialog">
          <DialogHeader>
            <DialogTitle>建造金字塔</DialogTitle>
            <DialogDescription>
              每新增一级分别付费，可以一次提升多级。
            </DialogDescription>
          </DialogHeader>
          <div className="pyramid-options">
            {human.pyramids.map((py, i) => (
              <button
                className={tower === i ? 'selected' : ''}
                key={i}
                onClick={() => {
                  setTower(i);
                  setToLevel(Math.min(4, py.level + 1));
                }}
              >
                <Layers />
                <span>
                  {py.color ?? '未建造'} · {py.level}级
                </span>
              </button>
            ))}
          </div>
          {human.pyramids[tower].level === 0 ? (
            <ColorPicker value={newColor} onChange={setNewColor} />
          ) : null}
          <div className="build-target">
            <span>目标等级</span>
            <NumberControl
              value={toLevel}
              min={Math.min(4, human.pyramids[tower].level + 1)}
              max={4}
              onChange={setToLevel}
            />
          </div>
          <p className="cost-preview">
            本次费用 <strong>{buildPrice(human, tower, toLevel)}</strong> 祈祷值
          </p>
          <Button
            className="gold-button"
            disabled={
              human.pyramids[tower].level >= 4 ||
              buildPrice(human, tower, toLevel) > human.pp
            }
            onClick={() =>
              send({
                type: 'build',
                slot,
                kind,
                pyramid: tower,
                level: toLevel,
                color: newColor,
              })
            }
          >
            确认建造
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={modal === 'recruit'}
        onOpenChange={(o) => !o && setModal(null)}
      >
        <DialogContent className="game-dialog small-dialog">
          <DialogHeader>
            <DialogTitle>招募与重新部署</DialogTitle>
            <DialogDescription>
              供应区 {human.reserve} 名士兵。通常每名 1 祈祷值，能力可减免。
            </DialogDescription>
          </DialogHeader>
          {(owns(human, '本地征募')
            ? ZONES.filter(
                (z) =>
                  (z.type === 'district' && z.city === human.city) ||
                  game.armies.some((a) => a.owner === 0 && a.zone === z.id),
              )
            : homeZones(game, human)
          )
            .filter(
              (z) =>
                !game.armies.some(
                  (a) => a.owner === 0 && a.zone === z.id && a.kind === 'god',
                ),
            )
            .map((z) => (
              <div className="recruit-row" key={z.id}>
                <span>
                  {z.name}
                  <small>
                    现有{' '}
                    {game.armies.find((a) => a.owner === 0 && a.zone === z.id)
                      ?.n ?? 0}{' '}
                    兵
                  </small>
                </span>
                <NumberControl
                  value={recruit[z.id] ?? 0}
                  onChange={(n) => setRecruit((r) => ({ ...r, [z.id]: n }))}
                  max={Math.min(
                    human.reserve,
                    troopLimit(human) -
                      (game.armies.find((a) => a.owner === 0 && a.zone === z.id)
                        ?.n ?? 0),
                  )}
                />
              </div>
            ))}
          {human.godUnlocked && !ownGodArmy ? (
            <div className="redeploy-select">
              <label>免费重新部署神祇</label>
              <Select
                value={godZone || 'none'}
                onValueChange={(v) => setGodZone(v === 'none' ? '' : String(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">本次不部署</SelectItem>
                  {homeZones(game, human)
                    .filter(
                      (z) =>
                        !game.armies.some(
                          (a) => a.owner === 0 && a.zone === z.id,
                        ),
                    )
                    .map((z) => (
                      <SelectItem key={z.id} value={z.id}>
                        {z.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <Button
            className="gold-button"
            onClick={() =>
              send({
                type: 'recruit',
                slot,
                kind,
                tileId: goldTile,
                placements: Object.entries(recruit)
                  .filter(([, n]) => n > 0)
                  .map(([zone, n]) => ({ zone, n })),
                godZone: godZone || undefined,
              })
            }
          >
            确认招募
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={isHumanBattle} onOpenChange={() => {}}>
        <DialogContent
          className="game-dialog battle-dialog"
          showCloseButton={false}
        >
          <DialogHeader>
            <p className="eyebrow">
              {game.pending
                ? `${pname(game.players[game.pending.attackerOwner])} 进攻 ${pname(game.players[game.pending.defenderOwner])}`
                : ''}
            </p>
            <DialogTitle>
              {game.pending?.stage === 'choose'
                ? '选一张出战，再暗弃一张。'
                : '战斗结果与去留'}
            </DialogTitle>
            <DialogDescription>
              {game.pending?.stage === 'choose'
                ? '双方出牌独立决定。红框为出战牌，灰框为暗弃牌。'
                : result
                  ? `${result.aStrength} 比 ${result.dStrength}，${pname(game.players[result.winner])}获胜。平局归防守方。`
                  : ''}
            </DialogDescription>
          </DialogHeader>
          {game.pending?.stage === 'choose' ? (
            <>
              <div className="sealed-opponent">
                <EyeOff size={20} />
                <span>
                  {battleEnemyCard
                    ? `秘密侦查：对手将出 ${card(battleEnemyCard).strength} 力 / ${card(battleEnemyCard).damage} 伤 / ${card(battleEnemyCard).shield} 盾`
                    : '对手已经准备出牌，牌面保持隐藏。'}
                </span>
              </div>
              <div className="combat-hand">
                {human.hand.map((id) => {
                  const c = card(id);
                  return (
                    <button
                      className={`combat-card ${id === playCard ? 'play-card' : ''} ${id === burnCard ? 'burn-card' : ''}`}
                      key={id}
                      onClick={() => {
                        if (id === playCard) {
                          setPlayCard('');
                          return;
                        }
                        if (id === burnCard) {
                          setBurnCard('');
                          return;
                        }
                        if (!playCard) setPlayCard(id);
                        else setBurnCard(id);
                      }}
                    >
                      <span className="combat-choice">
                        {id === playCard
                          ? '出战'
                          : id === burnCard
                            ? '暗弃'
                            : '战斗牌'}
                      </span>
                      <strong>
                        <Swords />
                        {c.strength}
                      </strong>
                      <div>
                        <span>
                          <Flame size={16} />
                          {c.damage}
                        </span>
                        <span>
                          <Shield size={16} />
                          {c.immune ? '∞' : c.shield}
                        </span>
                      </div>
                      {c.selfDamage ? (
                        <small>自损 {c.selfDamage} 真实伤害</small>
                      ) : c.returnAll ? (
                        <small>战后收回全部战斗牌</small>
                      ) : (
                        <small>{c.name}</small>
                      )}
                    </button>
                  );
                })}
              </div>
              {human.di.some((id) => di(id)?.phase === 'battle') ? (
                <div className="battle-di">
                  <h3>同时投入战斗神谕</h3>
                  {human.di
                    .filter((id) => di(id)?.phase === 'battle')
                    .map((id) => (
                      <button
                        key={id}
                        className={selectedDI.includes(id) ? 'selected' : ''}
                        onClick={() =>
                          setSelectedDI((ds) =>
                            ds.includes(id)
                              ? ds.filter((x) => x !== id)
                              : [...ds, id],
                          )
                        }
                      >
                        {di(id)!.name} · {di(id)!.cost} 祈祷
                        <span className="di-effect">{di(id)!.effect}</span>
                      </button>
                    ))}
                </div>
              ) : null}
              <Button
                className="gold-button"
                disabled={!playCard || !burnCard}
                onClick={() =>
                  send({
                    type: 'battle',
                    play: playCard,
                    burn: burnCard,
                    diIds: selectedDI,
                  })
                }
              >
                双方揭示并结算
                <ArrowRight size={17} />
              </Button>
            </>
          ) : result ? (
            <>
              <div className="battle-verdict">
                <div>
                  <strong>{result.aStrength}</strong>
                  <span>进攻方战力</span>
                </div>
                <b>VS</b>
                <div>
                  <strong>{result.dStrength}</strong>
                  <span>防守方战力</span>
                </div>
              </div>
              <div className="battle-outcomes">
                <p>
                  进攻方损失 <b>{result.aLoss}</b>，剩余 <b>{result.aLeft}</b>
                  ；防守方损失 <b>{result.dLoss}</b>，剩余 <b>{result.dLeft}</b>
                  。
                </p>
                <p>
                  进攻方战斗分 <b>＋{result.battlePoints}</b>；老兵分别{' '}
                  <b>
                    ＋{result.aVeterans} / ＋{result.dVeterans}
                  </b>
                  。
                </p>
                {result.notes.map((n) => (
                  <small key={n}>{n}</small>
                ))}
              </div>
              {game.armies.some(
                (a) =>
                  a.owner === 0 &&
                  (a.id === game.pending?.attacker ||
                    a.id === game.pending?.defender) &&
                  a.kind === 'troop',
              ) ? (
                <label className="recall-choice">
                  <Switch checked={recall} onCheckedChange={setRecall} />
                  <span>
                    {result.winner === 0 ? '胜方召回' : '败方召回'}
                    <small>
                      召回存活士兵，通常获得人数减一的祈祷值；已获得的永久分保留。
                    </small>
                  </span>
                </label>
              ) : (
                <p className="quiet-note">
                  神祇不能召回；失败时按合法退路撤退，没有退路则退场。
                </p>
              )}
              {result.winner === 0 && battleLoserArmy ? (
                <Select
                  value={retreat || 'auto'}
                  onValueChange={(v) =>
                    setRetreat(v === 'auto' ? '' : String(v))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="指定敌军撤退位置" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">系统选择合法撤退区</SelectItem>
                    {retreatOptions(game, battleLoserArmy!).map((id) => (
                      <SelectItem key={id} value={id}>
                        {zone(id).name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              <Button
                className="gold-button"
                onClick={() => send({ type: 'aftermath', recall, retreat })}
              >
                处理去留，返回棋盘
              </Button>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog
        open={started && game.phase === 'night' && !!night}
        onOpenChange={() => {}}
      >
        <DialogContent
          className="game-dialog small-dialog"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>黑夜 · 收益与整备</DialogTitle>
            <DialogDescription>
              先献祭、结算神庙，再换钱、抽牌、补兵。剩余老兵会清空。
            </DialogDescription>
          </DialogHeader>
          {night ? (
            <>
              <label className="night-option">
                <Switch
                  checked={night.sanctuary}
                  onCheckedChange={(v) => setNight({ ...night, sanctuary: v })}
                />
                若控制圣所，献祭 2 名士兵换 1 永久分
              </label>
              <label className="night-option">
                <Switch
                  checked={night.delta}
                  onCheckedChange={(v) => setNight({ ...night, delta: v })}
                />
                若控制三角洲神庙，献祭 1 换 5 祈祷
              </label>
              <p>
                你有 <b>{human.veterans}</b> 个老兵
              </p>
              <div className="recruit-row">
                <span>
                  兑换祈祷值<small>每点消耗 1 老兵</small>
                </span>
                <NumberControl
                  value={night.money}
                  max={human.veterans}
                  onChange={(n) => setNight({ ...night, money: n })}
                />
              </div>
              <div className="recruit-row">
                <span>
                  额外神谕卡<small>每张消耗 2 老兵</small>
                </span>
                <NumberControl
                  value={night.cards}
                  max={Math.floor(human.veterans / 2)}
                  onChange={(n) => setNight({ ...night, cards: n })}
                />
              </div>
              <div className="recruit-row">
                <span>
                  补充士兵<small>每名消耗 1 老兵</small>
                </span>
                <NumberControl
                  value={night.recruits}
                  max={Math.min(human.veterans, human.reserve)}
                  onChange={(n) => setNight({ ...night, recruits: n })}
                />
              </div>
              <Select
                value={night.recruitZone}
                onValueChange={(v) =>
                  v && setNight({ ...night, recruitZone: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {homeZones(game, human).map((z) => (
                    <SelectItem key={z.id} value={z.id}>
                      {z.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="gold-button"
                disabled={
                  night.money + night.cards * 2 + night.recruits >
                  human.veterans
                }
                onClick={() => send({ type: 'night', night })}
              >
                确认分配并结算黑夜
              </Button>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog
        open={
          started &&
          game.phase === 'order' &&
          game.orderDraft?.pickers[game.orderDraft.index] === 0
        }
        onOpenChange={() => {}}
      >
        <DialogContent
          className="game-dialog small-dialog"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>选择下一轮行动顺位</DialogTitle>
            <DialogDescription>
              分数较低者先选。亮起的位置还没有被占用。
            </DialogDescription>
          </DialogHeader>
          <div className="order-options">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                disabled={!game.orderDraft?.available.includes(i)}
                onClick={() => send({ type: 'order', position: i })}
              >
                {i + 1}
                <small>第{i + 1}位</small>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={modal === 'god'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="game-dialog small-dialog">
          <DialogHeader>
            <DialogTitle>{pname(human)} · 神祇</DialogTitle>
            <DialogDescription>
              基础战力 7，生命上限 {godInfo.life_max}
              。神独立作战，不能带士兵或神兽。
            </DialogDescription>
          </DialogHeader>
          <div className="god-requirements">
            {[
              [game.rise, '有人曾达到 4 分'],
              [
                human.pyramids.some((py) => py.level === 4),
                '自家城市有四级金字塔',
              ],
              [human.pp >= 4, '拥有 4 点祈祷值'],
            ].map(([okay, label]) => (
              <p key={String(label)} className={okay ? 'met' : ''}>
                <Check size={17} />
                {label}
              </p>
            ))}
          </div>
          {godInfo.effects.map((e) => (
            <div className="god-effect" key={e.phase}>
              <small>{e.phase}</small>
              <p>{e.effect}</p>
            </div>
          ))}
          {godInfo.uncertain.length ? (
            <p className="quiet-note">
              公开版差异：{godInfo.uncertain.join('；')}
            </p>
          ) : null}
          {godInfo.name === 'Sobek' && !human.godUnlocked ? (
            <Select
              value={
                human.deck.includes(replaceCard) ? replaceCard : human.deck[0]
              }
              onValueChange={(v) => v && setReplaceCard(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {human.deck.map((id) => (
                  <SelectItem key={id} value={id}>
                    移除 {card(id).strength} 力 / {card(id).damage} 伤 /{' '}
                    {card(id).shield} 盾
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <Button
            className="gold-button"
            disabled={!myTurn || !canGod(game, human)}
            onClick={() =>
              send({
                type: 'god',
                target:
                  selected && zone(selected).city === human.city
                    ? selected
                    : undefined,
                replace: human.deck.includes(replaceCard)
                  ? replaceCard
                  : human.deck[0],
              })
            }
          >
            {human.godUnlocked
              ? '已解锁，退场后通过招募重新部署'
              : '降临战场 · 固定 4 祈祷'}
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog
        open={modal === 'player'}
        onOpenChange={(o) => !o && setModal(null)}
      >
        <DialogContent className="game-dialog">
          <DialogHeader>
            <DialogTitle>
              {pname(game.players[inspectPlayer])}的公开信息
            </DialogTitle>
            <DialogDescription>
              总分 {score(game, game.players[inspectPlayer])}，祈祷{' '}
              {game.players[inspectPlayer].pp}，场上{' '}
              {game.armies.filter((a) => a.owner === inspectPlayer).length}{' '}
              支军团。隐藏手牌不展示。
            </DialogDescription>
          </DialogHeader>
          <div className="owned-list">
            {game.players[inspectPlayer].powers.length ? (
              game.players[inspectPlayer].powers.map((id) => (
                <div key={id}>
                  <CardArt id={id} />
                  <span>
                    <b>{tile(id).name}</b>
                    <small>{tile(id).effect}</small>
                  </span>
                </div>
              ))
            ) : (
              <p>尚未获得能力。</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={modal === 'attach'}
        onOpenChange={(o) => !o && setModal(null)}
      >
        <DialogContent className="game-dialog small-dialog">
          <DialogHeader>
            <DialogTitle>调配同行单位</DialogTitle>
            <DialogDescription>
              只在自己城区、放置普通标记前操作。同一军团通常一神兽一仆从。
            </DialogDescription>
          </DialogHeader>
          {human.powers
            .filter((id) => isCreature(id) || isServant(id))
            .map((id) => (
              <Button
                key={id}
                variant="outline"
                onClick={() =>
                  selectedArmy &&
                  send({
                    type: 'attach',
                    armyId: selectedArmy.id,
                    ...(isCreature(id)
                      ? { creatureId: id }
                      : { servantId: id }),
                  })
                }
              >
                {tile(id).name}
              </Button>
            ))}
        </DialogContent>
      </Dialog>
      <Dialog open={modal === 'di'} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="game-dialog small-dialog">
          <DialogHeader>
            <DialogTitle>神谕手牌</DialogTitle>
            <DialogDescription>
              战斗神谕在出牌时选择；白昼神谕可在自己行动前后使用。
            </DialogDescription>
          </DialogHeader>
          {human.di.length ? (
            human.di.map((id) => (
              <div className="di-row" key={id}>
                <div>
                  <b>{di(id)?.name ?? id}</b>
                  <small>
                    {di(id)?.phase === 'battle'
                      ? '战斗'
                      : di(id)?.phase === 'move'
                        ? '移动'
                        : '白昼'}{' '}
                    · {di(id)?.cost ?? 0} 祈祷
                  </small>
                  <p className="di-effect">{di(id)?.effect}</p>
                </div>
                <Button
                  variant="outline"
                  disabled={!myTurn || di(id)?.phase !== 'day'}
                  onClick={() =>
                    send({
                      type: 'di',
                      diIds: [id],
                      target: selected ?? undefined,
                      pyramid: tower,
                      color: newColor,
                    })
                  }
                >
                  使用
                </Button>
              </div>
            ))
          ) : (
            <p>当前没有神谕卡。</p>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={modal === 'gold-action'}
        onOpenChange={(o) => !o && setModal(null)}
      >
        <DialogContent className="game-dialog small-dialog">
          <DialogHeader>
            <DialogTitle>
              {goldTile ? tile(goldTile).name : '金色行动'}
            </DialogTitle>
            <DialogDescription>
              {goldTile ? tile(goldTile).effect : ''}
            </DialogDescription>
          </DialogHeader>
          <Button
            className="gold-button"
            onClick={() => {
              setMode('move');
              setModal(null);
              const a = selectedArmy ?? game.armies.find((a) => a.owner === 0);
              if (a) {
                setSelected(a.zone);
                setCount(a.n);
              }
            }}
          >
            额外移动
          </Button>
          {goldTile &&
          ['神圣意志', '勇士参拜'].includes(tile(goldTile).name) ? (
            <Button
              variant="outline"
              onClick={() => {
                setRecruit({});
                setGodZone('');
                setModal('recruit');
              }}
            >
              额外招募
            </Button>
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog
        open={modal === 'rules'}
        onOpenChange={(o) => !o && setModal(null)}
      >
        <DialogContent className="game-dialog rules-dialog">
          <DialogHeader>
            <DialogTitle>桌边规则</DialogTitle>
            <DialogDescription>
              六人各自作战，启用神祇；实体资料中的不确定事项在完整版中标明。
            </DialogDescription>
          </DialogHeader>
          <Tabs value={rulesTab} onValueChange={(v) => setRulesTab(String(v))}>
            <TabsList>
              <TabsTrigger value="quick">怎么玩</TabsTrigger>
              <TabsTrigger value="coverage">数字版处理</TabsTrigger>
              <TabsTrigger value="full">完整文档</TabsTrigger>
            </TabsList>
          </Tabs>
          {rulesTab === 'full' ? (
            <iframe title="完整规则文档" src="/rules.html" />
          ) : rulesTab === 'coverage' ? (
            <div className="rules-copy">
              <h3>与实体桌游的交互差别</h3>
              <p>
                地图和常规能力来自你提供的资料。默认不加入未确认的三级替换板。自动处理回收、资源上限、普通战斗奖励和阶段推进。
              </p>
              <p>
                少数需额外选择的效果暂由系统给出合法默认处理：预见弃牌、神圣伤痕、赛特抽牌取舍、巴卡坦转换、战利品选抽两张。神祇按公开版资料，索贝克伤害按进攻触发。
              </p>
              <p>
                当前移动支持起点分兵与终点合并，途中多次留兵/收兵尚不支持。原始规则文档保留全部实体规则。
              </p>
              <a href="/rules.md" download>
                下载 Markdown 规则
              </a>
            </div>
          ) : (
            <div className="rules-copy">
              <h3>每次放一个普通标记，然后结束本次回合</h3>
              <p>
                上、中、下三层在每个白昼结束时各至少一个标记。两个移动格、一个招募格、一个建造格、两个祈祷格、三个购买格。
              </p>
              <h3>主动进攻拿永久分</h3>
              <p>
                进攻获胜，而且伤亡后还有军团，通常获得 1
                战斗分。占神庙还有临时分，但离开或被赶走会失去。
              </p>
              <h3>先比力量，再算伤亡</h3>
              <p>
                力量相同，防守方胜。胜方也会损兵。双方各选一张出战牌及一张暗弃牌，用完手牌后再回收。
              </p>
              <h3>到 9 分还要等自己的回合开始</h3>
              <p>
                届时仍至少 9
                分，且无人比你更多，才立即获胜。神祇要先满足有人达4分、自家四级塔、对应空格和4祈祷。
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={modal === 'restart'}
        onOpenChange={(o) => !o && setModal(null)}
      >
        <DialogContent className="game-dialog small-dialog">
          <DialogHeader>
            <DialogTitle>重新布置一局？</DialogTitle>
            <DialogDescription>
              当前对局将被新局替换。原始规则文档不受影响。
            </DialogDescription>
          </DialogHeader>
          <Button
            className="gold-button"
            onClick={() => {
              setStarted(false);
              setModal(null);
              setPaused(true);
            }}
          >
            选择势力并重新开始
          </Button>
          <Button variant="outline" onClick={() => setModal(null)}>
            继续当前对局
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={game.phase === 'finished'} onOpenChange={() => {}}>
        <DialogContent
          className="game-dialog victory-dialog"
          showCloseButton={false}
        >
          <Crown size={48} />
          <DialogHeader>
            <DialogTitle>
              {game.winner === 0
                ? '你赢得了圣域。'
                : `${pname(winnerPlayer)}赢得本局`}
            </DialogTitle>
            <DialogDescription>
              第 {game.round} 轮，以 {score(game, winnerPlayer)}{' '}
              分在回合开始时满足胜利条件。
            </DialogDescription>
          </DialogHeader>
          <div className="final-ranking">
            {[...game.players]
              .sort((a, b) => score(game, b) - score(game, a))
              .map((p) => (
                <p key={p.id}>
                  <span>
                    {pname(p)}
                    {p.id === 0 ? ' · 你' : ''}
                  </span>
                  <strong>{score(game, p)} 分</strong>
                </p>
              ))}
          </div>
          <Button
            className="gold-button"
            onClick={() => {
              setStarted(false);
              setGame(newGame());
            }}
          >
            再开一局
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
