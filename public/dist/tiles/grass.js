/// <reference path="../buildings/building.d.ts" />
import { NonWaterTile } from './nonWaterTile.js';
import { randomFromTo } from '../random.js';
import { BuildingFactory } from '../buildings/buildingFactory.js';
const buildingFactory = new BuildingFactory();
export class Grass extends NonWaterTile {
    building = null;
    constructor(column, row, tileNr, dom) {
        const randomBetween1and3 = randomFromTo(1, 3);
        super('grass', column, row, tileNr, dom);
        dom.classList.remove('dirt-1', 'dirt-2', 'dirt-3');
        dom.classList.add('grass-' + randomBetween1and3);
        this.addFlower();
    }
    addFlower() {
        const randomBetween1and10 = randomFromTo(1, 15);
        const style = getComputedStyle(this.dom).backgroundImage;
        if (randomBetween1and10 === 1) {
            this.dom.style.backgroundImage = 'url(/assets/imgs/tiles/flowers/flowers_low.png),' + style;
            this.recourses.push('flower');
        }
        if (randomBetween1and10 === 2) {
            this.dom.style.backgroundImage += 'url(/assets/imgs/tiles/flowers/flowers_dense.png),' + style;
            this.recourses.push('flower');
        }
        if (randomBetween1and10 === 3) {
            this.dom.style.backgroundImage += 'url(/assets/imgs/tiles/flowers/flowers_middle.png),' + style;
            this.recourses.push('flower');
        }
    }
    addTree() {
        const style = getComputedStyle(this.dom).backgroundImage;
        const randomBetween1and2 = randomFromTo(1, 3);
        this.dom.style.backgroundImage = `url(/assets/imgs/tiles/trees/tree${randomBetween1and2}.png),${style}`;
        this.isEmpty = false;
        this.recourses.push('tree');
    }
    removeTree() {
        this.dom.style.backgroundImage = '';
        this.isEmpty = true;
        this.recourses = this.recourses.filter(recourse => recourse !== 'tree');
    }
    addBuilding(name) {
        const style = getComputedStyle(this.dom).backgroundImage;
        this.building = buildingFactory.generate(name);
        this.dom.style.backgroundImage = `url(/assets/imgs/tiles/building/${this.building.url}),${style}`;
    }
    removeBuilding() {
        if (!this.building) {
            return;
        }
        const style = getComputedStyle(this.dom).backgroundImage;
        const styleWithoutBuilding = style.split(',').slice(1).join(',');
        this.dom.style.backgroundImage = styleWithoutBuilding;
        buildingFactory.remove(this.building);
        this.building = null;
    }
    getBuilding() {
        return this.building;
    }
}
