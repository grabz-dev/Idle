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
        const data = this.game.model.data;
        const save = this.game.model.save;

        data.player.maxHealth = data.player.baseHealth;
        for(let item of save.items.equipment) {
            data.player.maxHealth += item.health;
        }
        if(save.player.curHealth > data.player.maxHealth)
            save.player.curHealth = data.player.maxHealth;

        this.game.view.vPlayer.onEquipmentChanged();
    }
}