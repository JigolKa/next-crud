import omit = require("lodash.omit")

// Improved variant of https://github.com/odynvolk/omit-deep-lodash/
// Note: reduced bundle size by importing only lodash.omit rather
// than the whole library
export default function omitDeep(input: object, props: string[]): object {
  function omitDeepOnOwnProps(obj: object) {
    if (typeof input === "undefined") {
      return input
    }

    if (!Array.isArray(obj) && !isObject(obj)) {
      return obj
    }

    if (Array.isArray(obj)) {
      return omitDeep(obj, props)
    }

    const o: Record<string | number, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      o[key] = !isNil(value) ? omitDeep(value, props) : value
    }

    return omit(o, props)
  }

  if (arguments.length > 2) {
    props = Array.prototype.slice.call(arguments).slice(1)
  }

  if (Array.isArray(input)) {
    return input.map(omitDeepOnOwnProps)
  }

  return omitDeepOnOwnProps(input)
}

function isNil(value: unknown) {
  return value === null || value === undefined
}

function isObject(obj: unknown) {
  return Object.prototype.toString.call(obj) === "[object Object]"
}
