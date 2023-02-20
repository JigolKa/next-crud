import { Api, RoutePayloadObject } from "../../../types";
import { ActionOutput } from "..";
export default function create({ req }: RoutePayloadObject, { table, requiredFields }: Api.MethodArguments, options: Api.GlobalOptions, filter: Api.FilterOptions): Promise<ActionOutput>;
