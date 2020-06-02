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
        //TODO
        if(restart) {
            restart.addEventListener('click', () => this.game.controller.cBattle.restart());
        }
    }

    update() {
        updateStatElem(this.elems.stats, '[data-id=time]', Utility.getFormattedTime(this.save.timeElapsed));
        updateStatElem(this.elems.stats, '[data-id=distance]', prettifyDistance(this.save.battle.distance));
        updateStatElem(this.elems.stats, '[data-id=distanceBest]', prettifyDistance(this.save.battle.distanceBest));
        updateStatElem(this.elems.stats, '[data-id=velocity]', prettifyDistance(this.save.battle.velocity));
        updateStatElem(this.elems.stats, '[data-id=velocityBest]', prettifyDistance(this.save.battle.velocityBest));

        const distance = this.save.battle.distance;
        for(let [enemy, elem] of [...this.enemies.entries()]) {
            elem.style.top = `${100 - (enemy.y - distance) * 10}%`;

            if(enemy.y - distance <= 0) {
                this.enemies.delete(enemy);
                elem.remove();
                continue;
            }

            const bars = elem.querySelectorAll('.attack .entry .bar');
            let i = 0;
            for(let item of enemy.items) {
                if(item.attack <= 0) continue;
                if(i >= 2) break;

                let bar = bars[0];
                if(!bar || !(bar instanceof HTMLElement)) throw new Error('VBattle.update: enemy doesn\'t have enough .attack .entry .bar descendants');
                bar.style.transform = `translateX(-${100 - item.attackTimer / (1 / item.attackSpeed) * 100}%)`;

                i++;
            }
        }


    }

    resume() {
        this.enemies.clear();
        this.elems.enemies.innerHTML = '';
        this.onEvent('enemiesAdded', this.save.battle.enemies);
    }

    /**
     * 
     * @param {'enemiesAdded'|'enemiesRemoved'|'enemiesDamaged'|'enemiesRemovedAll'} event 
     * @param  {...any} params 
     */
    onEvent(event, ...params) {
        if(this.paused) return;

        switch(event) {
        case 'enemiesAdded': {
            /** @type {MEnemy[]} */ let enemies = params[0];
            onEnemiesAdded.bind(this)(enemies);
            break;
        }
        case 'enemiesRemoved': {
            /** @type {MEnemy[]} */ let enemies = params[0];
            /** @type {boolean} */ let death = params[1];
            onEnemiesRemoved.bind(this)(enemies, death);
            break;
        }
        case 'enemiesDamaged': {
            /** @type {MEnemy[]} */ let enemies = params[0];
            onEnemiesDamaged.bind(this)(enemies);
            break;
        }
        case 'enemiesRemovedAll': {
            onEnemiesRemovedAll.bind(this)();
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

        {
            const group = elem.querySelector('.bar.group');
            if(!group) throw new Error('VBattle.onEnemiesAdded: .bar.group not found');
            const outer = elem.querySelector('.bar.outer');
            if(!outer) throw new Error('VBattle.onEnemiesAdded: .bar.outer not found');
            
            let i = 0;
            for(let item of [...enemy.items].reverse()) {
                if(item.healthMax <= 0) continue;
                if(i === 0) {
                    i++;
                    continue;
                }
                group.appendChild(outer.cloneNode(true));
            }

            i = 0;
            const outers = group.querySelectorAll('.bar.outer');
            for(let item of [...enemy.items].reverse()) {
                if(item.healthMax <= 0) continue;

                let outer = outers[i];
                if(!outer || !(outer instanceof HTMLElement)) throw new Error('VBattle.onEnemiesAdded: .bar.group doesn\'t have enough .bar.outer descendants');
                outer.style.flexGrow = item.healthMax+'';

                i++;
            }
        }

        {
            const health = elem.querySelector('.health [data-id=healthMax]');
            if(!health) throw new Error('VBattle.onEnemiesAdded: .health [data-id=healthMax] not found');
            health.textContent = Utility.getMaxHealthFromItems(enemy.items)+'';
        }

        {
            const attack = elem.querySelector('.attack');
            if(!attack) throw new Error('VBattle.onEnemiesAdded: .attack not found');
            const entry = elem.querySelector('.attack .entry');
            if(!entry) throw new Error('VBattle.onEnemiesAdded: .attack .entry not found');

            let i = 0;
            for(let item of enemy.items) {
                if(item.attack <= 0) continue;
                if(i === 0) {
                    i++;
                    continue;
                }
                if(i >= 2) break;

                attack.appendChild(entry.cloneNode(true));

                i++;
            }

            i = 0;
            const labels = attack.querySelectorAll('.entry [data-id=attack]');
            for(let item of enemy.items) {
                if(item.attack <= 0) continue;
                if(i >= 2) break;

                let label = labels[i];
                if(!label) throw new Error('VBattle.onEnemiesAdded: .attack doesn\'t have enough .entry [data-id=attack] descendants');
                label.textContent = item.attack+'';

                i++;
            }
        }
        
        elem.style.top = '0%';
        elem.style.left = enemy.x * 10 + '%';
        this.enemies.set(enemy, elem);
        this.elems.enemies.appendChild(elem);
    }
}

/**
 * @this {VBattle}
 * @param {MEnemy[]} enemies
 * @param {boolean} death
 */
function onEnemiesRemoved(enemies, death) {
    for(let enemy of enemies) {
        let elem = this.enemies.get(enemy);
        if(!elem) throw new Error('VBattle.onEnemiesRemoved: elem not found');

        if(!death) {
            this.enemies.delete(enemy);
            elem.remove();
        }
    }
}

/**
 * @this {VBattle}
 * @param {MEnemy[]} enemies
 */
function onEnemiesDamaged(enemies) {
    for(let enemy of enemies) {
        let elem = this.enemies.get(enemy);
        if(!elem) throw new Error('VBattle.onEnemiesDamaged: elem not found');
        const group = elem.querySelector('.bar.group');
        if(!group) throw new Error('VBattle.onEnemiesDamaged: .bar.group not found');

        let i = 0;
        const inners = group.querySelectorAll('.bar.inner');
        let hasHealthRemaining = false;
        for(let item of [...enemy.items].reverse()) {
            if(item.healthMax <= 0) continue;

            let inner = inners[i];
            if(!inner || !(inner instanceof HTMLElement)) throw new Error('VBattle.onEnemiesDamaged: .bar.group doesn\'t have enough .bar.inner descendants');

            inner.style.transform = `translate(-${100 - (item.healthCur / item.healthMax * 100)}%)`;

            if(item.healthCur > 0)
                hasHealthRemaining = true;
            i++;
        }

        if(!hasHealthRemaining) {
            elem.style.backgroundColor = '#0000005c';
            elem.style.borderColor = 'black';
        }
    }
}

/**
 * @this {VBattle}
 */
function onEnemiesRemovedAll() {
    this.enemies.clear();
    this.elems.enemies.innerHTML = '';
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