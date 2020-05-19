/** @typedef {import('./EntryPoint.js').default} Game.EntryPoint */

class View {
    /**
     * 
     * @param {Game.EntryPoint} game
     * @param {number} updateInterval
     */
    constructor(game, updateInterval) {
        this.game = game;
        this.updateInterval = updateInterval;
        this.updateClock = updateInterval;
    }

    resume() {

    }
}

/** @type {null|((updateInterval: number) => void)} */
View.prototype.update = null;

/** @type {null|((e: MouseEvent) => void)} */
View.prototype.onClick = null;
/** @type {null|((e: MouseEvent) => void)} */
View.prototype.onMouseUp = null;
/** @type {null|((e: MouseEvent) => void)} */
View.prototype.onMouseDown = null;

export default View;