export default function deepExclude(obj: Record<any, any>, keys: string[]) {
  for (const key in obj) {
    const value = obj[key];
    const nestedKeys = Object.keys(value);

    if (keys.includes(key)) {
      delete obj[key];
    }

    for (const nestedKey of nestedKeys)
      if (typeof value === "object" && keys.includes(nestedKey)) {
        deepExclude(obj, keys);
      }
  }

  return obj;
}
