'use strict';
(() => {
 const config=JSON.parse(document.getElementById('site-data').textContent);
 const clinic=config.kind==='clinic';
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const motion=()=>reduced.matches?'instant':'smooth';
 const observed=document.querySelectorAll('.rv');
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');observer.unobserve(e.target);}}),{threshold:0.08});
  observed.forEach((e,i)=>{e.style.setProperty('--delay',(i<7?i%4*.07:0)+'s');observer.observe(e);});
 }else observed.forEach(e=>e.classList.add('in'));
 const state={service:'',location:'',doctor:'',date:'',period:''};
 let step=1;
 const root=document.querySelector('.booking-main');
 const panes=[...document.querySelectorAll('[data-step]')];
 const date=document.getElementById('request-date');
 // Date comparison uses the user's zone, independent of the browser's locale.
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Novosibirsk',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 date.min=today;
 const period=document.getElementById('period');
 function setSelection(group,value){
  document.querySelectorAll('[data-group="'+group+'"] .opt').forEach(el=>{
   const on=el.dataset.value===value;el.classList.toggle('selected',on);el.setAttribute('aria-pressed',String(on));
  });
 }
 function addOption(value,description){
  const b=document.createElement('button');b.type='button';b.className='opt';b.dataset.value=value;b.setAttribute('aria-pressed','false');
  const title=document.createElement('b');title.textContent=value;b.append(title);
  const small=document.createElement('small');small.textContent=description;b.append(small);return b;
 }
 function populateDoctors(){
  if(!clinic)return;
  const container=document.getElementById('doctor-options');container.replaceChildren();
  container.append(addOption('Помогите выбрать врача','Администратор подберёт специалиста нужного профиля'));
  config.doctors.filter(d=>d[2].includes(state.service)).forEach(d=>container.append(addOption(d[0],d[1]+' · расписание уточняется')));
  if(![...container.children].some(x=>x.dataset.value===state.doctor))state.doctor='';
  setSelection('doctor',state.doctor);
 }
 function priceText(){
  if(clinic)return 'Стоимость: уточняется после консультации';
  if(state.service==='Индивидуальное вождение')return 'На сайте: 900 ₽/час · актуальность уточняется';
  if(state.service==='Уроки парковки')return 'На сайте: 3 400 ₽ за 4 часа · актуальность уточняется';
  if(state.service==='Подготовка к пересдаче')return 'На сайте: 5 100 / 5 400 ₽ · единая цена и условия уточняются';
  return 'Стоимость и состав курса: уточняются';
 }
 function requestText(){
  let formatted=state.date?new Date(state.date+'T12:00:00').toLocaleDateString('ru-RU'):'';
  return (clinic?'Услуга: ':'Программа: ')+state.service+'\n'+(clinic?'Специалист: '+state.doctor:'Филиал: Томск, '+state.location)+'\n'+(clinic?'Желаемый приём: ':'Когда связаться: ')+formatted+', '+state.period.toLowerCase()+'\n'+priceText()+'\n'+(clinic?'Время приёма подтверждает администратор.':'Дату старта и расписание подтверждает школа.');
 }
 function show(n,scroll=true){
  step=n;panes.forEach(p=>{p.hidden=Number(p.dataset.step)!==n;p.querySelector('.error')?.replaceChildren();});
  document.getElementById('step-label').textContent=n===5?'Сценарий завершён':'Шаг '+n+' из 4';
  document.getElementById('progress-fill').style.width=Math.min(n,4)*25+'%';
  document.querySelectorAll('.route li').forEach((li,i)=>{li.classList.toggle('active',i+1===Math.min(n,4));if(i+1===Math.min(n,4))li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
  if(n===2)populateDoctors();
  if(n===4)document.getElementById('review').textContent=requestText();
  const pane=panes[n-1],heading=pane.querySelector('h3');heading.tabIndex=-1;
  if(scroll){root.scrollIntoView({behavior:motion(),block:'start'});heading.focus({preventScroll:true});}
 }
 function fail(msg){const error=panes[step-1].querySelector('.error');error.textContent=msg;}
 document.querySelector('.booking-shell').addEventListener('click',e=>{
  const option=e.target.closest('.opt');
  if(option){
   const group=option.closest('[data-group]').dataset.group;
   if(group==='service'&&state.service!==option.dataset.value){state.doctor='';}
   state[group]=option.dataset.value;setSelection(group,state[group]);
   panes[step-1].querySelector('.error')?.replaceChildren();
  }
  if(e.target.closest('[data-next]')){
   if(step===1&&!state.service)return fail('Выберите направление, чтобы продолжить.');
   if(step===2&&!(clinic?state.doctor:state.location))return fail(clinic?'Выберите специалиста или помощь с подбором.':'Выберите филиал.');
   if(step===3){
    if(!date.value||date.value<today||!date.validity.valid)return fail('Выберите сегодняшнюю или будущую дату.');
    if(!period.value)return fail('Выберите удобный период.');
    state.date=date.value;state.period=period.value;
   }
   show(step+1);
  }
  if(e.target.closest('[data-back]'))show(step-1);
 });
 const form=document.querySelector('form[data-step="4"]');
 const phone=form.elements.phone;
 phone.addEventListener('input',()=>{
  let d=phone.value.replace(/\D/g,'');if(d[0]==='8')d='7'+d.slice(1);if(d&&d[0]!=='7')d='7'+d;d=d.slice(0,11);
  phone.value=!d?'':'+7'+(d.length>1?' '+d.slice(1,4):'')+(d.length>4?' '+d.slice(4,7):'')+(d.length>7?'-'+d.slice(7,9):'')+(d.length>9?'-'+d.slice(9,11):'');
 });
 form.addEventListener('submit',e=>{
  e.preventDefault();
  const name=form.elements.name.value.trim();
  if(name.length<2){fail('Укажите тестовое имя — не менее двух символов.');form.elements.name.focus();return;}
  if(phone.value.replace(/\D/g,'').length!==11){fail('Укажите тестовый номер из 11 цифр.');phone.focus();return;}
  if(!form.elements.consent.checked){fail('Подтвердите, что используете только тестовые данные.');form.elements.consent.focus();return;}
  const text=config.name+' · ДЕМО, не отправлено\n'+requestText()+'\nИмя: '+name+'\nТелефон: '+phone.value;
  document.getElementById('ticket').textContent=requestText();
  document.getElementById('telegram-preview').textContent=text;
  show(5);
 });
 document.getElementById('restart').addEventListener('click',()=>{
  Object.keys(state).forEach(k=>state[k]='');form.reset();date.value='';period.value='';
  document.querySelectorAll('.opt').forEach(o=>{o.classList.remove('selected');o.setAttribute('aria-pressed','false');});
  document.getElementById('ticket').textContent='';document.getElementById('telegram-preview').textContent='';show(1);
 });
 document.querySelectorAll('[data-pick]').forEach(a=>a.addEventListener('click',()=>{
  if(state.service!==a.dataset.pick)state.doctor='';
  state.service=a.dataset.pick;setSelection('service',state.service);show(2,false);
 }));
 document.querySelectorAll('[data-doctor]').forEach(a=>a.addEventListener('click',()=>{
  state.service=a.dataset.service;state.doctor=a.dataset.doctor;setSelection('service',state.service);show(2,false);
 }));
 show(1,false);
})();
