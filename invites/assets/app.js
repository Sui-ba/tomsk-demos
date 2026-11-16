(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.remove('no-js');
const rv=$$('.rv');
if(RM||!('IntersectionObserver' in window))rv.forEach(e=>e.classList.add('in'));
else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -5% 0px'});rv.forEach(e=>io.observe(e))}
/* countdown */
const cd=$('[data-countdown]');
if(cd){const start=Date.parse(cd.dataset.start),end=Date.parse(cd.dataset.end);const box=$('.cd',cd),done=$('.cd-done',cd),cells={d:$('[data-u=d]',cd),h:$('[data-u=h]',cd),m:$('[data-u=m]',cd),s:$('[data-u=s]',cd)};
 const word=(n,f)=>{const a=n%10,b=n%100;return f[(a===1&&b!==11)?0:(a>=2&&a<=4&&(b<10||b>=20))?1:2]};
 const W={d:['день','дня','дней'],h:['час','часа','часов'],m:['минута','минуты','минут'],s:['секунда','секунды','секунд']};
 const set=(k,v)=>{const el=cells[k],t=String(v).padStart(k==='d'?1:2,'0');if(el.textContent!==t){el.textContent=t;if(!RM){el.classList.remove('tick');void el.offsetWidth;el.classList.add('tick')}}el.nextElementSibling.textContent=word(v,W[k])};
 const run=()=>{const now=Date.now();
  if(now<start){let s=Math.floor((start-now)/1000);set('d',Math.floor(s/86400));s%=86400;set('h',Math.floor(s/3600));s%=3600;set('m',Math.floor(s/60));set('s',s%60);box.hidden=false;done.hidden=true;cd.dataset.state='before'}
  else{box.hidden=true;done.hidden=false;const live=now<end;done.textContent=live?cd.dataset.live:cd.dataset.after;cd.dataset.state=live?'live':'after';clearInterval(t)}};
 const t=setInterval(run,1000);run();}
/* palette */
$$('.sw button').forEach(b=>b.addEventListener('click',()=>{const on=b.getAttribute('aria-pressed')!=='true';$$('.sw button').forEach(x=>x.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed',on)}));
/* RSVP */
const f=$('#rsvp-form');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
if(f){const out=$('#rsvp-done');
 $$('[data-guests]',f).forEach(g=>{const gv=$('output',g),max=+g.dataset.max||5;let n=1;const setN=v=>{n=Math.max(1,Math.min(max,v));gv.textContent=n;$('[data-minus]',g).disabled=n<=1;$('[data-plus]',g).disabled=n>=max};setN(1);$('[data-minus]',g).addEventListener('click',()=>setN(n-1));$('[data-plus]',g).addEventListener('click',()=>setN(n+1))});
 const att=()=>{const r=$('input[name=att]:checked',f);return r?r.value:''};
 const sync=()=>{const yes=att()==='yes';$$('[data-yes-only]',f).forEach(e=>e.hidden=!yes)};
 $$('input[name=att]',f).forEach(r=>r.addEventListener('change',()=>{sync();$('[data-f=att]',f).classList.remove('bad')}));sync();
 $$('[data-f] input,[data-f] select',f).forEach(i=>['change','input'].forEach(ev=>i.addEventListener(ev,()=>i.closest('[data-f]').classList.remove('bad'))));
 const val=el=>{const o=$('output',el);if(o)return o.textContent;const rs=$$('input[type=radio]:checked',el);if(rs.length)return rs[0].closest('label').textContent.trim();const cs=$$('input[type=checkbox]:checked',el);if(cs.length||$('input[type=checkbox]',el))return cs.map(c=>c.closest('label').textContent.trim()).join(', ');const i=$('input,select,textarea',el);return i?i.value.trim():''};
 f.addEventListener('submit',e=>{e.preventDefault();let ok=true;const yes=att()==='yes';
  const mark=(el,bad)=>{el.classList.toggle('bad',bad);if(bad)ok=false};
  mark($('[data-f=name]',f),$('input[name=name]',f).value.trim().length<2);mark($('[data-f=att]',f),!att());
  $$('[data-req-yes]',f).forEach(el=>mark(el,yes&&!val(el)));
  mark($('[data-f=consent]',f),!$('input[name=consent]',f).checked);
  if(!ok){const b=$('.bad input,.bad select',f);b&&b.focus();return}
  const rows=[];$$('[data-sum]',f).forEach(el=>{if(el.closest('[hidden]'))return;const v=val(el);if(v)rows.push([el.dataset.sum,el.dataset.sum==='Ответ'?(yes?'Придёт':'Не сможет'):v])});
  $('.sum',out).innerHTML=rows.map(r=>'<div><span>'+esc(r[0])+'</span><b>'+esc(r[1])+'</b></div>').join('');
  $('[data-thanks]',out).textContent=yes?out.dataset.yes:out.dataset.no;
  f.hidden=true;out.hidden=false;const h=$('h3',out);h.tabIndex=-1;h.focus({preventScroll:true});out.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'})});
 $('[data-again]',out).addEventListener('click',()=>{out.hidden=true;f.hidden=false;$('input[name=name]',f).focus()});}
/* stubs: telegram, contacts, wishlist */
$$('[data-stub]').forEach(b=>b.addEventListener('click',()=>{const n=b.parentElement.querySelector('.stub-note')||b.nextElementSibling;if(n){n.hidden=false;n.classList.remove('tick');void n.offsetWidth;n.classList.add('tick')}}));
$$('[data-reserve]').forEach(b=>b.addEventListener('click',()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);b.textContent=on?'Зарезервировано (пример)':'Зарезервировать'}));
/* consent dialog */
const dlg=$('#consent-dlg');$$('[data-consent]').forEach(a=>a.addEventListener('click',e=>{if(dlg&&dlg.showModal){e.preventDefault();dlg.showModal()}}));
dlg&&$('[data-close]',dlg).addEventListener('click',()=>dlg.close());
/* music: soft generated chime, no files */
const mb=$('[data-music]');let ac=null,mt=null;
if(mb)mb.addEventListener('click',()=>{const on=mb.getAttribute('aria-pressed')!=='true';mb.setAttribute('aria-pressed',on);
 if(on){ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume();const notes=(mb.dataset.notes||'523,659,784,659').split(',').map(Number);let k=0;
  const play=()=>{const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=notes[k++%notes.length];g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+1.4);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+1.5)};play();mt=setInterval(play,700)}
 else{clearInterval(mt)}});
/* floating RSVP button: hide near the form */
const fab=$('.fab'),rs=$('#rsvp');if(fab&&rs&&'IntersectionObserver' in window){new IntersectionObserver(es=>es.forEach(e=>fab.classList.toggle('off',e.isIntersecting)),{threshold:.05}).observe(rs)}
})();
