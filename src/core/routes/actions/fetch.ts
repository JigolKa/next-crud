import { Api, RouteContext } from "../../../types"
import { getPrimaryKey } from "../../../helpers/dmmf"
import { ActionOutput } from ".."

export default async function fetch(
  _payload: RouteContext,
  { table, id }: Api.MethodContext,
  options: Api.GlobalOptions,
  filter: Api.FilterOptions
): Promise<ActionOutput> {
  if (id) {
    return {
      statusCode: 200,
      json: await (options.prismaInstance[table].findFirst as any)({
        where: {
          [getPrimaryKey(table)]: id,
        },
        ...filter,
      }),
    }
  }

  if (
    typeof options.disableGlobalFetching === "boolean" ||
    typeof options.disableGlobalFetching?.[table] !== "undefined"
  ) {
    const statusCode =
      typeof options.disableGlobalFetching === "object"
        ? options.disableGlobalFetching[table]?.statusCodeToReturn ?? 404
        : 404

    const errorText =
      typeof options.disableGlobalFetching === "object"
        ? options.disableGlobalFetching[table]?.message ?? "Not found"
        : "Not found"

    return {
      statusCode,
      errorText,
    }
  }

  const json = await (options.prismaInstance[table].findMany as any)({
    ...filter,
  })
  return {
    statusCode: 200,
    json,
  }
}
