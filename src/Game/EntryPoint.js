import Data from './Data.js';

import VBattle from './View/VBattle.js';
import VDayNightCycle from './View/VDayNightCycle.js';
import VItems from './View/VItems.js';

import CBattle from './Controller/CBattle.js';
import CItems from './Controller/CItems.js';

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
            pouch: /** @type {HTMLElement} */(document.getElementById('pouch'))
        };
        for(let entry of Object.entries(elems)) {
            if(entry[1] == null) throw new Error('DOM initialization error, ' + name);
        }

        this.model = new Data();
        this.view = {
            VDayNightCycle: new VDayNightCycle(this, 10000, {
                sky: elems.wrap,
                dim: elems.dim
            }),
            vBattle: new VBattle(this, 0, {
                enemies: elems.enemies
            }),
            vItems: new VItems(this, 0, {
                backpack: elems.backpack,
                pouch: elems.pouch
            })
        };
        this.controller = {
            cBattle: new CBattle(this),
            cItems: new CItems(this)
        };
        this.template = {
            tEnemy: () => /** @type {HTMLElement} */(template.tEnemy.cloneNode(true)),
            tItem: () => /** @type {HTMLElement} */(template.tItem.cloneNode(true))
        };

        document.addEventListener('mousemove', e => {
            this.model.data.mouse.x = e.screenX;
            this.model.data.mouse.y = e.screenY;
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