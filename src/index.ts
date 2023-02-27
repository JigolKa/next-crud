// Typescript will throw a bunch of error since Prisma has not generated any types
//@ts-nocheck
import type { NextApiRequest, NextApiResponse } from "next"
import actionsFactory from "./core/routes"
import { Api, Method } from "./types"
import { getArguments } from "./helpers/actions"
import isBodyRequired from "./helpers/isBodyRequired"
import { Prisma } from "@prisma/client"
import { json } from "./helpers/url"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime"
import logging from "./helpers/logging"
import hideFields from "./core/features/hide"
import filter, { FilterError } from "./core/features/filter"
import auth from "./core/features/authentication"

// Typescript will throw a bunch of errors since Prisma has not generated any types

type Handler = (
  req: NextApiRequest,
  res: NextApiResponse<object[] | object>
) => Promise<void>

function ApiWrapper(options: Api.GlobalOptions): Handler {
  if (typeof (Prisma as any).dmmf === "undefined") {
    logging(
      "BgRed",
      "Prisma types are not generated. Please enter `npx prisma generate` to create new types."
    )
    throw new Error(
      "Prisma types are not generated. Please enter `npx prisma generate` to create new types."
    )
  }

  const dmmf = Prisma.dmmf

  return async (req: NextApiRequest, res: NextApiResponse) => {
    options.callbacks?.onRequest?.({ req, res })

    const { method } = req
    const url = req.url!.split("?")[0]

    if (!method || !url) return

    const args = getArguments(req)

    if (!args || !args.table) {
      logging("BgRed", "Invalid url arguments")

      return res
        .status(422)
        .json({ ...json(422), errorText: "Invalid url arguments" })
    }

    const currentTable = dmmf["datamodel"].models.filter(
      (v) => v.name.toLowerCase() === (args.table as string).toLowerCase()
    )[0]

    if (!currentTable) {
      logging("BgRed", `Table ${args.table} not found`)

      return res.status(404).json({
        ...json(404),
        errorText: "Table not found",
      })
    }

    if (isBodyRequired(method as Method)) {
      if (req.headers["content-type"] !== "application/json") {
        logging("BgRed", "Unsupported Media Type")
        return res.status(415).json({
          ...json(415),
          errorText: "Unsupported Media Type",
        })
      }

      if (!req.body) {
        logging("BgRed", "Malformed body")
        return res.status(400).json({
          ...json(400),
          errorText: "Malformed body",
        })
      }
    }

    const authResult = await auth(options, req)

    if (typeof authResult !== "boolean" && authResult.statusCode === 403) {
      return res.status(403).json({
        ...json(403),
        errorText: authResult.errorText,
      })
    }

    const extraOptions: Record<string, any> = options.models ?? {}

    const hiddenKeys: { table: string; key: string }[] = []
    const dontUpdateKeys: { table: string; key: string }[] = []

    for (const table of Object.keys(extraOptions)) {
      for (const key of Object.keys(extraOptions[table])) {
        const options = Object.keys(extraOptions[table][key])

        if (options.includes("hide")) {
          hiddenKeys.push({ table, key })
        }

        if (options.includes("freeze")) {
          dontUpdateKeys.push({ table, key })
        }
      }
    }

    const prismaFilter = filter({ currentTable: currentTable.name, req, args })

    if (prismaFilter.errorText) {
      return res.status((<FilterError>prismaFilter).status).json(prismaFilter)
    }

    // ^4.10.1

    const canBeUpdated = currentTable.fields
      .filter((v) => !v.default)
      .filter((v) => !v.isReadOnly)
      .filter((v) => !dontUpdateKeys.map((v) => v.key).includes(v.name))

    const listRelations = canBeUpdated
      .filter((v) => v.relationName && v.isList)
      .map((v) => v.name)

    const required = canBeUpdated
      .filter((v) => v.isRequired)
      .filter((v) => !listRelations.includes(v.name))
      .map((v) => ({
        name: v.name,
        type: v.type,
        isUnique: v.isUnique,
      }))

    try {
      const action = actionsFactory(
        method.toUpperCase() as Method,
        /^\/api\/[A-Za-z]+\/verify/g.test(url)
      )

      if (!action) {
        logging("BgRed", `Method ${method} not allowed`)

        return res
          .status(405)
          .json({ ...json(405), errorText: "Method not allowed." })
      }

      const response = await action(
        { req, res },
        { ...args, requiredFields: required, canBeUpdated },
        options,
        prismaFilter as Api.FilterOptions
      )

      let data =
        response.json instanceof Array
          ? [...response.json]
          : { ...(response.json as unknown as object) }

      data = hideFields(
        data,
        hiddenKeys.map((v) => v.key)
      )

      options.callbacks?.onSuccess?.(data)

      return res.status(response.statusCode).json({
        ...json(response.statusCode),
        ...(response.errorText ? { error: response.errorText } : {}),
        ...(data ? { data } : {}),
      })
    } catch (e) {
      const error = e as unknown as PrismaClientKnownRequestError
      options.callbacks?.onError?.(error)

      logging("BgRed", error)

      if ("meta" in error) {
        return res.status(500).json({
          ...json(500),
          url: url,
          data: {
            code: error.code,
            ...(typeof error === "object" ? error.meta : {}),
            reference: `https://www.prisma.io/docs/reference/api-reference/error-reference#${error.code.toLowerCase()}`,
          },
        })
      } else {
        return res.status(500).json({
          ...json(500),
          url: url,
          data: {
            ...error,
          },
        })
      }
    }
  }
}

export { ApiWrapper }
