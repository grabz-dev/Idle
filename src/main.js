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

document.addEventListener('click', e => {
    for(let view of views) if(view.onClick != null) view.onClick(e);
});
document.addEventListener('mouseup', e => {
    for(let view of views) if(view.onMouseUp != null) view.onMouseUp(e);
});
document.addEventListener('mousedown', e => {
    for(let view of views) if(view.onMouseDown != null) view.onMouseDown(e);
});

entryPoint.model.loadGame().then(() => {
    for(let controller of controllers)
        controller.awake();

    setInterval(entryPoint.model.saveGame.bind(entryPoint.model), 5000);

    //const
    const save = entryPoint.model.save;
    const frameTime = 1/60*1000;
    
    //frame based
    let lastTimestamp = 0;
    let timeLeft = Math.min(Date.now() - save.timestamp, 1000 * 60 * 60 * 24);
    let catchup = false;
    
    requestAnimationFrame(loop);
    /**
     * 
     * @param {DOMHighResTimeStamp} timestamp 
     */
    function loop(timestamp) {
        timeLeft += timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        catchup = false;
        if(timeLeft >= frameTime * 60) {
            catchup = true;
            for(let view of views) {
                view.pause();
            }
        }

        while(timeLeft >= frameTime) {
            timeLeft -= frameTime;
            save.timeElapsed += frameTime;

            for(let controller of controllers) {
                if(typeof controller.update === 'function')
                    controller.update(frameTime);
            }

            if(!catchup) {
                for(let view of views) {
                    view.updateClock += frameTime;
                    if(view.updateClock >= view.updateInterval) {
                        view.updateClock = 0;
                        if(view.update != null)
                            view.update();
                    }
                }
            }
        }

        if(catchup) {
            for(let view of views) {
                view.unpause();
            }
        }

        requestAnimationFrame(loop);
    }

    // @ts-ignore
    window.game = entryPoint;
});