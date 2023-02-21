"use strict";
/* eslint-disable no-unused-vars */
Object.defineProperty(exports, "__esModule", { value: true });
const delete_1 = require("./actions/delete");
const fetch_1 = require("./actions/fetch");
const update_1 = require("./actions/update");
const create_1 = require("./actions/create");
const verify_1 = require("./actions/verify");
function actionsFactory(method, _verify = false) {
    const functions = {
        GET: fetch_1.default,
        POST: create_1.default,
        PATCH: update_1.default,
        DELETE: delete_1.default,
    };
    if (_verify)
        return method === "POST" ? verify_1.default : null;
    if (!functions[method])
        return null;
    return functions[method];
}
exports.default = actionsFactory;
//# sourceMappingURL=index.js.map