import { Api, RoutePayloadObject } from "../../../types";
import { ActionOutput } from "..";
export default function fetch(_payload: RoutePayloadObject, { table, ids }: Api.MethodArguments, options: Api.GlobalOptions, filter: Api.FilterOptions): Promise<ActionOutput>;
