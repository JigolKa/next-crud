import { Prisma } from "@prisma/client";
import { Table } from "../types";

export function getPrimaryKey(table: Table): string {
  return (
    Prisma.dmmf.datamodel.models
      // we want the first result
      .filter((v) => v.name.toLowerCase() === table.toLowerCase())[0]
      // there is only one ID field so the first one is the right one
      .fields.filter((v) => v.isId)[0].name
  );
}

export function getKeys(table: Table) {
  return Prisma.dmmf.datamodel.models
    .filter((v) => v.name.toLowerCase() === table.toLowerCase())[0]
    .fields.map((v) => v.name);
}

export function getRelationKeys(table: Table) {
  return Prisma.dmmf.datamodel.models
    .filter((v) => v.name.toLowerCase() === table.toLowerCase())[0]
    .fields.filter((v) => v.relationName)
    .map((v) => v.name);
}
