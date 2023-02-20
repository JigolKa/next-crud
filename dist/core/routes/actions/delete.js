"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dmmf_1 = require("../../../helpers/dmmf");
async function del(_payload, { table, ids }, options, filter) {
    if (ids.length < 0)
        return {
            statusCode: 422,
            errorText: "Missing required url arguments",
        };
    const json = await options.prismaInstance[table].delete({
        where: {
            [(0, dmmf_1.getPrimaryKey)(table)]: ids[0],
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