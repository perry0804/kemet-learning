'use client';
import { useState } from 'react';
import {
  Swords,
  Shield,
  Flame,
  Users,
  ArrowRight,
  RotateCcw,
  Trophy,
  Heart,
  Info,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { resolveCombat, type Army } from '@/lib/combat';

const fresh = (
  units: number,
  card: number,
  bonus: number,
  damage: number,
  shield: number,
): Army => ({
  units,
  card,
  bonus,
  damage,
  shield,
  trueDamage: 0,
  protected: 0,
});
export const presets = [
  {
    title: '圣象与冲锋',
    hint: '战力和防御，各算各的',
    a: fresh(5, 3, 2, 2, 1),
    d: fresh(4, 2, 0, 3, 0),
    temple: false,
  },
  {
    title: '打平会怎样',
    hint: '平局归防守方',
    a: fresh(5, 2, 0, 1, 0),
    d: fresh(4, 3, 0, 2, 1),
    temple: false,
  },
  {
    title: '赢了却死光',
    hint: '胜负不变，进攻分却有条件',
    a: fresh(3, 4, 1, 1, 0),
    d: fresh(4, 2, 0, 3, 0),
    temple: false,
  },
  {
    title: '抢下神庙',
    hint: '留下，还是带着永久分召回',
    a: fresh(5, 3, 1, 1, 1),
    d: fresh(3, 3, 0, 2, 0),
    temple: true,
  },
];
function Counter({
  label,
  value,
  max = 6,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  max?: number;
  min?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="counter">
      <span>
        {label}
        <strong>{value}</strong>
      </span>
      <Slider
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
      />
    </label>
  );
}
export default function Battle() {
  const [preset, setPreset] = useState(0),
    [a, setA] = useState<Army>({ ...presets[0].a }),
    [d, setD] = useState<Army>({ ...presets[0].d }),
    [stage, setStage] = useState(0),
    [temple, setTemple] = useState(false),
    [recall, setRecall] = useState(false);
  const r = resolveCombat(a, d);
  const change = (side: 'a' | 'd', key: keyof Army, value: number) => {
    (side === 'a' ? setA : setD)((old) => ({
      ...old,
      [key]: value,
      ...(key === 'units' ? { protected: Math.min(value, old.protected) } : {}),
    }));
    setStage(0);
  };
  const load = (i: number) => {
    setPreset(i);
    setA({ ...presets[i].a });
    setD({ ...presets[i].d });
    setTemple(presets[i].temple);
    setStage(0);
    setRecall(false);
  };
  const points =
    r.battlePoint +
    (temple && r.attackWins && r.attackLeft > 0 && !recall ? 1 : 0);
  return (
    <section className="lesson" aria-labelledby="battle-title">
      <div className="lesson-heading">
        <div>
          <p className="eyebrow">第一课 / 亲手打一仗</p>
          <h1 id="battle-title">
            赢下战斗，<span>不一定拿到分。</span>
          </h1>
          <p className="lead">调一调兵力和牌面，分三步看清胜负、伤亡与奖励。</p>
        </div>
        <span className="lesson-stamp">
          <Swords size={27} />
          <small>战斗演示</small>
        </span>
      </div>
      <Tabs
        value={String(preset)}
        onValueChange={(v) => load(Number(v))}
        className="scenario-tabs"
      >
        <TabsList>
          {presets.map((p, i) => (
            <TabsTrigger key={p.title} value={String(i)}>
              {p.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="battle-arena">
        {(['a', 'd'] as const).map((side) => {
          const army = side === 'a' ? a : d,
            left = side === 'a' ? r.attackLeft : r.defenseLeft,
            total = side === 'a' ? r.attackStrength : r.defenseStrength;
          return (
            <article
              className={`army ${side === 'a' ? 'attacker' : 'defender'}`}
              key={side}
            >
              <div className="army-heading">
                <span className="role">
                  <span className="role-dot" />
                  {side === 'a' ? '你 · 进攻方' : '对手 · 防守方'}
                </span>
                <span className="strength-total">
                  {total}
                  <small>战力</small>
                </span>
              </div>
              <div
                className="soldiers"
                aria-label={`${army.units}个士兵，${stage >= 2 ? left : army.units}个存活`}
              >
                {Array.from({ length: army.units }, (_, i) => (
                  <span
                    className={`soldier ${stage >= 2 && i >= left ? 'fallen' : ''}`}
                    key={i}
                  >
                    <Users size={24} />
                    {stage >= 2 && i >= left ? <i>×</i> : null}
                  </span>
                ))}
              </div>
              <div className="equation">
                <span>
                  {army.units}
                  <small>士兵</small>
                </span>
                <b>＋</b>
                <span>
                  {army.card}
                  <small>战斗牌</small>
                </span>
                <b>＋</b>
                <span>
                  {army.bonus}
                  <small>能力</small>
                </span>
                <b>＝</b>
                <strong>{total}</strong>
              </div>
              <div className="stat-controls">
                <Counter
                  label={`${side === 'a' ? '己方' : '对方'}士兵`}
                  value={army.units}
                  min={1}
                  max={7}
                  onChange={(v) => change(side, 'units', v)}
                />
                <Counter
                  label="战斗牌战力"
                  value={army.card}
                  onChange={(v) => change(side, 'card', v)}
                />
                <Counter
                  label="能力战力加成"
                  value={army.bonus}
                  onChange={(v) => change(side, 'bonus', v)}
                />
              </div>
              <div className="damage-controls">
                <div>
                  <Flame size={17} />
                  <Counter
                    label="造成的普通伤害"
                    value={army.damage}
                    onChange={(v) => change(side, 'damage', v)}
                  />
                </div>
                <div>
                  <Shield size={17} />
                  <Counter
                    label="自己的防御"
                    value={army.shield}
                    onChange={(v) => change(side, 'shield', v)}
                  />
                </div>
              </div>
              <Accordion>
                <AccordionItem value="advanced">
                  <AccordionTrigger>真实伤害与绝对防御</AccordionTrigger>
                  <AccordionContent>
                    <div className="stat-controls advanced">
                      <Counter
                        label="造成的真实伤害"
                        value={army.trueDamage}
                        max={5}
                        onChange={(v) => change(side, 'trueDamage', v)}
                      />
                      <Counter
                        label="绝对防御保护人数"
                        value={army.protected}
                        max={army.units}
                        onChange={(v) => change(side, 'protected', v)}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </article>
          );
        })}
        <span className="versus" aria-hidden="true">
          VS
        </span>
      </div>
      <div className="resolve-bar">
        <div className="step-dots">
          {['准备', '比战力', '算伤亡', '领奖励'].map((s, i) => (
            <button
              className={stage === i ? 'active' : ''}
              key={s}
              onClick={() => setStage(i)}
              aria-current={stage === i ? 'step' : undefined}
            >
              <span>{i || '·'}</span>
              {s}
            </button>
          ))}
        </div>
        <Button
          className="gold-button"
          onClick={() => setStage(stage === 3 ? 0 : stage + 1)}
        >
          {stage === 3 ? '再试一次' : stage === 0 ? '开始结算' : '下一步'}
          {stage === 3 ? <RotateCcw size={16} /> : <ArrowRight size={18} />}
        </Button>
      </div>
      <div className={`battle-result stage-${stage}`} aria-live="polite">
        <div className="result-symbol">
          {stage === 0 ? (
            <Swords />
          ) : stage === 1 ? (
            <Trophy />
          ) : stage === 2 ? (
            <Heart />
          ) : (
            <Trophy />
          )}
        </div>
        <div>
          <p className="eyebrow">
            {
              ['准备好了', '01 / 比较战力', '02 / 结算伤亡', '03 / 分数与老兵'][
                stage
              ]
            }
          </p>
          <h2>
            {stage === 0
              ? presets[preset].hint
              : stage === 1
                ? `${r.attackStrength} 比 ${r.defenseStrength}，${r.attackWins ? '你获胜' : '防守方获胜'}`
                : stage === 2
                  ? `你剩 ${r.attackLeft} 个兵，对手剩 ${r.defenseLeft} 个兵`
                  : `你得到 ${r.battlePoint} 个永久战斗分`}
          </h2>
          <p>
            {stage === 0
              ? '普通防御抵挡伤害，不增加战力。试着调高对手的伤害，再开始结算。'
              : stage === 1
                ? r.attackStrength === r.defenseStrength
                  ? '战力相同，防守方赢。胜负此时已经确定，接着双方都要算伤亡。'
                  : '先记录胜负。接下来即使赢家死光，胜负也不会反转。'
                : stage === 2
                  ? `你损失 ${r.attackLoss} 个兵；对手损失 ${r.defenseLoss} 个兵。普通伤害先减防御，真实伤害不受普通防御抵挡。`
                  : r.battlePoint
                    ? '主动进攻、获胜，而且奖励时还有军团，拿 1 个永久分。'
                    : r.attackWins
                      ? '你赢了，但军团已经消失，所以没有基础进攻战斗分。'
                      : '基础规则下，防守获胜领取老兵，进攻得分条件未满足。'}
          </p>
        </div>
        {stage === 3 ? (
          <div className="reward-numbers">
            <span>
              <strong>{r.attackVeterans}</strong>你的老兵
            </span>
            <span>
              <strong>{r.defenseVeterans}</strong>对手的老兵
            </span>
          </div>
        ) : null}
      </div>
      {stage === 3 ? (
        <div className="aftermath">
          <label>
            <Switch checked={temple} onCheckedChange={setTemple} />
            这是一场神庙争夺战
          </label>
          {r.attackWins && r.attackLeft > 0 ? (
            <>
              <label>
                <Switch checked={recall} onCheckedChange={setRecall} />
                胜方召回
              </label>
              <p>
                {recall
                  ? `召回 ${r.attackLeft} 个存活士兵，通常拿回 ${Math.max(0, r.attackLeft - 1)} 点祈祷值；永久分保留。`
                  : '胜方选择留驻；败方仍要撤退或召回。'}
                {temple
                  ? ` 你新增 ${points} 分，其中 ${points - r.battlePoint} 分为神庙临时分；原守军失去该庙分。`
                  : ''}
              </p>
            </>
          ) : (
            <p>
              败方仍须处理撤退或召回，即使胜方已经死光。没有自己的军团留驻，就不能据此取得神庙控制。
            </p>
          )}
        </div>
      ) : null}
      <p className="scope-note">
        <Info size={16} />
        普通军团的数值教学，输入为汇总值。未模拟具体手牌、神祇、触发连锁、自损及特殊得分；6–7
        人军团需要相应能力。假定败方有合法退路，召回不等于死亡。
      </p>
    </section>
  );
}
