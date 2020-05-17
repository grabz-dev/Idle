import Model from './../Model.js';

export default class MItem extends Model {
    /**
     * 
     * @param {"head"|"body"|"legs"|"feet"|"hand"} body
     * @param {number} health
     * @param {number} attack
     * @param {number} attackSpeed
     * @param {number} attackRange
     */
    constructor(body, health, attack, attackSpeed, attackRange) {
        super('MItem.mjs');

        this.body = body;
        this.health = health;
        this.attack = attack;
        this.attackSpeed = attackSpeed;
        this.attackRange = attackRange;
    }

    /**
     * @returns {object} json 
     */
    serialize() {
        return Object.assign(super.serialize(), {
            body: this.body,
            health: this.health,
            attack: this.attack,
            attackSpeed: this.attackSpeed,
            attackRange: this.attackRange,
        });
    }

    /**
     * @param {object} obj 
     */
    deserialize(obj) {
        this.body = obj.body;
        this.health = obj.health;
        this.attack = obj.attack;
        this.attackSpeed = obj.attackSpeed;
        this.attackRange = obj.attackRange;
    }
}