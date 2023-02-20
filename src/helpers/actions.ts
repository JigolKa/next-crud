import { NextApiRequest } from "next";
import { Table } from "../types";
import getFilename from "./getFilename";

export interface ParsedArgs {
  table: Table;
  ids: string[];
}

export function getArguments(req: NextApiRequest): ParsedArgs | undefined {
  const args = req.query[getFilename()];

  if (!args || args.length === 0) return undefined;

  return typeof args === "string"
    ? {
        table: args as Table,
        ids: [],
      }
    : {
        table: args[0] as Table,
        ids: args.slice(1),
      };
}
