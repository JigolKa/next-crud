import { Api, RouteContext } from "../../../types";
import { ActionOutput } from "..";
export default function fetch(_payload: RouteContext, { table, id }: Api.MethodContext, options: Api.GlobalOptions, filter: Api.FilterOptions): Promise<ActionOutput>;
