import type { NextApiRequest, NextApiResponse } from "next";
import { Api } from "./types";
declare function ApiWrapper(options: Api.GlobalOptions): (req: NextApiRequest, res: NextApiResponse) => Promise<any>;
export { ApiWrapper };
