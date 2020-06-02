import EntryPoint from './../EntryPoint.js';
import EntryPointDOM from './EntryPointDOM.js';

import VAccumulator from './../View/VAccumulator.js';
import VBattle from './../View/VBattle.js';
import VDayNightCycle from './../View/VDayNightCycle.js';
import VItems from './../View/VItems.js';
import VPlayer from './../View/VPlayer.js';

export default class EntryPointView {
    /**
     * 
     * @param {EntryPoint} game
     * @param {EntryPointDOM} elems 
     */
    constructor(game, elems) {
        this.vAccumulator = new VAccumulator(game, 0, {
            accumulator: elems.all.accumulator,
            forge: elems.all.forge,
        });
        this.vBattle = new VBattle(game, 0, {
            enemies: elems.all.enemies,
            stats: elems.all.stats
        });
        this.VDayNightCycle = new VDayNightCycle(game, 1000, {
            sky: elems.all.wrap,
            dim: elems.all.dim,
            clock: elems.all.clock
        });
        this.vItems = new VItems(game, 0, {
            backpack: elems.all.backpack,
            pouch: elems.all.pouch,
            equipment: elems.all.equipment,
            itemHeld: elems.all.itemHeld
        });
        this.vPlayer = new VPlayer(game, 0, {
            stats: elems.all.stats
        });
    }
}