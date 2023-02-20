import { Api, RoutePayloadObject } from "../../../types";
import { ActionOutput } from "..";
export default function update({ req }: RoutePayloadObject, { table, ids, canBeUpdated }: Api.MethodArguments, options: Api.GlobalOptions, filter: Api.FilterOptions): Promise<ActionOutput>;
