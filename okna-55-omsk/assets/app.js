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

(()=>{const {$,$$,esc,rub,tween,Wizard,choice,contactsForm,validateContacts,cityNow,cityDays,dlabel}=SW;
/* цены «от» — главная okna55.ucoz.ru */
const T=[{id:'win',label:'Пластиковое окно',sub:'Под ключ — от 7 800 ₽',from:7800,per:'окно'},{id:'balc',label:'Балкон',sub:'Цена <span class="tbd">уточняется</span>'},
 {id:'sect',label:'Секционные ворота',sub:'Под ключ — от 21 854 ₽',from:21854,per:'ворота',gate:1},{id:'sld',label:'Откатные или распашные ворота',sub:'Цена <span class="tbd">уточняется</span>',gate:1},
 {id:'roll',label:'Рольворота',sub:'Цена <span class="tbd">уточняется</span>',gate:1},{id:'auto',label:'Автоматика для ворот',sub:'Секционные, откатные, распашные, рольворота'},
 {id:'rep',label:'Ремонт секционных ворот',sub:'Ролики, тросы, подтяжка пружин — 4 000 ₽ с комплектующими',fixed:4000},{id:'biz',label:'Для склада и бизнеса',sub:'Скоростные и огнестойкие ворота, перегрузочное оборудование'}];
const tp=st=>T.find(x=>x.id===st.type);
function est(st){const t=tp(st);if(t.fixed)return {v:t.fixed,txt:rub(t.fixed)+' — спецпредложение с сайта'};if(t.from)return {v:t.from*(st.qty||1),txt:'от '+rub(t.from*(st.qty||1)),pre:1};return null}
const steps=[
{id:'type',title:'Что нужно',sub:'Цены «от» — с текущего сайта. Точная стоимость — после замера.',render(pb,st,api){choice(pb,st,api,'type',T);pb.addEventListener('pick',()=>{st.qty=1;st.urgent=false})}},
{id:'size',title:'Размеры и детали',sub:'Примерные размеры помогают замерщику взять нужный образец. Можно пропустить — всё измерят на месте.',render(pb,st,api){
  const t=tp(st);st.qty=st.qty||1;st.w=st.w||'';st.h=st.h||'';
  let h='<div class="grid2"><label class="field">Ширина, см<input type="number" name="w" min="30" max="1500" inputmode="numeric" placeholder="'+(t.gate?'300':'130')+'" value="'+st.w+'"></label><label class="field">Высота, см<input type="number" name="h" min="30" max="800" inputmode="numeric" placeholder="'+(t.gate?'250':'140')+'" value="'+st.h+'"></label></div>';
  if(t.id==='win')h+='<label class="field">Сколько окон<input type="number" name="qty" min="1" max="30" value="'+st.qty+'"></label>';
  if(t.gate)h+='<label class="check"><input type="checkbox" name="au" '+(st.au?'checked':'')+'> <span>Нужна автоматика (открывать с пульта)</span></label>';
  if(t.id==='rep')h='<label class="check"><input type="checkbox" name="urg" '+(st.urgent?'checked':'')+'> <span>Нужен срочный ремонт (по сайту возможен)</span></label><p class="hint">Цена со спецпредложения на сайте: замена всех роликов, тросов и подтяжка пружин — 4 000 ₽ с комплектующими. Актуальность — <span class="tbd">уточняется</span>.</p>';
  h+='<div class="total" aria-live="polite" data-tot><div><small>Ориентир</small><span data-l style="font-size:12px;opacity:.85"></span></div><b data-total>—</b></div><p class="note" style="margin-top:0" data-n></p>';
  pb.innerHTML=h;const T_=$('[data-total]',pb),L=$('[data-l]',pb),N=$('[data-n]',pb);
  const upd=()=>{const e=est(st);if(e){tween(T_,e.v,e.pre?'от ':'');L.textContent=t.id==='win'?st.qty+' × окно под ключ':(t.id==='rep'?'ремонт секционных ворот':'ворота под ключ');N.innerHTML=e.pre?'Цена «от» с сайта, без учёта размеров и опций'+(st.au?' и автоматики':'')+' — итог после замера. Актуальность цен <span class="tbd">уточняется</span>.':''}else{T_._tw=(T_._tw||0)+1;T_.dataset.v=0;T_.textContent='уточняется';L.textContent=t.label;N.innerHTML='Цена на этот вид работ на сайте не опубликована — <span class="tbd">уточняется</span> при звонке или замере.'}api.setValid(true)};
  $$('input',pb).forEach(i=>i.addEventListener('input',()=>{if(i.name==='w')st.w=i.value;if(i.name==='h')st.h=i.value;if(i.name==='qty')st.qty=Math.max(1,Math.min(30,+i.value||1));if(i.name==='au')st.au=i.checked;if(i.name==='urg')st.urgent=i.checked;upd()}));upd()}},
{id:'measure',title:'Замер',sub:'Куда приехать и когда удобно. Часы работы на сайте не указаны — время <span class="tbd">уточняется</span> при звонке (время омское).',render(pb,st,api){
  const days=cityDays(8).slice(1);st.dayI=null;st.part='';st.office=st.office||'north';
  pb.innerHTML='<label class="field">Адрес объекта<input name="obj" autocomplete="street-address" placeholder="Например: Омск, ул. Масленникова, 70" value="'+esc(st.obj||'')+'"></label><p class="wgroup">День замера</p><div class="days chips" data-days>'+days.map((x,i)=>'<button type="button" class="chip day" data-i="'+i+'">'+SW.WD[x.getUTCDay()]+'<b>'+x.getUTCDate()+'</b></button>').join('')+'</div><div class="chips" data-part>'+['Утро','День','Вечер'].map(x=>'<button type="button" class="chip slot">'+x+'</button>').join('')+'</div><p class="wgroup">Ближайший офис</p><div class="chips" data-of><button type="button" class="chip" data-o="north" aria-pressed="'+(st.office==='north')+'">24-я Северная, 168/2</button><button type="button" class="chip" data-o="mira" aria-pressed="'+(st.office==='mira')+'">пр. Мира, 98</button></div>';
  const o=$('input[name=obj]',pb),val=()=>api.setValid(o.value.trim().length>=5&&st.dayI!=null&&!!st.part);
  o.addEventListener('input',()=>{st.obj=o.value;val()});
  $$('[data-days] .chip',pb).forEach(c=>c.addEventListener('click',()=>{st.dayI=+c.dataset.i;st.dayL=dlabel(days[st.dayI]);$$('[data-days] .chip',pb).forEach(x=>x.setAttribute('aria-pressed',x===c));val()}));
  $$('[data-part] .chip',pb).forEach(c=>c.addEventListener('click',()=>{st.part=c.textContent;$$('[data-part] .chip',pb).forEach(x=>x.setAttribute('aria-pressed',x===c));val()}));
  $$('[data-o]',pb).forEach(c=>c.addEventListener('click',()=>{st.office=c.dataset.o;$$('[data-o]',pb).forEach(x=>x.setAttribute('aria-pressed',x===c))}));val()}},
{id:'contacts',title:'Контакты',form:1,nextLabel:'Вызвать замерщика',sub:'Перезвоним, чтобы подтвердить время замера.',render(pb,st){contactsForm(pb,st)},validate:validateContacts}];
const OF={north:'24-я Северная, 168/2 (ТК «Флагман»)',mira:'пр. Мира, 98'};
const sz=st=>st.w&&st.h?st.w+'×'+st.h+' см':'измерить на месте';
Wizard($('#booking'),{steps,who:'менеджер «Окна 55»',tel:'+79039277618',
 summary:st=>{const e=est(st);return [['Что нужно',tp(st).label+(st.type==='win'?' × '+st.qty:'')],['Размер',sz(st)],['Ориентир',e?e.txt:'уточняется'],['Замер',st.obj.trim()],['Когда',st.dayL+', '+st.part.toLowerCase()],['Офис',OF[st.office]],['Телефон',st.tel]]},
 message:st=>{const e=est(st);return 'Окна 55 · заявка на замер (ДЕМО, не отправлено)\n'+(st.urgent?'⚑ СРОЧНЫЙ РЕМОНТ\n':'')+'Что: '+tp(st).label+(st.type==='win'?' × '+st.qty:'')+(st.au?' + автоматика':'')+'\nРазмер: '+sz(st)+'\nОриентир: '+(e?e.txt:'уточняется')+'\nАдрес замера: '+st.obj.trim()+'\nКогда: '+st.dayL+', '+st.part.toLowerCase()+'\nОфис: '+OF[st.office]+'\nИмя: '+st.name+'\nТелефон: '+st.tel}});
})();
