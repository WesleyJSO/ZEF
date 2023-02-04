"use strict";
const { Model } = require("sequelize");
const project = require("./project");
module.exports = (sequelize, DataTypes) => {
  class Currency extends Model {
    static associate(models) {
      Currency.Project = Currency.belongsTo(models.Project);
      Currency.AnchorCurrency = Currency.hasOne(models.Currency);
    }
  }
  Currency.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      alias: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM,
        values: ["FIAT", "DIGITAL"],
        allowNull: false,
      },
      project: {
        type: DataTypes.INTEGER,
        references: {
          model: project,
          key: "id",
          deferrable: Deferrable.NOT,
        },
      },
    },
    {
      sequelize,
      modelName: "Currency",
    }
  );
  return Currency;
};
