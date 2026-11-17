(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rub=n=>Math.round(n).toLocaleString('ru-RU').replace(/\u00a0/g,' ')+' ₽';
/* reveal */
const rv=$$('.rv');
if(RM||!('IntersectionObserver' in window))rv.forEach(e=>e.classList.add('in'));
else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -6% 0px',threshold:.06});rv.forEach(e=>io.observe(e))}
/* tabs */
$$('[data-tabs]').forEach(t=>{const bs=$$('button',t);bs.forEach(b=>b.addEventListener('click',()=>{bs.forEach(x=>x.setAttribute('aria-selected',x===b));const g=t.dataset.tabs;$$('[data-tabgroup="'+g+'"]').forEach(p=>p.hidden=p.dataset.tab!==b.dataset.tab)}))});
/* animated number */
function tween(el,to,pre){pre=pre||'';const id=(el._tw=(el._tw||0)+1);if(RM){el.textContent=pre+rub(to);el.dataset.v=to;return}const from=+el.dataset.v||0;el.dataset.v=to;const t0=performance.now(),d=450;const f=t=>{if(el._tw!==id)return;const k=Math.min(1,(t-t0)/d),e=1-Math.pow(1-k,3);el.textContent=pre+rub(from+(to-from)*e);if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
/* phone mask */
function mask(v){let d=v.replace(/\D/g,'');if(!d)return'';if(d[0]==='8')d='7'+d.slice(1);if(d[0]!=='7')d='7'+d;d=d.slice(0,11);let s='+7';if(d.length>1)s+=' '+d.slice(1,4);if(d.length>4)s+=' '+d.slice(4,7);if(d.length>7)s+='-'+d.slice(7,9);if(d.length>9)s+='-'+d.slice(9,11);return s}
/* local time of the city (UTC offset from <html data-tz>) */
const TZ=+document.documentElement.dataset.tz||7;function cityNow(){return new Date(Date.now()+TZ*3600e3)}
function cityDays(n){const out=[],b=cityNow();for(let i=0;i<n;i++){const d=new Date(Date.UTC(b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate()+i));out.push(d)}return out}
const WD=['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],MON=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
const dlabel=d=>WD[d.getUTCDay()]+', '+d.getUTCDate()+' '+MON[d.getUTCMonth()];
/* wizard */
function Wizard(root,cfg){
  const st={},steps=cfg.steps,body=$('[data-wz-body]',root),list=$('[data-wz-steps]',root),bar=$('.bar i',root),top=$('[data-wz-top]',root);
  list.style.setProperty('--n',steps.length);
  list.innerHTML=steps.map((s,i)=>'<li><span>'+String(i+1).padStart(2,'0')+'</span><em>'+esc(s.title)+'</em></li>').join('');
  let idx=0;
  function show(i,focus){idx=i;const s=steps[i];
    $$('li',list).forEach((li,j)=>{li.className=j===i?'on':(j<i?'ok':'');$('span',li).textContent=j<i?'✓':String(j+1).padStart(2,'0')});
    bar.style.width=((i)/steps.length*100)+'%';top.firstElementChild.textContent='Шаг '+(i+1)+' из '+steps.length;
    const pane=document.createElement(s.form?'form':'div');pane.className='pane';pane.dataset.pane=s.id;if(s.form)pane.noValidate=true;
    pane.innerHTML='<h3>'+esc(s.title)+'</h3>'+(s.sub?'<p class="sub">'+s.sub+'</p>':'')+'<div class="pane-body"></div><div class="nav-row">'+(i?'<button type="button" class="btn ghost" data-back>← Назад</button>':'<span></span>')+'<button class="btn" '+(s.form?'type="submit"':'type="button"')+' data-next>'+(s.nextLabel||'Дальше')+' <span class="ar">→</span></button></div>';
    body.replaceChildren(pane);const pb=$('.pane-body',pane),next=$('[data-next]',pane);
    const api={st,setValid:v=>{next.disabled=!v},next:()=>show(i+1,true),pane,pb};
    s.render(pb,st,api);
    $('[data-back]',pane)&&$('[data-back]',pane).addEventListener('click',()=>show(i-1,true));
    if(s.form)pane.addEventListener('submit',e=>{e.preventDefault();if(s.validate(pane,st))done()});
    else next.addEventListener('click',()=>{if(!next.disabled)show(i+1,true)});
    if(focus){const h=$('h3',pane);h.tabIndex=-1;h.focus({preventScroll:true});const r=root.getBoundingClientRect();if(r.top<0||r.top>innerHeight*.5)root.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'})}
  }
  function done(){$$('li',list).forEach(li=>{li.className='ok';$('span',li).textContent='✓'});bar.style.width='100%';top.firstElementChild.textContent='Сценарий завершён';
    const rows=cfg.summary(st),msg=cfg.message(st);
    const pane=document.createElement('div');pane.className='pane tg-done';pane.dataset.pane='done';
    pane.innerHTML='<div class="done-ic">✓</div><h3>Заявка ушла в Telegram</h3><p class="sub"><b>Это демонстрация.</b> Ничего не отправлено. В рабочей версии '+esc(cfg.who)+' получит это сообщение в Telegram и свяжется с вами.</p><div class="sum">'+rows.map(r=>'<div><span>'+esc(r[0])+'</span><b>'+esc(r[1])+'</b></div>').join('')+'</div><details open><summary>Как выглядит сообщение в Telegram</summary><div class="tg" style="margin-top:10px">'+esc(msg)+'</div></details><div class="nav-row"><button type="button" class="btn ghost" data-restart>Пройти ещё раз</button><a class="btn" href="tel:'+cfg.tel+'">Позвонить <span class="ar">↗</span></a></div>';
    body.replaceChildren(pane);$('[data-restart]',pane).addEventListener('click',()=>{for(const k in st)delete st[k];show(0,true)});
    const h=$('h3',pane);h.tabIndex=-1;h.focus({preventScroll:true});
  }
  show(0,false);
}
/* shared steps */
function choice(pb,st,api,key,opts,cols){pb.innerHTML='<div class="opts">'+opts.map(o=>'<button type="button" class="opt" data-id="'+esc(o.id)+'" aria-pressed="'+(st[key]===o.id)+'"'+(o.off?' disabled':'')+'><b>'+esc(o.label)+'</b>'+(o.sub?'<small>'+o.sub+'</small>':'')+'</button>').join('')+'</div>';
  api.setValid(!!st[key]&&opts.some(o=>o.id===st[key]));
  $$('.opt',pb).forEach(b=>b.addEventListener('click',()=>{st[key]=b.dataset.id;$$('.opt',pb).forEach(x=>x.setAttribute('aria-pressed',x===b));api.setValid(true);pb.dispatchEvent(new CustomEvent('pick'))}))}
function contactsForm(pb,st,extra){pb.innerHTML='<div class="grid2"><label class="field" data-f="name">Как к вам обращаться<input name="name" required autocomplete="name" placeholder="Имя" value="'+esc(st.name||'')+'"><span class="err">Укажите имя</span></label><label class="field" data-f="tel">Телефон<input name="tel" type="tel" required inputmode="tel" autocomplete="tel" placeholder="+7 900 000-00-00" value="'+esc(st.tel||'')+'"><span class="err">Нужен номер из 11 цифр</span></label></div>'+(extra||'')+'<label class="check" data-f="ok"><input type="checkbox" name="ok" required> <span>Согласен на обработку персональных данных. В демо ничего не отправляется и не сохраняется.</span></label>';
  const t=$('input[type=tel]',pb);t.addEventListener('input',()=>{t.value=mask(t.value)});}
function validateContacts(pane,st){let ok=true;const n=$('input[name=name]',pane),t=$('input[name=tel]',pane),c=$('input[name=ok]',pane);
  const set=(f,bad)=>{const el=$('[data-f="'+f+'"]',pane);el.classList.toggle('bad',bad);if(bad){ok=false;el.classList.remove('shake');void el.offsetWidth}};
  set('name',n.value.trim().length<2);set('tel',t.value.replace(/\D/g,'').length!==11);set('ok',!c.checked);
  if(ok){st.name=n.value.trim();st.tel=t.value}else{const f=$('.bad input',pane);f&&f.focus()}return ok}
window.SW={$,$$,esc,rub,tween,mask,Wizard,choice,contactsForm,validateContacts,cityNow,cityDays,dlabel,WD,RM};
})();
/* shared steps for 17.11 batch: slots by schedule, car */
(()=>{const {$,$$,esc,cityNow,cityDays,dlabel,WD}=SW;
const pad=h=>String(h).padStart(2,'0')+':00';
function slotStep(pb,st,api,sched,note){
  const now=cityNow(),days=cityDays(8);
  const same=d=>d.getUTCFullYear()===now.getUTCFullYear()&&d.getUTCMonth()===now.getUTCMonth()&&d.getUTCDate()===now.getUTCDate();
  const avail=d=>{const s=sched[d.getUTCDay()];if(!s)return[];const out=[];for(let h=s[0];h<s[1];h++){if(same(d)&&h<=now.getUTCHours())continue;out.push(h)}return out};
  st.slot=null;st.dayI=null;
  pb.innerHTML='<p class="wgroup">День</p><div class="days chips" data-days>'+days.map((d,i)=>{const a=avail(d);return '<button type="button" class="chip day" data-i="'+i+'"'+(a.length?'':' disabled')+'>'+(same(d)?'Сегодня':WD[d.getUTCDay()])+'<b>'+d.getUTCDate()+'</b>'+(a.length?'':'<small>'+(sched[d.getUTCDay()]?'нет окон':'вых.')+'</small>')+'</button>'}).join('')+'</div><p class="wgroup">Время</p><div class="chips slots" data-slots><span class="note" style="margin:0">Сначала выберите день</span></div>'+(note?'<p class="note">'+note+'</p>':'');
  const S=$('[data-slots]',pb);
  $$('[data-days] .chip',pb).forEach(c=>c.addEventListener('click',()=>{const d=days[+c.dataset.i];st.dayI=+c.dataset.i;st.dayL=dlabel(d);st.slot=null;$$('[data-days] .chip',pb).forEach(x=>x.setAttribute('aria-pressed',x===c));
    S.innerHTML=avail(d).map(h=>'<button type="button" class="chip slot" data-h="'+h+'">'+pad(h)+'</button>').join('');api.setValid(false);
    $$('.slot',S).forEach(b=>b.addEventListener('click',()=>{st.slot=pad(+b.dataset.h);$$('.slot',S).forEach(x=>x.setAttribute('aria-pressed',x===b));api.setValid(true)}))}));
  api.setValid(false)}
function carStep(pb,st,api,o){o=o||{};
  pb.innerHTML='<div class="grid2"><label class="field" data-f="car">Марка и модель<input name="car" autocomplete="off" placeholder="Например: Toyota Corolla" value="'+esc(st.car||'')+'"><span class="err">Укажите марку и модель</span></label><label class="field">Год выпуска<input name="year" type="number" inputmode="numeric" min="1970" max="2027" placeholder="2012" value="'+esc(st.year||'')+'"></label></div>'+
   (o.vin?'<label class="field" data-f="vin">VIN или номер кузова'+(o.vinReq?'':' (необязательно)')+'<input name="vin" autocomplete="off" placeholder="Например: JTDBR32E720123456" value="'+esc(st.vin||'')+'" style="text-transform:uppercase"><span class="err">Нужен VIN (17 символов) или номер кузова</span></label>':'')+
   '<label class="field">'+esc(o.cmLabel||'Что беспокоит (необязательно)')+'<textarea name="cm" maxlength="400" placeholder="'+esc(o.cmPh||'Например: стук спереди справа на неровностях')+'">'+esc(st.cm||'')+'</textarea></label>';
  const car=$('input[name=car]',pb),vin=$('input[name=vin]',pb),yr=$('input[name=year]',pb),cm=$('textarea',pb);
  const okVin=v=>{v=v.trim().toUpperCase();return /^[A-HJ-NPR-Z0-9]{17}$/.test(v)||/^[A-Z0-9]{2,8}-?[0-9]{5,8}$/.test(v)};
  const val=()=>{st.car=car.value.trim();st.year=yr.value.trim();st.cm=cm.value.trim();if(vin)st.vin=vin.value.trim().toUpperCase();
    api.setValid(st.car.length>=2&&(!o.vinReq||okVin(vin.value)))};
  [car,yr,cm,vin].forEach(x=>x&&x.addEventListener('input',val));val()}
SW.slotStep=slotStep;SW.carStep=carStep;
})();

(()=>{const {$,$$,esc,rub,tween,Wizard,choice,contactsForm,validateContacts,cityDays,dlabel,WD}=SW;
const T=[{id:'stove',label:'Печь, камин, барбекю',sub:'Кладка и облицовка — от 20 000 ₽'},{id:'frame',label:'Каркасный дом',sub:'от 12 000 ₽ за м²'},{id:'log',label:'Сруб ручной рубки',sub:'Кедр, лиственница, сосна — от 13 000 ₽ за м³'},{id:'net',label:'Инженерные сети',sub:'Водопровод, септик, ГНБ — цена <span class="tbd">уточняется</span>'},{id:'facade',label:'Фасад, кровля, забор',sub:'от 600 ₽ за м² / м.пог'},{id:'other',label:'Отделка, электрика, другое',sub:'Опишите задачу'}];
const tp=st=>T.find(x=>x.id===st.type);
const FAC={plaster:{l:'Штукатурка фасада',p:900,u:'м²'},roof:{l:'Кровля',p:600,u:'м²'},fence:{l:'Забор',p:600,u:'м.пог'}};
const STOVE=['Отопительная печь','Печь для бани','Камин','Барбекю-комплекс'];
function est(st){const t=st.type;if(t==='stove')return{v:20000,txt:'от '+rub(20000)};if(t==='frame')return{v:12000*st.area,txt:'от '+rub(12000*st.area)};if(t==='log'&&st.vol)return{v:13000*st.vol,txt:'от '+rub(13000*st.vol)};if(t==='facade'){const f=FAC[st.fac];return{v:f.p*st.qty,txt:'от '+rub(f.p*st.qty)}}return null}
const steps=[
{id:'type',title:'Что строим',sub:'Цены «от» — с текущего сайта (2015 год), актуальность <span class="tbd">уточняется</span>.',render(pb,st,api){choice(pb,st,api,'type',T);pb.addEventListener('pick',()=>{st.area=100;st.vol=0;st.fac='plaster';st.qty=100;st.kind=STOVE[0];st.what='';st.len=''})}},
{id:'size',title:'Размер и детали',sub:'Примерно — точнее посчитаем на замере.',render(pb,st,api){const t=st.type;let h='';
  if(t==='stove')h='<p class="wgroup">Что нужно</p><div class="chips" data-k>'+STOVE.map(x=>'<button type="button" class="chip" aria-pressed="'+(st.kind===x)+'">'+x+'</button>').join('')+'</div>';
  if(t==='frame')h='<label class="field">Площадь дома: <b data-av>'+st.area+' м²</b><input class="range" type="range" name="area" min="30" max="300" step="5" value="'+st.area+'"></label>';
  if(t==='log')h='<label class="field">Объём сруба, м³ (если знаете)<input type="number" name="vol" min="0" max="500" inputmode="numeric" placeholder="Например: 40" value="'+(st.vol||'')+'"></label>';
  if(t==='facade')h='<div class="chips" data-f>'+Object.entries(FAC).map(([k,f])=>'<button type="button" class="chip" data-id="'+k+'" aria-pressed="'+(st.fac===k)+'">'+f.l+' — от '+f.p+' ₽/'+f.u+'</button>').join('')+'</div><label class="field" style="margin-top:12px"><span data-u>Объём, '+FAC[st.fac].u+'</span><input type="number" name="qty" min="1" max="5000" inputmode="numeric" value="'+st.qty+'"></label>';
  if(t==='net'||t==='other')h='<label class="field">'+(t==='net'?'Что нужно проложить и примерная длина':'Опишите задачу')+'<textarea name="what" maxlength="400" placeholder="'+(t==='net'?'Например: водопровод от скважины 30 м и септик':'Например: облицовка камина природным камнем')+'">'+esc(st.what||'')+'</textarea></label>';
  h+='<div class="total" aria-live="polite"><div><small>Ориентир</small><span data-l style="font-size:12px;opacity:.85"></span></div><b data-total>—</b></div><p class="note" style="margin-top:0" data-n></p>';
  pb.innerHTML=h;const TT=$('[data-total]',pb),L=$('[data-l]',pb),N=$('[data-n]',pb);
  const upd=()=>{const e=est(st);L.textContent=tp(st).label+(t==='stove'?': '+st.kind.toLowerCase():'');
    if(e){tween(TT,e.v,'от ');N.innerHTML='Цена «от» с сайта, без материалов и сложности объекта — итог после замера. Актуальность <span class="tbd">уточняется</span>.'}
    else{TT._tw=(TT._tw||0)+1;TT.dataset.v=0;TT.textContent='уточняется';N.innerHTML=t==='log'?'Укажите объём — посчитаем по 13 000 ₽ за м³. Если не знаете, посчитаем по проекту.':'Цена на этот вид работ на сайте не опубликована — <span class="tbd">уточняется</span> на замере.'}
    api.setValid(t==='net'||t==='other'?(st.what||'').trim().length>=5:true)};
  $$('[data-k] .chip',pb).forEach(c=>c.addEventListener('click',()=>{st.kind=c.textContent;$$('[data-k] .chip',pb).forEach(x=>x.setAttribute('aria-pressed',x===c));upd()}));
  $$('[data-f] .chip',pb).forEach(c=>c.addEventListener('click',()=>{st.fac=c.dataset.id;$$('[data-f] .chip',pb).forEach(x=>x.setAttribute('aria-pressed',x===c));$('[data-u]',pb).textContent='Объём, '+FAC[st.fac].u;upd()}));
  $$('input,textarea',pb).forEach(i=>i.addEventListener('input',()=>{if(i.name==='area'){st.area=+i.value;$('[data-av]',pb).textContent=st.area+' м²'}if(i.name==='vol')st.vol=Math.max(0,Math.min(500,+i.value||0));if(i.name==='qty')st.qty=Math.max(1,Math.min(5000,+i.value||1));if(i.name==='what')st.what=i.value;upd()}));upd()}},
{id:'obj',title:'Объект и замер',sub:'Красноярск и пригород. Рабочие дни <span class="tbd">уточняются</span> — менеджер подтвердит время.',render(pb,st,api){
  const days=cityDays(8).slice(1);st.dayI=null;st.when=st.when||'';
  pb.innerHTML='<label class="field">Адрес или район объекта<input name="obj" autocomplete="off" placeholder="Например: Емельяново, СНТ «Сосновый бор»" value="'+esc(st.obj||'')+'"></label><p class="wgroup">Когда начать работы</p><div class="chips" data-w>'+['В ближайший месяц','Весной–летом','Пока прицениваюсь'].map(x=>'<button type="button" class="chip" aria-pressed="'+(st.when===x)+'">'+x+'</button>').join('')+'</div><p class="wgroup">Удобный день замера</p><div class="days chips" data-days>'+days.map((x,i)=>'<button type="button" class="chip day" data-i="'+i+'">'+WD[x.getUTCDay()]+'<b>'+x.getUTCDate()+'</b></button>').join('')+'</div>';
  const o=$('input[name=obj]',pb),val=()=>api.setValid((st.obj||'').trim().length>=4&&!!st.when&&st.dayI!=null);
  o.addEventListener('input',()=>{st.obj=o.value;val()});
  $$('[data-w] .chip',pb).forEach(c=>c.addEventListener('click',()=>{st.when=c.textContent;$$('[data-w] .chip',pb).forEach(x=>x.setAttribute('aria-pressed',x===c));val()}));
  $$('[data-days] .chip',pb).forEach(c=>c.addEventListener('click',()=>{st.dayI=+c.dataset.i;st.dayL=dlabel(days[st.dayI]);$$('[data-days] .chip',pb).forEach(x=>x.setAttribute('aria-pressed',x===c));val()}));val()}},
{id:'contacts',title:'Контакты',form:1,nextLabel:'Вызвать на замер',sub:'Перезвоним, чтобы подтвердить замер.',render(pb,st){contactsForm(pb,st)},validate:validateContacts}];
const det=st=>st.type==='stove'?st.kind:st.type==='frame'?st.area+' м²':st.type==='log'?(st.vol?st.vol+' м³':'объём по проекту'):st.type==='facade'?FAC[st.fac].l+', '+st.qty+' '+FAC[st.fac].u:(st.what||'').trim();
Wizard($('#booking'),{steps,who:'мастер',tel:'+79029401759',
 summary:st=>{const e=est(st);return [['Что строим',tp(st).label],['Детали',det(st)],['Ориентир',e?e.txt:'уточняется'],['Объект',st.obj.trim()],['Начать',st.when],['Замер',st.dayL],['Телефон',st.tel]]},
 message:st=>{const e=est(st);return 'Малоэтажное строительство · заявка на замер (ДЕМО, не отправлено)\nЧто: '+tp(st).label+'\nДетали: '+det(st)+'\nОриентир: '+(e?e.txt:'уточняется')+'\nОбъект: '+st.obj.trim()+'\nНачать: '+st.when+'\nЗамер: '+st.dayL+'\nИмя: '+st.name+'\nТелефон: '+st.tel}});
})();
