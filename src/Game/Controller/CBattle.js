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
    
    start() {
        if(this.game.model.save.player.curHealth <= 0) {
            restart.bind(this)();
        }
    }

    /**
     * 
     * @param {number} frameTime 
     */
    update(frameTime) {
        const save = this.game.model.save;
        const data = this.game.model.data;

        const nearestEnemy = save.battle.enemies[0];

        let move = true;

        for(let item of save.items.equipment) {
            item.attackTimer += frameTime / 1000;
        }

        if(nearestEnemy) {
            if(isEnemyInRange.bind(this)(nearestEnemy)) {
                move = false;
                save.battle.distance = nearestEnemy.y - data.battle.attackRange;

                for(let item of save.items.equipment) {
                    if(item.attack <= 0) continue;
        
                    item.attackTimer += frameTime / 1000;
                    if(item.attackTimer >= 1 / item.attackSpeed) {
                        item.attackTimer -= 1 / item.attackSpeed;
        
                        let enemies = save.battle.enemies.slice(0, item.attackRange);
                        for(let enemy of enemies)
                            enemy.healthCur -= item.attack;
                        this.game.view.vBattle.onEnemiesDamaged(enemies);
                        for(let enemy of enemies) {
                            if(enemy.healthCur <= 0) {
                                save.battle.enemies.splice(0, 1);
                                addItem.bind(this)();
                                this.game.view.vBattle.onEnemiesRemoved([enemy]);
                            }
                        }

                        if(!areAnyEnemiesInRange.bind(this)())
                            break;
                    }
                }

                if(!areAnyEnemiesInRange.bind(this)())
                    move = true;
            }
        }

        for(let item of save.items.equipment) {
            if(item.attackTimer >= 1 / item.attackSpeed) {
                item.attackTimer = 1 / item.attackSpeed;
            }
        }

        for(let enemy of save.battle.enemies) {
            enemy.attackTimer += frameTime / 1000;
        }

        save.battle.enemies.some((enemy => {
            if(!isEnemyInRange.bind(this)(enemy))
                return true;

            if(enemy.attackTimer >= 1 / 1) {
                enemy.attackTimer -= 1 / 1;

                save.player.curHealth -= enemy.attack;
                this.game.view.vPlayer.onPlayerDamaged(enemy.attack);
                if(save.player.curHealth <= 0) {
                    restart.bind(this)();
                    return true;
                }
            }
        }));

        for(let enemy of save.battle.enemies) {
            if(enemy.attackTimer >= 1 / 1)
                enemy.attackTimer = 1 / 1;
        }

        if(move) {
            let prevPosInt = Math.floor(save.battle.distance);

            save.battle.velocity += data.battle.acceleration * (frameTime / 1000);
            save.battle.distance += save.battle.velocity * (frameTime / 1000);

            let newPosInt = Math.floor(save.battle.distance);

            if(newPosInt > prevPosInt) {
                addEnemy.bind(this)(newPosInt);
            }
        }
        else {
            save.battle.velocity = data.battle.startingVelocity;
        }
    }
}

/**
 * @this {CBattle}
 * TEMPORARY TODO
 */
function addItem() {
    const save = this.game.model.save;
    const data = this.game.model.data;

    let level = Math.ceil(save.battle.distance / 100);

    const item = new MItem();

    if(Utility.getRandomInt(0, 2) === 0) {
        item.type = MItem.Type.Armor;
        {
            let rng = Utility.getRandomInt(1, 1000);
            if(rng < 700) item.health = Utility.getRandomInt(1, 5) * level;
            else if(rng < 800) item.health = Utility.getRandomInt(6, 10) * level;
            else if(rng < 900) item.health = Utility.getRandomInt(11, 15) * level;
            else if(rng < 950) item.health = Utility.getRandomInt(16, 20) * level;
            else if(rng < 975) item.health = Utility.getRandomInt(21, 40) * level;
            else if(rng < 990) item.health = Utility.getRandomInt(41, 45) * level;
            else item.health = Utility.getRandomInt(46, 50) * level;
        }
    }
    else {
        item.type = MItem.Type.Weapon;
        {
            let rng = Utility.getRandomInt(1, 1000);
            if(rng < 700) item.attack = 1 * level;
            else if(rng < 800) item.attack = 2 * level;
            else if(rng < 900) item.attack = 3 * level;
            else if(rng < 950) item.attack = 4 * level;
            else if(rng < 975) item.attack = 5 * level;
            else if(rng < 990) item.attack = 6 * level;
            else item.attack = 7 * level;
        }
        {
            let rng = Utility.getRandomInt(1, 1000);
            if(rng < 900) item.attackRange = 1;
            else if(rng < 950) item.attackRange = 2;
            else if(rng < 975) item.attackRange = 3;
            else if(rng < 990) item.attackRange = 4;
            else if(rng < 995) item.attackRange = 5;
            else if(rng < 998) item.attackRange = 6;
            else item.attackRange = 7;
        }
        {
            let rng = Utility.getRandomInt(1, 1000);
            if(rng < 900) item.attackSpeed = 1;
            else if(rng < 950) item.attackSpeed = 1.5;
            else if(rng < 975) item.attackSpeed = 2;
            else if(rng < 990) item.attackSpeed = 2.5;
            else if(rng < 995) item.attackSpeed = 3;
            else if(rng < 998) item.attackSpeed = 0.5;
            else item.attackSpeed = 4;
        }
    }

    this.game.controller.cItems.addItems([item], 'backpack');
}

/**
 * @this {CBattle}
 * @param {number} pos
 * TEMPORARY TODO
 */
function addEnemy(pos) {
    const save = this.game.model.save;
    const data = this.game.model.data;

    let level = save.battle.distance / 100;

    let enemy = new MEnemy(Utility.getRandomInt(0, 10), pos + data.battle.spawnOffset, Math.ceil(level), Math.ceil(level * 20) + 1);
    
    save.battle.enemies.push(enemy);
    this.game.view.vBattle.onEnemiesAdded([enemy]);
}

/**
 * @this {CBattle}
 * @param {MEnemy} enemy
 * @returns {boolean}
 */
function isEnemyInRange(enemy) {
    const save = this.game.model.save;
    const data = this.game.model.data;

    return save.battle.distance + data.battle.attackRange >= enemy.y;
}

/**
 * @this {CBattle}
 * @returns {boolean}
 */
function areAnyEnemiesInRange() {
    const save = this.game.model.save;
    const data = this.game.model.data;

    let enemy = save.battle.enemies[0];
    if(enemy && isEnemyInRange.bind(this)(enemy)) {
        return true;
    }
    return false;
}

/**
 * @this {CBattle}
 */
function restart() {
    const save = this.game.model.save;
    const data = this.game.model.data;

    save.battle.distance = 0;
    save.battle.velocity = data.battle.startingVelocity;
    
    this.game.view.vBattle.onEnemiesRemoved(save.battle.enemies);
    save.battle.enemies.splice(0, save.battle.enemies.length);
    
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

    save.battle.enemies.splice(0, save.battle.enemies.length);
    save.battle.enemies.push(...enemies);
    this.game.view.vBattle.onEnemiesAdded([...enemies]);
}