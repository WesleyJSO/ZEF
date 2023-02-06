const chai = require("chai");
const chaiHttp = require("chai-http");
const Uuid = require("uuid");
const { initialize } = require("./index");

chai.use(chaiHttp);
chai.should();
let server;

describe("Members", () => {
  beforeEach(async () => {
    server = await require("../../src/index");
    await initialize();
  });
  describe("create a member", () => {
    it("should create a new member", (done) => {
      chai
        .request(server)
        .post("/member")
        .set({ "Idempotency-Key": Uuid.v4() })
        .send({
          name: "NEW TEST MEMBER",
          document: "99.999.999/9999-99",
          type: "INDIVIDUAL",
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
