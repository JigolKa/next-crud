import { Api, RouteContext } from "../../../types";
import { ActionOutput } from "..";
export default function update({ req }: RouteContext, { table, id, canBeUpdated }: Api.MethodContext, options: Api.GlobalOptions, filter: Api.FilterOptions): Promise<ActionOutput>;
