/// <reference types="cypress" />

describe("GET /api/user?select=password", () => {
  it("should not contain the `password` field", (done) => {
    cy.request("/api/user?select=password").then((response) => {
      expect(response.body.data).length.to.be.greaterThan(1)

      for (const obj of response.body.data) {
        expect(obj).not.to.have.property("password")

        done()
      }
    })
  })

  it("should be deep equal to `{}`", (done) => {
    cy.request("/api/user?select=password").then((response) => {
      for (const obj of response.body.data) {
        expect(obj).to.eql({})

        done()
      }
    })
  })
})

describe("GET /api/user?include=password", () => {
  it("should return 422 code", (done) => {
    cy.request({
      url: "/api/user?include=password",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(422)

      done()
    })
  })
})

describe("GET /api/user?include=password,", () => {
  it("should return 422 code", (done) => {
    cy.request({
      url: "/api/user?include=password,",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(422)

      done()
    })
  })
})

describe("GET /api/user?select=id,posts.author", () => {
  it("should only have `id` and `posts.author` property", (done) => {
    cy.request({
      url: "/api/user?select=id,posts.author",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.body.data).length.to.be.greaterThan(1)
      expect(response.body.data[0]).to.have.property("id")
      expect(response.body.data[0]).to.have.property("posts")
      expect(response.body.data[0].posts[0]).to.have.property("author")

      done()
    })
  })
})
