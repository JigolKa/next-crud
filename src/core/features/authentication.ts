import { NextApiRequest } from "next"
import logging from "../../helpers/logging"
import { Api, Method } from "../../types"

export default async function auth(
  options: Api.GlobalOptions,
  req: NextApiRequest
) {
  if (options.authentication?.callback) {
    const regex = RegExp(options.authentication.matcher ?? /.*/gm)

    if (
      regex.test(req.url) &&
      (options.authentication.methods || ["POST", "PATCH", "DELETE"]).includes(
        req.method as Method
      ) &&
      !(options.authentication.ignoredRoutes || []).includes(req.url)
    ) {
      const callbackResult = await options.authentication.callback({ req })

      if (!callbackResult) {
        logging("BgRed", "Access forbidden")

        return {
          errorText: "Access forbidden",
          statusCode: 403,
        }
      }
    }
  }

  return true
}
