"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArguments = void 0;
const getFilename_1 = require("./getFilename");
function getArguments(req) {
    const args = req.query[(0, getFilename_1.default)()];
    if (!args || args.length === 0)
        return undefined;
    return typeof args === "string"
        ? {
            table: args,
            ids: [],
        }
        : {
            table: args[0],
            ids: args.slice(1),
        };
}
exports.getArguments = getArguments;
//# sourceMappingURL=actions.js.map