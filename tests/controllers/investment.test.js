const chai = require("chai");
const chaiHttp = require("chai-http");
const Uuid = require("uuid");
const { balanceRepository, initialize } = require("./index");

chai.use(chaiHttp);
chai.should();
let server;

describe("Investments", () => {
  beforeEach(async () => {
    server = await require("../../src/index");
    await initialize();
  });
  describe("make an investment in Kuna", () => {
    it("should make an investiment Kuna", (done) => {
      chai
        .request(server)
        .post("/deposit/kuna")
        .set({ "Idempotency-Key": Uuid.v4() })
        .send({
          investorId: 1,
          depositValue: 1000,
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
  describe("make membership investment", () => {
    it("should create an membership investment", (done) => {
      balanceRepository.create({
        type: "DEPOSIT",
        value: 1000,
        memberId: 1,
        currencyId: 2,
      });
      chai
        .request(server)
        .post("/membership")
        .set({ "Idempotency-Key": Uuid.v4() })
        .send({ value: 1000, memberId: 1 })
        .end((error, response) => {
          error !== null
            ? console.error(error)
            : console.log(response.error.text || response.body);
          response.should.have.status(201);
          done();
        });
    });
  });
  describe("make an investment", () => {
    it("should make an investiment", (done) => {
      balanceRepository.create({
        type: "DEPOSIT",
        value: 1000,
        memberId: 1,
        currencyId: 2,
      });
      chai
        .request(server)
        .post("/invest")
        .set({ "Idempotency-Key": Uuid.v4() })
        .send({
          investorId: 1,
          projectInvestedId: 1,
          investedValue: 1000,
          transactionType: "DEPOSIT",
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
