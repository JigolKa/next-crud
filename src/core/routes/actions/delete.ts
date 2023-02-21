import { Api, RouteContext, Table } from "../../../types"
import { getPrimaryKey } from "../../../helpers/dmmf"
import { ActionOutput } from ".."

export default async function del(
  _payload: RouteContext,
  { table, id }: Api.MethodContext,
  options: Api.GlobalOptions,
  filter: Api.FilterOptions
): Promise<ActionOutput> {
  if (id)
    return {
      statusCode: 422,
      errorText: "Missing required url arguments",
    }

  const json = await (options.prismaInstance[table as Table].delete as any)({
    where: {
      [getPrimaryKey(table)]: id,
    },
    ...filter,
  })

  return {
    statusCode: 200,
    json,
  }
}
