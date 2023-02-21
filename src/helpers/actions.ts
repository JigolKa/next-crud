import { NextApiRequest } from "next"
import { Table } from "../types"
import getEndpoint from "./getEndpoint"
import logging from "./logging"

export interface ParsedArgs {
  table: Table
  id: string | number
}

export function getArguments(req: NextApiRequest): ParsedArgs | undefined {
  const args = req.query[getEndpoint(req)]

  if (!args || args.length === 0 || args.length > 2) return undefined

  logging("BgGreen", args)

  return {
    table: args[0] as Table,
    id: isNaN(Number(args.slice(1)))
      ? (args.slice(1) as string)
      : Number(args.slice(1)),
  }
}
