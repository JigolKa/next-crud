"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.algorithms = void 0;
const AES_1 = require("./algorithms/AES");
const TripleDES_1 = require("./algorithms/TripleDES");
function algorithms(algorithm, type
// eslint-disable-next-line
) {
    const key = process.env["MD5_HASH"];
    if (!key)
        throw new Error("MD5_HASH not defined in environnement variables.");
    const methods = {
        "AES 128": {
            decryption: (v) => new AES_1.AES(128, key).decrypt(v),
            encryption: (v) => new AES_1.AES(128, key).encrypt(v),
        },
        "AES 256": {
            decryption: (v) => new AES_1.AES(256, key).decrypt(v),
            encryption: (v) => new AES_1.AES(256, key).encrypt(v),
        },
        "Triple DES": {
            decryption: (v) => (0, TripleDES_1.decrypt)(v, key),
            encryption: (v) => (0, TripleDES_1.encrypt)(v, key),
        },
    };
    return methods[algorithm][type];
}
exports.algorithms = algorithms;
//# sourceMappingURL=index.js.map