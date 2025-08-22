import './config.js';
import {loadTrip} from './data.js';
import {getStateFromURL, applyState, onPopState} from './router.js';
import {loadState} from './state.js';
import {showToast, qs} from './ui.js';

async function boot(){
  registerSW();
  const urlState = getStateFromURL();
  applyState(urlState);
  onPopState(()=>applyState(getStateFromURL()));
  try {
    const trip = await loadTrip();
    console.log('Trip loaded', trip.tripName);
  } catch(e){
    showToast('Failed to load itinerary');
  }
  const state = loadState();
  console.log('Loaded state', state);
}

function registerSW(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/scripts/sw.js');
    navigator.serviceWorker.addEventListener('message', e=>{
      if(e.data && e.data.type === 'SW_UPDATE_READY'){
        const btn = document.createElement('button');
        btn.textContent='Reload';
        btn.addEventListener('click', ()=>{
          navigator.serviceWorker.getRegistration().then(reg=>{
            reg.waiting.postMessage({type:'SKIP_WAITING'});
          });
        });
        showToast('New version available');
        qs('#toasts').appendChild(btn);
      }
    });
  }
}

boot();
