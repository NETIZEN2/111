/** Parse URL hash or query to state */
export function getStateFromURL(){
  const url = new URL(window.location.href);
  const params = url.searchParams.size ? url.searchParams : new URLSearchParams(url.hash.slice(1));
  return {
    view: params.get('view') || 'timeline',
    date: params.get('date') || '',
    city: params.get('city') || '',
    pin: params.get('pin') || '',
    sheet: params.get('sheet') || '',
    modal: params.get('modal') || ''
  };
}

/** Apply state then update URL */
export function applyState(next){
  // simple example: toggle views
  document.querySelectorAll('main > section').forEach(sec=>sec.hidden=true);
  const view = next.view || 'timeline';
  const el = document.getElementById('view-'+view);
  if(el) el.hidden=false;
  writeURL(next);
}

export const writeURL = (state)=>{
  const params = new URLSearchParams();
  if(state.view) params.set('view', state.view);
  if(state.date) params.set('date', state.date);
  if(state.city) params.set('city', state.city);
  if(state.sheet) params.set('sheet', state.sheet);
  if(state.pin) params.set('pin', state.pin);
  if(state.modal) params.set('modal', state.modal);
  history.replaceState({}, '', '?'+params.toString());
};

export function onPopState(handler){
  window.addEventListener('popstate', handler);
}
