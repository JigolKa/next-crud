import { NextApiRequest } from "next";
import { Table } from "../types";
export interface ParsedArgs {
    table: Table;
    ids: string[];
}
export declare function getArguments(req: NextApiRequest): ParsedArgs | undefined;
