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

export default Utility;