/** @typedef {import('./../Game/Model/MItem.js').default} MItem */

class Utility {

}

/**
 * 
 * @param {number} minIncl
 * @param {number} maxExcl
 * @returns {number}
 */
Utility.getRandomInt = function(minIncl, maxExcl) {
    return Math.floor(Math.random() * (maxExcl - minIncl) + minIncl);
};

/**
 * @param {number} milliseconds
 * @returns {string}
 */
Utility.getFormattedTime = function(milliseconds) {
    let s = Math.floor(milliseconds / 1000);

    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    s = (s - mins) / 60;
    let hours = s % 60;
    let days = (s - hours) / 24;
  
    return `${days}:${hours < 10 ? '0'+hours:hours}:${mins < 10 ? '0'+mins:mins}:${secs < 10 ? '0'+secs:secs}`;
};

/**
 * @param {MItem[]} items
 * @param {number} tier
 * @param {number} damage
 * @param {number} tierPenalty
 * @returns {number} healthLeft
 */
Utility.damageItems = function(items, tier, damage, tierPenalty) {
    let healthLeft = 0;
    for(let item of items) {
        if(item.healthCur <= 0)
            continue;

        if(damage > 0) {
            let diff = tier - item.tier - tierPenalty;
            let mult = diff === 0 ? 1 : (diff < 0 ? 1 / (Math.abs(diff) * 10) : diff * 10);

            item.healthCur -= Math.ceil(damage * mult);
            damage = 0;
            if(item.healthCur < 0) {
                damage = item.healthCur / mult * -1;
                item.healthCur = 0;
            }
        }

        if(item.healthCur > 0)
            healthLeft += item.healthCur;
    }
    return healthLeft - damage;
};

/**
 * @param {MItem[]} items
 * @returns {number} health
 */
Utility.getCurHealthFromItems = function(items) {
    let health = 0;
    for(let item of items) {
        health += item.healthCur;
    }
    return health;
};

/**
 * @param {MItem[]} items
 * @returns {number} health
 */
Utility.getMaxHealthFromItems = function(items) {
    let health = 0;
    for(let item of items) {
        health += item.healthMax;
    }
    return health;
};

export default Utility;