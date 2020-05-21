import Model from './../Model.js';

import MTimer from './MTimer.js';

export default class MItem extends Model {
    /**
     * 
     * @param {MItem.Type=} type
     * @param {number=} health
     * @param {number=} attack
     * @param {number=} attackSpeed
     * @param {number=} attackRange
     */
    constructor(type, health, attack, attackSpeed, attackRange) {
        super('MItem.mjs');

        this.type = type ?? MItem.Type.Armor;
        this.health = health ?? 0;
        this.attack = attack ?? 0;
        this.attackSpeed = attackSpeed ?? 0;
        this.attackRange = attackRange ?? 0;
        this.attackTimer = 0;
    }

    /**
     * @returns {number}
     */
    getValue() {
        return this.health + (this.attack * this.attackSpeed * this.attackRange);
    }

    /**
     * @returns {object} json 
     */
    serialize() {
        return Object.assign(super.serialize(), {
            type: this.type,
            health: this.health,
            attack: this.attack,
            attackSpeed: this.attackSpeed,
            attackRange: this.attackRange,
        });
    }

    /**
     * @param {any} obj 
     */
    deserialize(obj) {
        this.type = obj.type;
        this.health = obj.health;
        this.attack = obj.attack;
        this.attackSpeed = obj.attackSpeed;
        this.attackRange = obj.attackRange;
    }
}

/**
 * @enum {0|1|2}
 */
MItem.Type = {
    None: /** @type {0} */(0),
    Weapon: /** @type {1} */(1),
    Armor: /** @type {2} */(2),
};