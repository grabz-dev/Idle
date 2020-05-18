import Model from './../Model.js';

const HEX_SHORT_PARSE = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
const HEX_FULL_PARSE = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

export default class Color extends Model {
    /**
     * Basic storage for a color.
     * @param {number} r Red component of the color, between 0 - 255.
     * @param {number} g Green component of the color, between 0 - 255.
     * @param {number} b Blue component of the color, between 0 - 255.
     * @param {number} a Opacity of the color, between 0 - 255.
     */
    constructor(r, g, b, a) {
        super('MColor.js');

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    /**
     * @returns {object} json 
     */
    serialize() {
        return Object.assign(super.serialize(), {
            r: this.r,
            g: this.g,
            b: this.b,
            a: this.a
        });
    }

    /**
     * @param {any} obj
     */
    deserialize(obj) {
        this.r = obj.r;
        this.g = obj.g;
        this.b = obj.b;
        this.a = obj.a;
    }
}

/**
 * Get an RGB color value from a hexadecimal string.
 * @param {string} hex - Valid formats include `#FF0000`, `#F00`.
 * @returns {Color}
 */
Color.HEXtoRGB = function(hex) {
    hex = hex.replace(HEX_SHORT_PARSE, (m, r, g, b) => {
        return r + r + g + g + b + b;
    });

    var result = HEX_FULL_PARSE.exec(hex);
    if(!result) {
        return new Color(0, 0, 0, 1);
    }
    return new Color(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 1);
};

/**
 * Get a hexadecimal string from an RGB color value.
 * @param {Color} color
 * @returns {string}
 */
Color.RGBtoHEX = function(color) {
    return '#' + ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1);
};

/**
 * Get an HSV color value from an RGB color value.
 * @param {Color} color
 * @returns {{h: number, s: number, v: number}}
 */
Color.RGBtoHSV = function(color) {
    let rabs, gabs, babs, rr, gg, bb, h=0, s, v, diff;
    rabs = color.r / 255;
    gabs = color.g / 255;
    babs = color.b / 255;
    v = Math.max(rabs, gabs, babs),
    diff = v - Math.min(rabs, gabs, babs);
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs, v, diff);
        gg = diffc(gabs, v, diff);
        bb = diffc(babs, v, diff);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: percentRoundFn(s * 100),
        v: percentRoundFn(v * 100)
    };
};

/**
 * Get an RGB color value from an HSV color value.
 * @param {number} h - The hue component, between 0 - 360.
 * @param {number} s - The saturation component, between 0 - 100.
 * @param {number} v - The value component, between 0 - 100.
 * @returns {Color}
 */
Color.HSVtoRGB = function(h, s, v) {
    h=h/360; s=s/100; v=v/100;
    let r=0, g=0, b=0, i, f, p, q, t;

    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
    }

    return new Color(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), 1);
};

/**
 * Get an HSV color value taken from between two HSV color values at a specific point.
 * @param {number} h1 - The hue component of the first color, between 0 - 360.
 * @param {number} s1 - The saturation component of the first color, between 0 - 100.
 * @param {number} v1 - The value component of the first color, between 0 - 100.
 * @param {number} h2 - The hue component of the second color, between 0 - 360.
 * @param {number} s2 - The saturation component of the second color, between 0 - 100.
 * @param {number} v2 - The value component of the second color, between 0 - 100.
 * @param {number} at - The position between the two colors to choose, between 0 - 1. 0.5 is the midpoint.
 * @returns {{h: number, s: number, v: number}}
 */
Color.interpolateHSV = function(h1, s1, v1, h2, s2, v2, at) {
    let d = h2 - h1;
    let delta = d + ((Math.abs(d) > 180) ? ((d < 0) ? 360 : -360) : 0);

    return {
        h: Math.round(((h1 + (delta * at)) + 360) % 360),
        s: Math.round((s2 - s1) * at + s1),
        v: Math.round((v2 - v1) * at + v1)
    };
};

/**
 * 
 * @param {number} c 
 * @param {number} v 
 * @param {number} diff
 * @returns {number} 
 */
function diffc(c, v, diff) {
    return (v - c) / 6 / diff + 1 / 2;
}

/**
 * 
 * @param {number} num
 * @returns {number} 
 */
function percentRoundFn(num) {
    return Math.round(num * 100) / 100;
}