import assert from 'node:assert';
import {getStateFromURL, writeURL} from '../scripts/router.js';

// mock minimal DOM
global.window = {
  location: new URL('http://example.com/?view=map&date=2025-09-13'),
  history: {replaceState: (s,t,u)=>{global.window.location = new URL('http://example.com'+u);} },
  addEventListener: ()=>{}
};
global.history = global.window.history;

global.document = {querySelectorAll:()=>[],getElementById:()=>null};

const state = getStateFromURL();
assert.equal(state.view, 'map');
assert.equal(state.date, '2025-09-13');

writeURL({view:'timeline',date:'2025-09-14',city:'Paris'});
assert.equal(global.window.location.search, '?view=timeline&date=2025-09-14&city=Paris');

console.log('router tests passed');
