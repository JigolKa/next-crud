import type { NextApiRequest, NextApiResponse } from "next";
import actionsFactory from "./core/routes";
import { Api, Method, Table } from "./types";
import { getArguments } from "./helpers/actions";
import isBodyRequired from "./helpers/isBodyRequired";
import { Prisma } from "@prisma/client";
import { json } from "./helpers/url";
import getEndpoint from "./helpers/getEndpoint";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import omitDeep from "./helpers/exclude";
import { getKeys, getRelationKeys } from "./helpers/dmmf";
import logging, { loggingColors } from "./helpers/logging";

// Typescript will throw a bunch of errors since Prisma has not generated any types

type Handler = (
  req: NextApiRequest,
  res: NextApiResponse<object[] | object>
) => Promise<void>;

function ApiWrapper(options: Api.GlobalOptions): Handler {
  if (typeof Prisma["dmmf"] === "undefined") {
    logging(
      "BgRed",
      "Prisma types are not generated. Please enter `npx prisma generate` to create new types."
    );
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

    const args = getArguments(req);

    if (!args || !args.table) {
      logging("BgRed", "Invalid url arguments");

      return res
        .status(422)
        .json({ ...json(422), errorText: "Invalid url arguments" });
    }

    const currentTable = dmmf["datamodel"].models.filter(
      (v) => v.name.toLowerCase() === (args.table as string).toLowerCase()
    )[0];

    if (!currentTable) {
      logging("BgRed", `Table ${args.table} not found`);

      return res.status(404).json({
        ...json(404),
        errorText: "Table not found",
      });
    }

    if (isBodyRequired(method as Method)) {
      if (req.headers["content-type"] !== "application/json") {
        logging("BgRed", "Unsupported Media Type");
        return res.status(415).json({
          ...json(415),
          errorText: "Unsupported Media Type",
        });
      }

      if (!req.body) {
        logging("BgRed", "Malformed body");
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

        if (!callbackResult) {
          logging("BgRed", "Access forbidden");

          return res
            .status(403)
            .json({ ...json(403), errorText: "Access forbidden" });
        }
      }
    }

    const extraOptions: Record<string, any> = options.extraOptions ?? {};

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
    delete prismaArgs[getEndpoint(req)];

    const tableKeys = getKeys(args.table);

    for (const filter of Object.keys(prismaArgs)) {
      if (!["include", "select", "skip", "take"].includes(filter)) continue;

      const arg = req.query[filter] as string;
      let obj: Record<string, boolean | object> | number = {};

      if (["include", "select"].includes(filter)) {
        for (const _key of arg.split(",")) {
          const parts = _key.split(".");
          if (!tableKeys.includes(parts[parts.length - 1])) {
            logging(
              "BgRed",
              "Key `" +
                parts[parts.length - 1] +
                "` not found on table " +
                currentTable.name
            );
            return res.status(404).json({
              ...json(404),
              errorText:
                "Key `" +
                parts[parts.length - 1] +
                "` not found on table " +
                currentTable.name,
            });
          }

          if (
            filter === "include" &&
            !getRelationKeys(currentTable.name.toLowerCase() as Table).includes(
              _key
            )
          ) {
            logging(
              "BgRed",
              "The include filter only accepts fields with a relation"
            );

            return res.status(422).json({
              ...json(422),
              errorText:
                "The include filter only accepts fields with a relation",
            });
          }

          let data: object | boolean = true;

          if (parts.length > 1) {
            data = {
              [filter]: {
                [parts[1]]: true,
              },
            };
          }

          //TODO: decomment and fix

          obj[parts[0]] = data;
        }
      } else {
        if (!isNaN(Number(arg))) {
          obj = Number(arg) || 1;
        } else {
          continue;
        }
      }

      prismaPayload[filter] = obj;
    }

    console.log(prismaPayload);

    if (
      Object.keys(prismaPayload).includes("include") &&
      Object.keys(prismaPayload).includes("select")
    ) {
      logging(
        "BgRed",
        "Your query cannot contain the select and the include filter. You have to take only one"
      );
      return res.status(422).json({
        ...json(422),
        data: "Your query cannot contain the select and the include filter. You have to take only one",
      });
    }

    // ^4.10.1

    const canBeUpdated = currentTable.fields
      .filter((v) => !v.default)
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

      if (!action) {
        logging("BgRed", `Method ${method} not allowed`);

        return res
          .status(405)
          .json({ ...json(405), errorText: "Method not allowed." });
      }

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

      logging("BgRed", error);

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
