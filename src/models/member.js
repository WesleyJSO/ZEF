"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    static associate(models) {
      Member.Wallet = Member.hasOne(models.Wallet);
      Member.Project = Member.hasOne(models.Project);
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
