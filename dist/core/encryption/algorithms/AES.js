"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AES = void 0;
const crypto = require("crypto");
class AES {
    constructor(BS, key) {
        this.key = key;
        this.BS = BS;
        this.ratio = this.BS * 0.125;
        this.IV = crypto.randomBytes(this.ratio).toString("hex");
    }
    encrypt(data) {
        let iv = crypto.randomBytes(16);
        let salt = crypto.randomBytes(16);
        let key = crypto.scryptSync(this.key, salt, this.ratio);
        let cipher = crypto.createCipheriv(`aes-${this.BS}-cbc`, key, iv);
        let encrypted = cipher.update(data, "utf8", "hex");
        encrypted += cipher.final("hex");
        return `${iv.toString("hex")}#${salt.toString("hex")}#${encrypted}`;
    }
    decrypt(text) {
        let [ivs, salts, data] = text.split("#");
        let iv = Buffer.from(ivs, "hex");
        let salt = Buffer.from(salts, "hex");
        let key = crypto.scryptSync(this.key, salt, this.ratio);
        let decipher = crypto.createDecipheriv(`aes-${this.BS}-cbc`, key, iv);
        let decrypted = decipher.update(data, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted.toString();
    }
}
exports.AES = AES;
//# sourceMappingURL=AES.js.map