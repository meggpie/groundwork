// Sequential practice: local state only; no Rise completion or persistence.
document.querySelectorAll('[data-knowledge-check]').forEach(root=>{
 const questions=JSON.parse(root.querySelector('[data-questions]').textContent);
 const form=root.querySelector('form'),field=root.querySelector('fieldset'),legend=root.querySelector('legend');
 const options=root.querySelector('.kc-options'),counter=root.querySelector('.kc-counter');
 const feedback=root.querySelector('.kc-feedback'),action=root.querySelector('.kc-action');
 let current=0,passed=false;
 function clearResults(){
  options.querySelectorAll('.kc-option').forEach(option=>{
   delete option.dataset.result;option.querySelector('.kc-result')?.remove();
  });
 }
 function resultIcon(correct){
  const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
  icon.setAttribute('viewBox','0 0 20 20');icon.setAttribute('aria-hidden','true');icon.classList.add('kc-result');
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d',correct?'M4 10 8 14 16 5':'M5 5 15 15 M15 5 5 15');
  path.setAttribute('fill','none');path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','2');
  path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');icon.append(path);return icon;
 }
 function show(focus=false){
  passed=false;field.disabled=false;feedback.replaceChildren();feedback.hidden=true;
  counter.textContent=`Question ${current+1} of ${questions.length}`;
  legend.textContent=questions[current].question;options.replaceChildren();
  questions[current].answers.forEach((answer,index)=>{
   const label=document.createElement('label');label.className='kc-option';
   const radio=document.createElement('input');radio.type='radio';radio.name='answer';radio.value=String(index);
   const text=document.createElement('span');text.textContent=answer.text;label.append(radio,text);options.append(label);
  });
  action.textContent='Check Answer';action.disabled=true;
  if(focus)legend.focus();
 }
 options.addEventListener('change',()=>{clearResults();action.disabled=false;feedback.hidden=true;feedback.replaceChildren()});
 form.addEventListener('submit',event=>{
  event.preventDefault();
  if(passed){
   if(current+1<questions.length){current++;show(true)}
   else{form.hidden=true;counter.hidden=true;const complete=root.querySelector('.kc-complete');complete.hidden=false;complete.querySelector('h2').focus()}
   return;
  }
  const selected=options.querySelector('input:checked');if(!selected)return;
  const answer=questions[current].answers[Number(selected.value)];passed=answer.correct;
  clearResults();
  const option=selected.closest('.kc-option');option.dataset.result=passed?'correct':'incorrect';option.append(resultIcon(passed));
  const title=document.createElement('strong');
  title.append(resultIcon(passed),document.createTextNode(passed?'Correct.':'Not quite. Try again.'));
  const message=document.createElement('p');message.textContent=answer.feedback;
  feedback.dataset.correct=String(passed);feedback.hidden=false;feedback.replaceChildren(title,message);
  if(passed){field.disabled=true;action.textContent=current+1<questions.length?'Next Question':'Finish';action.focus()}
 });
 show();
});
