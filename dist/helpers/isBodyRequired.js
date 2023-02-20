"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isBodyRequired(method) {
    const bodyRequired = {
        DELETE: false,
        GET: false,
        POST: true,
        PATCH: true,
    };
    return bodyRequired[method];
}
exports.default = isBodyRequired;
//# sourceMappingURL=isBodyRequired.js.map