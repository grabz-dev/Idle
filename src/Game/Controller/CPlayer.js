/** @typedef {import('./../EntryPoint.js').default} Game.EntryPoint */

import Controller from './../Controller.js';

import Utility from './../../Utility/Utility.js';

export default class CPlayer extends Controller {
    /**
     * 
     * @param {Game.EntryPoint} game 
     */
    constructor(game) {
        super(game);
    }

    awake() {

    }

    calculateStats() {
        this.data.player.maxHealth = this.data.player.baseHealth;
        for(let item of this.save.items.equipment) {
            this.data.player.maxHealth += item.health;
        }
        if(this.save.player.curHealth > this.data.player.maxHealth)
            this.save.player.curHealth = this.data.player.maxHealth;

        this.game.view.vPlayer.onEquipmentChanged();
    }
}