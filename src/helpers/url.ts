export function getJsonFromUrl(url: string) {
  if (!url) url = location.search
  var query = url.substr(1)
  var result: Record<string, any> = {}
  query.split("&").forEach(function (part) {
    var item = part.split("=")
    result[item[0]] = decodeURIComponent(item[1])
  })
  return result
}

export const json = (v: number) => {
  const date = new Date()

  return {
    status: v,
    timestamp: date,
  }
}
