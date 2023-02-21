import { Base64String, MD5Hash } from '..';
export declare function encrypt(data: string, key: MD5Hash): Base64String;
export declare function decrypt(data: Base64String, key: MD5Hash): string;
