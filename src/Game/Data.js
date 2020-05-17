/** @typedef {import('./Model/MEnemy').default} MEnemy */
/** @typedef {import('./Model/MItem').default} MItem */

import MTimer from './Model/MTimer.js';

export default class Data {
    constructor() {
        this.save = {
            version: 1,
            tutorial: {
                givenStarterItems: false
            },
            enemies: /** @type {MEnemy[]} */([]),
            items: {
                backpack: /** @type {MItem[]} */([]),
                pouch: /** @type {MItem[]} */([])
            },
            battleTimer: new MTimer(1)
        };

        this.data = {
            mouse: {
                x: 0,
                y: 0
            },
            items: /** @type {Map<MItem, string>} */(new Map())
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
