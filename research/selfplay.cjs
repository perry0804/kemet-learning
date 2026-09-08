const assert=require('node:assert/strict');const G=require('./game-compiled/lib/game.js');
let completed=0,maxSteps=0;const results=[];
for(let seed=1;seed<=12;seed++){
 let s=G.newGame(seed%6,'蓝','白',seed*4271),steps=0;
 const start=G.freeChoices(s).sort((a,b)=>G.powerValue(s,s.players[0],b.id)-G.powerValue(s,s.players[0],a.id))[0];s=G.apply(s,{type:'setup',tileId:start.id});
 while(s.phase!=='finished'&&steps<1000){
  let cmd;
  if(s.phase==='night')cmd={type:'night',night:G.defaultNight(s,s.players[0])};
  else if(s.phase==='battle'&&s.pending.stage==='choose'&&(s.pending.attackerOwner===0||s.pending.defenderOwner===0)){
   const h=[...s.players[0].hand].sort((a,b)=>G.card(b).strength-G.card(a).strength+(G.card(a).selfDamage??0)-(G.card(b).selfDamage??0));cmd={type:'battle',play:h[0],burn:h[h.length-1],diIds:[]};
  }else cmd=G.aiAction(s);
  const next=G.apply(s,cmd);if(next.error){console.log('ERROR',seed,steps,s.phase,cmd,next.error);process.exit(1);}
  s=next;steps++;const issues=G.validateGame(s);if(issues.length){console.log('INVALID',seed,steps,cmd,issues);process.exit(1);}
 }
 assert.equal(s.phase,'finished',`seed ${seed} stuck in ${s.phase} at round ${s.round}`);completed++;maxSteps=Math.max(maxSteps,steps);results.push({seed,round:s.round,steps,winner:s.winner,score:G.score(s,s.players[s.winner])});
}
console.log(JSON.stringify({completed,maxSteps,results},null,2));
