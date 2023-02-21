import { Api, RouteContext, Table } from "../../../types"
import { algorithms } from "../../encryption"
import { ActionOutput } from ".."
import logging from "../../../helpers/logging"

export default async function create(
  { req }: RouteContext,
  { table, requiredFields }: Api.MethodContext,
  options: Api.GlobalOptions,
  filter: Api.FilterOptions
): Promise<ActionOutput> {
  const requiredFieldsArray = requiredFields.map((v) => v.name)
  const fieldsArray = Object.keys(req.body)
  const notRecognizedFields = fieldsArray.filter(
    (val) => !requiredFieldsArray.includes(val)
  )

  const filteredData = [...fieldsArray]

  for (const notRecognizedField of notRecognizedFields)
    filteredData.splice(filteredData.indexOf(notRecognizedField), 1)

  for (const key of requiredFieldsArray) {
    if (!filteredData.includes(key)) {
      return {
        statusCode: 422,
        errorText: "Missing required fields",
      }
    }
  }

  const payload: { [key: string]: any } = {}

  for (const element of filteredData) {
    const obj = req.body[element]

    payload[element] = obj ? obj : undefined
  }

  const tables = options.extraOptions
  const _table = tables?.[table]

  if (tables && _table) {
    const encryptedFields = Object.keys(_table)
      .map((k) => ({
        encryption:
          (_table as Record<string, Api.RowOptions>)[k].encryption ?? null,
        key: k,
      }))
      .filter((v) => v.encryption)

    for (const v of encryptedFields) {
      if (!v.encryption) continue

      let field

      if (typeof v.encryption === "string") {
        field = algorithms(v.encryption, "encryption")(payload[v.key])
      } else {
        const encrypt = v.encryption["encrypt"]

        if (!encrypt) {
          logging("BgRed", "Encryption method not set")
          throw new Error("Encryption method not set")
        }

        field = encrypt(payload[v.key])
      }

      payload[v.key] = field
    }
  }

  return {
    statusCode: 200,
    json: await (options.prismaInstance[table as Table].create as any)({
      data: payload,
      ...filter,
    }),
  }
}
