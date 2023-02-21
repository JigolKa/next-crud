import { SupportedEncryptionAlgorithms } from "../../types";
export declare function algorithms(algorithm: SupportedEncryptionAlgorithms, type: "encryption" | "decryption"): (v: string) => string;
export type MD5Hash = string;
export type Base64String = string;
export type BlockSize = 128 | 256;
export type DESType = "Simple" | "Triple";
export type HexadecimalString = string;
