"use strict";
const { Model, Deferrable } = require("sequelize");
const currency = require("./currency");
const Member = require("./member");

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      Project.Member = Project.belongsTo(models.Member);
      Project.Currency = Project.hasOne(models.Currency);
    }
  }
  Project.init(
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
    { sequelize, modelName: "Project" }
  );

  return Project;
};
