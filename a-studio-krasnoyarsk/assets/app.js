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
/* услуги — по тексту astudio100.ucoz.ru («Наши скидки»); цены на сайте не опубликованы */
const S=[{id:'hair',label:'Причёска',sub:'Парикмахер-стилист'},{id:'make',label:'Макияж',sub:'Визажист'},{id:'look',label:'Образ к событию',sub:'Причёска + макияж'},{id:'nails',label:'Маникюр и педикюр',sub:'В том числе дизайн, рисунки'},{id:'lash',label:'Наращивание ресниц',sub:'Мастер по ресницам'},{id:'other',label:'Другое',sub:'Уточним по телефону'}];
const PARTS=[['11:00–14:00',14],['14:00–17:00',17],['После 17:00',21]];
const steps=[
{id:'svc',title:'Услуга',sub:'Цены на сайте не опубликованы — <span class="tbd">уточняются</span> у администратора.',render(pb,st,api){choice(pb,st,api,'svc',S)}},
{id:'where',title:'В салоне или на дому',sub:'По сайту салон выезжает в любую точку Красноярска. Условия и стоимость выезда <span class="tbd">уточняются</span>.',render(pb,st,api){
  choice(pb,st,api,'where',[{id:'salon',label:'В салоне',sub:'ул. Чернышевского, 100'},{id:'home',label:'Выезд на дом',sub:'Мастер приедет к вам'}]);
  const box=document.createElement('div');box.innerHTML='<label class="field" data-f="addr">Район или адрес<input name="addr" autocomplete="street-address" placeholder="Например: Взлётка, ул. Весны" value="'+esc(st.addr||'')+'"><span class="err">Укажите хотя бы район</span></label>';pb.append(box);
  const inp=$('input',box);const upd=()=>{box.hidden=st.where!=='home';api.setValid(!!st.where&&(st.where!=='home'||inp.value.trim().length>=3))};
  inp.addEventListener('input',()=>{st.addr=inp.value;upd()});pb.addEventListener('pick',upd);upd()}},
{id:'time',title:'День и время',sub:'Салон работает ежедневно с 11:00 «до последнего клиента». Время — красноярское; администратор подтвердит запись и подберёт мастера.',render(pb,st,api){
  const now=cityNow(),days=cityDays(10);st.dayI=null;st.part='';
  pb.innerHTML='<div class="days chips" data-days>'+days.map((x,i)=>'<button type="button" class="chip day" data-i="'+i+'">'+SW.WD[x.getUTCDay()]+'<b>'+x.getUTCDate()+'</b></button>').join('')+'</div><p class="wgroup">Время</p><div class="chips" data-part>'+PARTS.map(p=>'<button type="button" class="chip slot" data-end="'+p[1]+'">'+p[0]+'</button>').join('')+'</div><p class="hint"><b>Мастер:</b> подберёт администратор — имена мастеров на сайте не указаны (<span class="tbd">уточняется</span>). Работы мастеров — на странице ВКонтакте.</p>';
  const parts=$$('[data-part] .chip',pb),val=()=>api.setValid(st.dayI!=null&&!!st.part);
  const lock=()=>{const today=st.dayI===0;parts.forEach(p=>{const off=today&&now.getUTCHours()>=+p.dataset.end-1;p.disabled=off;if(off&&st.part===p.textContent){st.part='';p.setAttribute('aria-pressed','false')}});val()};
  $$('[data-days] .chip',pb).forEach(c=>c.addEventListener('click',()=>{st.dayI=+c.dataset.i;st.dayL=dlabel(days[st.dayI]);$$('[data-days] .chip',pb).forEach(x=>x.setAttribute('aria-pressed',x===c));lock()}));
  parts.forEach(c=>c.addEventListener('click',()=>{st.part=c.textContent;parts.forEach(x=>x.setAttribute('aria-pressed',x===c));val()}));val()}},
{id:'contacts',title:'Контакты',form:1,nextLabel:'Записаться',sub:'Администратор перезвонит и подтвердит время.',render(pb,st){contactsForm(pb,st,'<label class="field">Пожелания (необязательно)<textarea name="cm" maxlength="300" placeholder="Например: вечерняя причёска на длинные волосы"></textarea></label>');$('textarea',pb).addEventListener('input',e=>st.cm=e.target.value)},validate:validateContacts}];
const sn=st=>S.find(x=>x.id===st.svc).label,wn=st=>st.where==='home'?'Выезд на дом: '+st.addr.trim():'В салоне, Чернышевского, 100';
Wizard($('#booking'),{steps,who:'администратор «А-Студио»',tel:'+79639559626',
 summary:st=>[['Услуга',sn(st)],['Где',wn(st)],['Когда',st.dayL+', '+st.part],['Мастер','подберёт администратор'],['Стоимость','уточняется'],['Телефон',st.tel]],
 message:st=>'А-Студио · запись (ДЕМО, не отправлено)\n'+(st.where==='home'?'🚗 ВЫЕЗД НА ДОМ\n':'')+'Услуга: '+sn(st)+'\nГде: '+wn(st)+'\nКогда: '+st.dayL+', '+st.part+(st.cm?'\nПожелания: '+st.cm:'')+'\nИмя: '+st.name+'\nТелефон: '+st.tel+'\n→ подобрать мастера и подтвердить время'});
})();
