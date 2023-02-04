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
      type: {
        type: DataTypes.ENUM,
        values: ["DEPOSIT", "WITHDRAW"],
        allowNull: false,
      },
      wallet: {
        type: DataTypes.INTEGER,
        references: {
          model: Wallet,
          key: "id",
          deferrable: Deferrable.NOT,
        },
      },
      currrency: {
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
