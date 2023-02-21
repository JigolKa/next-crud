import { NextApiRequest } from "next";
import { Table } from "../types";
export interface ParsedArgs {
    table: Table;
    id: string | number;
}
export declare function getArguments(req: NextApiRequest): ParsedArgs | undefined;
