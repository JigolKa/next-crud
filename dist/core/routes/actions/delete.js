"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dmmf_1 = require("../../../helpers/dmmf");
async function del(_payload, { table, id }, options, filter) {
    if (id)
        return {
            statusCode: 422,
            errorText: "Missing required url arguments",
        };
    const json = await options.prismaInstance[table].delete({
        where: {
            [(0, dmmf_1.getPrimaryKey)(table)]: id,
        },
        ...filter,
    });
    return {
        statusCode: 200,
        json,
    };
}
exports.default = del;
//# sourceMappingURL=delete.js.map