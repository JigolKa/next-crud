/* eslint-disable no-unused-vars */

import { Api, Method, RouteContext } from "../../types";
import del from "./actions/delete";
import fetch from "./actions/fetch";
import update from "./actions/update";
import create from "./actions/create";
import verify from "./actions/verify";

export type ActionSignature = (
  request: RouteContext,
  args: Api.MethodContext,
  options: Api.GlobalOptions,
  filter: Api.FilterOptions
) => Promise<ActionOutput>;

export type ActionOutput = {
  statusCode: number;
  json?: unknown;
  errorText?: string;
};

export default function actionsFactory(
  method: Method,
  _verify: boolean = false
): ActionSignature | null {
  const functions: Record<Method, ActionSignature> = {
    GET: fetch,
    POST: create,
    PATCH: update,
    DELETE: del,
  };

  if (_verify) return method === "POST" ? verify : null;

  if (!functions[method]) return null;

  return functions[method];
}
