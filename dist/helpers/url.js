"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.json = exports.getJsonFromUrl = void 0;
function getJsonFromUrl(url) {
    if (!url)
        url = location.search;
    var query = url.substr(1);
    var result = {};
    query.split("&").forEach(function (part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}
exports.getJsonFromUrl = getJsonFromUrl;
const json = (v) => {
    const date = new Date();
    return {
        status: v,
        timestamp: date,
    };
};
exports.json = json;
//# sourceMappingURL=url.js.map