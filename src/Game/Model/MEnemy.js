import Model from './../Model.js';

export default class MEnemy extends Model {
    /**
     * @param {number} x 
     * @param {number} y
     * @param {number} attack
     * @param {number} health
     * @param {string=} _path
     */
    constructor(x, y, attack, health, _path) {
        super(_path ?? 'MEnemy.js');

        this.x = x ?? 0;
        this.y = y ?? 0;
        this.attack = attack ?? 0;
        this.healthCur = health ?? 0;
        this.healthMax = health ?? 0;
        this.attackTimer = 0;
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
            healthMax: this.healthMax,
            attackTimer: this.attackTimer,
        });
    }

    /**
     * @param {any} obj 
     */
    deserialize(obj) {
        this.x = obj.x;
        this.y = obj.y;
        this.attack = obj.attack;
        this.healthCur = obj.healthCur;
        this.healthMax = obj.healthMax;
        this.attackTimer = obj.attackTimer;
    }
}