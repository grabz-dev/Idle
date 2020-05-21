/** @typedef {import('./../EntryPoint.js').default} Game.EntryPoint */

import View from './../View.js';

import MItem from './../Model/MItem.js';
import TItem from './../Template/TItem.js';

export default class VItems extends View {
    /**
     * 
     * @param {Game.EntryPoint} game 
     * @param {number} updateInterval
     * @param {{
        backpack: HTMLElement,
        pouch: HTMLElement,
        equipment: HTMLElement,
        itemHeld: HTMLElement
    }} elems
     */
    constructor(game, updateInterval, elems) {
        super(game, updateInterval);
        this.elems = elems;
        
        const data = this.game.model.data;

        /** @type {Map<MItem, HTMLElement>} */
        this.itemsToElems = new Map();
        /** @type {Map<HTMLElement, MItem>} */
        this.elemsToItems = new Map();

        this.itemHoldersToElems = {
            backpack: this.elems.backpack,
            pouch: this.elems.pouch,
            equipment: this.elems.equipment
        };

        /** @type {null|HTMLElement} */
        this.itemHeld = null;

        /** @type {Map<HTMLElement, 'backpack'|'pouch'|'equipment'>} */
        this.elemsToItemHolders = new Map();
        for(let entry of Object.entries(this.itemHoldersToElems)) {
            let name = entry[0];
            let holder = entry[1];

            for(let v of data.itemHolders)
                if(name === v) this.elemsToItemHolders.set(holder, name);

            holder.addEventListener('mousedown', onClickHolder.bind({this: this, elem: holder}));
        }
    }

    /**
     * 
     * @param {number} updateInterval 
     */
    update(updateInterval) {
        this.refreshItemHeldPosition();

        const save = this.game.model.save;
        for(let item of save.items.equipment) {
            let elem = this.itemsToElems.get(item);
            if(elem == null) continue;
            let attackBar = elem.querySelector('.attack-bar');
            if(!(attackBar instanceof HTMLElement)) continue;
            attackBar.style.transform = `translateX(-${item.attackTimer / (1 / item.attackSpeed) * 100}%)`;
        }
    }

    refreshItemHeldPosition() {
        if(this.itemHeld) {
            const data = this.game.model.data;
            this.itemHeld.style.transform = `translate(${data.mouse.x - this.itemHeld.offsetWidth / 2}px, ${data.mouse.y - this.itemHeld.offsetHeight / 2}px)`;
        }
    }

    /**
     * 
     * @param {MouseEvent} e 
     */
    onMouseDown(e) {
        dropItem.bind(this)();
    }

    /**
     * 
     * @param {MItem[]} items
     * @param {'backpack'|'pouch'|'equipment'} holder
     */
    onItemsAdded(items, holder) {
        for(let item of items) {
            let elem = this.game.template.tItem();
            elem.addEventListener('mousedown', onClickItem.bind({this: this, elem: elem}));
            this.itemsToElems.set(item, elem);
            this.elemsToItems.set(elem, item);

            this.itemHoldersToElems[holder].appendChild(elem);

            refreshValue(elem, item);
            refreshAttribute(elem, item, 'health');
            refreshAttribute(elem, item, 'attack');
            refreshAttribute(elem, item, 'attackSpeed');
            refreshAttribute(elem, item, 'attackRange');

            //TODO
            let attackBar = elem.querySelector('.attack-bar');
            if(!(attackBar instanceof HTMLElement)) continue;
            if(item.type !== MItem.Type.Weapon)
                attackBar.style.visibility = 'hidden';
            else if(item.type === MItem.Type.Weapon && holder !== 'equipment')
                attackBar.style.visibility = 'hidden';
            else attackBar.style.visibility = 'visible';
        }
    }

    /**
     * 
     * @param {MItem[]} items
     * @param {'backpack'|'pouch'|'equipment'} holder
     */
    onItemsRemoved(items, holder) {
        for(let item of items) {
            let elem = this.itemsToElems.get(item);

            if(elem === this.itemHeld)
                dropItem.bind(this)();

            this.itemsToElems.delete(item);
            if(elem) {
                this.elemsToItems.delete(elem);
                this.itemHoldersToElems[holder].removeChild(elem);
            }
        }
    }

