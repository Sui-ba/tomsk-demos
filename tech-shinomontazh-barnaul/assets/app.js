'use strict';
(() => {
 const config=JSON.parse(document.getElementById('site-data').textContent);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const motion=()=>reduced.matches?'auto':'smooth';
 // Reveal on scroll
 const observed=document.querySelectorAll('.rv');
 if('IntersectionObserver' in window&&!reduced.matches){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.08,rootMargin:'0px 0px -30px 0px'});
  observed.forEach((e,i)=>{e.style.setProperty('--delay',(i<8?(i%4)*.07:0)+'s');io.observe(e);});
 }else observed.forEach(e=>e.classList.add('in'));
 // Local date/time in the company's time zone
 const tz=config.tz||'Asia/Barnaul';
 const fmt=(d,o)=>new Intl.DateTimeFormat('ru-RU',Object.assign({timeZone:tz},o)).format(d);
 const isoDay=d=>new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
 const nowHour=()=>Number(new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',hourCycle:'h23'}).format(new Date()));
 const todayIso=isoDay(new Date());
 const state={};
 const shell=document.querySelector('.booking-shell');
 const root=document.querySelector('.booking-main');
 const panes=[...document.querySelectorAll('[data-step]')];
 const total=panes.length-1; // last pane is the result
 const form=document.querySelector('form[data-step]');
 let step=1;
 function setSelection(group,value){
  document.querySelectorAll('[data-group="'+group+'"] .opt').forEach(el=>{const on=el.dataset.value===value;el.classList.toggle('selected',on);el.setAttribute('aria-pressed',String(on));});
 }
 function mkOpt(value,label,sub){
  const b=document.createElement('button');b.type='button';b.className='opt';b.dataset.value=value;b.setAttribute('aria-pressed','false');
  const t=document.createElement('b');t.textContent=label;b.append(t);
  if(sub){const s=document.createElement('small');s.textContent=sub;b.append(s);}
  return b;
 }
 // Day chips for the next N days
 document.querySelectorAll('[data-days]').forEach(box=>{
  const n=Number(box.dataset.days);const base=new Date();
  for(let i=0;i<n;i++){
   const d=new Date(base.getTime()+i*864e5);const iso=isoDay(d);
   const label=i===0?'Сегодня':i===1?'Завтра':fmt(d,{weekday:'short'});
   const b=mkOpt(iso,label+', '+fmt(d,{day:'numeric',month:'short'}).replace('.',''));b.dataset.human=fmt(d,{weekday:'long',day:'numeric',month:'long'});box.append(b);
  }
 });
 function refreshSlots(){
  const g=document.querySelector('[data-group="time"]');if(!g)return;
  const h=nowHour();const today=state.day===todayIso;
  g.querySelectorAll('.opt').forEach(o=>{const hour=parseInt(o.dataset.value,10);const off=today&&hour<=h;o.disabled=off;if(off&&state.time===o.dataset.value){state.time='';}});
  setSelection('time',state.time||'');
 }
 function visible(group){
  const cond=group.dataset.showIf;if(!cond)return true;
  const [key,vals]=cond.split(':');return vals.split('|').includes(state[key]||'');
 }
 function refreshConditional(){
  document.querySelectorAll('.group[data-show-if]').forEach(g=>{const v=visible(g);g.hidden=!v;if(!v)state[g.dataset.group]='';});
 }
 function optLabel(group,value){
  const o=document.querySelector('[data-group="'+group+'"] .opt[data-value="'+CSS.escape(value)+'"]');
  if(!o)return value;return o.dataset.human||o.querySelector('b').textContent;
 }
 function lines(){
  const out=[];
  panes.slice(0,total).forEach(p=>{
   p.querySelectorAll('.group[data-group], .field[data-label]').forEach(el=>{
    if(el.classList.contains('group')){
     if(el.hidden||!el.dataset.label)return;const v=state[el.dataset.group];if(v)out.push(el.dataset.label+': '+optLabel(el.dataset.group,v));
    }else{
     const inp=el.querySelector('input,select');if(inp&&inp.value.trim()&&inp.name!=='name'&&inp.name!=='phone')out.push(el.dataset.label+': '+inp.value.trim());
    }
   });
  });
  document.querySelectorAll('[data-summary-check]').forEach(c=>{if(c.checked)out.push(c.dataset.summaryCheck);});
  const pg=config.priceGroup&&document.querySelector('[data-group="'+config.priceGroup+'"] .opt[data-value="'+CSS.escape(state[config.priceGroup]||'')+'"]');
  out.push('Стоимость: '+(pg&&pg.dataset.price?pg.dataset.price:'уточняется'));
  if(config.note)out.push(config.note);
  return out.join('\n');
 }
 function show(n,scroll=true){
  step=n;
  panes.forEach(p=>{p.hidden=Number(p.dataset.step)!==n;const e=p.querySelector('.error');if(e)e.textContent='';});
  document.getElementById('step-label').textContent=n>total?'Готово':'Шаг '+n+' из '+total;
  document.getElementById('progress-fill').style.width=(Math.min(n,total+1)-1)/total*100+'%';
  document.querySelectorAll('.route li').forEach((li,i)=>{const s=i+1;li.classList.toggle('active',s===n);li.classList.toggle('done',s<n);if(s===n)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
  refreshConditional();refreshSlots();
  const rv=panes[n-1].querySelector('.review');if(rv)rv.textContent=lines();
  const h=panes[n-1].querySelector('h3');h.tabIndex=-1;
  if(scroll){root.scrollIntoView({behavior:motion(),block:'start'});h.focus({preventScroll:true});}
 }
 function fail(msg,el){const e=panes[step-1].querySelector('.error');e.textContent=msg;if(el)el.focus({preventScroll:false});}
 function validate(){
  const p=panes[step-1];
  for(const g of p.querySelectorAll('.group[data-req]')){if(!g.hidden&&!state[g.dataset.group]){fail(g.dataset.err||'Выберите вариант, чтобы продолжить.');return false;}}
  for(const f of p.querySelectorAll('.field[data-req] input')){if(!f.value.trim()){fail(f.closest('.field').dataset.err||'Заполните поле.',f);return false;}}
  return true;
 }
 shell.addEventListener('click',e=>{
  const o=e.target.closest('.opt');
  if(o&&!o.disabled&&o.closest('[data-group]')){
   const g=o.closest('[data-group]').dataset.group;state[g]=o.dataset.value;setSelection(g,state[g]);
   if(g==='day')refreshSlots();
   refreshConditional();
   const er=panes[step-1].querySelector('.error');if(er)er.textContent='';
  }
  if(e.target.closest('[data-next]')){if(validate())show(step+1);}
  if(e.target.closest('[data-back]'))show(step-1);
 });
 const phone=form.elements.phone;
 phone.addEventListener('input',()=>{
  let d=phone.value.replace(/\D/g,'');if(d[0]==='8')d='7'+d.slice(1);if(d&&d[0]!=='7')d='7'+d;d=d.slice(0,11);
  phone.value=!d?'':'+7'+(d.length>1?' '+d.slice(1,4):'')+(d.length>4?' '+d.slice(4,7):'')+(d.length>7?'-'+d.slice(7,9):'')+(d.length>9?'-'+d.slice(9,11):'');
 });
 form.addEventListener('submit',e=>{
  e.preventDefault();
  if(!validate())return;
  const name=form.elements.name.value.trim();
  if(name.length<2)return fail('Укажите тестовое имя — не менее двух символов.',form.elements.name);
  if(phone.value.replace(/\D/g,'').length!==11)return fail('Укажите тестовый номер из 11 цифр.',phone);
  if(form.elements.email&&form.elements.email.value&&!form.elements.email.validity.valid)return fail('Проверьте email или оставьте поле пустым.',form.elements.email);
  if(!form.elements.consent.checked)return fail('Подтвердите, что используете только тестовые данные.',form.elements.consent);
  const body=lines();
  document.getElementById('ticket').textContent=body+'\nИмя: '+name+'\nТелефон: '+phone.value;
  document.getElementById('telegram-preview').textContent='Новая заявка · ДЕМО, никуда не отправлено\n'+body+'\nИмя: '+name+'\nТелефон: '+phone.value;
  show(total+1);
 });
 document.getElementById('restart').addEventListener('click',()=>{
  Object.keys(state).forEach(k=>state[k]='');form.reset();
  document.querySelectorAll('.booking-shell .opt').forEach(o=>{o.classList.remove('selected');o.setAttribute('aria-pressed','false');});
  document.getElementById('ticket').textContent='';document.getElementById('telegram-preview').textContent='';show(1);
 });
 function stepOf(group){const g=document.querySelector('.booking-shell [data-group="'+group+'"]');return g?Number(g.closest('[data-step]').dataset.step):1;}
 document.querySelectorAll('[data-pick]').forEach(a=>a.addEventListener('click',()=>{
  const g=a.dataset.pickGroup;state[g]=a.dataset.pick;setSelection(g,state[g]);refreshConditional();
  const target=a.dataset.goto?Number(a.dataset.goto):Math.min(stepOf(g)+1,total);
  show(target,false);
  document.getElementById('booking').scrollIntoView({behavior:motion(),block:'start'});
 }));
 // Showcase picker (optional on page)
 const picker=document.querySelector('.picker');
 if(picker){
  const fs={};const out=document.getElementById('pick-result');
  const render=()=>{
   const parts=[...picker.querySelectorAll('[data-fgroup]')].map(g=>fs[g.dataset.fgroup]).filter(Boolean);
   out.style.opacity=0;
   setTimeout(()=>{out.textContent=parts.length?parts.join(' · '):'Выберите параметры';out.style.opacity=1;},reduced.matches?0:120);
   const btn=document.getElementById('pick-book');btn.dataset.pick=fs.radius||'';btn.disabled=!fs.radius;
  };
  picker.addEventListener('click',e=>{const o=e.target.closest('.opt');if(!o)return;const g=o.closest('[data-fgroup]').dataset.fgroup;fs[g]=fs[g]===o.dataset.value?'':o.dataset.value;
   o.closest('[data-fgroup]').querySelectorAll('.opt').forEach(x=>{const on=x.dataset.value===fs[g];x.classList.toggle('selected',on);x.setAttribute('aria-pressed',String(on));});render();});
  render();
 }
 // Course filter (optional on page)
 document.querySelectorAll('[data-course-filter]').forEach(b=>b.addEventListener('click',()=>{
  const cat=b.dataset.courseFilter;
  document.querySelectorAll('[data-course-filter]').forEach(x=>{const on=x===b;x.classList.toggle('selected',on);x.setAttribute('aria-pressed',String(on));});
  document.querySelectorAll('.course').forEach(c=>{c.hidden=!(cat==='all'||c.dataset.cat===cat);});
 }));
 show(1,false);
})();
