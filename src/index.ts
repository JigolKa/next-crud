// Typescript will throw a bunch of errors since Prisma has not generated any types
// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from "next";
import actionsFactory from "./core/routes";
import { Api, Method } from "./types";
import { getArguments } from "./helpers/actions";
import isBodyRequired from "./helpers/isBodyRequired";
import { Prisma } from "@prisma/client";
import { json } from "./helpers/url";
import getFilename from "./helpers/getFilename";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import omitDeep from "./helpers/exclude";

function ApiWrapper(options: Api.GlobalOptions) {
  if (typeof Prisma["dmmf"] === "undefined") {
    throw new Error(
      "Prisma types are not generated. Please enter `npx prisma generate` to create new types."
    );
  }

  const dmmf = Prisma.dmmf;

  return async (req: NextApiRequest, res: NextApiResponse) => {
    options.callbacks?.onRequest?.({ req, res });

    const { method } = req;
    const url = req.url!.split("?")[0];

    if (!method || !url) return;

    if (isBodyRequired(method as Method)) {
      if (req.headers["content-type"] !== "application/json") {
        return res.status(415).json({
          ...json(415),
          errorText: "Unsupported Media Type",
        });
      }

      if (!req.body) {
        return res.status(400).json({
          ...json(400),
          errorText: "Malformed body",
        });
      }
    }

    if (options.authentication?.callback) {
      const regex = RegExp(options.authentication.matcher ?? /.*/gm);

      if (
        regex.test(url) &&
        (
          options.authentication.methods || ["POST", "PATCH", "DELETE"]
        ).includes(method as Method) &&
        !(options.authentication.ignoredRoutes || []).includes(url)
      ) {
        const callbackResult = await options.authentication.callback({ req });

        if (!callbackResult)
          return res
            .status(403)
            .json({ ...json(403), errorText: "Access forbidden" });
      }
    }

    const args = getArguments(req);

    if (!args || !args.table)
      return res
        .status(422)
        .json({ ...json(422), errorText: "Missing required url arguments" });

    const extraOptions: Record<string, any> = options.tables ?? {};

    const hiddenKeys: { table: string; key: string }[] = [];
    const dontUpdateKeys: { table: string; key: string }[] = [];

    for (const table of Object.keys(extraOptions)) {
      for (const key of Object.keys(extraOptions[table])) {
        const options = Object.keys(extraOptions[table][key]);

        if (options.includes("hide")) {
          hiddenKeys.push({ table, key });
        }

        if (options.includes("dontUpdate")) {
          dontUpdateKeys.push({ table, key });
        }
      }
    }

    const prismaArgs = { ...req.query };
    const prismaPayload: Api.FilterOptions = {};
    delete prismaArgs[getFilename()];

    // const tableKeys = getKeys(args.table);

    for (const filter of Object.keys(prismaArgs)) {
      if (!["include", "select", "skip", "take"].includes(filter)) continue;

      const arg = req.query[filter] as string;
      let obj: Record<string, boolean | object> | number = {};

      if (["include", "select"].includes(filter)) {
        for (const _key of arg.split(",")) {
          let data: object | boolean = true;
          const parts = _key.split(".");

          if (parts.length > 1) {
            data = {
              [filter]: {
                [parts[1]]: true,
              },
            };
          }

          //TODO: decomment and fix

          // if (!tableKeys.includes(key)) continue;

          obj[parts[0]] = data;
        }
      } else {
        if (!isNaN(Number(arg))) {
          obj = Number(arg);
        } else {
          continue;
        }
      }

      prismaPayload[filter] = obj;
    }

    if (
      Object.keys(prismaPayload).includes("include") &&
      Object.keys(prismaPayload).includes("select")
    ) {
      return res.status(422).json({
        ...json(422),
        data: "Your query cannot contain the select and the include filter. You have to take only one",
      });
    }

    // ^4.10.1

    const canBeUpdated = dmmf["datamodel"].models
      .filter(
        (v) => v.name.toLowerCase() === (args.table as string).toLowerCase()
      )[0]
      .fields.filter((v) => !v.default)
      .filter((v) => !v.isReadOnly)
      .filter((v) => !dontUpdateKeys.map((v) => v.key).includes(v.name));

    const listRelations = canBeUpdated
      .filter((v) => v.relationName && v.isList)
      .map((v) => v.name);

    const required = canBeUpdated
      .filter((v) => v.isRequired)
      .filter((v) => !listRelations.includes(v.name))
      .map((v) => ({
        name: v.name,
        type: v.type,
        isUnique: v.isUnique,
      }));

    try {
      const action = actionsFactory(
        method.toUpperCase() as Method,
        /^\/api\/[A-Za-z]+\/verify/g.test(url)
      );

      if (!action)
        return res
          .status(405)
          .json({ ...json(405), errorText: "Method not allowed." });

      const response = await action(
        { req, res },
        { ...args, requiredFields: required, canBeUpdated },
        options,
        prismaPayload
      );

      let data =
        response.json instanceof Array
          ? [...response.json]
          : { ...(response.json as unknown as object) };

      if (data instanceof Array) {
        for (let i = 0; i < data.length; i++) {
          const v = omitDeep(
            data[i],
            hiddenKeys.map((v) => v.key)
          );

          data[i] = v;
        }
      } else if (typeof data === "object") {
        const v = { ...data };

        data = omitDeep(
          v,
          hiddenKeys.map((v) => v.key)
        );
      }

      options.callbacks?.onSuccess?.(data);
      return res.status(response.statusCode).json({
        ...json(response.statusCode),
        ...(response.errorText ? { error: response.errorText } : {}),
        ...(data ? { data } : {}),
      });
    } catch (e) {
      const error = e as unknown as PrismaClientKnownRequestError;
      options.callbacks?.onError?.(error);

      if ("meta" in error) {
        return res.status(500).json({
          ...json(500),
          url: url,
          data: {
            code: error.code,
            ...(typeof error === "object" ? error.meta : {}),
            reference: `https://www.prisma.io/docs/reference/api-reference/error-reference#${error.code.toLowerCase()}`,
          },
        });
      } else {
        return res.status(500).json({
          ...json(500),
          url: url,
          data: {
            ...error,
          },
        });
      }
    }
  };
}

export { ApiWrapper };
