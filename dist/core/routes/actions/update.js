"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dmmf_1 = require("../../../helpers/dmmf");
async function update({ req }, { table, ids, canBeUpdated }, options, filter) {
    if (ids.length < 0) {
        return {
            statusCode: 422,
            errorText: "Missing required url arguments",
        };
    }
    const canBeUpdatedArray = canBeUpdated.map((v) => v.name);
    const fieldsArray = Object.keys(req.body);
    const notRecognizedFields = fieldsArray.filter((val) => !canBeUpdatedArray.includes(val));
    const filteredData = [...fieldsArray];
    for (const notRecognizedField of notRecognizedFields) {
        filteredData.splice(filteredData.indexOf(notRecognizedField), 1);
    }
    const payload = {};
    for (const element of filteredData) {
        payload[element] = req.body[element];
    }
    try {
        const json = await options.prismaInstance[table].update({
            where: {
                [(0, dmmf_1.getPrimaryKey)(table)]: ids[0],
            },
            data: payload,
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
exports.default = update;
//# sourceMappingURL=update.js.map