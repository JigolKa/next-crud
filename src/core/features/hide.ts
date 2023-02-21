import omitDeep from "../../helpers/exclude";

export default function hideFields(
  data: object | object[],
  hiddenKeys: string[]
) {
  if (data instanceof Array) {
    for (let i = 0; i < data.length; i++) {
      const v = omitDeep(data[i], hiddenKeys);

      data[i] = v;
    }
  } else if (typeof data === "object") {
    const v = { ...data };

    data = omitDeep(v, hiddenKeys);
  }

  return data;
}
