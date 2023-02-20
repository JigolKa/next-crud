# Next Crud Automation

## What is Next Crud Automation ?

Next Crud Automation is an **api wrapper for Next.js and Prisma**

This library can be only be used **in a Next.js app** at the moment

## Getting started

The fastest way to get started is to create a new file in your **api folder**, and paste the following code:

```ts
// pages/api/[...crud].ts

import ApiWrapper from "@jigolka/next-crud";

import { PrismaClient } from "@prisma/client";

export default ApiWrapper({
  prismaInstance: new PrismaClient(),
});
```

Now this function will host the following routes:

- GET /api/`table`

- POST /api/`table`

- PATCH /api/`table`/`id`

- DELETE /api/`table`/`id`

### Note:

- `table` is the name of the table you want to access. **Lowercase only**

- `id` is the primary key of a record

# Examples

- **GET /api/user** will return a list of records of the user Model

- **PATCH /api/user/1** will update a row where it's primary key is 1

**TODO**: Proper documentation
