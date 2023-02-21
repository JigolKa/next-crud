import type { NextApiRequest, NextApiResponse } from "next";
import { Api } from "./types";
type Handler = (req: NextApiRequest, res: NextApiResponse<object[] | object>) => Promise<void>;
declare function ApiWrapper(options: Api.GlobalOptions): Handler;
export { ApiWrapper };
