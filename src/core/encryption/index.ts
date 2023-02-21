import logging from "../../helpers/logging";
import { SupportedEncryptionAlgorithms } from "../../types";
import { AES } from "./algorithms/AES";
import { decrypt, encrypt } from "./algorithms/TripleDES";

export function algorithms(
  algorithm: SupportedEncryptionAlgorithms,
  type: "encryption" | "decryption"
  // eslint-disable-next-line
): (v: string) => string {
  const key = process.env["MD5_HASH"];

  if (!key) {
    logging("BgRed", "MD5_HASH not defined in environnement variables.");
    throw new Error("MD5_HASH not defined in environnement variables.");
  }

  const methods: Record<
    SupportedEncryptionAlgorithms,
    // eslint-disable-next-line
    Record<"encryption" | "decryption", (v: string) => string>
  > = {
    "AES 128": {
      decryption: (v) => new AES(128, key).decrypt(v),
      encryption: (v) => new AES(128, key).encrypt(v),
    },
    "AES 256": {
      decryption: (v) => new AES(256, key).decrypt(v),
      encryption: (v) => new AES(256, key).encrypt(v),
    },
    "Triple DES": {
      decryption: (v) => decrypt(v, key),
      encryption: (v) => encrypt(v, key),
    },
  };

  return methods[algorithm][type];
}

export type MD5Hash = string;
export type Base64String = string;
export type BlockSize = 128 | 256;
export type DESType = "Simple" | "Triple";
export type HexadecimalString = string;
