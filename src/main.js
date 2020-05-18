/** @typedef {import('./Game/Model.js').default} Model */
/** @typedef {import('./Game/View.js').default} View */
/** @typedef {import('./Game/Controller.js').default} Controller */

import EntryPoint from './Game/EntryPoint.js';

const entryPoint = new EntryPoint();

/** @type {View[]} */
// @ts-ignore
const views = Object.keys(entryPoint.view).map(e => entryPoint.view[e]);
/** @type {Controller[]} */
// @ts-ignore
const controllers = Object.keys(entryPoint.controller).map(e => entryPoint.controller[e]);

for(let controller of controllers)
    controller.awake();
for(let controller of controllers)
    controller.start();

document.addEventListener('click', e => {
    for(let view of views) if(view.onClick != null) view.onClick(e);
});
document.addEventListener('mouseup', e => {
    for(let view of views) if(view.onMouseUp != null) view.onMouseUp(e);
});
document.addEventListener('mousedown', e => {
    for(let view of views) if(view.onMouseDown != null) view.onMouseDown(e);
});

const frameTime = 1/60*1000;

loop();
function loop() {
    for(let controller of controllers) {
        controller.update(frameTime);
    }

    for(let view of views) {
        view.updateClock += frameTime;
        if(view.updateClock >= view.updateInterval) {
            view.updateClock = 0;
            if(view.update != null)
                view.update(frameTime);
        }
    }

    setTimeout(loop, frameTime);
}