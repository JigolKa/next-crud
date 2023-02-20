import { Api, RoutePayloadObject } from "../../../types";
import { getPrimaryKey } from "../../../helpers/dmmf";
import { ActionOutput } from "..";

export default async function fetch(
  _payload: RoutePayloadObject,
  { table, ids }: Api.MethodArguments,
  options: Api.GlobalOptions,
  filter: Api.FilterOptions
): Promise<ActionOutput> {
  if (ids.length >= 1) {
    return {
      statusCode: 200,
      json: await (options.prismaInstance[table].findFirst as any)({
        where: {
          [getPrimaryKey(table)]: ids[0],
        },
        ...filter,
      }),
    };
  }

  if (
    typeof options.disableGlobalFetching === "boolean" ||
    typeof options.disableGlobalFetching?.[table] !== "undefined"
  ) {
    const statusCode =
      typeof options.disableGlobalFetching === "object"
        ? options.disableGlobalFetching[table]?.statusCodeToReturn ?? 404
        : 404;

    const errorText =
      typeof options.disableGlobalFetching === "object"
        ? options.disableGlobalFetching[table]?.message ?? "Not found"
        : "Not found";

    return {
      statusCode,
      errorText,
    };
  }

  try {
    const json = await (options.prismaInstance[table].findMany as any)({
      ...filter,
    });
    return {
      statusCode: 200,
      json,
    };
  } catch (error) {
    return {
      statusCode: 500,
      errorText: "An unexpected error occured",
      json: (error as unknown as any).meta,
    };
  }
}
