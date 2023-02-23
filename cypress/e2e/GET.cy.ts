/// <reference types="cypress" />

describe("GET /api/user", () => {
  it("should be an array", (done) => {
    cy.request("GET", "/api/user").then((response) => {
      expect(response.body.data).length.to.be.greaterThan(1)
      done()
    })
  })

  it("should not contain the `password` and `isAdmin` field", (done) => {
    cy.request("GET", "/api/user").then((response) => {
      console.log(response.body.data)
      for (const obj of response.body.data) {
        expect(obj).not.to.have.property("password")
        expect(obj).not.to.have.property("isAdmin")
      }
      done()
    })
  })
})

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

describe("GET /api/users", () => {
  it("should return 404 code", (done) => {
    cy.request({ url: "/api/users", failOnStatusCode: false }).then(
      (response) => {
        expect(response.status).to.eq(404)

        done()
      }
    )
  })
})
