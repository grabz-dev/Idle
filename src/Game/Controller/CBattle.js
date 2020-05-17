/** @typedef {import('./../EntryPoint.js').default} Game.EntryPoint */

import Controller from './../Controller.js';

import MEnemy from './../Model/MEnemy.js';

import Utility from './../../Utility/Utility.js';

export default class CBattle extends Controller {
    /**
     * 
     * @param {Game.EntryPoint} game 
     */
    constructor(game) {
        super(game);
    }

    /**
     * 
     * @param {number} frameTime 
     */
    update(frameTime) {
        const save = this.game.model.save;
        if(save.enemies.length === 0) {
            generateNewEnemies.bind(this)();
        }

        save.battleTimer.update(frameTime);
        if(save.battleTimer.done) {
            save.battleTimer.reset();

            let enemy = save.enemies[0];
            enemy.healthCur -= 3;
            this.game.view.vBattle.onEnemiesDamaged([enemy]);

            if(enemy.healthCur <= 0) {
                save.enemies.splice(0, 1);
                this.game.view.vBattle.onEnemiesRemoved([enemy]);
            }
        }
    }
}

/**
 * @this {CBattle}
 */
function generateNewEnemies() {
    const save = this.game.model.save;

    let slots = [];
    for(let i = 0; i < 10; i++) {
        for(let j = 0; j < 10; j++) {
            slots.push(i);
            slots.push(j);
        }
    }


    let count = Utility.getRandomInt(1, 5);
    let enemies = [];
    for(let i = 0; i < count; i++) {
        let index = Utility.getRandomInt(0, slots.length / 2);
        let x = slots[index];
        let y = slots[index + 1];
        slots.splice(index, 2);

        let enemy = new MEnemy(x, y, 3, 10);
        enemies.push(enemy);
    }
    enemies.sort((a, b) => b.y - a.y || a.x - b.x);

    save.enemies.splice(0, save.enemies.length);
    save.enemies.push(...enemies);
    this.game.view.vBattle.onEnemiesAdded([...enemies]);
}