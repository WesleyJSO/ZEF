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

describe("Balances", () => {
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
});
