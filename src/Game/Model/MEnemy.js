import Model from './../Model.js';

export default class MEnemy extends Model {
    /**
     * @param {number} x 
     * @param {number} y
     * @param {number} attack
     * @param {number} health
     */
    constructor(x, y, attack, health) {
        super('MEnemy.mjs');

        this.x = x;
        this.y = y;
        this.attack = attack;
        this.healthCur = health;
        this.healthMax = health;
    }

    /**
     * @returns {object} json 
     */
    serialize() {
        return Object.assign(super.serialize(), {
            x: this.x,
            y: this.y,
            attack: this.attack,
            healthCur: this.healthCur,
            healthMax: this.healthMax
        });
    }

    /**
     * @param {object} obj 
     */
    deserialize(obj) {
        this.x = obj.x;
        this.y = obj.y;
        this.attack = obj.attack;
        this.healthCur = obj.healthCur;
        this.healthMax = obj.healthMax;
    }
}