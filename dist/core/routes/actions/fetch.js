"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dmmf_1 = require("../../../helpers/dmmf");
async function fetch(_payload, { table, ids }, options, filter) {
    if (ids.length >= 1) {
        return {
            statusCode: 200,
            json: await options.prismaInstance[table].findFirst({
                where: {
                    [(0, dmmf_1.getPrimaryKey)(table)]: ids[0],
                },
                ...filter,
            }),
        };
    }
    if (typeof options.disableGlobalFetching === "boolean" ||
        typeof options.disableGlobalFetching?.[table] !== "undefined") {
        const statusCode = typeof options.disableGlobalFetching === "object"
            ? options.disableGlobalFetching[table]?.statusCodeToReturn ?? 404
            : 404;
        const errorText = typeof options.disableGlobalFetching === "object"
            ? options.disableGlobalFetching[table]?.message ?? "Not found"
            : "Not found";
        return {
            statusCode,
            errorText,
        };
    }
    try {
        const json = await options.prismaInstance[table].findMany({
            ...filter,
        });
        return {
            statusCode: 200,
            json,
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            errorText: "An unexpected error occured",
            json: error.meta,
        };
    }
}
exports.default = fetch;
//# sourceMappingURL=fetch.js.map