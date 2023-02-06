const chai = require("chai");
const chaiHttp = require("chai-http");
const Uuid = require("uuid");
const { initialize } = require("./index");

chai.use(chaiHttp);
chai.should();
let server;

describe("Projects", () => {
  beforeEach(async () => {
    server = await require("../../src/index");
    await initialize();
  });
  describe("find all", () => {
    it("should get all projects", (done) => {
      chai
        .request(server)
        .get("/project")
        .end((error, response) => {
          error !== null
            ? console.error(error)
            : console.log(response.error.text || response.body);
          response.should.have.status(200);
          done();
        });
    });
  });
  describe("create project", () => {
    it("should create a new project", (done) => {
      chai
        .request(server)
        .post("/project")
        .set({ "Idempotency-Key": Uuid.v4() })
        .send({
          name: "TEST PROJECT",
          currencyName: "TEST CURRENCY",
          alias: "TCR",
          memberId: 1,
          value: 100,
          amount: 100,
        })
        .end((error, response) => {
          error !== null
            ? console.error(error)
            : console.log(response.error.text || response.body);
          response.should.have.status(201);
          done();
        });
    });
  });
});
