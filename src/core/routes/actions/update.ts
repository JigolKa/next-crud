import { Api, RoutePayloadObject, Table } from "../../../types";
import { getPrimaryKey } from "../../../helpers/dmmf";
import { ActionOutput } from "..";

export default async function update(
  { req }: RoutePayloadObject,
  { table, ids, canBeUpdated }: Api.MethodArguments,
  options: Api.GlobalOptions,
  filter: Api.FilterOptions
): Promise<ActionOutput> {
  if (ids.length < 0) {
    return {
      statusCode: 422,
      errorText: "Missing required url arguments",
    };
  }

  const canBeUpdatedArray = canBeUpdated.map((v) => v.name);
  const fieldsArray = Object.keys(req.body);
  const notRecognizedFields = fieldsArray.filter(
    (val) => !canBeUpdatedArray.includes(val)
  );

  const filteredData = [...fieldsArray];

  for (const notRecognizedField of notRecognizedFields) {
    filteredData.splice(filteredData.indexOf(notRecognizedField), 1);
  }

  const payload: { [key: string]: any } = {};

  for (const element of filteredData) {
    payload[element] = req.body[element];
  }

  try {
    const json = await (options.prismaInstance[table as Table].update as any)({
      where: {
        [getPrimaryKey(table)]: ids[0],
      },
      data: payload,
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
