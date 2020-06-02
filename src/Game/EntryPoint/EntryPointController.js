import EntryPoint from './../EntryPoint.js';

import CBattle from './../Controller/CBattle.js';
import CWorldArbiter from './../Controller/CWorldArbiter.js';
import CItems from './../Controller/CItems.js';
import CPlayer from './../Controller/CPlayer.js';

export default class EntryPointController {
    /**
     * 
     * @param {EntryPoint} game
     */
    constructor(game) {
        this.cBattle = new CBattle(game);
        this.cWorldArbiter = new CWorldArbiter(game);
        this.cItems = new CItems(game);
        this.cPlayer = new CPlayer(game);
    }
}