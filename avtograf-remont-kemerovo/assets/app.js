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

(()=>{const {$,$$,esc,rub,tween,Wizard,choice,contactsForm,validateContacts}=SW;
const FORMATS=[{id:'turnkey',label:'Ремонт под ключ',sub:'Строительные, электро- и сантехнические работы, отделка'},{id:'works',label:'Отдельные работы',sub:'Стены, пол, потолок — по позициям прайса'},{id:'design',label:'Дизайн интерьера + ремонт',sub:'Акция на сайте: сопровождение бесплатно (актуальность уточняется)'},{id:'small',label:'Небольшой ремонт',sub:'Кухня, малярные работы, бытовые задачи'}];
const OBJ=[['Квартира'],['Офис'],['Отдельная комната'],['Кухня или санузел']];
/* позиции и цены — прайс отделочных работ на avtograf1.ucoz.ru (дата не указана) */
const W=[
 {g:'Стены',id:'w_put',n:'Шпаклёвка стен (слой)',p:200,a:'walls',on:1},
 {g:'Стены',id:'w_paint',n:'Покраска стен',p:120,a:'walls',on:1},
 {g:'Стены',id:'w_wall',n:'Оклейка обоями (винил/флизелин)',p:150,a:'walls'},
 {g:'Стены',id:'w_tile',n:'Монтаж плитки на стену',p:650,a:'walls'},
 {g:'Пол',id:'f_screed',n:'Стяжка до 5 см',p:350,a:'floor'},
 {g:'Пол',id:'f_lam',n:'Укладка ламината',p:300,a:'floor',on:1},
 {g:'Пол',id:'f_tile',n:'Укладка плитки на пол',p:600,a:'floor'},
 {g:'Потолок',id:'c_put',n:'Шпаклёвка потолка',p:250,a:'floor'},
 {g:'Потолок',id:'c_paint',n:'Покраска потолка',p:60,a:'floor',on:1},
 {g:'Потолок',id:'c_gkl',n:'Гипсокартонный потолок',p:550,a:'floor'}];
function calc(st){let s=0;const f=+st.floor||0,w=+st.walls||0;W.forEach(x=>{if(st.w[x.id])s+=x.p*(x.a==='walls'?w:f)});s+=(+st.points||0)*500;return s}
function lines(st){return W.filter(x=>st.w[x.id]).map(x=>x.n)}
const steps=[
{id:'format',title:'Что нужно сделать',sub:'Выберите формат — от него зависит, кто перезвонит: мастер или дизайнер.',render(pb,st,api){
  choice(pb,st,api,'format',FORMATS);
  const o=document.createElement('div');o.innerHTML='<p class="wgroup">Объект</p><div class="chips" style="margin-top:8px">'+OBJ.map(x=>'<button type="button" class="chip" aria-pressed="'+((st.obj||'Квартира')===x[0])+'">'+x[0]+'</button>').join('')+'</div>';pb.append(o);st.obj=st.obj||'Квартира';
  $$('.chip',o).forEach(c=>c.addEventListener('click',()=>{st.obj=c.textContent;$$('.chip',o).forEach(x=>x.setAttribute('aria-pressed',x===c))}))}},
{id:'calc',title:'Площадь и работы',sub:'Расчёт по прайсу «Автографа». Это ориентир за работу, без материалов — точную смету даст специалист.',render(pb,st,api){
  if(!st.w){st.w={};W.forEach(x=>{if(x.on)st.w[x.id]=1});st.floor=45;st.walls=Math.round(45*2.5);st.points=0;st.wallsTouched=0}
  let g='';pb.innerHTML='<div class="grid2"><label class="field">Площадь пола, м² <input type="number" min="1" max="500" inputmode="numeric" name="floor" value="'+st.floor+'"><input class="range" type="range" min="5" max="200" value="'+Math.min(200,st.floor)+'" aria-label="Площадь пола"></label><label class="field">Площадь стен, м² <input type="number" min="0" max="2000" inputmode="numeric" name="walls" value="'+st.walls+'"><small style="font-weight:400">Подставляется грубо: пол × 2,5. Поправьте, если знаете точнее.</small></label></div><div class="wlist">'+W.map(x=>{const h=x.g!==g?'<p class="wgroup">'+x.g+'</p>':'';g=x.g;return h+'<label class="witem"><input type="checkbox" data-w="'+x.id+'" '+(st.w[x.id]?'checked':'')+'><span>'+esc(x.n)+'</span><em>'+x.p+' ₽/м²</em></label>'}).join('')+'<p class="wgroup">Электрика</p><label class="witem"><span>⚡</span><span>Установка электроточек, шт.</span><em><input type="number" name="points" min="0" max="99" value="'+st.points+'" style="width:64px;padding:6px;border:1px solid var(--line2);border-radius:8px;background:var(--bg)"> × 500 ₽</em></label></div><div class="total" aria-live="polite"><div><small>Ориентир за работы по прайсу</small><span data-l></span></div><b data-total>0 ₽</b></div><p class="note" style="margin-top:0">Прайс опубликован на текущем сайте без даты — актуальность цен <span class="tbd">уточняется</span>. Материалы, демонтаж и подготовка в расчёт не входят.</p>';
  const fl=$('input[name=floor]',pb),rg=$('.range',pb),wl=$('input[name=walls]',pb),pt=$('input[name=points]',pb),T=$('[data-total]',pb),L=$('[data-l]',pb);
  const upd=()=>{const s=calc(st);tween(T,s);const n=lines(st).length+(st.points>0?1:0);L.textContent=n+' '+(n===1?'позиция':n>1&&n<5?'позиции':'позиций')+' · '+st.floor+' м² пола';L.style.cssText='font-size:12px;opacity:.85';api.setValid(s>0&&st.floor>0)};
  const setF=v=>{st.floor=Math.max(0,Math.min(500,+v||0));if(!st.wallsTouched){st.walls=Math.round(st.floor*2.5);wl.value=st.walls}upd()};
  fl.addEventListener('input',()=>{setF(fl.value);rg.value=Math.min(200,st.floor)});rg.addEventListener('input',()=>{fl.value=rg.value;setF(rg.value)});
  wl.addEventListener('input',()=>{st.wallsTouched=1;st.walls=Math.max(0,+wl.value||0);upd()});pt.addEventListener('input',()=>{st.points=Math.max(0,Math.min(99,+pt.value||0));upd()});
  $$('[data-w]',pb).forEach(c=>c.addEventListener('change',()=>{if(c.checked)st.w[c.dataset.w]=1;else delete st.w[c.dataset.w];upd()}));upd()}},
{id:'photo',title:'Фото и сроки',sub:'Пара снимков помещения экономит выезд «просто посмотреть». Фото остаются на вашем устройстве — это демо.',render(pb,st,api){
  st.when=st.when||'';pb.innerHTML='<label class="drop">📷 <b>Прикрепить фото помещения</b><br><small>JPG/PNG, можно несколько — необязательно</small><input type="file" accept="image/*" multiple></label><div class="thumbs"></div><p class="wgroup">Когда планируете начать</p><div class="chips">'+['В ближайший месяц','Через 1–3 месяца','Пока прицениваюсь'].map(x=>'<button type="button" class="chip" aria-pressed="'+(st.when===x)+'">'+x+'</button>').join('')+'</div><label class="field">Комментарий (необязательно)<textarea name="cm" maxlength="400" placeholder="Например: вторичка, нужна замена проводки">'+esc(st.cm||'')+'</textarea></label>';
  const fi=$('input[type=file]',pb),th=$('.thumbs',pb);fi.addEventListener('change',()=>{th.innerHTML='';st.photos=fi.files.length;[...fi.files].slice(0,6).forEach(f=>{const r=new FileReader();r.onload=()=>{const i=new Image();i.src=r.result;i.alt='Ваше фото';th.append(i)};r.readAsDataURL(f)})});
  $$('.chip',pb).forEach(c=>c.addEventListener('click',()=>{st.when=c.textContent;$$('.chip',pb).forEach(x=>x.setAttribute('aria-pressed',x===c));api.setValid(true)}));
  $('textarea',pb).addEventListener('input',e=>st.cm=e.target.value);api.setValid(!!st.when)}},
{id:'contacts',title:'Куда перезвонить',form:1,nextLabel:'Отправить заявку',sub:'Телефон проверяется сразу, ошибиться цифрой сложно.',render(pb,st){contactsForm(pb,st,'<div class="chips" data-way>'+['Звонок','Telegram'].map(x=>'<button type="button" class="chip" aria-pressed="'+((st.way||'Звонок')===x)+'">'+x+'</button>').join('')+'</div>');st.way=st.way||'Звонок';$$('[data-way] .chip',pb).forEach(c=>c.addEventListener('click',()=>{st.way=c.textContent;$$('[data-way] .chip',pb).forEach(x=>x.setAttribute('aria-pressed',x===c))}))},validate:validateContacts}];
const fname=st=>FORMATS.find(f=>f.id===st.format).label;
Wizard($('#booking'),{steps,who:'мастер «Автографа»',tel:'+79089589092',
 summary:st=>[['Формат',fname(st)],['Объект',st.obj],['Площадь',st.floor+' м² пола, '+st.walls+' м² стен'],['Ориентир',rub(calc(st))+' за работы'],['Начать',st.when],['Фото',(st.photos||0)+' шт.'],['Связь',st.way+', '+st.tel]],
 message:st=>'Автограф · новая заявка (ДЕМО, не отправлено)\nФормат: '+fname(st)+'\nОбъект: '+st.obj+'\nПол: '+st.floor+' м², стены: '+st.walls+' м²\nРаботы: '+(lines(st).join('; ')||'—')+(st.points?'\nЭлектроточки: '+st.points+' шт.':'')+'\nОриентир по прайсу: '+rub(calc(st))+' (без материалов)\nСтарт: '+st.when+'\nФото: '+(st.photos||0)+' шт.'+(st.cm?'\nКомментарий: '+st.cm:'')+'\nИмя: '+st.name+'\nТелефон: '+st.tel+' · '+st.way+(st.format==='design'?'\n→ передать дизайнеру':'')});
})();
