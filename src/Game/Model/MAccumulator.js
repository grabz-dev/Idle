import Model from './../Model.js';

import MTimer from './MTimer.js';

export default class objMAccumulator extends Model {
    /**
     * 
     * @param {string=} _path
     */
    constructor(_path) {
        super(_path ?? 'MAccumulator.js');
        this.tier = 1;
        this.ilvl = 1;
        this.value = 0;
    }

    getMaxStorage() {
        return Math.pow(10, this.tier - 1) * Math.pow(10, this.ilvl) * 10;
    }

    /**
     * 
     * @param {number} tier 
     * @param {number} ilvl 
     */
    getItemCost(tier, ilvl) {
        return Math.pow(10, this.tier - 1) * Math.pow(10, this.ilvl);
    }

    /**
     * 
     * @param {number} tier 
     * @param {number} ilvl 
     */
    getMaxBuy(tier, ilvl) {
        return Math.max(0, Math.min(10, this.value / this.getItemCost(tier, ilvl)));
    }

    /**
     * @returns {object} json 
     */
    serialize() {
        return Object.assign(super.serialize(), {
            tier: this.tier,
            ilvl: this.ilvl,
            value: this.value
        });
    }

    /**
     * @param {any} obj 
     */
    deserialize(obj) {
        this.tier = obj.tier;
        this.ilvl = obj.ilvl;
        this.value = obj.value;
    }
}