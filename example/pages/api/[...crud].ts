import { ApiWrapper } from "../../../dist/"
import prisma from "prisma/instance"

export default ApiWrapper({
  prismaInstance: prisma,
  models: {
    post: {
      author: {
        hide: true,
        freeze: true,
      },
    },
  },
  callbacks: {
    onError: (error) => console.error(error),
    onRequest: ({ req, res }) => console.log({ req, res }),
    onSuccess: (data) => console.log("data: ", data),
  },
})
