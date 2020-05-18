/** @typedef {import('./../EntryPoint.js').default} Game.EntryPoint */

import Controller from './../Controller.js';

import MEnemy from './../Model/MEnemy.js';

import Utility from './../../Utility/Utility.js';
import MItem from '../Model/MItem.js';

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
            save.battleTimer.reset();
            save.wave++;
            this.game.view.vBattle.onWaveChanged();
            generateNewEnemies.bind(this)();
        }

        for(let item of save.items.equipment) {
            if(item.attack <= 0) continue;

            item.attackTimer += frameTime / 1000;
            if(item.attackTimer >= 1 / item.attackSpeed) {
                item.attackTimer -= 1 / item.attackSpeed;

                let enemies = save.enemies.slice(0, item.attackRange);
                for(let enemy of enemies)
                    enemy.healthCur -= item.attack;
                this.game.view.vBattle.onEnemiesDamaged(enemies);
                for(let enemy of enemies) {
                    if(enemy.healthCur <= 0) {
                        save.enemies.splice(0, 1);
                        this.game.controller.cItems.addItems([new MItem('hand', 0, Utility.getRandomInt(1, 9), Utility.getRandomInt(1, 9), Utility.getRandomInt(1, 9))], 'backpack');
                        this.game.view.vBattle.onEnemiesRemoved([enemy]);
                    }
                }
            }
        }

        save.battleTimer.update(frameTime);
        if(save.battleTimer.done) {
            save.battleTimer.reset();

            for(let enemy of save.enemies) {
                save.player.curHealth -= enemy.attack;
                this.game.view.vPlayer.onPlayerDamaged(enemy.attack);

                if(save.player.curHealth <= 0) {
                    restart.bind(this)();
                    break;
                }
            }
        }
    }
}

/**
 * @this {CBattle}
 */
function restart() {
    const save = this.game.model.save;
    const data = this.game.model.data;

    save.wave = 0;
    this.game.view.vBattle.onWaveChanged();

    this.game.view.vBattle.onEnemiesRemoved(save.enemies);
    save.enemies.splice(0, save.enemies.length);
    
    save.player.curHealth = data.player.maxHealth;
    this.game.view.vPlayer.onPlayerResurrected();
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

        let enemy = new MEnemy(x, y, 1, 10);
        enemies.push(enemy);
    }
    enemies.sort((a, b) => b.y - a.y || a.x - b.x);

    save.enemies.splice(0, save.enemies.length);
    save.enemies.push(...enemies);
    this.game.view.vBattle.onEnemiesAdded([...enemies]);
}