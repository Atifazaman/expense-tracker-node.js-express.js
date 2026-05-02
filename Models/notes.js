const sequelize = require("../Utils/db-connection");
const { DataTypes } = require("sequelize");

const Notes = sequelize.define("Notes", {
  note: DataTypes.TEXT,
  date: DataTypes.DATEONLY,
  userId: DataTypes.INTEGER
});

module.exports = Notes;