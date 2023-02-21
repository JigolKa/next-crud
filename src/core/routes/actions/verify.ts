import { ActionOutput } from "..";
import logging from "../../../helpers/logging";
import {
  Api,
  RouteContext,
  SupportedEncryptionAlgorithms,
} from "../../../types";
import { algorithms } from "../../encryption";

export default async function verify(
  { req }: RouteContext,
  { table: _table }: Api.MethodContext,
  options: Api.GlobalOptions
): Promise<ActionOutput> {
  const { extraOptions } = options;
  const table = extraOptions?.[_table];
  if (!extraOptions || !table)
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

  const payload: Record<string, string> = {};

  for (const v of encryptedFields) {
    try {
      let decrypted;
      const encryptionAlgorithm = (table as any)[v]["encryption"];

      if (typeof encryptionAlgorithm === "string") {
        decrypted = algorithms(
          encryptionAlgorithm as SupportedEncryptionAlgorithms,
          "decryption"
        )(req.body[v]);
      } else {
        const decrypt = encryptionAlgorithm["encrypt"];

        if (!decrypt) {
          logging("BgRed", "Decryption method not set");
          throw new Error("Decryption method not set");
        }

        decrypted = decrypt(payload[v]);
      }

      payload[v] = decrypted;
    } catch (error) {
      return {
        statusCode: 500,
        json: error as unknown as object,
        errorText: "An error occured during the decryption",
      };
    }
  }

  return {
    statusCode: 200,
    json: payload,
  };
}
