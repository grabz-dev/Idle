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
        this.game.view.vPlayer.onEquipmentChanged();
    }
}