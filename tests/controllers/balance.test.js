const chai = require("chai");
const chaiHttp = require("chai-http");
const { memberRepository, balanceRepository, initialize } = require("./index");

chai.use(chaiHttp);
chai.should();
let server;

describe("Balances", () => {
  beforeEach(async () => {
    server = await require("../../src/index");
    await initialize();
  });
  describe("get investment mande by member", () => {
    it("should get investment mande by member", (done) => {
      chai
        .request(server)
        .get("/balance/1/1")
        .end((error, response) => {
          error !== null
            ? console.error(error)
            : console.log(response.error.text || response.body);
          response.should.have.status(200);
          done();
        });
    });
  });
  describe("get member Kuna balance", () => {
    it("should get the member Kuna balance", (done) => {
      chai
        .request(server)
        .get("/balance/1")
        .end((error, response) => {
          error !== null
            ? console.error(error)
            : console.log(response.error.text || response.body);
          response.should.have.status(200);
          done();
        });
    });
  });
  describe("get balances", () => {
    it("should get the balance of all currencies", (done) => {
      chai
        .request(server)
        .get("/balance")
        .set({ memberId: 1 })
        .end((error, response) => {
          error !== null
            ? console.error(error)
            : console.log(response.error.text || response.body);
          response.should.have.status(200);
          done();
        });
    });
  });
  describe("get detailed balances", () => {
    it("should get the detailed balance of a currency", (done) => {
      memberRepository.create({
        name: "Test member",
        document: "XX.XXX.XXX/XXXX-YY",
        type: "INDIVIDUAL",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      balanceRepository.create([
        {
          type: "MEMBERSHIP_FEE",
          value: 5_000,
          memberId: 2,
          currencyId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          type: "INVESTMENT",
          value: -2_000,
          memberId: 2,
          currencyId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          type: "ASSET_ACQUISITION",
          value: 2_000,
          memberId: 2,
          currencyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      chai
        .request(server)
        .get("/detailed-balance/2/1")
        .end((error, response) => {
          error !== null
            ? console.error(error)
            : console.log(response.error.text || response.body);
          response.should.have.status(200);
          done();
        });
    });
  });
});
