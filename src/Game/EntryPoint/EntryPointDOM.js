export default class EntryPointElems {
    constructor() {
        this.all = {
            dim: /** @type {HTMLElement} */(document.getElementById('dim')),
            wrap: /** @type {HTMLElement} */(document.getElementById('wrap')),
            enemies: /** @type {HTMLElement} */(document.getElementById('enemies')),
            backpack: /** @type {HTMLElement} */(document.getElementById('backpack')),
            pouch: /** @type {HTMLElement} */(document.getElementById('pouch')),
            equipment: /** @type {HTMLElement} */(document.getElementById('equipment')),
            stats: /** @type {HTMLElement} */(document.getElementById('stats')),
            itemHeld: /** @type {HTMLElement} */(document.getElementById('itemHeld')),
            clock: /** @type {HTMLElement} */(document.getElementById('clock')),
        };

        for(let entry of Object.entries(this.all)) {
            if(entry[1] == null) throw new Error('DOM initialization error, ' + entry[0]);
        }
    }
} 
