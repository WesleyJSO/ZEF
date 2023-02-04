"use strict";
const { Model } = require("sequelize");
const currency = require("./currency");
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
          model: member,
          key: "id",
          deferrable: Deferrable.NOT,
        },
      },
    },
    { sequelize, modelName: "Project" }
  );

  return Project;
};
