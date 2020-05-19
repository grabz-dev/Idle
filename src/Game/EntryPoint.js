import Data from './Data.js';

import VBattle from './View/VBattle.js';
import VDayNightCycle from './View/VDayNightCycle.js';
import VItems from './View/VItems.js';
import VPlayer from './View/VPlayer.js';

import CBattle from './Controller/CBattle.js';
import CItems from './Controller/CItems.js';
import CPlayer from './Controller/CPlayer.js';

import TEnemy from './Template/TEnemy.js';
import TItem from './Template/TItem.js';

const template = {
    tEnemy: GetHTMLElementFromString(TEnemy),
    tItem: GetHTMLElementFromString(TItem)
};

export default class EntryPoint {
    constructor() {
        const elems = {
            dim: /** @type {HTMLElement} */(document.getElementById('dim')),
            wrap: /** @type {HTMLElement} */(document.getElementById('wrap')),
            enemies: /** @type {HTMLElement} */(document.getElementById('enemies')),
            backpack: /** @type {HTMLElement} */(document.getElementById('backpack')),
            pouch: /** @type {HTMLElement} */(document.getElementById('pouch')),
            equipment: /** @type {HTMLElement} */(document.getElementById('equipment')),
            stats: /** @type {HTMLElement} */(document.getElementById('stats')),
            itemHeld: /** @type {HTMLElement} */(document.getElementById('itemHeld')),
            clock: /** @type {HTMLElement} */(document.getElementById('clock')),
        };
        for(let entry of Object.entries(elems)) {
            if(entry[1] == null) throw new Error('DOM initialization error, ' + entry[0]);
        }

        this.model = new Data();
        this.view = {
            VDayNightCycle: new VDayNightCycle(this, 1000, {
                sky: elems.wrap,
                dim: elems.dim,
                clock: elems.clock
            }),
            vBattle: new VBattle(this, 0, {
                enemies: elems.enemies,
                stats: elems.stats
            }),
            vItems: new VItems(this, 0, {
                backpack: elems.backpack,
                pouch: elems.pouch,
                equipment: elems.equipment,
                itemHeld: elems.itemHeld
            }),
            vPlayer: new VPlayer(this, 0, {
                stats: elems.stats
            })
        };
        this.controller = {
            cBattle: new CBattle(this),
            cItems: new CItems(this),
            cPlayer: new CPlayer(this)
        };
        this.template = {
            tEnemy: () => /** @type {HTMLElement} */(template.tEnemy.cloneNode(true)),
            tItem: () => /** @type {HTMLElement} */(template.tItem.cloneNode(true))
        };

        document.addEventListener('mousemove', e => {
            this.model.data.mouse.x = e.x;
            this.model.data.mouse.y = e.y;
        });
    }
} 

/**
 * 
 * @param {string} str
 * @returns {HTMLElement} 
 */
function GetHTMLElementFromString(str) {
    const placeholder = document.createElement('div');
    placeholder.innerHTML = str;
    let elem = placeholder.children[0];
    if(!(elem instanceof HTMLElement))
        throw new Error('Template error, ' + elem);
    return elem;
}