    /**
     * 
     * @param {MItem[]} items
     * @param {'backpack'|'pouch'|'equipment'} holder
     */
    onItemsMoved(items, holder) {
        for(let item of items) {
            let elem = this.itemsToElems.get(item);
            if(elem == null)
                continue;
            
            this.itemHoldersToElems[holder].appendChild(elem);

            //TODO
            let attackBar = elem.querySelector('.attack-bar');
            if(!(attackBar instanceof HTMLElement)) continue;
            if(item.type !== MItem.Type.Weapon)
                attackBar.style.visibility = 'hidden';
            else if(item.type === MItem.Type.Weapon && holder !== 'equipment')
                attackBar.style.visibility = 'hidden';
            else attackBar.style.visibility = 'visible';
        }
    }

    refreshBackpackPositions() {
        for(let item of this.game.model.save.items.backpack) {
            let elem = this.itemsToElems.get(item);
            if(!elem || !elem.parentElement) continue;

            elem.parentElement.appendChild(elem);
        }
    }
}

/**
 * 
 * @param {HTMLElement} elem
 * @param {MItem} item
 */
function refreshValue(elem, item) {
    let e = elem.querySelector('[data-id=value');
    if(e instanceof HTMLElement) {
        e.textContent = item.getValue()+'';
    }
}

/**
 * 
 * @param {HTMLElement} elem
 * @param {MItem} item
 * @param {'health'|'attack'|'attackSpeed'|'attackRange'} attrib
 */
function refreshAttribute(elem, item, attrib) {
    let e = elem.querySelector(`[data-id=${attrib}]`);
    if(e instanceof HTMLElement) {
        let value = item[attrib];

        if(value !== 0) {
            if(e.parentElement)
                e.parentElement.style.display = 'block';
            e.textContent = item[attrib]+'';
        }
    }
}

/**
 * @this {VItems}
 */
function dropItem() {
    const data = this.game.model.data;

    if(this.itemHeld) {
        this.itemHeld.style.transform = '';
        this.itemHeld.style.pointerEvents = '';
        let item = this.elemsToItems.get(this.itemHeld);
        if(item) {
            let holderName = data.itemsToHolders.get(item);
            if(holderName)
                this.itemHoldersToElems[holderName].appendChild(this.itemHeld);
        }
        this.itemHeld = null;
    }
}

/**
 * @this {{this: VItems, elem: HTMLElement}}
 * @param {MouseEvent} e 
 */
function onClickItem(e) {
    if(e.button !== 0) return;

    const elem = this.elem;
    const that = this.this;

    if(that.itemHeld == null) {
        e.stopPropagation();
        that.itemHeld = elem;
        that.itemHeld.style.pointerEvents = 'none';
        that.elems.itemHeld.appendChild(that.itemHeld);
        that.refreshItemHeldPosition();
    }
    else {
        let item1 = that.elemsToItems.get(elem);
        let item2 = that.elemsToItems.get(that.itemHeld);
        if(item1 == null || item2 == null) return;

        let item1holderName = that.game.model.data.itemsToHolders.get(item1);
        let item2holderName = that.game.model.data.itemsToHolders.get(item2);
        if(item1holderName == null || item2holderName == null) return;

        that.game.controller.cItems.moveItems([item1], item2holderName);
        that.game.controller.cItems.moveItems([item2], item1holderName);
    }
}

/**
 * @this {{this: VItems, elem: HTMLElement}}
 * @param {MouseEvent} e 
 */
function onClickHolder(e) {
    if(e.button !== 0) return;

    const elem = this.elem;
    const that = this.this;

    if(that.itemHeld != null && e.target != that.itemHeld) {
        e.stopPropagation();
        let item = that.elemsToItems.get(that.itemHeld);
        if(item == null)
            return;

        let holderName = that.elemsToItemHolders.get(elem);
        if(holderName == null)
            return;

        that.game.controller.cItems.moveItems([item], holderName);
        dropItem.bind(that)();
    }
}