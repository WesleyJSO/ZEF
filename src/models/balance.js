"use strict";
const { Model } = require("sequelize");
const currency = require("./currency");
const wallet = require("./wallet");
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
          model: wallet,
          key: "id",
          deferrable: Deferrable.NOT,
        },
      },
      currrency: {
        type: DataTypes.INTEGER,
        references: {
          model: currency,
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
