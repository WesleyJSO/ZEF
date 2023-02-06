"use strict";
const { Model, Deferrable } = require("sequelize");
const Project = require("./project");

module.exports = (sequelize, DataTypes) => {
  class Currency extends Model {
    static associate(models) {
      Currency.Project = Currency.belongsTo(models.Project);
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
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      projectId: {
        type: DataTypes.INTEGER,
        references: {
          model: Project,
          key: "id",
          deferrable: Deferrable.NOT,
        },
      },
      anchorCurrencyId: {
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
      modelName: "Currency",
    }
  );
  return Currency;
};
