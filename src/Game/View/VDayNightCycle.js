/** @typedef {import('./../EntryPoint.js').default} Game.EntryPoint */

import View from './../View.js';

import MColor from './../Model/MColor.js';
import MTimer from './../Model/MTimer.js';

/** @type {Map<number, {colors: MColor[], brightness: number}>} */
const TIME_COLORS = new Map();
TIME_COLORS.set(4.5, {colors: [MColor.HEXtoRGB('#0D0807'), MColor.HEXtoRGB('#0D0807')], brightness: 0.55});
TIME_COLORS.set(5.5, {colors: [MColor.HEXtoRGB('#855256'), MColor.HEXtoRGB('#FF6D50')], brightness: 0.8 });
TIME_COLORS.set(6,   {colors: [MColor.HEXtoRGB('#3B77B2'), MColor.HEXtoRGB('#82A9BB')], brightness: 0.95});
TIME_COLORS.set(15,  {colors: [MColor.HEXtoRGB('#3B77B2'), MColor.HEXtoRGB('#82A9BB')], brightness: 0.95});
TIME_COLORS.set(18,  {colors: [MColor.HEXtoRGB('#7595C0'), MColor.HEXtoRGB('#8C6E6E')], brightness: 0.85});
TIME_COLORS.set(20,  {colors: [MColor.HEXtoRGB('#4B65A8'), MColor.HEXtoRGB('#274371')], brightness: 0.75});
TIME_COLORS.set(22,  {colors: [MColor.HEXtoRGB('#001D54'), MColor.HEXtoRGB('#03224D')], brightness: 0.65});
TIME_COLORS.set(23,  {colors: [MColor.HEXtoRGB('#0D0807'), MColor.HEXtoRGB('#0D0807')], brightness: 0.55});

export default class VDayNightCycle extends View {
    /**
     * 
     * @param {Game.EntryPoint} game
     * @param {number} updateInterval
     * @param {{
           sky: HTMLElement,
           dim: HTMLElement,
           clock: HTMLElement
       }} elems
     */
    constructor(game, updateInterval, elems) {
        super(game, updateInterval);
        this.elems = elems;

        this.skyTimer = new MTimer(10);

        this.debugging = false;
        this.additionalTime = 0;

        this.resume();
    }
    
    /**
     * 
     * @param {number} updateInterval 
     */
    update(updateInterval) {
        const date = new Date();

        if(this.debugging) {
            date.setMinutes(date.getMinutes() + this.additionalTime);
            this.additionalTime += 30;
            refreshSkyColor.bind(this)(date);
            refreshClock.bind(this)(date);
        }
        else {
            this.skyTimer.update(updateInterval);
            if(this.skyTimer.done) {
                this.skyTimer.reset();
                refreshSkyColor.bind(this)(date);
            }
            refreshClock.bind(this)(date);
        }
    }

    resume() {
        const date = new Date();

        refreshSkyColor.bind(this)(date);
        refreshClock.bind(this)(date);
    }
}

/**
 * @this {VDayNightCycle}
 * @param {Date} date
 */
function refreshClock(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    this.elems.clock.textContent = `${hours}:${minutes < 10 ? `0${minutes}` : `${minutes}`}`;
}

/**
 * @this {VDayNightCycle}
 * @param {Date} date
 */
function refreshSkyColor(date) {
    let cur = date.getHours() + (date.getMinutes() / 60);
    let hours = Array.from(TIME_COLORS.keys());
    hours.sort((a, b) => a - b);

    let hourPrev = 0;
    let hourNext = 0;
    let hourAdd = 0; //0 or 24. 24 if hourNext < hourPrev

    for(let i = 0, l = hours.length; i < l; i++) {
        hourPrev = hours[i];

        if(hours[i + 1] == null)
            hourNext = hours[0];
        else
            hourNext = hours[i + 1];

        if(hourNext < hourPrev)
            hourAdd = 24;
        else
            hourAdd = 0;

        if(cur >= hourPrev && cur <= hourNext + hourAdd) {
            break;
        }
    }

    let colPrev = TIME_COLORS.get(hourPrev);
    let colNext = TIME_COLORS.get(hourNext);
    if(!colPrev || !colNext) return;

    /** @type {MColor[]} */
    let colNew = [];
    let brightness = 0;

    let at = 1 - ((hourNext + hourAdd - (cur < hourPrev ? cur+24 : cur)) / (hourNext + hourAdd - hourPrev));

    for(let i = 0, l = Math.max(colPrev.colors.length, colNext.colors.length); i < l; i++) {
        let col1 = colPrev.colors[i] || colPrev.colors[colPrev.colors.length - 1];
        let col2 = colNext.colors[i] || colNext.colors[colNext.colors.length - 1];

        let hsv1 = MColor.RGBtoHSV(col1);
        let hsv2 = MColor.RGBtoHSV(col2);

        let hsv3 = MColor.interpolateHSV(hsv1.h, hsv1.s, hsv1.v, hsv2.h, hsv2.s, hsv2.v, at);

        colNew.push(MColor.HSVtoRGB(hsv3.h, hsv3.s, hsv3.v));
        brightness = (colNext.brightness - colPrev.brightness) * at + colPrev.brightness;
    }

    this.elems.sky.style.backgroundImage = `linear-gradient(${colNew.map(v => `rgb(${v.r},${v.g},${v.b})`).join(', ')})`;
    this.elems.dim.style.backgroundColor = `rgba(0, 0, 0, ${1 - brightness})`;
}