/** @typedef {import('./../EntryPoint.js').default} Game.EntryPoint */

import View from './../View.js';

import MEnemy from './../Model/MEnemy.js';

import Utility from './../../Utility/Utility.js';

export default class VBattle extends View {
    /**
     * 
     * @param {Game.EntryPoint} game 
     * @param {number} updateInterval
     * @param {{
        enemies: HTMLElement,
        stats: HTMLElement
    }} elems
     */
    constructor(game, updateInterval, elems) {
        super(game, updateInterval);
        this.elems = elems;

        /** @type {Map<MEnemy, HTMLElement>} */
        this.enemies = new Map();

        let restart = this.elems.stats.querySelector('[data-id=restart]');
        if(restart) {
            restart.addEventListener('click', () => this.game.controller.cBattle.restart());
        }
    }

    update() {
        updateStatElem(this.elems.stats, '[data-id=time]', Utility.getFormattedTime(this.save.timeElapsed));
        updateStatElem(this.elems.stats, '[data-id=distance]', prettifyDistance(this.save.battle.distance));
        updateStatElem(this.elems.stats, '[data-id=distanceBest]', prettifyDistance(this.save.battle.distanceBest));
        updateStatElem(this.elems.stats, '[data-id=velocity]', prettifyDistance(this.save.battle.velocity));

        const distance = this.save.battle.distance;
        for(let enemy of this.save.battle.enemies) {
            let elem = this.enemies.get(enemy);
            if(!elem) continue;

            elem.style.top = `${100 - (enemy.y - distance) * 10}%`;
        }


    }

    resume() {
        this.enemies.clear();
        this.elems.enemies.innerHTML = '';
        this.onEvent('enemiesAdded', this.save.battle.enemies);
    }

    /**
     * 
     * @param {'enemiesAdded'|'enemiesRemoved'|'enemiesDamaged'} event 
     * @param  {...any} params 
     */
    onEvent(event, ...params) {
        if(this.paused) return;

        switch(event) {
        case 'enemiesAdded': {
            /** @type {MEnemy[]} */
            let enemies = params[0];
            onEnemiesAdded.bind(this)(enemies);
            break;
        }
        case 'enemiesRemoved': {
            /** @type {MEnemy[]} */
            let enemies = params[0];
            onEnemiesRemoved.bind(this)(enemies);
            break;
        }
        case 'enemiesDamaged': {
            /** @type {MEnemy[]} */
            let enemies = params[0];
            onEnemiesDamaged.bind(this)(enemies);
            break;
        }
        }
    }
}

/**
 * @this {VBattle}
 * @param {MEnemy[]} enemies
 */
function onEnemiesAdded(enemies) {
    for(let enemy of enemies) {
        let elem = this.game.template.tEnemy();
        elem.style.top = '0%';
        elem.style.left = enemy.x * 10 + '%';
        this.enemies.set(enemy, elem);
        this.elems.enemies.appendChild(elem);
    }
}

/**
 * @this {VBattle}
 * @param {MEnemy[]} enemies
 */
function onEnemiesRemoved(enemies) {
    for(let enemy of enemies) {
        let elem = this.enemies.get(enemy);
        if(elem == null) {
            console.warn('Tried removing enemy that doesn\'t exist', enemy);
            continue;
        }
        
        this.enemies.delete(enemy);
        elem.remove();
    }
}

/**
 * @this {VBattle}
 * @param {MEnemy[]} enemies
 */
function onEnemiesDamaged(enemies) {
    for(let enemy of enemies) {
        let elem = this.enemies.get(enemy);
        if(elem == null) {
            console.warn('Tried damaging enemy that doesn\'t exist', enemy);
            continue;
        }
        let bar = elem.querySelector('.bar.inner');
        if(bar == null || !(bar instanceof HTMLElement)) {
            console.warn('No healthbar on enemy', enemy);
            continue;
        }
        bar.style.transform = `translate(-${100 - (enemy.healthCur / enemy.healthMax * 100)}%)`;
    }
}


/**
 * 
 * @param {HTMLElement} elem
 * @param {string} query 
 * @param {string} value 
 */
function updateStatElem(elem, query, value) {
    let stat = elem.querySelector(query);
    if(stat) {
        stat.textContent = value;
    }
}

/**
 * 
 * @param {number} number
 * @returns {string} 
 */
function prettifyDistance(number) {
    number = Math.floor(number * 10) / 10;
    let str = number+'';
    if(str.indexOf('.') === -1) str += '.0';
    return str;
}