import { Building } from './building.js';
export class Ranger extends Building {
    url = 'ranger.png';
    produceNeeds = {
        seeds: 1,
    };
    produce() {
        console.log('Producing Trees');
    }
}
