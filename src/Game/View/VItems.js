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

            for(let v of this.data.itemHolders)
                if(name === v) this.elemsToItemHolders.set(holder, name);

            holder.addEventListener('mousedown', onClickHolder.bind({this: this, elem: holder}));
        }
    }

    update() {
        refreshItemHeldPosition.bind(this)();

        for(let item of this.save.items.equipment) {
            let elem = this.itemsToElems.get(item);
            if(elem == null) continue;
            let attackBar = elem.querySelector('.attack-bar');
            if(!(attackBar instanceof HTMLElement)) continue;
            attackBar.style.transform = `translateX(-${item.attackTimer / (1 / item.attackSpeed) * 100}%)`;
        }
    }

    resume() {
        this.elems.itemHeld.innerHTML = '';
        this.itemHeld = null;

        this.itemsToElems.clear();
        this.elemsToItems.clear();
        
        for(let holderElem of Object.values(this.itemHoldersToElems)) {
            holderElem.innerHTML = '';
        }

        for(let holderName of this.data.itemHolders) {
            onItemsAdded.bind(this)(this.save.items[holderName], holderName);
        }
    }

    /**
     * 
     * @param {'itemsAdded'|'itemsRemoved'|'itemsMoved'|'holderSorted'} event 
     * @param  {...any} params 
     */
    onEvent(event, ...params) {
        if(this.paused) return;

        switch(event) {
        case 'itemsAdded': {
            /** @type {MItem[]} */ let items = params[0];
            /** @type {'backpack'|'pouch'|'equipment'} */ let holder = params[1];
            onItemsAdded.bind(this)(items, holder);
            break;
        }
        case 'itemsRemoved': {
            /** @type {MItem[]} */ let items = params[0];
            /** @type {'backpack'|'pouch'|'equipment'} */ let holder = params[1];
            onItemsRemoved.bind(this)(items, holder);
            break;
        }
        case 'itemsMoved': {
            /** @type {MItem[]} */ let items = params[0];
            /** @type {'backpack'|'pouch'|'equipment'} */ let holder = params[1];
            onItemsMoved.bind(this)(items, holder);
            break;
        }
        case 'holderSorted': {
            /** @type {'backpack'|'pouch'|'equipment'} */ let holder = params[0];
            onHolderSorted.bind(this)(holder);
        }
        }
    }

    /**
     * 
     * @param {MouseEvent} e 
     */
    onMouseDown(e) {
        dropItem.bind(this)();
    }
}

/**
 * @this {VItems}
 * @param {MItem[]} items
 * @param {'backpack'|'pouch'|'equipment'} holder
 */
function onItemsAdded(items, holder) {
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
 * @this {VItems}
 * @param {MItem[]} items
 * @param {'backpack'|'pouch'|'equipment'} holder
 */
function onItemsRemoved(items, holder) {
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
 * @this {VItems}
 * @param {MItem[]} items
 * @param {'backpack'|'pouch'|'equipment'} holder
 */
function onItemsMoved(items, holder) {
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

    onHolderSorted.bind(this)(holder);
}

/**
 * @this {VItems}
 * @param {'backpack'|'pouch'|'equipment'} holderName
 */
function onHolderSorted(holderName) {
    for(let item of this.save.items[holderName]) {
        let elem = this.itemsToElems.get(item);
        if(!elem || !elem.parentElement) continue;

        let parent = elem.parentElement;
        parent.removeChild(elem);
        parent.appendChild(elem);
    }
}






/**
 * @this {VItems}
 */
function refreshItemHeldPosition() {
    if(this.itemHeld) {
        this.itemHeld.style.transform = `translate(${this.data.mouse.x - this.itemHeld.offsetWidth / 2}px, ${this.data.mouse.y - this.itemHeld.offsetHeight / 2}px)`;
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
        e.textContent = Math.floor(item.getValue() * 10) / 10+'';
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
    if(this.itemHeld) {
        this.itemHeld.style.transform = '';
        this.itemHeld.style.pointerEvents = '';
        let item = this.elemsToItems.get(this.itemHeld);
        if(item) {
            let holderName = this.data.itemsToHolders.get(item);
            if(holderName) {
                this.itemHoldersToElems[holderName].appendChild(this.itemHeld);
                onHolderSorted.bind(this)(holderName);
            }
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
        refreshItemHeldPosition.bind(that)();
    }
    else {
        let item1 = that.elemsToItems.get(elem);
        let item2 = that.elemsToItems.get(that.itemHeld);
        if(item1 == null || item2 == null) return;

        let item1holderName = that.data.itemsToHolders.get(item1);
        let item2holderName = that.data.itemsToHolders.get(item2);
        if(item1holderName == null || item2holderName == null) return;

        that.game.controller.cItems.swapItems(item1, item1holderName, item2, item2holderName);
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