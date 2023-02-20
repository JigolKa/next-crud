import { ActionOutput } from "..";
import { Api, RoutePayloadObject } from "../../../types";
export default function verify({ req }: RoutePayloadObject, { table: _table }: Api.MethodArguments, options: Api.GlobalOptions): Promise<ActionOutput>;
