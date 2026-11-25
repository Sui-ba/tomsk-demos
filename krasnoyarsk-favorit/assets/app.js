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


(()=>{const {$,$$,esc,Wizard,choice,contactsForm,validateContacts,slotStep}=SW;
const S=[{id:'tire',label:'Сезонная смена шин',sub:'Шиномонтаж + балансировка · цена по радиусу <span class="tbd">уточняется</span>'},{id:'disk',label:'Правка дисков',sub:'от 800 ₽ · диагностика геометрии бесплатно'},{id:'cut',label:'Порез, грыжа или прокол',sub:'Вулканизация ≈ 2–3 часа'},{id:'stud',label:'Ошиповка / дошиповка',sub:'Шипы Теком 12 мм'},{id:'store',label:'Хранение шин',sub:'По договору на сезон'},{id:'align',label:'Развал-схождение',sub:'СТО Взлётная, 51б · диагностика 600 ₽'},{id:'oil',label:'Замена масла',sub:'СТО Взлётная, 51б'}];
const lab=st=>S.find(x=>x.id===st.svc).label,sto=st=>st.svc==='align'||st.svc==='oil';
const R=['R13','R14','R15','R16','R17','R18','R19','R20','R21–22'],N=['1','2','4'],DT=['Штампованные','Литые','Кованые'],DC=[['easy','Простая — от 800–1 000 ₽'],['mid','Средняя — от 1 000–2 000 ₽'],['hard','Сварка, сложный ремонт — от 2 000 ₽'],['unk','Не знаю — покажу мастеру']];
const chips=(k,a)=>'<div class="chips" data-'+k+'>'+a.map(v=>{const id=Array.isArray(v)?v[0]:v,l=Array.isArray(v)?v[1]:v;return '<button type="button" class="chip" data-v="'+esc(id)+'">'+esc(l)+'</button>'}).join('')+'</div>';
function params(pb,st,api){
  if(sto(st)){pb.innerHTML='<p class="note" style="margin-top:0">Работа на СТО по соседству: Взлётная, 51б, тел. +7 (391) 293-50-80, 9:00–20:00.</p><label class="field" data-f="car">Марка и модель<input name="car" autocomplete="off" placeholder="Например: Kia Rio" value="'+esc(st.car||'')+'"></label>'+(st.svc==='oil'?'<label class="check"><input type="checkbox" name="buy"'+(st.buy?' checked':'')+'> <span>Масло куплю у вас — по сайту замена тогда бесплатна, фильтр тоже</span></label>':'<p class="note">Диагностика развала-схождения — 600 ₽ (с сайта), цена регулировки <span class="tbd">уточняется</span>.</p>');
    const c=$('input[name=car]',pb),b=$('input[name=buy]',pb),v=()=>{st.car=c.value.trim();if(b)st.buy=b.checked;api.setValid(st.car.length>=2)};c.addEventListener('input',v);b&&b.addEventListener('change',v);v();return}
  const many=st.svc==='tire'||st.svc==='stud'||st.svc==='store';
  pb.innerHTML='<p class="wgroup">Радиус</p>'+chips('r',R)+'<p class="wgroup">'+(many?'Сколько колёс':'Сколько дисков / колёс')+'</p>'+chips('n',N)+
   (st.svc==='disk'?'<p class="wgroup">Повреждение</p>'+chips('dc',DC):'<p class="wgroup">Диски</p>'+chips('dt',DT))+
   (st.svc==='tire'?'<label class="check"><input type="checkbox" name="buy"'+(st.buy?' checked':'')+'> <span>Покупаю комплект шин или дисков у вас</span></label><p class="note" data-hint></p>':'')+
   (st.svc==='stud'?'<p class="note">Условия с сайта: заводские отверстия под шип, протектор не меньше 6 мм, шине не больше 5 лет.</p>':'')+
   (st.svc==='store'?'<p class="note">Хранение по договору с предоплатой за сезон (около полугода). Стоимость <span class="tbd">уточняется</span>.</p>':'');
  const need=st.svc==='disk'?['r','n','dc']:['r','n','dt'];
  const hint=$('[data-hint]',pb),buy=$('input[name=buy]',pb);
  const upd=()=>{if(buy){st.buy=buy.checked;hint.innerHTML=st.buy?'Скидка 30% на шиномонтаж при покупке комплекта — условие с текущего сайта.':'Цена шиномонтажа по радиусу на сайте не опубликована — <span class="tbd">уточняется</span>; мастер назовёт её при подтверждении.'}api.setValid(need.every(k=>st[k]))};
  need.forEach(k=>{const box=$('[data-'+k+']',pb);$$('.chip',box).forEach(b=>{b.setAttribute('aria-pressed',st[k]===b.dataset.v);b.addEventListener('click',()=>{st[k]=b.dataset.v;$$('.chip',box).forEach(x=>x.setAttribute('aria-pressed',x===b));upd()})})});
  buy&&buy.addEventListener('change',upd);upd()}
const dcL=st=>(DC.find(x=>x[0]===st.dc)||['',''])[1];
const det=st=>sto(st)?st.car+(st.svc==='oil'&&st.buy?' · масло покупаю у вас':''):st.r+' · '+st.n+' шт. · '+(st.svc==='disk'?dcL(st):st.dt)+(st.svc==='tire'&&st.buy?' · покупаю комплект (−30% на шиномонтаж)':'');
const all={0:[9,22],1:[9,22],2:[9,22],3:[9,22],4:[9,22],5:[9,22],6:[9,22]},s51={0:[9,20],1:[9,20],2:[9,20],3:[9,20],4:[9,20],5:[9,20],6:[9,20]};
const where=st=>sto(st)?'СТО, Взлётная 51б':'Шиносервис, Взлётная 53';
const steps=[
{id:'svc',title:'Какая услуга',sub:'Шиномонтаж, диски и шипы — на Взлётной, 53; развал и масло — на СТО, Взлётная, 51б.',render(pb,st,api){choice(pb,st,api,'svc',S)}},
{id:'par',title:'Колёса и детали',sub:'Чтобы мастер рассчитал время и итог заранее.',render:params},
{id:'time',title:'День и время',sub:'Время красноярское.',render(pb,st,api){slotStep(pb,st,api,sto(st)?s51:all,sto(st)?'СТО: 9:00–20:00. Время в демо — пример.':'Шиносервис ежедневно: по сайту до 23:00, по Яндекс Картам до 22:00 — в демо слоты до 22:00. Время — пример.')}},
{id:'contacts',title:'Контакты',form:1,nextLabel:'Записаться',sub:'Мастер перезвонит и подтвердит время.',render(pb,st){contactsForm(pb,st)},validate:validateContacts}];
Wizard($('#booking'),{steps,who:'мастер',tel:'+73912862715',
 summary:st=>[['Услуга',lab(st)],['Детали',det(st)],['Где',where(st)],['Когда',st.dayL+', '+st.slot],['Телефон',st.tel]],
 message:st=>'Фаворит · запись (ДЕМО, не отправлено)\nУслуга: '+lab(st)+'\nДетали: '+det(st)+'\nГде: '+where(st)+'\nКогда: '+st.dayL+', '+st.slot+'\nИмя: '+st.name+'\nТелефон: '+st.tel});
})();
