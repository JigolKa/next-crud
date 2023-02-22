# Next Crud

![NPM version](https://img.shields.io/github/package-json/v/jigolka/next-crud?label=npm)
![License](https://img.shields.io/npm/l/@jigolka/next-crud)

## What is Next Crud ?

Next Crud is an api wrapper for **Next.js and Prisma** that handle automatically **CRUD endpoints**.

## Documenation

We do not have a documentation at this moment

## Getting started

`npm install @jigolka/next-crud`

Given this specific schema:

```sql
model User {
  id      String  @id @default(cuid())
  name    String
  email   String
}
```

Paste the following snippet to get you started:

```ts
// pages/api/[...crud].ts

import ApiWrapper from "@jigolka/next-crud"

import { PrismaClient } from "@prisma/client"

export default ApiWrapper({
  prismaInstance: new PrismaClient(),
})
```

This will generate these differents endpoints:

| Endpoint               | Description       |
| ---------------------- | ----------------- |
| GET `/api/user`        | Get all the users |
| GET `/api/user/[id]`   | Get one user      |
| POST `/api/user`       | Create one user   |
| PATCH `/api/user/[id]` | Update one user   |
| DELETE`/api/user/[id]` | Delete one user   |

## Contributing

Pull requests are welcome!
