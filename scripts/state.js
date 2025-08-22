const KEY = 'tripdash-state-v1';

export function loadState(){
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){ return {}; }
}

export function saveState(state){
  localStorage.setItem(KEY, JSON.stringify(state));
}
