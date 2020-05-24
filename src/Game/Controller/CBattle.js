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
    
    awake() {
        this.game.view.vBattle.onEvent('enemiesAdded', this.save.battle.enemies);

        if(this.save.battle.velocity < this.data.battle.startingVelocity)
            this.save.battle.velocity = this.data.battle.startingVelocity;
    }

    /**
     * 
     * @param {number} frameTime 
     */
    update(frameTime) {
        let move = true;

        for(let item of this.save.items.equipment) {
            item.attackTimer += frameTime / 1000;
        }

        let nearestEnemy = this.save.battle.enemies[0];
        if(nearestEnemy && isEnemyInRangeOfAttack.bind(this)(nearestEnemy)) {
            for(let item of this.save.items.equipment) {
                if(item.attack <= 0) continue;
    
                item.attackTimer += frameTime / 1000;
                if(item.attackTimer >= 1 / item.attackSpeed) {
                    item.attackTimer -= 1 / item.attackSpeed;
    
                    let enemies = this.save.battle.enemies.slice(0, item.attackRange);
                    for(let i = 0; i < enemies.length; i++) {
                        let enemy = enemies[i];
                        if(!isEnemyInRangeOfAttack.bind(this)(enemy)) {
                            enemies.splice(i, enemies.length);
                            break;
                        }
                        enemy.healthCur -= item.attack;
                    }
                    this.game.view.vBattle.onEvent('enemiesDamaged', enemies);
                    for(let enemy of enemies) {
                        if(enemy.healthCur <= 0) {
                            this.save.battle.enemies.splice(0, 1);
                            addItem.bind(this)();
                            this.game.view.vBattle.onEvent('enemiesRemoved', [enemy]);
                        }
                    }

                    if(!areAnyEnemiesInRangeOfAttack.bind(this)())
                        break;
                }
            }
        }

        for(let item of this.save.items.equipment) {
            if(item.attackTimer >= 1 / item.attackSpeed) {
                item.attackTimer = 1 / item.attackSpeed;
            }
        }

        for(let enemy of this.save.battle.enemies) {
            enemy.attackTimer += frameTime / 1000;
        }

        nearestEnemy = this.save.battle.enemies[0];
        if(nearestEnemy && isEnemyInRangeOfReceive.bind(this)(nearestEnemy)) {
            console.log('receive');
            move = false;
            this.save.battle.distance = nearestEnemy.y - this.data.battle.receiveRange;

            this.save.battle.enemies.some((enemy => {
                if(!isEnemyInRangeOfReceive.bind(this)(enemy))
                    return true;
    
                if(enemy.attackTimer >= 1 / 1) {
                    enemy.attackTimer -= 1 / 1;
    
                    this.save.player.curHealth -= enemy.attack;
                    this.game.view.vPlayer.onPlayerDamaged(enemy.attack);
                    if(this.save.player.curHealth <= 0) {
                        this.restart();
                        return true;
                    }
                }
            }));
        }

        for(let enemy of this.save.battle.enemies) {
            if(enemy.attackTimer >= 1 / 1)
                enemy.attackTimer = 1 / 1;
        }

        if(move) {
            let prevPosInt = Math.floor(this.save.battle.distance);

            this.save.battle.velocity += this.data.battle.acceleration * (frameTime / 1000);
            this.save.battle.distance += this.save.battle.velocity * (frameTime / 1000);

            if(this.save.battle.distance > this.save.battle.distanceBest) {
                this.save.battle.distanceBest = this.save.battle.distance;
            }
            if(this.save.battle.velocity > this.save.battle.velocityBest) {
                this.save.battle.velocityBest = this.save.battle.velocity;
            }

            let newPosInt = Math.floor(this.save.battle.distance);

            if(newPosInt > prevPosInt) {
                addEnemies.bind(this)(newPosInt);
            }
        }
        else {
            this.save.battle.velocity = Math.max(this.save.battle.velocity / 2, this.data.battle.startingVelocity);
        }
    }
    restart() {
        this.save.battle.distance = 0;
        this.save.battle.velocity = this.data.battle.startingVelocity;
        
        this.game.view.vBattle.onEvent('enemiesRemoved', this.save.battle.enemies);
        this.save.battle.enemies.splice(0, this.save.battle.enemies.length);
        
        this.save.player.curHealth = this.data.player.maxHealth;
        this.game.view.vPlayer.onPlayerResurrected();
    }
}

/**
 * @this {CBattle}
 * TEMPORARY TODO
 */
