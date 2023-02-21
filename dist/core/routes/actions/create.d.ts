import { Api, RouteContext } from "../../../types";
import { ActionOutput } from "..";
export default function create({ req }: RouteContext, { table, requiredFields }: Api.MethodContext, options: Api.GlobalOptions, filter: Api.FilterOptions): Promise<ActionOutput>;
