import { NextApiRequest } from "next"

export default function getEndpoint(req: NextApiRequest): string {
  return Object.keys(req.query)
    .map((k) => ({ k, v: req.query[k] }))
    .filter((v) => Array.isArray(v.v))[0].k
}
