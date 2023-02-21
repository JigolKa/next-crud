import { Api, Method, RouteContext } from "../../types";
export type ActionSignature = (request: RouteContext, args: Api.MethodContext, options: Api.GlobalOptions, filter: Api.FilterOptions) => Promise<ActionOutput>;
export type ActionOutput = {
    statusCode: number;
    json?: unknown;
    errorText?: string;
};
export default function actionsFactory(method: Method, _verify?: boolean): ActionSignature | null;
