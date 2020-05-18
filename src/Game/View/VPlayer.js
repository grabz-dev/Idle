/** @typedef {import('./../EntryPoint.js').default} Game.EntryPoint */

import View from './../View.js';

import MItem from './../Model/MItem.js';
import TItem from './../Template/TItem.js';

export default class VPlayer extends View {
    /**
     * 
     * @param {Game.EntryPoint} game 
     * @param {number} updateInterval
     * @param {{
        stats: HTMLElement
    }} elems
     */
    constructor(game, updateInterval, elems) {
        super(game, updateInterval);
        this.elems = elems;
    }

    onEquipmentChanged() {
        const save = this.game.model.save;
        const data = this.game.model.data;

        const stats = this.elems.stats;

        updateStatElem(stats, '[data-id=curHealth]', save.player.curHealth+'');
        updateStatElem(stats, '[data-id=maxHealth]', data.player.maxHealth+'');
    }
    
    /**
     * 
     * @param {number} damage 
     */
    onPlayerDamaged(damage) {
        updateStatElem(this.elems.stats, '[data-id=curHealth]', this.game.model.save.player.curHealth+'');
    }
    
    onPlayerResurrected() {
        updateStatElem(this.elems.stats, '[data-id=curHealth]', this.game.model.save.player.curHealth+'');
    }
}

/**
 * 
 * @param {HTMLElement} elem
 * @param {string} query 
 * @param {string} value 
 */
function updateStatElem(elem, query, value) {
    let stat = elem.querySelector(query);
    if(stat) {
        stat.textContent = value;
    }
}