import { ApiWrapper } from "../../../dist/"
import prisma from "prisma/instance"

export default ApiWrapper({
  prismaInstance: prisma,
  models: {
    user: {
      password: {
        encryption: "AES 256",
        hide: true,
      },
      isAdmin: {
        freeze: true,
        hide: true,
      },
    },
  },
  callbacks: {},
})
