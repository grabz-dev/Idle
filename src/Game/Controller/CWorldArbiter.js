/** @typedef {import('./../EntryPoint.js').default} Game.EntryPoint */

import Controller from './../Controller.js';

import MEnemy from './../Model/MEnemy.js';
import MItem from '../Model/MItem.js';

import Utility from './../../Utility/Utility.js';

export default class CWorldArbiter extends Controller {
    /**
     * 
     * @param {Game.EntryPoint} game 
     */
    constructor(game) {
        super(game);
    }
    
    start() {
        this.newWorld();
    }

    /**
     * 
     * @param {number} frameTime 
     */
    update(frameTime) {
        
    }

    newWorld() {
        if(this.save.world.initialized)
            return;

        this.game.controller.cItems.removeAllItems();
        this.game.controller.cBattle.removeAllEnemies();

        this.save.world.level = 1;

        addStarterItems.bind(this)();
        this.save.world.initialized = true;
    }

    /**
     * 
     * @param {number} newY 
     */
    step(newY) {
        this.save.world.level = Math.max(1, Math.floor(newY / 100));

        let ilvl = Math.ceil(newY % 1000 / 100);
        this.save.accumulator.ilvl = Math.max(this.save.accumulator.ilvl, ilvl);

        let tier = Math.ceil(newY / 1000);
        this.save.accumulator.tier = Math.max(this.save.accumulator.tier, tier);

        /** @type {MEnemy[]} */
        let enemies = [];
        let arr = [0,1,2,3,4,5,6,7,8,9];

        for(let i = 0; i < tier; i++) {
            /** @type {MItem[]} */
            let items = [];
            items[0] = generateItem(MItem.Type.Weapon, ilvl, tier);
            items[1] = generateItem(MItem.Type.Armor, ilvl, tier);
            items[2] = generateItem(MItem.Type.Armor, ilvl, tier);

            let index = Utility.getRandomInt(0, arr.length);
            let enemy = new MEnemy(arr[index], newY + this.data.battle.spawnOffset, items);
            arr.splice(index, 1);
            enemies.push(enemy);
        }
        this.game.controller.cBattle.addEnemies(enemies);
    }

    /**
     * @param {MItem.Type} type
     * @param {number} tier 
     * @param {number} ilvl 
     * @param {number} amount 
     */
    forgeItems(type, tier, ilvl, amount) {
        this.save.accumulator.value -= this.save.accumulator.getItemCost(tier, ilvl) * amount;
        this.game.view.vAccumulator.onAccumulatorAdded();

        /** @type {MItem[]} */
        let items = [];
        for(let i = 0; i < amount; i++) {
            let item = generateItem(type, ilvl, tier);
            items.push(item);
        }
        this.game.controller.cItems.removeItems(this.save.items.backpack, 'backpack');
        this.game.controller.cItems.addItems(items, 'backpack');
        this.game.controller.cItems.sortItems('backpack');
    }

    /**
     * 
     * @param {MEnemy} enemy 
     */
    enemyDefeated(enemy) {
        if(enemy.items.length === 0) return;

        let value = 0;
        for(let item of enemy.items) {
            value += Math.pow(10, item.ilvl - 1);
        }

        this.save.accumulator.value += value;
        this.game.view.vAccumulator.onAccumulatorAdded();
    }
}

/**
 * @this {CWorldArbiter}
 */
function addStarterItems() {
    this.game.controller.cItems.addItems([
        new MItem(MItem.Type.Armor, 1, 1, 20, 0, 0, 0, 0), 
        new MItem(MItem.Type.Armor, 1, 1, 20, 0, 0, 0, 0),
        new MItem(MItem.Type.Weapon, 1, 1, 0, 2, 1, 0, 0)
    ], 'backpack');
}

/**
 * @param {MItem.Type} type
 * @param {number} ilvl 
 * @param {number} tier
 * @returns {MItem} 
 */
function generateItem(type, ilvl, tier) {
    switch(type) {
    case MItem.Type.None: {
        return new MItem(type, ilvl, tier, 0, 0, 0, 0, 0);
    }
    case MItem.Type.Weapon: {
        return new MItem(type, ilvl, tier,
            0,
            Math.ceil(ilvl * tier * roll(10, 0.9) * 5 + ilvl * tier),
            Math.ceil(5 + 45 * roll(10, 0.9)) / 10,
            0,//Math.ceil(10 * roll(10, 0.5)),
            0,//Math.ceil(10 * roll(10, 0.9))
        );
    }
    case MItem.Type.Armor: {
        return new MItem(type, ilvl, tier,
            Math.ceil(ilvl * tier * roll(10, 0.9) * 100 + ilvl * tier),
            0, 0, 0, 0
        );
    }
    }
}

/**
 * 
 * @param {number} degree 
 * @param {number} v1 
 * @returns {number} y
 */
function roll(degree, v1) {
    let x = Math.random();
    return (Math.pow(x, degree) * v1) + ((1 - v1) * x);
}