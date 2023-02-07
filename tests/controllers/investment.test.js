const chai = require("chai");
const chaiHttp = require("chai-http");
const Uuid = require("uuid");
const {
  projectRepository,
  currencyRepository,
  balanceRepository,
  initialize,
  memberRepository,
} = require("./index");

chai.use(chaiHttp);
chai.should();
let server;

describe("Investments", () => {
  beforeEach(async () => {
    server = await require("../../src/index");
    await initialize();
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
          response.should.have.status(204);
          done();
        });
    });
  });
  // describe("make an investment", () => {
  //   it("should make an investiment", async () => {
  //     balanceRepository.create({
  //       type: "DEPOSIT",
  //       value: 10000,
  //       memberId: 1,
  //       currencyId: 2,
  //     });
  //     const investor = await memberRepository.create({
  //       name: "Wesleys",
  //       document: "123.123.321.YYYW",
  //       type: "INDIVIDUAL",
  //     });
  //     const member = await memberRepository.create({
  //       name: "Cintia",
  //       document: "123.123.321.YYYX",
  //       type: "INDIVIDUAL",
  //     });
  //     const project = await projectRepository.create({
  //       name: "TEST PROJECT",
  //       value: 1030,
  //       memberId: member.id,
  //     });
  //     const acquiredCurrency = await currencyRepository.create({
  //       name: "TEST CURRENCY",
  //       alias: "TCR",
  //       amount: 1000,
  //       quotation: 1,
  //       type: "DIGITAL",
  //       projectId: project.id,
  //     });
  //     chai
  //       .request(server)
  //       .post("/invest")
  //       .set({ "Idempotency-Key": Uuid.v4() })
  //       .send({
  //         acquiredCurrencyId: acquiredCurrency.id,
  //         paymentCurrencyId: 1,
  //         investorId: investor.id,
  //         investedValue: 10,
  //       })
  //       .end((error, response) => {
  //         error !== null
  //           ? console.error(error)
  //           : console.log(response.error.text || response.body);
  //         response.should.have.status(201);
  //       });
  //   });
  // });
});
