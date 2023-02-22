import prisma from "./instance"
import { faker } from "@faker-js/faker"

export default async function seedDatabase() {
  for (let i = 0; i < 10; i++) {
    await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.name.firstName(),
      },
    })
  }

  for (let i = 0; i < 10; i++) {
    await prisma.post.create({
      data: {
        author: {
          connect: {
            id: Math.floor(Math.random() * 9) + 1,
          },
        },
        content: faker.lorem.lines(Math.floor(Math.random() * 5) + 5),
      },
    })
  }

  for (let i = 0; i < 10; i++) {
    await prisma.comment.create({
      data: {
        author: {
          connect: {
            id: Math.floor(Math.random() * 9) + 1,
          },
        },
        post: {
          connect: {
            id: Math.floor(Math.random() * 9) + 1,
          },
        },
        content: faker.lorem.lines(Math.floor(Math.random() * 5) + 5),
      },
    })
  }
}

seedDatabase()
