"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelationKeys = exports.getKeys = exports.getPrimaryKey = void 0;
const client_1 = require("@prisma/client");
function getPrimaryKey(table) {
    return (client_1.Prisma.dmmf.datamodel.models
        // we want the first result
        .filter((v) => v.name.toLowerCase() === table.toLowerCase())[0]
        // there is only one ID field so the first one is the right one
        .fields.filter((v) => v.isId)[0].name);
}
exports.getPrimaryKey = getPrimaryKey;
function getKeys(table) {
    return client_1.Prisma.dmmf.datamodel.models
        .filter((v) => v.name.toLowerCase() === table.toLowerCase())[0]
        .fields.map((v) => v.name);
}
exports.getKeys = getKeys;
function getRelationKeys(table) {
    return client_1.Prisma.dmmf.datamodel.models
        .filter((v) => v.name.toLowerCase() === table.toLowerCase())[0]
        .fields.filter((v) => v.relationName)
        .map((v) => v.name);
}
exports.getRelationKeys = getRelationKeys;
//# sourceMappingURL=dmmf.js.map