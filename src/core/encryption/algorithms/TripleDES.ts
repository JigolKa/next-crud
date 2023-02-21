import * as crypto from "crypto"
import { Base64String, MD5Hash } from ".."

export function encrypt(data: string, key: MD5Hash): Base64String {
  const md5Key = crypto
    .createHash("md5")
    .update(key)
    .digest("hex")
    .substr(0, 24)
  const cipher = crypto.createCipheriv("des-ede3", md5Key, "")

  let encrypted = cipher.update(data, "utf8", "base64")
  encrypted += cipher.final("base64")
  return encrypted
}

export function decrypt(data: Base64String, key: MD5Hash): string {
  const md5Key = crypto
    .createHash("md5")
    .update(key)
    .digest("hex")
    .substr(0, 24)
  const decipher = crypto.createDecipheriv("des-ede3", md5Key, "")

  let encrypted = decipher.update(data, "base64", "utf8")
  encrypted += decipher.final("utf8")
  return encrypted
}
