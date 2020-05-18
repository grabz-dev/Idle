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
        const save = this.game.model.save;
        const data = this.game.model.data;

        if(!save.tutorial.givenStarterItems) {
            addStarterItems.bind(this)();
            save.tutorial.givenStarterItems = true;
        }

        for(let entry of Object.entries(save.items)) {
            let holderName = entry[0];
            let items = entry[1];

            for(let item of items) {
                for(let v of data.itemHolders) {
                    if(v === holderName) {
                        data.itemsToHolders.set(item, holderName);
                        break;
                    }
                }
            }
        }

        this.game.controller.cPlayer.calculateStats();
    }

    /**
     * 
     * @param {number} frameTime 
     */
    update(frameTime) {
        
    }

    /**
     * 
     * @param {MItem[]} items
     * @param {'backpack'|'pouch'|'equipment'} holderName 
     */
    addItems(items, holderName) {
        const data = this.game.model.data;
        const save = this.game.model.save;
        
        /** @type {MItem[]|undefined} */
        let holder = save.items[holderName];

        if(holder == null) {
            console.error('CItems.addItems bad holder', holderName);
            return;
        }

        if(holderName === 'backpack' && items.length + holder.length > data.items[holderName]) {
            holder.sort((a, b) => b.getValue() - a.getValue());
            let deleted = holder.splice(10, holder.length);
            this.game.view.vItems.onItemsRemoved(deleted, holderName);
        }

        for(let i = 0; i < items.length; i++) {
            let item = items[i];

            if(holder.length >= data.items[holderName]) {
                items.splice(i, items.length);
                break;
            }

            data.itemsToHolders.set(item, holderName);
            holder.push(item);
        }

        this.game.view.vItems.onItemsAdded([...items], holderName);
        if(holderName === 'equipment')
            this.game.controller.cPlayer.calculateStats();
    }

    /**
     * 
     * @param {MItem[]} items
     * @param {'backpack'|'pouch'|'equipment'} holderName 
     */
    removeItems(items, holderName) {
        const data = this.game.model.data;
        const save = this.game.model.save;
        
        /** @type {MItem[]|undefined} */
        let holder = save.items[holderName];

        if(holder == null) {
            console.error('CItems.removeItems bad holder', holderName);
            return;
        }

        for(let i = 0; i < items.length; i++) {
            let item = items[i];

            if(holder.length >= data.items[holderName]) {
                items.splice(i, items.length);
                break;
            }

            data.itemsToHolders.delete(item);
            holder.splice(holder.indexOf(item), 1);
        }

        this.game.view.vItems.onItemsRemoved([...items], holderName);
        if(holderName === 'equipment')
            this.game.controller.cPlayer.calculateStats();
    }
    
    /**
     * 
     * @param {MItem[]} items 
     * @param {'backpack'|'pouch'|'equipment'} holderName 
     */
    moveItems(items, holderName) {
        const data = this.game.model.data;
        const save = this.game.model.save;

        /** @type {MItem[]|undefined} */
        let holder = save.items[holderName];

        if(holder == null) {
            console.error('CItems.moveItems bad holder', holderName);
            return;
        }

        for(let i = 0; i < items.length; i++) {
            let item = items[i];
            
            let oldHolderName = data.itemsToHolders.get(item);
            if(oldHolderName == null || oldHolderName === holderName) {
                continue;
            }

            console.log(holder.length, data.items[holderName]);

            if(holder.length >= data.items[holderName]) {
                items.splice(i, items.length);
                break;
            }

            data.itemsToHolders.set(item, holderName);
            save.items[oldHolderName].splice(save.items[oldHolderName].indexOf(item), 1);
            holder.push(item);
        }
        
        this.game.view.vItems.onItemsMoved([...items], holderName);
        if(holderName === 'equipment')
            this.game.controller.cPlayer.calculateStats();
    }
}

/**
 * @this {CItems}
 */
function addStarterItems() {
    this.addItems([
        new MItem('body', 10, 0, 0, 0), 
        new MItem('feet', 7, 0, 0, 0),
        new MItem('hand', 0, 4, 1, 1)
    ], 'backpack');
}
