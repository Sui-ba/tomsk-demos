'use strict';
// Local concept only. No fetch, API, storage, payments or real reservations.
const state={step:0,zone:'a',pc:null,date:'',time:'19:00',mode:'package',package:'3',hours:3,name:'',phone:''};
const busy=new Set([2,5,7,10,14]);
const $=s=>document.querySelector(s), pad=n=>String(n).padStart(2,'0');
const zones={a:{name:'Общий зал',ids:[1,2,3,4,5,6,7,8]},b:{name:'Буткемп',ids:[9,10,11,12]},ps:{name:'PlayStation 5',ids:[13,14]}};
const ids=z=>zones[z].ids;
const label=n=>n>12?`PS5 #${n-12}`:`ПК ${pad(n)}`;
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Novosibirsk',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const money=n=>`${new Intl.NumberFormat('ru-RU').format(n)} ₽`;
function calculate(s){
 const isPS=s.zone==='ps',weekend=[0,6].includes(new Date(`${s.date}T12:00:00+07:00`).getUTCDay());
 const rate=isPS?(weekend?300:250):(s.zone==='b'?180:140);
 const night=s.mode==='package'&&s.package==='night'&&!isPS;
 const morning=s.mode==='package'&&s.package==='morning'&&!isPS;
 const hours=s.mode==='hours'?Number(s.hours):night?10:morning?1:Number(s.package);
 const packs=isPS?(weekend?{1:300,3:800}:{1:250,3:650}):(s.zone==='b'?{1:180,3:490,5:770,night:800,morning:100}:{1:140,3:390,5:600,night:650,morning:100});
 const minutes=Number(s.time.slice(0,2))*60+Number(s.time.slice(3,5));
 const morningEligible=!morning||(minutes>=540&&minutes+60<=900);
 const validHours=Number.isInteger(hours)&&hours>=1&&hours<=24;
 const price=!validHours||!morningEligible?undefined:s.mode==='hours'?rate*hours:packs[s.package];
 const start=new Date(`${s.date}T${s.time}:00+07:00`);
 const end=night||!validHours||!Number.isFinite(start.getTime())?null:new Date(start.getTime()+hours*3600000);
 const endText=end?new Intl.DateTimeFormat('ru-RU',{timeZone:'Asia/Novosibirsk',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(end):'уточняется';
 return {hours:validHours?hours:null,price,rate,weekend,night,morning,morningEligible,endText,costText:Number.isFinite(price)?`Ориентировочно ${money(price)}`:'Стоимость уточняется'};
}
window.demoCalculator=calculate;
const pcButton=n=>`<button type="button" class="pc ${n>12?'console-seat':''}" data-pc="${n}" aria-label="${label(n)}, ${busy.has(n)?'занят':'свободен'}" aria-pressed="${state.pc===n}" ${busy.has(n)?'disabled':''}><span>${label(n)}</span></button>`;
function renderMap(){
 for(const z of Object.keys(zones))$(`#pcs-${z}`).innerHTML=ids(z).map(pcButton).join('');
 $('#free-count').textContent=`${14-busy.size} СВОБОДНО / ДЕМО`;
 if(state.pc){$('#selected-title').textContent=`${label(state.pc)} — твой выбор`;$('#selected-detail').textContent=`${zones[state.zone].name} · Демо-статус. Теперь выбери пакет или свои часы.`;}
 else{$('#selected-title').innerHTML='Выбери<br>свободное место';$('#selected-detail').textContent='ПК или PlayStation? Нажми на подсвеченное место. Статусы демонстрационные.';}
}
function choose(n){state.pc=n;state.zone=n>12?'ps':n<=8?'a':'b';if(state.zone==='ps'&&!['1','3'].includes(state.package))state.package='3';renderMap();if(state.step===1)renderStep();}
function summaryHTML(){const c=calculate(state);return `<div class="estimate" aria-live="polite"><div><span>Ориентировочная стоимость</span><strong id="estimate-price">${c.costText}</strong></div><div><span>Длительность</span><strong id="estimate-duration">${c.hours===null?'Уточняется':c.hours+' ч'}</strong></div><div><span>Окончание · Северск, UTC+7</span><strong id="estimate-end">${c.endText}</strong></div><p>${c.night?'По прайсу: ночной пакет 10 часов в окне 22:00–10:00. Это 12-часовое окно, а не длительность. Точные правила старта, окончания и доступность уточняются у администратора.':c.morning?`Утренняя акция: 09:00–15:00, 100 ₽ за 1 час. ${c.morningEligible?'':'Выбранный час вне этого окна — стоимость уточняется. '}Срок акции, доступность и зона применения уточняются.`:state.mode==='hours'?`Расчёт: ${c.hours} × ${money(c.rate)}/ч. Пакетные скидки автоматически не применяются.`:'Цена выбранного пакета из опубликованного прайса.'}${state.zone==='ps'?` PS5: ${c.weekend?'выходной':'будний'} день по календарю. Праздничные дни и правила клуба уточняются; без доплат за людей/геймпады.`:''}</p><small>По прайсу от 23.07.2026, уточняется. Это ориентир, не оплата и не подтверждение свободного места.</small></div>`;}
function updateEstimate(){remember();$('#estimate-holder').innerHTML=summaryHTML();}
function renderStep(){
 if(!state.date)state.date=today();
 document.querySelectorAll('.steps li').forEach((el,i)=>{el.classList.toggle('active',i===state.step);if(i===state.step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
 $('#back').disabled=state.step===0;$('#step-count').textContent=`${state.step+1} / 4`;$('#next').textContent=state.step===3?'Завершить демо ↗':'Дальше →';
 let content='';
 if(state.step===0)content=`<h3 tabindex="-1">Сначала — зона</h3><p>ПК на схеме условные. Две PlayStation — по информации Михаила; их расположение и все статусы демонстрационные.</p><div class="zone-choices">${Object.entries(zones).map(([z,v])=>`<button type="button" class="zone-option" data-book-zone="${z}" aria-pressed="${state.zone===z}"><strong>${v.name}</strong><small>${z==='ps'?'PS5 #1 · PS5 #2':'Демо · ПК '+(z==='a'?'01—08':'09—12')}</small></button>`).join('')}</div>`;
 if(state.step===1)content=`<h3 tabindex="-1">Выбери ${state.zone==='ps'?'PlayStation':'свободный ПК'}</h3><p>${zones[state.zone].name} · Демонстрационные статусы, не реальные свободные места.</p><div class="pc-grid booking-pcs">${ids(state.zone).map(pcButton).join('')}</div><p>${state.pc?'Выбран '+label(state.pc):'Нажми на свободное место, чтобы продолжить.'}</p>`;
 if(state.step===2){const ps=state.zone==='ps',c=calculate(state),options=ps?[['1',`1 час · ${money(c.rate)}`],['3',`3 часа · ${money(c.weekend?800:650)}`]]:[['1',`1 час · ${money(c.rate)}`],['3',`3 часа · ${money(state.zone==='b'?490:390)}`],['5',`5 часов · ${money(state.zone==='b'?770:600)}`],['night',`Ночной гринд · 10 ч · ${money(state.zone==='b'?800:650)}`],['morning','Утренняя акция · 1 ч · 100 ₽ (условия уточняются)']];
 content=`<h3 tabindex="-1">Тариф или своё время?</h3><p>${zones[state.zone].name} · ${label(state.pc)} · Все часы указаны по Северску (UTC+7).</p><div class="booking-modes"><button type="button" data-mode="package" aria-pressed="${state.mode==='package'}">Тариф / пакет клуба</button><button type="button" data-mode="hours" aria-pressed="${state.mode==='hours'}">Своё количество часов</button></div><div class="fields booking-datetime"><label>Дата<input name="date" type="date" min="${today()}" value="${state.date}" required></label><label>Время начала<input name="time" type="time" value="${state.time}" required></label></div>${state.mode==='package'?`<label class="package-label">Выбери тариф<select name="package">${options.map(([id,text])=>`<option value="${id}" ${state.package===id?'selected':''}>${text}</option>`).join('')}</select></label>`:`<label class="hours-label">Количество часов (1–24)<span class="hours-stepper"><button type="button" data-hours-step="-1" aria-label="На час меньше">−</button><input name="hours" type="number" min="1" max="24" step="1" value="${state.hours}" required><button type="button" data-hours-step="1" aria-label="На час больше">+</button></span></label>`}<div id="estimate-holder">${summaryHTML()}</div>`;}
 if(state.step===3)content=`<h3 tabindex="-1">Контакт для администратора</h3><p>Это тест формы. Не вводи настоящие данные — используй «Игрок» и +7 (000) 000-00-00. Данные только в памяти страницы.</p>${summaryHTML()}<div class="fields two"><label>Тестовое имя<input name="player" autocomplete="off" maxlength="40" placeholder="Игрок" required></label><label>Тестовый телефон<input name="phone" type="tel" autocomplete="off" inputmode="tel" maxlength="24" placeholder="+7 (000) 000-00-00" minlength="10" required></label></div>`;
 $('#step-content').innerHTML=content;
 if(state.step===3){$('[name=player]').value=state.name;$('[name=phone]').value=state.phone;}
 $('#next').disabled=state.step===1&&!state.pc;
}
function remember(){if(state.step===2){state.date=$('[name=date]').value;state.time=$('[name=time]').value;if($('[name=package]'))state.package=$('[name=package]').value;if($('[name=hours]'))state.hours=Number($('[name=hours]').value);}if(state.step===3){state.name=$('[name=player]').value;state.phone=$('[name=phone]').value;}}
function resetFlow(){state.step=0;$('#done').hidden=true;$('#booking-form').hidden=false;$('.steps').hidden=false;}
document.addEventListener('click',e=>{
 const pc=e.target.closest('[data-pc]');if(pc&&!pc.disabled)choose(Number(pc.dataset.pc));
 const zone=e.target.closest('[data-book-zone]');if(zone){state.zone=zone.dataset.bookZone;state.pc=null;if(state.zone==='ps'&&!['1','3'].includes(state.package))state.package='3';renderMap();renderStep();}
 const shortcut=e.target.closest('[data-zone]');if(shortcut){state.zone=shortcut.dataset.zone;state.pc=null;resetFlow();renderMap();renderStep();}
 const duration=e.target.closest('[data-duration]');if(duration){state.mode='package';state.package=duration.dataset.duration==='6'?'night':'3';resetFlow();renderStep();}
 const mode=e.target.closest('[data-mode]');if(mode){remember();state.mode=mode.dataset.mode;renderStep();}
 const step=e.target.closest('[data-hours-step]');if(step){const input=$('[name=hours]');input.value=Math.min(24,Math.max(1,Number(input.value)+Number(step.dataset.hoursStep)));updateEstimate();}
});
$('#booking-form').addEventListener('input',e=>{if(state.step===2){updateEstimate();}});
$('#booking-form').addEventListener('change',e=>{if(state.step===2){remember();if(e.target.name==='date'&&state.zone==='ps')renderStep();else updateEstimate();}});
$('#back').addEventListener('click',()=>{remember();if(state.step>0){state.step--;renderStep();$('#step-content h3').focus({preventScroll:true});}});
$('#booking-form').addEventListener('submit',e=>{e.preventDefault();remember();if(state.step<3){state.step++;renderStep();$('#step-content h3').focus({preventScroll:true});}else{
 const c=calculate(state);$('#booking-form').hidden=true;$('.steps').hidden=true;$('#done').hidden=false;
 $('#booking-summary').textContent=`Демо · ${zones[state.zone].name} · ${label(state.pc)} · ${state.date.split('-').reverse().join('.')} в ${state.time} · ${c.hours} ч. ${c.costText}. Окончание: ${c.endText} (Северск, UTC+7). По прайсу от 23.07.2026, уточняется.${c.night?' Правила старта, окончания и доступность ночного пакета уточняются.':''}`;
 state.name='';state.phone='';$('#step-content').innerHTML='';$('#done').focus({preventScroll:true});
}});
$('#restart').addEventListener('click',()=>{resetFlow();state.pc=null;renderMap();renderStep();});
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.06});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
setInterval(()=>{if(document.hidden||reduce.matches)return;const options=Object.values(zones).flatMap(z=>z.ids).filter(n=>n!==state.pc),n=options[Math.floor(Math.random()*options.length)];busy.has(n)?busy.delete(n):busy.add(n);renderMap();if(state.step===1&&!$('#booking-form').hidden)renderStep();},12000);
renderMap();renderStep();
