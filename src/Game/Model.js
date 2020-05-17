export default class Model {
    /**
     * 
     * @param {string} _path 
     */
    constructor(_path) {
        this._path = _path;
    }

    /**
     * @returns {object} json 
     */
    serialize() {
        return {
            _path: this._path
        };
    }

    /**
     * @param {object} json 
     */
    deserialize(json) {
        console.error('deserialize not implemented', json);
    }
}