"use strict";
const { Model, Deferrable } = require("sequelize");
const Currency = require("./currency");
const Wallet = require("./wallet");

module.exports = (sequelize, DataTypes) => {
  class Balance extends Model {
    static associate(models) {
      Balance.Wallet = Balance.belongsTo(models.Wallet);
      Balance.Currency = Balance.belongsTo(models.Currency);
    }
  }
  Balance.init(
    {
      // "MEMBERSHIP_FEE" -> HRK(Croatian kuna) converted to ZNK(ZEF kuna) only
      // "DEPOSIT" -> HRK(Croatian kuna) deposit only
      // "WITHDRAW" -> HRK(Croatian kuna) withdraw only
      // "ASSET_SALE" -> digital currency sale only
      // "ASSET_ACQUISITION" -> digital currency aquisition only
      // "INVESTMENT" -> deduction of HRK(Croatian kuna) to buy digital currency
      type: {
        type: DataTypes.ENUM,
        values: [
          "MEMBERSHIP_FEE",
          "DEPOSIT",
          "WITHDRAW",
          "ASSET_SALE",
          "ASSET_ACQUISITION",
          "INVESTMENT",
        ],
        allowNull: false,
      },
      value: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      walletId: {
        type: DataTypes.INTEGER,
        references: {
          model: Wallet,
          key: "id",
          deferrable: Deferrable.NOT,
        },
      },
      currencyId: {
        type: DataTypes.INTEGER,
        references: {
          model: Currency,
          key: "id",
          deferrable: Deferrable.NOT,
        },
      },
    },
    {
      sequelize,
      modelName: "Balance",
    }
  );
  return Balance;
};
