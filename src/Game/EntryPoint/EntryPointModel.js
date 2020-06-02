/** @typedef {import('./../Model/MEnemy').default} MEnemy */
/** @typedef {import('./../Model/MItem').default} MItem */

import MAccumulator from './../Model/MAccumulator.js';

export default class EntryPointModel {
    constructor() {
        this.save = {
            version: 2,
            timeElapsed: 0,
            timestamp: 0,
            tutorial: {

            },
            battle: {
                enemies: /** @type {MEnemy[]} */([]),
                distance: 0, //in meters
                distanceBest: 0,
                velocity: 0,
                velocityBest: 0,
            },
            world: {
                initialized: false,
                level: 0,
            },
            items: {
                backpack: /** @type {MItem[]} */([]),
                pouch: /** @type {MItem[]} */([]),
                equipment: /** @type {MItem[]} */([])
            },
            accumulator: new MAccumulator()
        };

        this.data = {
            mouse: {
                x: 0,
                y: 0
            },
            battle: {
                acceleration: 1.0, //per second
                spawnOffset: 11,
                startingVelocity: 1.0,
            },
            itemHolders: /** @type {['backpack', 'pouch', 'equipment']} */(['backpack', 'pouch', 'equipment']),
            itemsToHolders: /** @type {Map<MItem, 'backpack'|'pouch'|'equipment'>} */(new Map()),
            items: {
                backpack: 40,
                pouch: 6,
                equipment: 6
            },
            player: {
                baseHealth: 10,
                maxHealth: 0
            }
        };

        this.save.battle.velocity = this.data.battle.startingVelocity;
        this.save.timestamp = Date.now();
    }

    saveGame() {
        this.save.timestamp = Date.now();
        localStorage.setItem('game', JSON.stringify(this.save));
    }

    async loadGame() {
        let json = localStorage.getItem('game');
        if(json == null) return;

        let save = JSON.parse(json);
        save = compat(save);
        
        /** @type {({parent: any, childName: string}[])[]} */
        var arr = [];
        crawl(0, arr, save);
        for(let depth = arr.length - 1; depth >= 0; depth--) {
            for(let obj of arr[depth]) {
                let mObj = obj.parent[obj.childName];
                let v = await import(`./../Model/${mObj._path}`);
                let m = new v.default();
                m.deserialize(mObj);
                obj.parent[obj.childName] = m;
            }
        }

        assign(this.save, save);
    }
}

/**
 * Make the save compatible with the current version.
 * @param {any} save
 * @returns {any}
 */
function compat(save) {
    if(save.version < 2)
        save = {};
    return save;
}

/**
 * 
 * @param {number} depth 
 * @param {({parent: any, childName: string}[])[]} arr 
 * @param {any} parent 
 * @param {string=} childName 
 */
function crawl(depth, arr, parent, childName) {
    if(arr[depth] == null)
        arr[depth] = [];

    let child = childName == null ? parent : parent[childName];

    if(typeof child._path !== 'undefined') {
        arr[depth].push({ parent: parent, childName: childName??'' });
    }

    let keys = Object.keys(child);
    for(let key of keys) {
        let property = child[key];

        if(typeof property === 'object')
            crawl(depth + 1, arr, child, key);
    }
}

/**
 * 
 * @param {any} target 
 * @param  {...any} sources
 */
function assign(target, ...sources) {
    for(let source of sources) {
        for(let [key, value] of Object.entries(source)) {
            if(typeof value === 'object' && typeof target[key] === 'object')
                assign(target[key], value);
            else
                target[key] = value;
        }
    }
}