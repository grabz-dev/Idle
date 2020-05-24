/** @typedef {import('./EntryPoint.js').default} Game.EntryPoint */

class View {
    /**
     * 
     * @param {Game.EntryPoint} game
     * @param {number} updateInterval
     */
    constructor(game, updateInterval) {
        this.game = game;
        this.save = game.model.save;
        this.data = game.model.data;
        
        this.paused = false;
        this.updateInterval = updateInterval;
        this.updateClock = updateInterval;
    }

    resume() {

    }

    pause() {
        this.paused = true;
    }
    unpause() {
        this.paused = false;
        this.resume();
    }
}

/** @type {null|(() => void)} */
View.prototype.update = null;

/** @type {null|((e: MouseEvent) => void)} */
View.prototype.onClick = null;
/** @type {null|((e: MouseEvent) => void)} */
View.prototype.onMouseUp = null;
/** @type {null|((e: MouseEvent) => void)} */
View.prototype.onMouseDown = null;

export default View;