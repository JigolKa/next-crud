import { Api, RouteContext, Table } from "../../../types"
import { getPrimaryKey } from "../../../helpers/dmmf"
import { ActionOutput } from ".."

export default async function update(
  { req }: RouteContext,
  { table, id, canBeUpdated }: Api.MethodContext,
  options: Api.GlobalOptions,
  filter: Api.FilterOptions
): Promise<ActionOutput> {
  if (id) {
    return {
      statusCode: 422,
      errorText: "Missing required url arguments",
    }
  }

  const canBeUpdatedArray = canBeUpdated.map((v) => v.name)
  const fieldsArray = Object.keys(req.body)
  const notRecognizedFields = fieldsArray.filter(
    (val) => !canBeUpdatedArray.includes(val)
  )

  const filteredData = [...fieldsArray]

  for (const notRecognizedField of notRecognizedFields) {
    filteredData.splice(filteredData.indexOf(notRecognizedField), 1)
  }

  const payload: { [key: string]: any } = {}

  for (const element of filteredData) {
    payload[element] = req.body[element]
  }

  const json = await (options.prismaInstance[table as Table].update as any)({
    where: {
      [getPrimaryKey(table)]: id,
    },
    data: payload,
    ...filter,
  })

  return {
    statusCode: 200,
    json,
  }
}
