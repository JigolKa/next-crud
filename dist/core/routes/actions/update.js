"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dmmf_1 = require("../../../helpers/dmmf");
async function update({ req }, { table, id, canBeUpdated }, options, filter) {
    if (id) {
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
    const json = await options.prismaInstance[table].update({
        where: {
            [(0, dmmf_1.getPrimaryKey)(table)]: id,
        },
        data: payload,
        ...filter,
    });
    return {
        statusCode: 200,
        json,
    };
}
exports.default = update;
//# sourceMappingURL=update.js.map