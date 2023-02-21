import { Method } from "../types"

export default function isBodyRequired(method: Method) {
  const bodyRequired: Record<Method, boolean> = {
    DELETE: false,
    GET: false,
    POST: true,
    PATCH: true,
  }

  return bodyRequired[method]
}
