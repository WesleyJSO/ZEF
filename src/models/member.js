"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    static associate(models) {
      Member.Projects = Member.hasMany(models.Project);
      Member.Balances = Member.hasMany(models.Balance);
    }
  }
  Member.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      document: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM,
        values: ["DOMAIN_OWNER", "COMPANY", "INDIVIDUAL"],
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Member",
    }
  );
  return Member;
};
