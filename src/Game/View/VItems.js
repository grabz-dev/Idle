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
        pouch: HTMLElement
    }} elems
     */
    constructor(game, updateInterval, elems) {
        super(game, updateInterval);
        this.elems = elems;

        /** @type {Map<MItem, HTMLElement>} */
        this.itemsToElems = new Map();
        /** @type {Map<HTMLElement, MItem>} */
        this.elemsToItems = new Map();

        this.itemHoldersToElems = {
            backpack: this.elems.backpack,
            pouch: this.elems.pouch
        };

        /** @type {null|HTMLElement} */
        this.itemHeld = null;
        this.itemHeldX = 0;
        this.itemHeldY = 0;

        /** @type {Map<HTMLElement, string>} */
        this.elemsToItemHolders = new Map();
        for(let entry of Object.entries(this.itemHoldersToElems)) {
            let name = entry[0];
            let holder = entry[1];

            this.elemsToItemHolders.set(holder, name);
            holder.addEventListener('mousedown', onClickHolder.bind({this: this, elem: holder}));
        }
    }

    /**
     * 
     * @param {number} frameTime 
     */
    update(frameTime) {
        if(this.itemHeld) {
            const data = this.game.model.data;
            this.itemHeld.style.transform = `translate(${data.mouse.x - this.itemHeldX}px, ${data.mouse.y - this.itemHeldY}px)`;
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
     * @param {string} holder
     */
    onItemsAdded(items, holder) {
        for(let item of items) {
            let elem = this.game.template.tItem();
            elem.addEventListener('mousedown', onClickItem.bind({this: this, elem: elem}));
            this.itemsToElems.set(item, elem);
            this.elemsToItems.set(elem, item);

            this.itemHoldersToElems[holder].appendChild(elem);

            refreshAttribute(elem, item, 'health');
            refreshAttribute(elem, item, 'attack');
            refreshAttribute(elem, item, 'attackSpeed');
            refreshAttribute(elem, item, 'attackRange');
        }
    }

    /**
     * 
     * @param {MItem[]} items
     * @param {string} holder
     */
    onItemsMoved(items, holder) {
        for(let item of items) {
            let elem = this.itemsToElems.get(item);
            if(elem == null)
                continue;
            
            this.itemHoldersToElems[holder].appendChild(elem);
        }
    }
}

/**
 * 
 * @param {HTMLElement} elem 
 */
function refreshAttribute(elem, item, attrib) {
    if(item[attrib] == null || item[attrib] == 0) return;
    let e = elem.querySelector(`[data-id=${attrib}]`);
    if(e instanceof HTMLElement) {
        if(e.parentElement)
            e.parentElement.style.display = 'block';
        e.textContent = item[attrib]+'';
    }
}

/**
 * @this {VItems}
 */
function dropItem() {
    if(this.itemHeld) {
        this.itemHeld.style.transform = '';
        this.itemHeld.style.pointerEvents = '';
        this.itemHeld = null;
    }
}

/**
 * @this {{this: VItems, elem: HTMLElement}}
 * @param {MouseEvent} e 
 */
function onClickItem(e) {
    const elem = this.elem;
    const that = this.this;

    if(that.itemHeld == null) {
        e.stopPropagation();
        that.itemHeld = elem;
        that.itemHeldX = e.screenX;
        that.itemHeldY = e.screenY;
        that.itemHeld.style.pointerEvents = 'none';
    }
}

/**
 * @this {{this: VItems, elem: HTMLElement}}
 * @param {MouseEvent} e 
 */
function onClickHolder(e) {
    const elem = this.elem;
    const that = this.this;

    if(that.itemHeld != null && e.target != that.itemHeld) {
        e.stopPropagation();
        let item = that.elemsToItems.get(that.itemHeld);
        if(item == null)
            return;

        let holder = that.elemsToItemHolders.get(elem);
        if(holder == null)
            return;

        that.game.controller.cItems.moveItems([item], holder);
        dropItem.bind(that)();
    }
}