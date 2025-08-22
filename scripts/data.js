/**
 * @typedef {Object} Leg
 * @property {string} id
 * @property {"flight"|"train"|"car"|"rideshare"|"walk"} mode
 * @property {string=} number
 * @property {{dt:string, place:string, iata?:string, terminal?:string}} dep
 * @property {{dt:string, place:string, iata?:string, terminal?:string}} arr
 * @property {number=} durationMin
 * @property {string[]=} notes
 */
/**
 * @typedef {Object} Stay
 * @property {string} id
 * @property {string} city
 * @property {string} country
 * @property {string} name
 * @property {string} addr
 * @property {number} lat
 * @property {number} lon
 * @property {string} checkin
 * @property {string} checkout
 * @property {string=} tz
 */
/**
 * @typedef {Object} Activity
 * @property {string} id
 * @property {string} date
 * @property {string} title
 * @property {string=} time
 * @property {string=} note
 */
/**
 * @typedef {Object} Trip
 * @property {string} tripName
 * @property {Leg[]} legs
 * @property {Stay[]} stays
 * @property {Activity[]} bookedActivities
 */

export async function loadTrip() {
  const res = await fetch('/data/itinerary.json');
  const json = await res.json();
  validateTrip(json);
  return json;
}

/**
 * @param {Trip} trip
 */
export function validateTrip(trip) {
  if(!trip.tripName) throw new Error('tripName missing');
  for (const leg of trip.legs) {
    const dep = new Date(leg.dep.dt);
    const arr = new Date(leg.arr.dt);
    if(!(dep < arr)) throw new Error('leg '+leg.id+' dep>=arr');
  }
  for (const stay of trip.stays) {
    if(typeof stay.lat !== 'number' || typeof stay.lon !== 'number') {
      console.warn('Stay missing coordinates', stay.id);
    }
  }
}
