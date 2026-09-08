export type Army = {
  units: number;
  card: number;
  bonus: number;
  damage: number;
  trueDamage: number;
  shield: number;
  protected: number;
};
export function resolveCombat(a: Army, d: Army) {
  const attackStrength = a.units + a.card + a.bonus,
    defenseStrength = d.units + d.card + d.bonus;
  const attackWins = attackStrength > defenseStrength;
  const losses = (own: Army, other: Army) =>
    Math.min(
      Math.max(0, own.units - own.protected),
      other.trueDamage + Math.max(0, other.damage - own.shield),
    );
  const attackLoss = losses(a, d),
    defenseLoss = losses(d, a),
    attackLeft = a.units - attackLoss,
    defenseLeft = d.units - defenseLoss;
  const battlePoint = attackWins && attackLeft > 0 ? 1 : 0;
  return {
    attackStrength,
    defenseStrength,
    attackWins,
    attackLoss,
    defenseLoss,
    attackLeft,
    defenseLeft,
    battlePoint,
    attackVeterans: battlePoint ? 0 : 1,
    defenseVeterans: attackWins ? 1 : 2,
  };
}
