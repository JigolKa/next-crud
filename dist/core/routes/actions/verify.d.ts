import { ActionOutput } from "..";
import { Api, RouteContext } from "../../../types";
export default function verify({ req }: RouteContext, { table: _table }: Api.MethodContext, options: Api.GlobalOptions): Promise<ActionOutput>;
