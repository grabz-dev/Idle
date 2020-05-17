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

export default Utility;