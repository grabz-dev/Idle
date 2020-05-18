/** @typedef {import('./Model/MEnemy').default} MEnemy */
/** @typedef {import('./Model/MItem').default} MItem */

import MTimer from './Model/MTimer.js';

class Save {
    constructor() {
        
    }
}

export default class Data {
    constructor() {
        this.save = {
            version: 1,
            tutorial: {
                givenStarterItems: false
            },
            wave: 0,
            enemies: /** @type {MEnemy[]} */([]),
            items: {
                backpack: /** @type {MItem[]} */([]),
                pouch: /** @type {MItem[]} */([]),
                equipment: /** @type {MItem[]} */([])
            },
            player: {
                curHealth: 0
            },
            battleTimer: new MTimer(1)
        };

        this.data = {
            mouse: {
                x: 0,
                y: 0
            },
            itemHolders: /** @type {['backpack', 'pouch', 'equipment']} */(['backpack', 'pouch', 'equipment']),
            itemsToHolders: /** @type {Map<MItem, 'backpack'|'pouch'|'equipment'>} */(new Map()),
            items: {
                backpack: 20,
                pouch: 6,
                equipment: 3
            },
            player: {
                baseHealth: 10,
                maxHealth: 0
            }
        };
    }

    /**
     * Load save file from JSON.
     * @param {object} json 
     */
    load(json) {
        compat(json);
        Object.assign(this.save, json);
    }
}

/**
 * Make the save compatible with the current version.
 * @param {object} json
 * @returns {object} json
 */
function compat(json) {
    return json;
}
