/** @typedef {import('./../EntryPoint.js').default} Game.EntryPoint */

import View from './../View.js';

import MEnemy from './../Model/MEnemy.js';

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
    }

    /**
     * 
     * @param {MEnemy[]} enemies
     */
    onEnemiesAdded(enemies) {
        for(let enemy of enemies) {
            let elem = this.game.template.tEnemy();
            elem.style.top = enemy.y * 10 + '%';
            elem.style.left = enemy.x * 10 + '%';
            this.enemies.set(enemy, elem);
            this.elems.enemies.appendChild(elem);
        }
    }

    /**
     * 
     * @param {MEnemy[]} enemies 
     */
    onEnemiesRemoved(enemies) {
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
     * 
     * @param {MEnemy[]} enemies 
     */
    onEnemiesDamaged(enemies) {
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

    onWaveChanged() {
        updateStatElem(this.elems.stats, '[data-id=wave]', this.game.model.save.wave+'');
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