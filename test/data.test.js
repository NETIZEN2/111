import assert from 'node:assert';
import {validateTrip} from '../scripts/data.js';
import fs from 'node:fs';

const trip = JSON.parse(fs.readFileSync('data/itinerary.json','utf8'));
assert.doesNotThrow(()=>validateTrip(trip));
console.log('data validation passed');
