"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto = require("crypto");
function encrypt(data, key) {
    const md5Key = crypto.createHash('md5').update(key).digest('hex').substr(0, 24);
    const cipher = crypto.createCipheriv('des-ede3', md5Key, '');
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}
exports.encrypt = encrypt;
function decrypt(data, key) {
    const md5Key = crypto.createHash('md5').update(key).digest('hex').substr(0, 24);
    const decipher = crypto.createDecipheriv('des-ede3', md5Key, '');
    let encrypted = decipher.update(data, 'base64', 'utf8');
    encrypted += decipher.final('utf8');
    return encrypted;
}
exports.decrypt = decrypt;
//# sourceMappingURL=TripleDES.js.map