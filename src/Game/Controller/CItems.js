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
            for(let item of entry[1]) {
                data.items.set(item, entry[0]);
            }
        }
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
     * @param {string} holder 
     */
    addItems(items, holder) {
        const data = this.game.model.data;
        const save = this.game.model.save;

        if(save.items[holder] == null) {
            console.error('CItems.addItems bad holder', holder);
            return;
        }
        save.items[holder].push(...items);
        this.game.view.vItems.onItemsAdded([...items], holder);
    }
    
    /**
     * 
     * @param {MItem[]} items 
     * @param {string} newHolder 
     */
    moveItems(items, newHolder) {
        const data = this.game.model.data;
        const save = this.game.model.save;

        if(save.items[newHolder] == null) {
            console.error('CItems.moveItems bad holder', newHolder);
            return;
        }

        for(let item of items) {
            let oldHolder = data.items.get(item);
            if(oldHolder == null || oldHolder === newHolder) {
                
                continue;
            }
            
            data.items.set(item, newHolder);
            save.items[oldHolder].splice(save.items[oldHolder].indexOf(item), 1);
            save.items[newHolder].push(item);
        }
        
        this.game.view.vItems.onItemsMoved([...items], newHolder);
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
