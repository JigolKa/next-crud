import { Api, Method, RoutePayloadObject } from "../../types";
export type ActionSignature = (request: RoutePayloadObject, args: Api.MethodArguments, options: Api.GlobalOptions, filter: Api.FilterOptions) => Promise<ActionOutput>;
export type ActionOutput = {
    statusCode: number;
    json?: unknown;
    errorText?: string;
};
export default function actionsFactory(method: Method, _verify?: boolean): ActionSignature | null;
