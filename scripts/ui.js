export const qs = (sel, ctx=document) => ctx.querySelector(sel);
export const qsa = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
export function showToast(msg){
  const t=document.createElement('div');
  t.className='toast';
  t.textContent=msg;
  qs('#toasts').appendChild(t);
  setTimeout(()=>t.remove(),3000);
}
