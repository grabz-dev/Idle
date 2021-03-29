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
        this.value = 0;
    }

    getMaxStorage() {
        return Math.pow(10, this.tier - 1);
    }

    /**
     * 
     * @param {number} tier 
     */
    getItemCost(tier) {
        return Math.pow(10, tier - 1);
    }

    /**
     * 
     * @param {number} tier 
     */
    getMaxBuy(tier) {
        return Math.max(0, Math.min(10, this.value / this.getItemCost(tier)));
    }

    /**
     * @returns {object} json 
     */
    serialize() {
        return Object.assign(super.serialize(), {
            tier: this.tier,
            value: this.value
        });
    }

    /**
     * @param {any} obj 
     */
    deserialize(obj) {
        this.tier = obj.tier;
        this.value = obj.value;
    }
}