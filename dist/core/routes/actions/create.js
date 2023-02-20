"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const encryption_1 = require("../../encryption");
async function create({ req }, { table, requiredFields }, options, filter) {
    const requiredFieldsArray = requiredFields.map((v) => v.name);
    const fieldsArray = Object.keys(req.body);
    const notRecognizedFields = fieldsArray.filter((val) => !requiredFieldsArray.includes(val));
    const filteredData = [...fieldsArray];
    for (const notRecognizedField of notRecognizedFields)
        filteredData.splice(filteredData.indexOf(notRecognizedField), 1);
    for (const key of requiredFieldsArray) {
        if (!filteredData.includes(key)) {
            return {
                statusCode: 422,
                errorText: "Missing required fields",
            };
        }
    }
    const payload = {};
    for (const element of filteredData) {
        const obj = req.body[element];
        payload[element] = obj ? obj : undefined;
    }
    const tables = options.tables;
    const _table = tables?.[table];
    if (tables && _table) {
        const encryptedFields = Object.keys(_table)
            .map((k) => ({
            encryption: _table[k].encryption ?? null,
            key: k,
        }))
            .filter((v) => v.encryption);
        for (const v of encryptedFields) {
            if (!v.encryption)
                continue;
            let field;
            if (typeof v.encryption === "string") {
                field = (0, encryption_1.algorithms)(v.encryption, "encryption")(payload[v.key]);
            }
            else {
                const encrypt = v.encryption["encrypt"];
                if (!encrypt) {
                    throw new Error("Encryption method not set");
                }
                field = encrypt(payload[v.key]);
            }
            payload[v.key] = field;
        }
    }
    return {
        statusCode: 200,
        json: await options.prismaInstance[table].create({
            data: payload,
            ...filter,
        }),
    };
}
exports.default = create;
//# sourceMappingURL=create.js.map