function addItem() {
    let level = Math.ceil(this.save.battle.distance / 100);

    const item = {
        type: /** @type {0|1|2} */(0),
        health: 0,
        attack: 0,
        attackRange: 0,
        attackSpeed: 0
    };

    if(Utility.getRandomInt(0, 2) === 0) {
        item.type = MItem.Type.Armor;
        {
            let rng = Utility.getRandomInt(1, 1000);
            if(rng < 700) item.health = Utility.getRandomInt(1, 5) * level * Math.min(level, 10);
            else if(rng < 800) item.health = Utility.getRandomInt(6, 10) * level * Math.min(level, 10);
            else if(rng < 900) item.health = Utility.getRandomInt(11, 15) * level * Math.min(level, 10);
            else if(rng < 950) item.health = Utility.getRandomInt(16, 20) * level * Math.min(level, 10);
            else if(rng < 975) item.health = Utility.getRandomInt(21, 40) * level * Math.min(level, 10);
            else if(rng < 990) item.health = Utility.getRandomInt(41, 45) * level * Math.min(level, 10);
            else item.health = Utility.getRandomInt(46, 50) * level * Math.min(level, 10);
        }
    }
    else {
        item.type = MItem.Type.Weapon;
        {
            let rng = Utility.getRandomInt(1, 1000);
            if(rng < 700) item.attack = 1 * level * Math.min(level, 10);
            else if(rng < 800) item.attack = 2 * level * Math.min(level, 10);
            else if(rng < 900) item.attack = 3 * level * Math.min(level, 10);
            else if(rng < 950) item.attack = 4 * level * Math.min(level, 10);
            else if(rng < 975) item.attack = 5 * level * Math.min(level, 10);
            else if(rng < 990) item.attack = 6 * level * Math.min(level, 10);
            else item.attack = 7 * level * Math.min(level, 10);
        }
        {
            let rng = Utility.getRandomInt(1, 1000);
            if(rng < 900) item.attackRange = 1;
            else if(rng < 950) item.attackRange = 2;
            else if(rng < 975) item.attackRange = 3;
            else if(rng < 990) item.attackRange = 4;
            else if(rng < 994) item.attackRange = 5;
            else if(rng < 997) item.attackRange = 6;
            else item.attackRange = 7;
        }
        {
            let rng = Utility.getRandomInt(1, 1000);
            if(rng < 900) item.attackSpeed = Utility.getRandomInt(10, 15) / 10;
            else if(rng < 950) item.attackSpeed = Utility.getRandomInt(15, 20) / 10;
            else if(rng < 975) item.attackSpeed = Utility.getRandomInt(20, 25) / 10;
            else if(rng < 985) item.attackSpeed = Utility.getRandomInt(25, 30) / 10;
            else if(rng < 990) item.attackSpeed = Utility.getRandomInt(30, 35) / 10;
            else if(rng < 993) item.attackSpeed = Utility.getRandomInt(35, 40) / 10;
            else if(rng < 995) item.attackSpeed = Utility.getRandomInt(40, 70) / 10;
            else if(rng < 997) item.attackSpeed = Utility.getRandomInt(70, 100) / 10;
            else item.attackSpeed = Utility.getRandomInt(100, 200) / 10;
        }
    }

    this.game.controller.cItems.addItems([new MItem(item.type, item.health, item.attack, item.attackSpeed, item.attackRange)], 'backpack');
}

/**
 * @this {CBattle}
 * @param {number} pos
 * TEMPORARY TODO
 */
function addEnemies(pos) {
    let level = this.save.battle.distance / 100;
    /** @type {MEnemy[]} */
    let enemies = [];
    let arr = [0,1,2,3,4,5,6,7,8,9];
    let enemyCount = Utility.getRandomInt(1, 1 + Math.min(Math.ceil(level), arr.length - 1));
    for(let i = 0; i < enemyCount; i++) {
        let index = Utility.getRandomInt(0, arr.length);
        arr.splice(index, 1);
        let enemy = new MEnemy(arr[index], pos + this.data.battle.spawnOffset, Math.ceil(level), Math.ceil(level * 200) + 1);
    
        this.save.battle.enemies.push(enemy);
        enemies.push(enemy);
    }

    this.game.view.vBattle.onEvent('enemiesAdded', enemies);
}

/**
 * @this {CBattle}
 * @param {MEnemy} enemy
 * @returns {boolean}
 */
function isEnemyInRangeOfReceive(enemy) {
    return this.save.battle.distance + this.data.battle.receiveRange >= enemy.y;
}

/**
 * @this {CBattle}
 * @param {MEnemy} enemy
 * @returns {boolean}
 */
function isEnemyInRangeOfAttack(enemy) {
    return this.save.battle.distance + this.data.battle.attackRange >= enemy.y;
}

/**
 * @this {CBattle}
 * @returns {boolean}
 */
function areAnyEnemiesInRangeOfAttack() {
    let enemy = this.save.battle.enemies[0];
    if(enemy && isEnemyInRangeOfAttack.bind(this)(enemy)) {
        return true;
    }
    return false;
}