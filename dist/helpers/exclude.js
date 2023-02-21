"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const omit = require("lodash.omit");
// Improved variant of https://github.com/odynvolk/omit-deep-lodash/
// Note: reduced bundle size by importing only lodash.omit rather
// than the whole library
function omitDeep(input, props) {
    function omitDeepOnOwnProps(obj) {
        if (typeof input === "undefined") {
            return input;
        }
        if (!Array.isArray(obj) && !isObject(obj)) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return omitDeep(obj, props);
        }
        const o = {};
        for (const [key, value] of Object.entries(obj)) {
            o[key] = !isNil(value) ? omitDeep(value, props) : value;
        }
        return omit(o, props);
    }
    if (arguments.length > 2) {
        props = Array.prototype.slice.call(arguments).slice(1);
    }
    if (Array.isArray(input)) {
        return input.map(omitDeepOnOwnProps);
    }
    return omitDeepOnOwnProps(input);
}
exports.default = omitDeep;
function isNil(value) {
    return value === null || value === undefined;
}
function isObject(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
}
//# sourceMappingURL=exclude.js.map