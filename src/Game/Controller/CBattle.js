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
        let nearestEnemy = this.save.battle.enemies[0];
        if(nearestEnemy && this.save.battle.distance + 1 >= nearestEnemy.y) {
            move = false;
            this.save.battle.distance = nearestEnemy.y - 1;
        }

        for(let item of this.save.items.equipment) {
            if(item.attack <= 0)
                continue;

            if(item.attackTimer < 1 / item.attackSpeed) {
                item.attackTimer += frameTime / 1000;
            }
            
            let attacked = false;
            if(item.attackTimer >= 1 / item.attackSpeed) {
                let damageLeft = item.attack;

                let nearestEnemy = this.save.battle.enemies[0];
                if(!nearestEnemy || !isEnemyInRange.bind(this)(nearestEnemy, 1 + 1))
                    continue;

                for(let i = 0; i < this.save.battle.enemies.length; i++) {
                    let enemy = this.save.battle.enemies[i];
                    if(damageLeft <= 0)
                        break;
                    if(!isEnemyInRange.bind(this)(enemy, 9 + 1))
                        break;
                    
                    attacked = true;
                    let healthLeft = Utility.damageItems(enemy.items, item.tier, damageLeft, -1);
                    this.game.view.vBattle.onEvent('enemiesDamaged', [enemy]);

                    if(healthLeft <= 0) {
                        this.removeEnemies([enemy], true);
                        i--;
                    }

                    if(healthLeft < 0) {
                        damageLeft = healthLeft * -1;
                    }
                    else {
                        break;
                    }
                }
            }

            if(attacked)
                item.attackTimer -= 1 / item.attackSpeed;

            item.attackTimer = Math.min(item.attackTimer, 1 / item.attackSpeed);
        }

        for(let enemy of this.save.battle.enemies) {
            for(let item of enemy.items) {
                if(item.attack <= 0)
                    continue;
                item.attackTimer += frameTime / 1000;

                if(!isEnemyInRange.bind(this)(enemy, 1 + 1)) {
                    if(item.attackTimer >= 1 / item.attackSpeed) {
                        item.attackTimer = 1 / item.attackSpeed;
                    }
                    continue;
                }

                if(item.attackTimer >= 1 / item.attackSpeed) {
                    item.attackTimer -= 1 / item.attackSpeed;

                    let healthLeft = Utility.damageItems(this.save.items.equipment, item.tier, item.attack, 1);
                    
                    this.game.view.vPlayer.onPlayerDamaged(item.attack);
                    if(healthLeft <= 0) {
                        this.restart();
                        return true;
                    }
                }
            }
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
                this.game.controller.cWorldArbiter.step(newPosInt);
            }
        }
        else {
            this.save.battle.velocity = Math.max(this.save.battle.velocity * 0.9, this.data.battle.startingVelocity);
            //this.save.battle.velocity = this.data.battle.startingVelocity;
        }
    }
    restart() {
        this.save.battle.distance = 0;
        this.save.battle.velocity = this.data.battle.startingVelocity;
        
        this.removeAllEnemies();
        for(let item of this.save.items.equipment)
            item.reset();
        this.game.view.vPlayer.onPlayerResurrected();
    }

    /**
     * 
     * @param {MEnemy[]} enemies 
     */
    addEnemies(enemies) {
        this.save.battle.enemies.push(...enemies);
        this.game.view.vBattle.onEvent('enemiesAdded', enemies);
    }

    /**
     * 
     * @param {MEnemy[]} enemies
     * @param {boolean} death 
     */
    removeEnemies(enemies, death) {
        for(let enemy of enemies) {
            this.save.battle.enemies.splice(this.save.battle.enemies.indexOf(enemy), 1);
            if(death) this.game.controller.cWorldArbiter.enemyDefeated(enemy);
        }
        this.game.view.vBattle.onEvent('enemiesRemoved', enemies, death);
    }

    removeAllEnemies() {
        this.save.battle.enemies.splice(0, this.save.battle.enemies.length);
        this.game.view.vBattle.onEvent('enemiesRemovedAll');
    }
}

/**
 * @this {CBattle}
 * @param {MEnemy} enemy
 * @param {number} range
 * @returns {boolean}
 */
function isEnemyInRange(enemy, range) {
    return this.save.battle.distance + range > enemy.y;
}