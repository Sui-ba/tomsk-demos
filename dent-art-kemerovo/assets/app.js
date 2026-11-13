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
function tween(el,to){if(RM){el.textContent=rub(to);return}const from=+el.dataset.v||0;el.dataset.v=to;const t0=performance.now(),d=450;const f=t=>{const k=Math.min(1,(t-t0)/d),e=1-Math.pow(1-k,3);el.textContent=rub(from+(to-from)*e);if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
/* phone mask */
function mask(v){let d=v.replace(/\D/g,'');if(!d)return'';if(d[0]==='8')d='7'+d.slice(1);if(d[0]!=='7')d='7'+d;d=d.slice(0,11);let s='+7';if(d.length>1)s+=' '+d.slice(1,4);if(d.length>4)s+=' '+d.slice(4,7);if(d.length>7)s+='-'+d.slice(7,9);if(d.length>9)s+='-'+d.slice(9,11);return s}
/* local time of the city (UTC+7, Кемерово) */
const TZ=7;function cityNow(){return new Date(Date.now()+TZ*3600e3)}
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

(()=>{const {$,$$,esc,Wizard,choice,contactsForm,validateContacts,cityNow,cityDays,dlabel}=SW;
/* график — раздел «Информация для пациентов» на dentart42.ru */
const nthSat=d=>Math.ceil(d.getUTCDate()/7);
const CLINIC=d=>{const w=d.getUTCDay();return w===0?null:w===6?[9,17]:[9,19]};
const DOC={
 ena:{n:'Урбанская Екатерина Александровна',r:'Директор, стоматолог-терапевт',s:'Чётные числа 9:00–19:00 · нечётные 9:00–15:00 · Сб (2-я и 4-я неделя) 9:00–17:00',h:d=>{const w=d.getUTCDay();if(w===0)return null;if(w===6)return [2,4].includes(nthSat(d))?[9,17]:null;return d.getUTCDate()%2===0?[9,19]:[9,15]}},
 nan:{n:'Урбанская Наталья Антоновна',r:'Хирург, зам. директора по лечебной части',s:'Ежедневно 9:00–16:00 · Сб (1-я и 3-я неделя) 10:00–17:00',h:d=>{const w=d.getUTCDay();if(w===0)return null;if(w===6)return [1,3].includes(nthSat(d))?[10,17]:null;return [9,16]}},
 pel:{n:'Пелевин Игорь Алексеевич',r:'Ортопед',s:'Нечётные числа 15:00–19:00',h:d=>{const w=d.getUTCDay();if(w===0||w===6)return null;return d.getUTCDate()%2?[15,19]:null}},
 sok:{n:'Соколов Дмитрий Викторович',r:'Стоматолог-ортопед',s:'График на сайте не опубликован — уточняется',h:CLINIC,tbd:1},
 any:{n:'Подберёт администратор',r:'Любой врач по направлению',s:'Часы клиники: Пн–Пт 9:00–19:00, Сб 9:00–17:00',h:CLINIC,tbd:1}};
const DIR=[{id:'ther',label:'Лечение и эстетическая реставрация',sub:'Кариес, каналы, восстановление разрушенного зуба',d:['ena','any']},
 {id:'hyg',label:'Гигиена, чувствительность, отбеливание',sub:'Профгигиена, повышенная чувствительность, украшения для зубов',d:['ena','any']},
 {id:'orth',label:'Протезирование и микропротезирование',sub:'Съёмные и несъёмные протезы, временный протез за одно посещение',d:['sok','pel','any']},
 {id:'surg',label:'Хирургический приём',sub:'Приём хирурга по графику клиники',d:['nan','any']},
 {id:'cons',label:'Не знаю, к кому — нужен осмотр',sub:'Администратор подскажет врача',d:['any','ena','nan','sok','pel']}];
const steps=[
{id:'dir',title:'С чем обратиться',sub:'Цены по направлениям <span class="tbd">уточняются</span> — прайс на сайте клиники отдельной страницей.',render(pb,st,api){choice(pb,st,api,'dir',DIR);pb.addEventListener('pick',()=>{delete st.doc;delete st.day;delete st.slot})}},
{id:'doc',title:'Врач',sub:'Список отфильтрован по направлению. Какие услуги ведёт каждый врач — <span class="tbd">уточняется</span> у клиники.',render(pb,st,api){const dir=DIR.find(x=>x.id===st.dir);choice(pb,st,api,'doc',dir.d.map(k=>({id:k,label:DOC[k].n,sub:esc(DOC[k].r)+'<br>'+(DOC[k].tbd?'<span class="tbd">':'')+esc(DOC[k].s)+(DOC[k].tbd?'</span>':'')})));pb.addEventListener('pick',()=>{delete st.day;delete st.slot})}},
{id:'time',title:'День и время',sub:'Показаны только дни, когда врач принимает по опубликованному графику (время — Кемерово). Администратор подтвердит запись.',render(pb,st,api){
  const doc=DOC[st.doc],now=cityNow(),days=cityDays(14).map(d=>({d,h:doc.h(d)}));
  pb.innerHTML='<div class="days chips">'+days.map((x,i)=>'<button type="button" class="chip day" data-i="'+i+'" '+(x.h?'':'disabled')+' aria-pressed="'+(st.day===i)+'">'+SW.WD[x.d.getUTCDay()]+'<b>'+x.d.getUTCDate()+'</b><small>'+(x.h?x.h[0]+'–'+x.h[1]:'нет')+'</small></button>').join('')+'</div><div data-slots></div><p class="hint">'+(doc.tbd?'<b>Время предварительное.</b> Точный график этого варианта уточняется — используем часы клиники.':'<b>График по сайту клиники:</b> '+esc(doc.s)+'. Как считаются «недели месяца» и праздничные дни — уточняется.')+'</p>';
  const sl=$('[data-slots]',pb);
  const drawSlots=()=>{const x=days[st.day];if(!x){sl.innerHTML='';return}const today=x.d.getUTCDate()===now.getUTCDate()&&x.d.getUTCMonth()===now.getUTCMonth();let b='';for(let h=x.h[0];h<x.h[1];h++){const past=today&&h<=now.getUTCHours();b+='<button type="button" class="chip slot" '+(past?'disabled':'')+' aria-pressed="'+(st.slot===h)+'">'+h+':00</button>'}sl.innerHTML='<p class="wgroup" style="margin:6px 0 8px">'+dlabel(x.d)+'</p><div class="chips">'+b+'</div>';
    if(!$('.slot:not([disabled])',sl))sl.insertAdjacentHTML('beforeend','<p class="note">На сегодня свободных часов по графику не осталось — выберите другой день.</p>');
    $$('.slot',sl).forEach(c=>c.addEventListener('click',()=>{st.slot=parseInt(c.textContent);$$('.slot',sl).forEach(y=>y.setAttribute('aria-pressed',y===c));api.setValid(true)}))};
  $$('.day',pb).forEach(c=>c.addEventListener('click',()=>{st.day=+c.dataset.i;st.dayLabel=dlabel(days[st.day].d);delete st.slot;$$('.day',pb).forEach(y=>y.setAttribute('aria-pressed',y===c));api.setValid(false);drawSlots()}));
  drawSlots();api.setValid(st.slot!=null&&st.day!=null)}},
{id:'contacts',title:'Контакты',form:1,nextLabel:'Записаться',sub:'Администратор перезвонит и подтвердит время.',render(pb,st){contactsForm(pb,st,'<label class="field">Комментарий (необязательно)<textarea name="cm" maxlength="300" placeholder="Например: болит зуб справа, нужен первичный осмотр"></textarea></label>');$('textarea',pb).addEventListener('input',e=>st.cm=e.target.value)},validate:validateContacts}];
const dn=st=>DIR.find(x=>x.id===st.dir).label;
Wizard($('#booking'),{steps,who:'администратор «Дент-Арт»',tel:'+73842367932',
 summary:st=>[['Направление',dn(st)],['Врач',DOC[st.doc].n],['Желаемое время',st.dayLabel+', '+st.slot+':00'],['Адрес','ул. Николая Островского, 28 (уточняется)'],['Стоимость','уточняется'],['Телефон',st.tel]],
 message:st=>'Дент-Арт · запись (ДЕМО, не отправлено)\nНаправление: '+dn(st)+'\nВрач: '+DOC[st.doc].n+'\nЖелаемое время: '+st.dayLabel+', '+st.slot+':00'+(DOC[st.doc].tbd?' (по часам клиники)':' (по графику врача)')+(st.cm?'\nКомментарий: '+st.cm:'')+'\nИмя: '+st.name+'\nТелефон: '+st.tel+'\n→ подтвердить время звонком'});
})();
