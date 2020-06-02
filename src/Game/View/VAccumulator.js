/** @typedef {import('./../EntryPoint.js').default} Game.EntryPoint */

import View from './../View.js';

import MItem from './../Model/MItem.js';
import TItem from './../Template/TItem.js';

import Utility from './../../Utility/Utility.js';

export default class VAccumulator extends View {
    /**
     * 
     * @param {Game.EntryPoint} game 
     * @param {number} updateInterval
     * @param {{
        accumulator: HTMLElement,
        forge: HTMLElement
    }} elems
     */
    constructor(game, updateInterval, elems) {
        super(game, updateInterval);
        this.elems = elems;

        this.cache = {
            /** @type {number} */ ilvl: 0,
            /** @type {number} */ tier: 0,
        };

        this.selection = {
            /** @type {number} */ ilvl: 0,
            /** @type {number} */ tier: 0,
        };

        /** @type {boolean} */ this.updateMax = false;

        let elem1 = this.elems.forge.querySelector('[data-id=selectTier]');
        //TODO
        if(elem1) {
            elem1.addEventListener('change', this.onForgeSelectionChanged.bind(this));
        }
        let elem2 = this.elems.forge.querySelector('[data-id=selectiLvl]');
        //TODO
        if(elem2) {
            elem2.addEventListener('change', this.onForgeSelectionChanged.bind(this));
        }

        let elem3 = this.elems.forge.querySelector('[data-id=forgeWeapon]');
        //TODO
        if(elem3) {
            elem3.addEventListener('click', this.onForgeWeaponClick.bind(this));
        }
        let elem4 = this.elems.forge.querySelector('[data-id=forgeArmor]');
        //TODO
        if(elem4) {
            elem4.addEventListener('click', this.onForgeArmorClick.bind(this));
        }
    }

    resume() {
        this.game.view.vAccumulator.onAccumulatorAdded();
    }

    update() {
        if(this.cache.ilvl !== this.save.accumulator.ilvl) {
            let elem = this.elems.accumulator.querySelector('[data-id=ilvl]');
            if(!elem) throw new Error('VAccumulator.update: [data-id=ilvl] missing');
            this.cache.ilvl = this.save.accumulator.ilvl;
            this.updateMax = true;
            elem.textContent = this.cache.ilvl+'';
        }

        if(this.cache.tier !== this.save.accumulator.tier) {
            let elem = this.elems.accumulator.querySelector('[data-id=tier]');
            if(!elem) throw new Error('VAccumulator.update: [data-id=tier] missing');
            this.cache.tier = this.save.accumulator.tier;
            this.updateMax = true;
            elem.textContent = this.cache.tier+'';
        }

        if(this.updateMax) {
            this.updateMax = false;
            
            {
                let elem = this.elems.accumulator.querySelector('[data-id=storageMax]');
                if(!elem) throw new Error('VAccumulator.update: [data-id=storageMax] missing');
                elem.textContent = this.save.accumulator.getMaxStorage()+'';
            }

            {
                let elem = this.elems.forge.querySelector('[data-id=selectTier]');
                if(!elem || !(elem instanceof HTMLElement)) throw new Error('VAccumulator.update: [data-id=selectTier] missing');
                elem.innerHTML = '';
                for(let i = 1; i <= this.cache.tier; i++) {
                    elem.innerHTML += `<option value="${i}" ${i === this.cache.tier ? 'selected' : ''}>Tier ${i}</option`;
                }
                
            }
            {
                let elem = this.elems.forge.querySelector('[data-id=selectiLvl]');
                if(!elem || !(elem instanceof HTMLElement)) throw new Error('VAccumulator.update: [data-id=selectiLvl] missing');
                elem.innerHTML = '';
                for(let i = 1; i <= this.cache.ilvl; i++) {
                    elem.innerHTML += `<option value="${i}" ${i === this.cache.ilvl ? 'selected' : ''}>iLvl ${i}</option>`;
                }
            }

            this.onForgeSelectionChanged();
        }
    }

    onForgeSelectionChanged() {
        {
            let elem = this.elems.forge.querySelector('[data-id=selectTier]');
            if(!elem || !(elem instanceof HTMLSelectElement)) throw new Error('VAccumulator.onForgeSelectionChanged: [data-id=selectTier] missing');
            this.selection.tier = +elem.value;
        }
        {
            let elem = this.elems.forge.querySelector('[data-id=selectiLvl]');
            if(!elem || !(elem instanceof HTMLSelectElement)) throw new Error('VAccumulator.onForgeSelectionChanged: [data-id=selectiLvl] missing');
            this.selection.ilvl = +elem.value;
        }


        let maxBuy = this.save.accumulator.getMaxBuy(this.selection.tier, this.selection.ilvl);
        let itemCost = this.save.accumulator.getItemCost(this.selection.tier, this.selection.ilvl);

        {
            let elems = this.elems.forge.querySelectorAll('[data-id=forgeItemCount]');
            for(let elem of elems) {
                if(!elem || !(elem instanceof HTMLElement)) throw new Error('VAccumulator.onForgeSelectionChanged: [data-id=forgeItemCount] missing');
                elem.textContent = maxBuy+'';
            }
        }
        {
            let elems = this.elems.forge.querySelectorAll('[data-id=forgeItemCost]');
            for(let elem of elems) {
                if(!elem || !(elem instanceof HTMLElement)) throw new Error('VAccumulator.onForgeSelectionChanged: [data-id=forgeItemCost] missing');
                elem.textContent = (itemCost * maxBuy)+'';
            }
        }
    }

    onAccumulatorAdded() {
        {
            let elem = this.elems.accumulator.querySelector('[data-id=valueHeight]');
            if(!elem || !(elem instanceof HTMLElement)) throw new Error('VAccumulator.onAccumulatorAdded: [data-id=valueHeight] missing');
            elem.style.height = (this.save.accumulator.value / this.save.accumulator.getMaxStorage()) * 100 + '%';
        }
        {
            let elem = this.elems.accumulator.querySelector('[data-id=storageCur]');
            if(!elem || !(elem instanceof HTMLElement)) throw new Error('VAccumulator.onAccumulatorAdded: [data-id=storageCur] missing');
            elem.textContent = this.save.accumulator.value+'';
        }
    }

    onForgeWeaponClick() {
        this.onForgeSelectionChanged();
        this.game.controller.cWorldArbiter.forgeItems(MItem.Type.Weapon, this.selection.tier, this.selection.ilvl, this.save.accumulator.getMaxBuy(this.tier, this.ilvl));
    }
    onForgeArmorClick() {
        this.onForgeSelectionChanged();
        this.game.controller.cWorldArbiter.forgeItems(MItem.Type.Armor, this.selection.tier, this.selection.ilvl, this.save.accumulator.getMaxBuy(this.tier, this.ilvl));
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