"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArguments = void 0;
const getEndpoint_1 = require("./getEndpoint");
const logging_1 = require("./logging");
function getArguments(req) {
    const args = req.query[(0, getEndpoint_1.default)(req)];
    if (!args || args.length === 0 || args.length > 2)
        return undefined;
    (0, logging_1.default)("BgGreen", args);
    return {
        table: args[0],
        id: isNaN(Number(args.slice(1)))
            ? args.slice(1)
            : Number(args.slice(1)),
    };
}
exports.getArguments = getArguments;
//# sourceMappingURL=actions.js.map