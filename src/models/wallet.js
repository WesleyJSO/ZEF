"use strict";
const { Model, Deferrable } = require("sequelize");
const Member = require("./member");

module.exports = (sequelize, DataTypes) => {
  class Wallet extends Model {
    static associate(models) {
      Wallet.Member = Wallet.belongsTo(models.Member);
      Wallet.Balance = Wallet.hasMany(models.Balance);
    }
  }
  Wallet.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      member: {
        type: DataTypes.INTEGER,
        references: {
          model: Member,
          key: "id",
          deferrable: Deferrable.NOT,
        },
      },
    },
    {
      sequelize,
      modelName: "Wallet",
    }
  );
  return Wallet;
};
