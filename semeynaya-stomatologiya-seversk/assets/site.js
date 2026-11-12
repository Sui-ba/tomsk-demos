const $=s=>document.querySelector(s);const form=$('#request');let step=1;const data={};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.1});document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));
const extraLabel=form.dataset.extraLabel||'Детали';const extraRequired=form.dataset.extraRequired==='1';
const prices=JSON.parse(form.dataset.prices||'{}');
function estimate(){const s=$('#service').value,x=$('#extra').value;if(prices[s]&&prices[s][x])return prices[s][x];return ''}
function ticketText(){const d=$('#date').value;const est=estimate();return 'Услуга: '+($('#service').value||'—')+'\n'+extraLabel+': '+(($('#extra').value||'').trim()||'—')+'\nЖелаемое время: '+(d?d.split('-').reverse().join('.'):'—')+' · '+($('#time').value||'—')+'\nКонтакт: '+(($('#name').value||'').trim()||'—')+' · '+(($('#tel').value||'').trim()||'—')+(est?'\nОриентир по прайсу сайта: '+est+' (примерно)':'')+'\n'+form.dataset.footnote}
function live(){const el=$('#live');if(el)el.textContent=ticketText();const e=$('#estimate');if(e){const v=estimate();e.textContent=v?'Ориентир по прайсу с сайта: '+v+' — примерно, точную сумму назовёт мастер.':'';}}
function show(n){step=n;document.querySelectorAll('.pane').forEach(e=>e.hidden=Number(e.dataset.step)!==n);document.querySelectorAll('.progress i').forEach((e,i)=>e.classList.toggle('active',i<n));$('#step-info').textContent=n<4?'Шаг '+n+' из 3 · '+['Услуга','Время','Проверка'][n-1]:'Демонстрация завершена';if(n>1)form.scrollIntoView({behavior:reduce?'instant':'smooth',block:'center'});}
document.querySelectorAll('[data-pick]').forEach(b=>b.addEventListener('click',()=>{$('#service').value=b.dataset.pick;live();show(1);$('#booking').scrollIntoView({behavior:reduce?'instant':'smooth'})}));
const date=$('#date');const now=new Date();const localDate=new Date(now-now.getTimezoneOffset()*60000).toISOString().slice(0,10);date.min=localDate;
form.addEventListener('input',live);form.addEventListener('change',live);
form.addEventListener('submit',e=>{e.preventDefault();const pane=$('[data-step="'+step+'"]');const err=pane.querySelector('.error');err.textContent='';const inputs=[...pane.querySelectorAll('input,select')];let bad=inputs.find(i=>!i.checkValidity());
if(step===1&&extraRequired&&!$('#extra').value.trim())bad=$('#extra');
if(step===2){const digits=$('#tel').value.replace(/\D/g,'').length;if(!bad&&$('#date').value<localDate)bad=$('#date');if(!bad&&(digits<10||digits>11))bad=$('#tel');if(!bad&&!$('#name').value.trim())bad=$('#name');}
if(bad){err.textContent='Пожалуйста, заполните выделенное поле корректно.';bad.focus();return}
if(step===1){show(2)}else if(step===2){const t=ticketText();$('#review').textContent=t;$('#ticket').textContent=t;show(3)}else if(step===3){show(4)}});
document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>show(step-1)));$('#reset').addEventListener('click',()=>{HTMLFormElement.prototype.reset.call(form);live();show(1)});
const counters=document.querySelectorAll('[data-count]');const co=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;co.unobserve(e.target);const el=e.target,to=Number(el.dataset.count);if(reduce){el.textContent=to;return}let v=0;const t=setInterval(()=>{v++;el.textContent=v;if(v>=to)clearInterval(t)},120)}),{threshold:.5});counters.forEach(c=>co.observe(c));
live();show(1);
