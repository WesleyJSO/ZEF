const chai = require("chai");
const chaiHttp = require("chai-http");
const Uuid = require("uuid");
const models = require("../../src/models/index.js");

const balanceRepository = models.sequelize.models.Balance;
const currencyRepository = models.sequelize.models.Currency;
const memberRepository = models.sequelize.models.Member;
const projectRepository = models.sequelize.models.Project;
const walletRepository = models.sequelize.models.Wallet;
chai.use(chaiHttp);
chai.should();
let server;

describe("Investments", () => {
  beforeEach(async () => {
    server = await require("../../src/index");
    await balanceRepository.destroy({ truncate: { cascade: true } });
    await currencyRepository.destroy({ truncate: { cascade: true } });
    await memberRepository.destroy({ truncate: { cascade: true } });
    await projectRepository.destroy({ truncate: { cascade: true } });
    await walletRepository.destroy({ truncate: { cascade: true } });

    await memberRepository.create({
      id: 1,
      name: "ZEF INC.",
      document: "XX.XXX.XXX/XXXX-XX",
      type: "DOMAIN_OWNER",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await projectRepository.create({
      id: 1,
      name: "ZEF",
      value: 1_000,
      memberId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await currencyRepository.bulkCreate([
      {
        id: 1,
        name: "ZEF kuna",
        alias: "ZKN",
        type: "DIGITAL",
        amount: 1_000,
        anchorCurrencyId: 2,
        projectId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "Croatian kuna",
        alias: "HRK",
        type: "FIAT",
        amount: 1_000,
        projectId: null,
        anchorCurrencyId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await walletRepository.create({
      id: 1,
      name: "ZEF Wallet",
      memberId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
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
        walletId: 1,
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
        walletId: 1,
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
  // describe("sell investment", () => {
  //   it("should sell an investiment", async (done) => {
  //     await balanceRepository.create({
  //       type: "MEMBERSHIP_FEE",
  //       value: 1000,
  //       walletId: 1,
  //       currencyId: 1,
  //     });
  //     chai
  //       .request(server)
  //       .post("/sell")
  //       .set({ "Idempotency-Key": Uuid.v4() })
  //       .send({
  //         memberId: 1,
  //         projectId: 1,
  //         sellingAmount: 700,
  //       })
  //       .end((error, response) => {
  //         error !== null
  //           ? console.error(error)
  //           : console.log(response.error.text || response.body);
  //         response.should.have.status(201);
  //         done();
  //       });
  //   });
  // });
});
