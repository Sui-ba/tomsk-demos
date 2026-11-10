'use strict';
// Session-only demo: no API, storage, analytics or actual reservation.
const state={step:0,zone:'a',pc:null,date:'',time:'19:00',duration:'3',name:'',phone:''};
const busy=new Set([2,5,7,10]);
const $=s=>document.querySelector(s);
const ids=zone=>zone==='a'?[1,2,3,4,5,6,7,8]:[9,10,11,12];
const pad=n=>String(n).padStart(2,'0');
const pcButton=n=>`<button type="button" class="pc" data-pc="${n}" aria-label="ПК ${pad(n)}, ${busy.has(n)?'занят':'свободен'}" aria-pressed="${state.pc===n}" ${busy.has(n)?'disabled':''}><span>ПК ${pad(n)}</span></button>`;
function renderMap(){
 $('#pcs-a').innerHTML=ids('a').map(pcButton).join('');$('#pcs-b').innerHTML=ids('b').map(pcButton).join('');
 $('#free-count').textContent=`${12-busy.size} СВОБОДНО / ДЕМО`;
 if(state.pc){$('#selected-title').textContent=`ПК ${pad(state.pc)} — твой выбор`;$('#selected-detail').textContent=`Демо-зона ${state.zone.toUpperCase()} · Теперь выбери дату и время. Наличие в клубе уточняется.`;}
 else{$('#selected-title').innerHTML='Выбери<br>свободный ПК';$('#selected-detail').textContent='Нажми на подсвеченное место на схеме. Дальше выберешь время.';}
}
function choose(n){state.pc=n;state.zone=n<=8?'a':'b';renderMap();if(state.step===1)renderStep();}
function renderStep(){
 document.querySelectorAll('.steps li').forEach((el,i)=>{el.classList.toggle('active',i===state.step);if(i===state.step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
 $('#back').disabled=state.step===0;$('#step-count').textContent=`${state.step+1} / 4`;$('#next').textContent=state.step===3?'Завершить демо ↗':'Дальше →';
 let content='';
 if(state.step===0)content=`<h3 tabindex="-1">Сначала — зона</h3><p>Зоны — из прайса клуба. Количество и расположение ПК демонстрационные.</p><div class="zone-choices">${['a','b'].map(z=>`<button type="button" class="zone-option" data-book-zone="${z}" aria-pressed="${state.zone===z}"><strong>${z==='a'?'Общий зал':'Буткемп'}</strong><small>Демо · ПК ${z==='a'?'01—08':'09—12'}</small></button>`).join('')}</div>`;
 if(state.step===1)content=`<h3 tabindex="-1">Выбери свободный ПК</h3><p>Зона ${state.zone.toUpperCase()} · Демонстрационные статусы, не реальные места.</p><div class="pc-grid booking-pcs">${ids(state.zone).map(pcButton).join('')}</div><p>${state.pc?'Выбран ПК '+pad(state.pc):'Нажми на свободный ПК, чтобы продолжить.'}</p>`;
 if(state.step===2){const now=new Date(),today=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;if(!state.date)state.date=today;
 content=`<h3 tabindex="-1">Когда играем?</h3><p>ПК ${pad(state.pc)} · Стоимость и наличие на выбранное время уточняются.</p><div class="fields"><label>Дата<input name="date" type="date" min="${today}" value="${state.date}" required></label><label>Время начала<input name="time" type="time" value="${state.time}" required></label><label>Длительность<select name="duration">${[1,2,3,6].map(n=>`<option value="${n}" ${state.duration==n?'selected':''}>${n} ${n===1?'час':n<5?'часа':'часов'}</option>`).join('')}</select></label></div>`;}
 if(state.step===3)content=`<h3 tabindex="-1">Контакт для администратора</h3><p>Это тест формы. Не вводи настоящие данные — используй «Игрок» и +7 (000) 000-00-00. Данные остаются только в памяти страницы.</p><div class="fields two"><label>Тестовое имя<input name="player" autocomplete="off" maxlength="40" placeholder="Игрок" required></label><label>Тестовый телефон<input name="phone" type="tel" autocomplete="off" inputmode="tel" maxlength="24" placeholder="+7 (000) 000-00-00" minlength="10" required></label></div>`;
 $('#step-content').innerHTML=content;
 if(state.step===3){$('[name=player]').value=state.name;$('[name=phone]').value=state.phone;}
 $('#next').disabled=state.step===1&&!state.pc;
}
function remember(){if(state.step===2){state.date=$('[name=date]').value;state.time=$('[name=time]').value;state.duration=$('[name=duration]').value;}if(state.step===3){state.name=$('[name=player]').value;state.phone=$('[name=phone]').value;}}
document.addEventListener('click',e=>{
 const pc=e.target.closest('[data-pc]');if(pc&&!pc.disabled)choose(Number(pc.dataset.pc));
 const zone=e.target.closest('[data-book-zone]');if(zone){state.zone=zone.dataset.bookZone;state.pc=null;renderMap();renderStep();}
 const shortcut=e.target.closest('[data-zone]');if(shortcut){state.zone=shortcut.dataset.zone;state.pc=null;state.step=0;renderMap();renderStep();}
 const duration=e.target.closest('[data-duration]');if(duration){state.duration=duration.dataset.duration;state.step=0;renderStep();}
});
$('#back').addEventListener('click',()=>{remember();if(state.step>0){state.step--;renderStep();$('#step-content h3').focus({preventScroll:true});}});
$('#booking-form').addEventListener('submit',e=>{e.preventDefault();remember();if(state.step<3){state.step++;renderStep();$('#step-content h3').focus({preventScroll:true});}else{
 $('#booking-form').hidden=true;$('.steps').hidden=true;$('#done').hidden=false;
 $('#booking-summary').textContent=`Демо · Зона ${state.zone.toUpperCase()} · ПК ${pad(state.pc)} · ${state.date.split('-').reverse().join('.')} в ${state.time} · ${state.duration} ч. Цена уточняется.`;
 state.name='';state.phone='';$('#step-content').innerHTML='';$('#done').focus({preventScroll:true});
}});
$('#restart').addEventListener('click',()=>{state.step=0;state.pc=null;$('#done').hidden=true;$('#booking-form').hidden=false;$('.steps').hidden=false;renderMap();renderStep();});
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.06});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
setInterval(()=>{if(document.hidden||reduce.matches)return;const options=[1,2,3,4,5,6,7,8,9,10,11,12].filter(n=>n!==state.pc);const n=options[Math.floor(Math.random()*options.length)];busy.has(n)?busy.delete(n):busy.add(n);renderMap();if(state.step===1&&!$('#booking-form').hidden)renderStep();},12000);
renderMap();renderStep();
