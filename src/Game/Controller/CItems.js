/** @typedef {import('./../EntryPoint.js').default} Game.EntryPoint */

import Controller from './../Controller.js';

import MItem from './../Model/MItem.js';

import Utility from './../../Utility/Utility.js';

export default class CItems extends Controller {
    /**
     * 
     * @param {Game.EntryPoint} game 
     */
    constructor(game) {
        super(game);
    }

    awake() {
        for(let holderName of this.data.itemHolders) {
            let holder = this.save.items[holderName];
            for(let item of holder) {
                this.data.itemsToHolders.set(item, holderName);
            }
            this.game.view.vItems.onEvent('itemsAdded', holder, holderName);
        }


        if(!this.save.tutorial.givenStarterItems) {
            addStarterItems.bind(this)();
            this.save.tutorial.givenStarterItems = true;
        }

        this.game.controller.cPlayer.calculateStats();
    }

    /**
     * 
     * @param {MItem[]} items
     * @param {'backpack'|'pouch'|'equipment'} holderName 
     */
    addItems(items, holderName) {
        /** @type {MItem[]|undefined} */
        let holder = this.save.items[holderName];

        if(holder == null) {
            console.error('CItems.addItems bad holder', holderName);
            return;
        }

        if(holderName === 'backpack' && items.length + holder.length > this.data.items[holderName]) {
            handleBackpackOverfill.bind(this)();
        }

        for(let i = 0; i < items.length; i++) {
            let item = items[i];

            if(holder.length >= this.data.items[holderName]) {
                items.splice(i, items.length);
                break;
            }

            item.attackTimer = 0;
            this.data.itemsToHolders.set(item, holderName);
            holder.push(item);
        }

        this.game.view.vItems.onEvent('itemsAdded', items, holderName);
        if(holderName === 'equipment')
            this.game.controller.cPlayer.calculateStats();
    }

    /**
     * 
     * @param {MItem[]} items
     * @param {'backpack'|'pouch'|'equipment'} holderName 
     */
    removeItems(items, holderName) {
        /** @type {MItem[]|undefined} */
        let holder = this.save.items[holderName];

        if(holder == null) {
            console.error('CItems.removeItems bad holder', holderName);
            return;
        }

        for(let i = 0; i < items.length; i++) {
            let item = items[i];

            if(holder.length >= this.data.items[holderName]) {
                items.splice(i, items.length);
                break;
            }

            this.data.itemsToHolders.delete(item);
            holder.splice(holder.indexOf(item), 1);
        }

        this.game.view.vItems.onEvent('itemsRemoved', items, holderName);
        if(holderName === 'equipment')
            this.game.controller.cPlayer.calculateStats();
    }
    
    /**
     * 
     * @param {MItem[]} items 
     * @param {'backpack'|'pouch'|'equipment'} holderName 
     */
    moveItems(items, holderName) {
        /** @type {MItem[]|undefined} */
        let holder = this.save.items[holderName];

        if(holder == null) {
            console.error('CItems.moveItems bad holder', holderName);
            return;
        }

        for(let i = 0; i < items.length; i++) {
            let item = items[i];
            
            let oldHolderName = this.data.itemsToHolders.get(item);
            if(oldHolderName == null || oldHolderName === holderName) {
                continue;
            }
            
            if(holder.length >= this.data.items[holderName]) {
                items.splice(i, items.length);
                break;
            }

            item.attackTimer = 0;
            this.data.itemsToHolders.set(item, holderName);
            this.save.items[oldHolderName].splice(this.save.items[oldHolderName].indexOf(item), 1);
            holder.push(item);
        }
        
        this.game.view.vItems.onEvent('itemsMoved', items, holderName);
        if(holderName === 'equipment')
            this.game.controller.cPlayer.calculateStats();
    }
}

/**
 * @this {CItems}
 */
function addStarterItems() {
    this.addItems([
        new MItem(MItem.Type.Armor, 5, 0, 0, 0), 
        new MItem(MItem.Type.Armor, 5, 0, 0, 0),
        new MItem(MItem.Type.Weapon, 0, 1, 1, 1)
    ], 'backpack');
}

/**
 * @this {CItems}
 */
function handleBackpackOverfill() {
    this.save.items.backpack.sort((a, b) => b.getValue() - a.getValue());

    /** @type {number[]} */
    var types = [];

    /** @type {MItem[]} */
    var newBackpack = [];

    /** @type {MItem[]} */
    var removed = [];

    for(let item of this.save.items.backpack) {
        if(types[item.type] == null)
            types[item.type] = 0;
    }

    const slotsPerType = Math.floor(this.data.items.backpack / 2 / types.length);
    
    for(let item of this.save.items.backpack) {
        types[item.type]++;

        if(types[item.type] < slotsPerType)
            newBackpack.push(item);
        else
            removed.push(item);
    }

    this.save.items.backpack.splice(0, this.save.items.backpack.length);
    this.save.items.backpack.push(...newBackpack);

    this.game.view.vItems.onEvent('itemsRemoved', removed, 'backpack');
    this.game.view.vItems.onEvent('backpackSorted');
}