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

(()=>{const {$,$$,esc,Wizard,choice,contactsForm,validateContacts,cityDays,dlabel,cityNow}=SW;
/* направления и специализации — pravo42.com */
const LAW={vol:'Волынский Данил Юрьевич, адвокат, партнёр',sht:'Шестаков Андрей Владимирович, ведущий юрист',vor:'Воронков Сергей Андреевич, ведущий юрист'};
const D=[
 {id:'fam',t:'p',label:'Семейные дела',sub:'Развод, алименты, раздел имущества',ex:['Расторжение брака в суде','Взыскание алиментов','Раздел имущества супругов','Порядок общения с ребёнком'],l:['sht','vor','vol']},
 {id:'inh',t:'p',label:'Наследство',sub:'Доли, сроки, оспаривание завещания',ex:['Получение свидетельства о праве на наследство','Определение доли','Оспаривание завещания','Долги наследодателя'],l:['sht']},
 {id:'ins',t:'p',label:'ДТП и страховые споры',sub:'Заниженная выплата, отказ страховой',ex:['Страховая занизила выплату','Отказ страховой в выплате','Признать случай страховым','Возмещение вреда через суд'],l:['sht']},
 {id:'hou',t:'p',label:'Жилищные дела',sub:'Выселение, раздел жилплощади, УК',ex:['Спор с управляющей компанией','Затопление','Раздел жилплощади','Приватизация'],l:['sht']},
 {id:'est',t:'p',label:'Недвижимость и земля',sub:'Проверка сделки, права, границы участка',ex:['Проверка юридической чистоты сделки','Спор о границах с соседями','Оформление прав на землю','Снижение кадастровой стоимости'],l:['vor']},
 {id:'lab',t:'p',label:'Трудовые споры',sub:'Защита интересов в органах и суде',ex:['Консультация по трудовому законодательству','Оформление документов','Защита интересов в суде'],l:[]},
 {id:'crim',t:'p',label:'Защита по уголовным делам',sub:'На следствии и в суде, в т. ч. потерпевшим',ex:['Нужен защитник на следствии','Обжалование приговора','Интересы потерпевшего'],l:['sht']},
 {id:'civ',t:'p',label:'Гражданские дела',sub:'Претензии, иски, исполнение решений',ex:['Составить претензию или иск','Письменная консультация','Исполнение решения суда'],l:['vor']},
 {id:'reg',t:'b',label:'Регистрация и ликвидация ООО',sub:'Изменения, реорганизация',ex:['Регистрация юрлица','Внесение изменений','Ликвидация'],l:['vol','vor']},
 {id:'bnk',t:'b',label:'Банкротство бизнеса',sub:'На стороне должника или кредитора',ex:['Взыскание долга через банкротство','Контролируемая процедура'],l:['vol','vor']},
 {id:'arb',t:'b',label:'Арбитраж',sub:'Дебиторка, сделки, корпоративные споры',ex:['Взыскание дебиторской задолженности','Признание сделки недействительной','Корпоративный спор'],l:['vor','sht','vol']},
 {id:'sub',t:'b',label:'Абонентское обслуживание',sub:'Несколько тарифов — условия уточняются',ex:['Постоянное юридическое сопровождение','Проверка договоров'],l:['vol','vor']}];
const URG=['Есть дата суда или срок','Срочно, на этой неделе','Не срочно'];
const steps=[
{id:'dir',title:'Ваш вопрос',sub:'Выберите направление — заявка сразу попадёт к юристу с подходящим профилем.',render(pb,st,api){
  st.who=st.who||'p';const draw=()=>{const box=document.createElement('div');choice(box,st,api,'dir',D.filter(x=>x.t===st.who));return box};
  pb.innerHTML='<div class="tabs" role="tablist"><button type="button" role="tab" data-w="p" aria-selected="'+(st.who==='p')+'">Частным лицам</button><button type="button" role="tab" data-w="b" aria-selected="'+(st.who==='b')+'">Бизнесу</button></div>';const h=document.createElement('div');pb.append(h);h.append(draw());
  $$('[data-w]',pb).forEach(b=>b.addEventListener('click',()=>{st.who=b.dataset.w;$$('[data-w]',pb).forEach(x=>x.setAttribute('aria-selected',x===b));h.replaceChildren(draw())}));
  pb.addEventListener('pick',()=>{delete st.ex})}},
{id:'sit',title:'Ситуация в двух строках',sub:'Без подробностей — юрист уточнит при звонке. Можно начать с подсказки.',render(pb,st,api){
  const d=D.find(x=>x.id===st.dir);st.urg=st.urg||'';
  pb.innerHTML='<div class="chips" data-ex>'+d.ex.map(x=>'<button type="button" class="chip">'+esc(x)+'</button>').join('')+'</div><label class="field">Опишите коротко<textarea name="sit" maxlength="280" placeholder="Например: развожусь, нужно разделить квартиру и машину">'+esc(st.sit||'')+'</textarea><small style="font-weight:400" data-cnt></small></label><p class="wgroup">Насколько срочно</p><div class="chips" data-urg>'+URG.map(x=>'<button type="button" class="chip" aria-pressed="'+(st.urg===x)+'">'+x+'</button>').join('')+'</div>';
  const ta=$('textarea',pb),cnt=$('[data-cnt]',pb);const upd=()=>{st.sit=ta.value;const n=ta.value.trim().length;cnt.textContent=n<10?'Ещё '+(10-n)+' симв. минимум · '+n+'/280':n+'/280';api.setValid(n>=10&&!!st.urg)};
  $$('[data-ex] .chip',pb).forEach(c=>c.addEventListener('click',()=>{ta.value=(ta.value.trim()?ta.value.trim()+'. ':'')+c.textContent;c.setAttribute('aria-pressed','true');upd();ta.focus()}));
  $$('[data-urg] .chip',pb).forEach(c=>c.addEventListener('click',()=>{st.urg=c.textContent;$$('[data-urg] .chip',pb).forEach(x=>x.setAttribute('aria-pressed',x===c));upd()}));ta.addEventListener('input',upd);upd()}},
{id:'when',title:'Первая консультация',sub:'По сайту первая консультация бесплатная. Часы работы — Пн–Пт 9:00–19:00 (Кемерово).',render(pb,st,api){
  const d=D.find(x=>x.id===st.dir),now=cityNow(),days=cityDays(10).filter(x=>x.getUTCDay()%6!==0).slice(0,6);st.fmt=st.fmt||'По телефону';
  pb.innerHTML='<div class="chips" data-fmt>'+['По телефону','В офисе на пр. Ленина, 90/2'].map(x=>'<button type="button" class="chip" aria-pressed="'+(st.fmt===x)+'">'+x+'</button>').join('')+'</div><p class="wgroup">День</p><div class="days chips" data-days>'+days.map((x,i)=>'<button type="button" class="chip day" data-i="'+i+'">'+SW.WD[x.getUTCDay()]+'<b>'+x.getUTCDate()+'</b></button>').join('')+'</div><p class="wgroup">Время</p><div class="chips" data-part>'+['9:00–12:00','12:00–15:00','15:00–19:00'].map((x,i)=>'<button type="button" class="chip slot" data-end="'+[12,15,19][i]+'">'+x+'</button>').join('')+'</div><div class="hint" data-law></div>';
  const lw=$('[data-law]',pb);lw.innerHTML=d.l.length?'<b>По профилю на сайте такими делами занимается:</b><br>'+d.l.map(k=>esc(LAW[k])).join('<br>')+'<br><span class="tbd">Кто возьмёт ваш вопрос — уточняется.</span>':'<b>Юриста подберёт руководитель.</b> <span class="tbd">Профильный специалист уточняется.</span>';
  const parts=$$('[data-part] .chip',pb);
  const val=()=>api.setValid(st.dayI!=null&&!!st.part);
  const lock=()=>{const x=days[st.dayI];const today=x&&x.getUTCDate()===now.getUTCDate();parts.forEach(p=>{const off=today&&now.getUTCHours()>=+p.dataset.end-1;p.disabled=off;if(off&&st.part===p.textContent){st.part='';p.setAttribute('aria-pressed','false')}});val()};
  $$('[data-fmt] .chip',pb).forEach(c=>c.addEventListener('click',()=>{st.fmt=c.textContent;$$('[data-fmt] .chip',pb).forEach(x=>x.setAttribute('aria-pressed',x===c))}));
  $$('[data-days] .chip',pb).forEach(c=>c.addEventListener('click',()=>{st.dayI=+c.dataset.i;st.dayL=dlabel(days[st.dayI]);$$('[data-days] .chip',pb).forEach(x=>x.setAttribute('aria-pressed',x===c));lock()}));
  parts.forEach(c=>c.addEventListener('click',()=>{st.part=c.textContent;parts.forEach(x=>x.setAttribute('aria-pressed',x===c));val()}));
  st.dayI=null;st.part='';val()}},
{id:'contacts',title:'Контакты',form:1,nextLabel:'Отправить заявку',sub:'Номер увидит только юрист, который будет звонить.',render(pb,st){contactsForm(pb,st)},validate:validateContacts}];
const dd=st=>D.find(x=>x.id===st.dir);
Wizard($('#booking'),{steps,who:'юрист «КемеровоЮрСервис»',tel:'+79045762787',
 summary:st=>[['Направление',dd(st).label],['Срочность',st.urg],['Консультация',st.fmt],['Когда удобно',st.dayL+', '+st.part],['Профиль',dd(st).l.length?LAW[dd(st).l[0]].split(',')[0]+' (уточняется)':'подберёт руководитель'],['Телефон',st.tel]],
 message:st=>'КемеровоЮрСервис · заявка (ДЕМО, не отправлено)\n'+(st.urg.startsWith('Есть')||st.urg.startsWith('Срочно')?'⚑ СРОЧНО: '+st.urg+'\n':'')+'Направление: '+dd(st).label+(st.who==='b'?' (бизнес)':'')+'\nСитуация: '+st.sit.trim()+'\nКонсультация: '+st.fmt+', '+st.dayL+', '+st.part+'\nПо профилю: '+(dd(st).l.map(k=>LAW[k].split(',')[0]).join(', ')||'—')+'\nИмя: '+st.name+'\nТелефон: '+st.tel});
})();
