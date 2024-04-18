import Dirt from './tiles/dirt.js';
import Grass from './tiles/grass.js';
import River from './tiles/river.js';
import Info from './info.js';
const info = new Info();
const dev = localStorage.getItem('dev') === 'true';
const playgroundDOM = document.querySelector('main');
export default class Playground {
    height;
    width;
    rounds = 0;
    grid = [[]];
    recourses;
    constructor(width = 10, height = 10, recourses) {
        this.recourses = recourses;
        this.height = height;
        this.width = width;
        playgroundDOM.style.setProperty('--playground-width', width + '');
    }
    generatePlaygroundOnDOM() {
        let columns = [];
        let row = [];
        for (let i = 0; i < this.height * this.width; i++) {
            const cell = document.createElement('div');
            const cellNr = i + '';
            const rowNr = Math.floor(i / this.width);
            const columnNr = i % this.width;
            cell.dataset.nr = cellNr;
            cell.textContent = dev ? cellNr : '';
            playgroundDOM.appendChild(cell);
            if (i !== 0 && i % this.width === 0) {
                columns.push(row);
                row = [];
                row.push(new Dirt(i, rowNr, columnNr, cell)); // first cell in row
            }
            else {
                row.push(new Dirt(i, rowNr, columnNr, cell));
            }
        }
        columns.push(row);
        this.grid = columns;
    }
    generatRandomGrass(percent) {
        const grassCount = Math.floor(this.height * this.width * (percent / 100));
        const allreadyPickedCells = [];
        while (allreadyPickedCells.length < grassCount) {
            const cellNr = Math.floor(Math.random() * this.height * this.width);
            const cell = document.querySelector(`[data-nr="${cellNr}"]`);
            if (!allreadyPickedCells.includes(cellNr)) {
                const row = Math.floor(cellNr / this.width);
                const column = cellNr % this.width;
                allreadyPickedCells.push(cellNr);
                if (this.grid[row] === undefined || this.grid[row]?.[column] === undefined) {
                    console.log(this.grid);
                    console.log(`no cell found for grass ${cellNr}, row: ${row}, column: ${column}`);
                }
                else {
                    this.grid[row][column] = new Grass(cellNr, row, column, cell);
                }
            }
        }
    }
    getRandomeCell() {
        return Math.floor(Math.random() * this.height * this.width);
    }
    generatRandomTrees(percent) {
        let treeCount = Math.floor(this.height * this.width * (percent / 100));
        while (treeCount !== 0) {
            const cellNr = this.getRandomeCell();
            const column = Math.floor(cellNr / this.width);
            const row = cellNr % this.width;
            const tile = this.grid[column]?.[row];
            if (!tile) {
                console.log(this.grid);
                console.log(`no cell found for tree ${cellNr}, row: ${row}, column: ${column}`);
                continue;
            }
            if (tile instanceof Grass && !tile.hasTree) {
                tile.addTree();
                treeCount--;
            }
        }
    }
    generateRandomStones(stones) {
        let stoneCount = Math.floor(this.height * this.width * (stones / 100));
        while (stoneCount !== 0) {
            const cellNr = this.getRandomeCell();
            const column = Math.floor(cellNr / this.width);
            const row = cellNr % this.width;
            const tile = this.grid[column]?.[row];
            if (!tile) {
                console.log(this.grid);
                console.log(`no cell found for stone ${cellNr}, row: ${row}, column: ${column}`);
                continue;
            }
            if (tile instanceof Grass && !tile.hasTree) {
                tile.addStone();
                stoneCount--;
            }
        }
    }
    generateRivers(rivers) {
        for (let i = 0; i < rivers; i++) {
            this.generateStartTile();
        }
    }
    getNextRiverTile(tile, tiles) {
        const direction = Math.floor(Math.random() * 4);
        const getPosition = Object.freeze({
            0: () => this.grid[tile.row - 1]?.[tile.column],
            1: () => this.grid[tile.row + 1]?.[tile.column],
            2: () => this.grid[tile.row]?.[tile.column - 1],
            3: () => this.grid[tile.row]?.[tile.column + 1],
        });
        const position = getPosition[direction]();
        if (!position) {
            return this.getNextRiverTile(tile, tiles);
        }
        const isAlreadyInTiles = tiles.find(t => t.cellNr === position.cellNr);
        if (isAlreadyInTiles || position instanceof River) {
            return this.getNextRiverTile(tile, tiles);
        }
        return position;
    }
    generateRiver(startTile) {
        const tiles = [startTile];
        const riverSize = Math.floor(this.height * this.width * 0.03);
        for (let i = 0; i < riverSize - 1; i++) {
            const lastTile = tiles[i];
            const nextTile = this.getNextRiverTile(lastTile, tiles);
            if (!nextTile) {
                return;
            }
            tiles.push(nextTile);
        }
        tiles.forEach((tile, i) => {
            let level = '';
            if (i === 0) {
                const next = tiles[i + 1];
                if (tile.column === next?.column && next?.row < tile.row) {
                    level = 'end_bottom';
                }
                if (tile.column === next?.column && next?.row > tile.row) {
                    level = 'end_top';
                }
                if (tile.row === next?.row && next?.column > tile.column) {
                    level = 'end_left';
                }
                if (tile.row === next?.row && next?.column < tile.column) {
                    level = 'end_right';
                }
            }
            if (i === tiles.length - 1) {
                const prev = tiles[i - 1];
                if (tile.column === prev?.column && prev?.row < tile.row) {
                    level = 'end_bottom';
                }
                if (tile.column === prev?.column && prev?.row > tile.row) {
                    level = 'end_top';
                }
                if (tile.row === prev?.row && prev?.column > tile.column) {
                    level = 'end_left';
                }
                if (tile.row === prev?.row && prev?.column < tile.column) {
                    level = 'end_right';
                }
            }
            if (i !== 0 && i !== tiles.length - 1) {
                const prev = tiles[i - 1];
                const next = tiles[i + 1];
                if (next?.row === prev?.row) {
                    level = 'horizontal';
                }
                if (next?.column === prev?.column) {
                    level = 'vertical';
                }
                if ((prev && prev?.column < tile.column) || (next && next?.column < tile.column)) {
                    if ((prev && prev?.row < tile.row) || (next && next?.row < tile.row)) {
                        level = 'top_left';
                    }
                    if ((prev && prev?.row > tile.row) || (next && next?.row > tile.row)) {
                        level = 'bottom_left';
                    }
                }
                if ((prev && prev?.column > tile.column) || (next && next?.column > tile.column)) {
                    if ((prev && prev?.row < tile.row) || (next && next?.row < tile.row)) {
                        level = 'top_right';
                    }
                    if ((prev && prev?.row > tile.row) || (next && next?.row > tile.row)) {
                        level = 'bottom_right';
                    }
                }
            }
            this.grid[tile.row][tile.column] = new River(tile.cellNr, tile.row, tile.column, tile.dom, level);
        });
    }
    generateStartTile() {
        const cellNr = this.getRandomeCell();
        const tile = this.getTile(cellNr);
        if ((tile instanceof Grass && tile.hasTree) || tile instanceof River) {
            return this.generateStartTile();
        }
        if (!tile) {
            return;
        }
        return this.generateRiver(tile);
    }
    getTile(cellNr) {
        const row = Math.floor(cellNr / this.width);
        const column = cellNr % this.width;
        const tile = this.grid[row]?.[column];
        return tile || null;
    }
    convertDirtnessToGrass(tile) {
        if (this.recourses.seeds === 0) {
            const text = 'Not enough seeds, need one seed to convert dirt to grass. Cut Trees';
            info.displayInfo(text);
            return;
        }
        this.recourses.seeds--;
        this.recourses.renderRecourses(++this.rounds);
        this.grid[tile.row][tile.column] = new Grass(tile.cellNr, tile.row, tile.column, tile.dom);
    }
    build(tile, activeBuilding, buildingMenu) {
        const areEnoughRecourses = activeBuilding.needs.every(need => this.recourses[need.name] >= need.amount);
        if (areEnoughRecourses) {
            tile.addBuilding(activeBuilding.name);
            this.recourses.subtract(activeBuilding.needs);
            this.recourses.add(activeBuilding.gifts);
            this.recourses.renderRecourses();
        }
        else {
            const text = `Not enough recourses, need ${activeBuilding.needs
                .map(need => ` ${need.amount} ${need.emoji}`)
                .join(', ')} to build a ${activeBuilding.name}.`;
            info.displayInfo(text);
            buildingMenu.makeBuildingSelectInactive();
        }
    }
    changeLandscape(tile) {
        const needPopulationToCollectStone = 6;
        if (tile.hasTree) {
            tile.removeTree();
            this.recourses.wood++;
            this.recourses.seeds++;
            return this.recourses.renderRecourses(++this.rounds);
        }
        if (tile.hasStone && this.recourses.population >= needPopulationToCollectStone) {
            tile.removeStone();
            this.recourses.stone++;
            return this.recourses.renderRecourses(++this.rounds);
        }
        if (tile.hasStone && this.recourses.population < needPopulationToCollectStone) {
            const text = `Not enough people, need ${needPopulationToCollectStone} people to collect a stone. Build tents & houses`;
            return info.displayInfo(text);
        }
    }
    clickOnGrass(tile, buildingMenu) {
        const activeBuilding = buildingMenu.getActiveBuilding();
        if (!tile.hasTree && !tile.hasStone && activeBuilding) {
            return this.build(tile, activeBuilding, buildingMenu);
        }
        else {
            return this.changeLandscape(tile);
        }
    }
    clickOnTile(cellNr, buildingMenu) {
        const tile = this.getTile(cellNr);
        const clickAction = Object.freeze({
            dirt: () => this.convertDirtnessToGrass(tile),
            grass: () => this.clickOnGrass(tile, buildingMenu),
        });
        const action = clickAction[tile.type];
        if (action) {
            return action();
        }
    }
    isAllDirtGone() {
        return this.grid.flat().every((tile) => tile.type !== 'dirt');
    }
    areAllTreesCutted() {
        return this.grid.flat().every((tile) => tile.type !== 'grass' || !tile.hasTree);
    }
    areAllStonesRemoved() {
        return this.grid.flat().every((tile) => tile.type !== 'grass' || !tile.hasStone);
    }
    click(callback) {
        playgroundDOM.addEventListener('click', function (event) {
            return callback(event);
        });
    }
}
