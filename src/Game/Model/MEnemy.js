/** @typedef {import('./MItem').default} MItem */

import Model from './../Model.js';

export default class MEnemy extends Model {
    /**
     * @param {number} x 
     * @param {number} y
     * @param {MItem[]} items
     * @param {string=} _path
     */
    constructor(x, y, items, _path) {
        super(_path ?? 'MEnemy.js');

        this.x = x ?? 0;
        this.y = y ?? 0;
        this.items = items ?? [];
    }

    /**
     * @returns {object} json 
     */
    serialize() {
        return Object.assign(super.serialize(), {
            x: this.x,
            y: this.y,
            items: this.items,
        });
    }

    /**
     * @param {any} obj 
     */
    deserialize(obj) {
        this.x = obj.x;
        this.y = obj.y;
        this.items = obj.items;
    }
}