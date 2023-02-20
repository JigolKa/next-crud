import * as crypto from "crypto";
import { Base64String, BlockSize, HexadecimalString, MD5Hash } from "..";

export class AES {
  IV: HexadecimalString;
  BS: BlockSize;
  key: MD5Hash;
  ratio: number;

  constructor(BS: BlockSize, key: MD5Hash) {
    this.key = key;

    this.BS = BS;
    this.ratio = this.BS * 0.125;

    this.IV = crypto.randomBytes(this.ratio).toString("hex");
  }

  encrypt(data: string): Base64String {
    let iv = crypto.randomBytes(16);
    let salt = crypto.randomBytes(16);
    let key = crypto.scryptSync(this.key, salt, this.ratio);

    let cipher = crypto.createCipheriv(`aes-${this.BS}-cbc`, key, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    return `${iv.toString("hex")}#${salt.toString("hex")}#${encrypted}`;
  }

  decrypt(text: Base64String): string {
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
