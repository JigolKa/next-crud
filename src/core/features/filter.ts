import { NextApiRequest } from "next"
import { ParsedArgs } from "../../helpers/actions"
import { getKeys, getModels, getRelationKeys } from "../../helpers/dmmf"
import getEndpoint from "../../helpers/getEndpoint"
import logging from "../../helpers/logging"
import capitalize from "../../helpers/string"
import { json } from "../../helpers/url"
import { Api, Table } from "../../types"

export type FilterContext = {
  currentTable: string
  req: NextApiRequest
  args: ParsedArgs
}

export type FilterError = ReturnType<typeof json> & { errorText: string }

export default function filter({
  currentTable,
  req,
  args,
}: FilterContext): Api.FilterOptions | FilterError {
  const queryArguments = { ...req.query }
  const prismaFilter: Api.FilterOptions = {}
  delete queryArguments[getEndpoint(req)]

  for (const filter of Object.keys(queryArguments)) {
    if (!["include", "select", "skip", "take"].includes(filter)) continue

    const query = req.query[filter] as string
    let obj: Record<string, boolean | object> | number = {}

    if (["include", "select"].includes(filter)) {
      for (const key of query.split(",")) {
        if (!key) continue

        const parts = key.split(".")

        if (parts.length > 2)
          return {
            ...json(422),
            errorText: "3 levels deep relations are not supported",
          }

        const table =
          parts.length === 1
            ? args.table
            : (getModels()
                .filter((v) =>
                  parts[parts.length - 2].includes(v.toLowerCase())
                )[0]
                .toLowerCase() as Table)

        logging("BgGreen", "key:", key, "model:", table)

        if (!getKeys(table).includes(parts[parts.length - 1])) {
          logging(
            "BgRed",
            "Key `" +
              parts[parts.length - 1] +
              "` not found on model " +
              capitalize(table)
          )
          return {
            ...json(404),
            errorText:
              "Key `" +
              parts[parts.length - 1] +
              "` not found on model " +
              capitalize(table),
          }
        }

        if (
          filter === "include" &&
          !getRelationKeys(currentTable.toLowerCase() as Table).includes(key)
        ) {
          logging(
            "BgRed",
            "The include filter only accepts fields with a relation"
          )

          return {
            ...json(422),
            errorText: "The include filter only accepts fields with a relation",
          }
        }

        let data: object | boolean = true

        if (parts.length > 1) {
          data = {
            [filter]: {
              [parts[1]]: true,
            },
          }
        }

        //TODO: decomment and fix

        obj[parts[0]] = data
      }
    } else {
      if (!isNaN(Number(query))) {
        obj = Math.abs(Number(query)) || 1
      } else {
        continue
      }
    }

    prismaFilter[filter] = obj
  }

  if (
    Object.keys(prismaFilter).includes("include") &&
    Object.keys(prismaFilter).includes("select")
  ) {
    logging(
      "BgRed",
      "Your query cannot contain the select and the include filter. You have to take only one"
    )
    return {
      ...json(422),
      errorText:
        "Your query cannot contain the select and the include filter. You have to take only one",
    }
  }

  return prismaFilter
}
