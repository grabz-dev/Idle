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
            this.game.controller.cPlayer.calculateStats();
        }
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
            this.sortItems('backpack');
            handleBackpackOverfill.bind(this)();
        }

        for(let i = 0; i < items.length; i++) {
            let item = items[i];

            if(holder.length >= this.data.items[holderName]) {
                items.splice(i, items.length);
                break;
            }

            item.reset();
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
        items = [...items];

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
                continue;
            }

            item.reset();
            this.data.itemsToHolders.set(item, holderName);
            this.save.items[oldHolderName].splice(this.save.items[oldHolderName].indexOf(item), 1);
            holder.push(item);
        }
        
        this.game.view.vItems.onEvent('itemsMoved', items, holderName);
        this.game.controller.cPlayer.calculateStats();
    }

    /**
     * 
     * @param {MItem} item1
     * @param {'backpack'|'pouch'|'equipment'} holderName1
     * @param {MItem} item2
     * @param {'backpack'|'pouch'|'equipment'} holderName2
     */
    swapItems(item1, holderName1, item2, holderName2) {
        /** @type {MItem[]|undefined} */
        let holder1 = this.save.items[holderName1];
        if(holder1 == null) {
            console.error('CItems.swapItems bad holder 1', holderName1);
            return;
        }
        let holder2 = this.save.items[holderName2];
        if(holder2 == null) {
            console.error('CItems.swapItems bad holder 2', holderName2);
            return;
        }

        item1.reset();
        item2.reset();

        this.data.itemsToHolders.set(item1, holderName2);
        this.data.itemsToHolders.set(item2, holderName1);

        let index1 = holder1.indexOf(item1);
        let index2 = holder2.indexOf(item2);
        holder1[index1] = item2;
        holder2[index2] = item1;

        this.game.view.vItems.onEvent('itemsMoved', [item1], holderName2);
        this.game.view.vItems.onEvent('itemsMoved', [item2], holderName1);

        if(holderName1 === 'equipment' || holderName2 === 'equipment')
            this.game.controller.cPlayer.calculateStats();
    }

    removeAllItems() {
        for(let holderName of this.data.itemHolders) {
            this.removeItems(this.save.items[holderName], holderName);
        }
    }

    /**
     * 
     * @param {'backpack'|'pouch'|'equipment'} holderName
     */
    sortItems(holderName) {
        this.save.items[holderName].sort((a, b) => b.getValue() - a.getValue());
        this.game.view.vItems.onEvent('holderSorted', 'backpack');
    }
}

/**
 * @this {CItems}
 */
function handleBackpackOverfill() {
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
}