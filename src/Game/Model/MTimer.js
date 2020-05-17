import Model from './../Model.js';

export default class Timer extends Model {
    /**
     * 
     * @param {number} max - Time in seconds. 
     */
    constructor(max) {
        super('MTimer.js');

        this.max = max;
        this.timer = 0;
        this.done = false;

        this.reset();
    }

    /**
     * @returns {object} json 
     */
    serialize() {
        return Object.assign(super.serialize(), {
            max: this.max,
            timer: this.timer,
            done: this.done,
        });
    }

    /**
     * @param {object} obj 
     */
    deserialize(obj) {
        this.max = obj.max;
        this.timer = obj.timer;
        this.done = obj.done;
    }

    reset() {
        this.timer = 0;
        this.done = false;
    }

    /**
     * 
     * @param {number} frameTime - Time in milliseconds. 
     */
    update(frameTime) {
        if(this.timer === this.max)
            return;

        this.timer += frameTime / 1000;
        if(this.timer >= this.max) {
            this.timer = this.max;
            this.done = true;
        }
    }
} 
