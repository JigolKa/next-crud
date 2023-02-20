import { Base64String, BlockSize, HexadecimalString, MD5Hash } from "..";
export declare class AES {
    IV: HexadecimalString;
    BS: BlockSize;
    key: MD5Hash;
    ratio: number;
    constructor(BS: BlockSize, key: MD5Hash);
    encrypt(data: string): Base64String;
    decrypt(text: Base64String): string;
}
