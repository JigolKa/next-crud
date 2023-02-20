import { Api, RoutePayloadObject, Table } from "../../../types";
import { getPrimaryKey } from "../../../helpers/dmmf";
import { ActionOutput } from "..";

export default async function del(
  _payload: RoutePayloadObject,
  { table, ids }: Api.MethodArguments,
  options: Api.GlobalOptions,
  filter: Api.FilterOptions
): Promise<ActionOutput> {
  if (ids.length < 0)
    return {
      statusCode: 422,
      errorText: "Missing required url arguments",
    };

  const json = await (options.prismaInstance[table as Table].delete as any)({
    where: {
      [getPrimaryKey(table)]: ids[0],
    },
    ...filter,
  });

  return {
    statusCode: 200,
    json,
  };
}
