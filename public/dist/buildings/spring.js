import { Building } from './building.js';
export class Spring extends Building {
    url = 'spring.png';
    gift() {
        return [
            {
                name: 'water',
                amount: 1,
            },
        ];
    }
}
