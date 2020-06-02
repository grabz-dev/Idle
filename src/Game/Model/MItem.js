import Model from './../Model.js';

import MTimer from './MTimer.js';

export default class MItem extends Model {
    /**
     * 
     * @param {MItem.Type} type
     * @param {number} ilvl
     * @param {number} tier
     * @param {number} health
     * @param {number} attack
     * @param {number} attackSpeed
     * @param {number} attackRange
     * @param {number} attackAOE
     * @param {string=} _path
     */
    constructor(type, ilvl, tier, health, attack, attackSpeed, attackRange, attackAOE, _path) {
        super(_path ?? 'MItem.js');

        this.type = type ?? MItem.Type.Armor;
        this.ilvl = ilvl ?? 0;
        this.tier = tier ?? 0;
        this.healthMax = health ?? 0;
        this.healthCur = health ?? 0;
        this.attack = attack ?? 0;
        this.attackSpeed = attackSpeed ?? 0;
        this.attackRange = attackRange ?? 0;
        this.attackAOE = attackAOE ?? 0;
        this.attackTimer = 0;
    }

    reset() {
        this.attackTimer = 0;
        this.healthCur = this.healthMax;
    }

    /**
     * @returns {number}
     */
    getValue() {
        let value = this.healthMax;
        value += this.attack * this.attackSpeed;

        value *= Math.pow(10, this.tier - 1);

        return Math.sqrt(value);
    }

    /**
     * @returns {object} json 
     */
    serialize() {
        return Object.assign(super.serialize(), {
            type: this.type,
            ilvl: this.ilvl,
            tier: this.tier,
            healthMax: this.healthMax,
            healthCur: this.healthCur,
            attack: this.attack,
            attackSpeed: this.attackSpeed,
            attackRange: this.attackRange,
            attackAOE: this.attackAOE,
        });
    }

    /**
     * @param {any} obj 
     */
    deserialize(obj) {
        this.type = obj.type;
        this.ilvl = obj.ilvl;
        this.tier = obj.tier;
        this.healthMax = obj.healthMax;
        this.healthCur = obj.healthCur;
        this.attack = obj.attack;
        this.attackSpeed = obj.attackSpeed;
        this.attackRange = obj.attackRange;
        this.attackAOE = obj.attackAOE;
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