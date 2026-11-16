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

(()=>{const {$,$$,esc,Wizard,choice,contactsForm,validateContacts,cityNow,cityDays,dlabel}=SW;
/* направления и специалисты — меню kcl.ucoz.ru; часы — страница «Контакты» */
const D=[{id:'med',label:'Медицинская косметология',sub:'Инъекционная, дерматокосметология, аппаратная, чистки, программы ухода'},
 {id:'rw',label:'Радиоволновое удаление',sub:'Решение — после осмотра специалиста'},
 {id:'health',label:'Оздоровительный центр',sub:'Медицинский массаж, оздоровительные программы, коррекция фигуры'},
 {id:'salon',label:'Салон красоты',sub:'Парикмахерские услуги'},
 {id:'cert',label:'Подарочный сертификат',sub:'На любую сумму и любую услугу'}];
const SP={any:'Подберёт администратор',pim:'Пименов Леонид Николаевич',dem:'Демская Светлана Ивановна',ant:'Антонова Ирина Владимировна'};
const steps=[
{id:'dir',title:'Направление',sub:'Цены — у администратора центра (<span class="tbd">уточняются</span>): на странице прайса сайта их нет.',render(pb,st,api){choice(pb,st,api,'dir',D);pb.addEventListener('pick',()=>{delete st.fmt;delete st.sp})}},
{id:'fmt',title:'Формат визита',sub:'',render(pb,st,api){
  if(st.dir==='cert'){pb.innerHTML='<label class="field">Сумма или услуга для сертификата<input name="cert" placeholder="Например: 5 000 ₽ или чистка лица" value="'+esc(st.cert||'')+'"></label><p class="hint">По сайту сертификат оформляется на любую сумму и услугу; по желанию дарителя получателю не сообщают стоимость. Способ получения — <span class="tbd">уточняется</span>.</p>';
    const i=$('input',pb);const u=()=>{st.cert=i.value;api.setValid(i.value.trim().length>=2)};i.addEventListener('input',u);u();return}
  const opts=st.dir==='salon'?[{id:'proc',label:'Запись на услугу',sub:'Администратор уточнит детали'}]:[{id:'cons',label:'Консультация специалиста',sub:'С неё стоит начать: у процедур есть противопоказания'},{id:'proc',label:'Запись на процедуру',sub:'Если вы уже были у специалиста центра'}];
  choice(pb,st,api,'fmt',opts);
  const box=document.createElement('div');st.sp=st.sp||'any';box.innerHTML='<p class="wgroup">Специалист</p><div class="chips" style="margin-top:8px">'+Object.entries(SP).map(([k,v])=>'<button type="button" class="chip" data-sp="'+k+'" aria-pressed="'+(st.sp===k)+'">'+v+'</button>').join('')+'</div><p class="note">Специалисты — из раздела «Специалисты центра». Кто из них ведёт выбранное направление — <span class="tbd">уточняется</span>.</p>';
  if(st.dir!=='salon')pb.append(box);
  $$('[data-sp]',box).forEach(c=>c.addEventListener('click',()=>{st.sp=c.dataset.sp;$$('[data-sp]',box).forEach(x=>x.setAttribute('aria-pressed',x===c))}))}},
{id:'time',title:'День и время',sub:'Центр работает ежедневно 10:00–21:00 без обеда и выходных (время красноярское). Администратор подтвердит запись.',render(pb,st,api){
  const now=cityNow(),days=cityDays(10);st.dayI=null;delete st.slot;
  pb.innerHTML='<div class="days chips">'+days.map((x,i)=>'<button type="button" class="chip day" data-i="'+i+'">'+SW.WD[x.getUTCDay()]+'<b>'+x.getUTCDate()+'</b></button>').join('')+'</div><div data-slots></div>';
  const sl=$('[data-slots]',pb);
  const draw=()=>{const today=st.dayI===0;let b='';for(let h=10;h<21;h++){const past=today&&h<=now.getUTCHours();b+='<button type="button" class="chip slot" '+(past?'disabled':'')+'>'+h+':00</button>'}
    sl.innerHTML='<p class="wgroup" style="margin:6px 0 8px">'+st.dayL+'</p><div class="chips">'+b+'</div>'+(today&&!b.includes('class="chip slot" >')?'<p class="note">На сегодня время закончилось — выберите другой день.</p>':'');
    $$('.slot',sl).forEach(c=>c.addEventListener('click',()=>{st.slot=c.textContent;$$('.slot',sl).forEach(y=>y.setAttribute('aria-pressed',y===c));api.setValid(true)}))};
  $$('.day',pb).forEach(c=>c.addEventListener('click',()=>{st.dayI=+c.dataset.i;st.dayL=dlabel(days[st.dayI]);delete st.slot;$$('.day',pb).forEach(y=>y.setAttribute('aria-pressed',y===c));api.setValid(false);draw()}));api.setValid(false)}},
{id:'contacts',title:'Контакты',form:1,nextLabel:'Записаться',sub:'Администратор перезвонит, подтвердит время и расскажет о подготовке.',render(pb,st){contactsForm(pb,st,'<label class="field">Вопрос администратору (необязательно)<textarea name="cm" maxlength="300" placeholder="Например: какой специалист ведёт консультацию"></textarea></label>');$('textarea',pb).addEventListener('input',e=>st.cm=e.target.value)},validate:validateContacts}];
const dn=st=>D.find(x=>x.id===st.dir).label,fm=st=>st.dir==='cert'?'Сертификат: '+st.cert.trim():(st.fmt==='cons'?'Консультация специалиста':'Запись на процедуру');
Wizard($('#booking'),{steps,who:'администратор центра «Эстетик»',tel:'+73912204764',
 summary:st=>[['Направление',dn(st)],['Формат',fm(st)],['Специалист',st.dir==='cert'||st.dir==='salon'?'—':SP[st.sp]],['Когда',st.dayL+', '+st.slot],['Стоимость','уточняется'],['Телефон',st.tel]],
 message:st=>'Эстетик · запись (ДЕМО, не отправлено)\nНаправление: '+dn(st)+'\nФормат: '+fm(st)+(st.dir!=='cert'&&st.dir!=='salon'?'\nСпециалист: '+SP[st.sp]:'')+'\nКогда: '+st.dayL+', '+st.slot+(st.cm?'\nВопрос: '+st.cm:'')+'\nИмя: '+st.name+'\nТелефон: '+st.tel+'\n→ подтвердить время звонком'});
})();
