"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const encryption_1 = require("../../encryption");
async function verify({ req }, { table: _table }, options) {
    const { tables } = options;
    const table = tables?.[_table];
    if (!tables || !table)
        return { statusCode: 404, errorText: "Not found" };
    const encryptedFields = Object.keys(table);
    for (let i = 0; i < Object.keys(req.body).length; i++) {
        const key = Object.keys(req.body)[i];
        if (!encryptedFields.includes(key))
            return {
                statusCode: 422,
                errorText: "Key not recognized",
            };
    }
    const payload = {};
    for (const v of encryptedFields) {
        try {
            let decrypted;
            const encryptionAlgorithm = table[v]["encryption"];
            if (typeof encryptionAlgorithm === "string") {
                decrypted = (0, encryption_1.algorithms)(encryptionAlgorithm, "decryption")(req.body[v]);
            }
            else {
                const decrypt = encryptionAlgorithm["encrypt"];
                if (!decrypt) {
                    throw new Error("Decryption method not set");
                }
                decrypted = decrypt(payload[v]);
            }
            payload[v] = decrypted;
        }
        catch (error) {
            return {
                statusCode: 500,
                json: error,
                errorText: "An error occured during the decryption",
            };
        }
    }
    return {
        statusCode: 200,
        json: payload,
    };
}
exports.default = verify;
//# sourceMappingURL=verify.js.map