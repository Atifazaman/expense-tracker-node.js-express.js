const userTable = require("./usersTable");
const expenseTable = require("./expensetrackertable");
const orderTable = require("./orderModel");
const forgotPasswordTable = require("./ForgotPasswordRequests");
const Notes = require("./notes");

userTable.hasMany(expenseTable);
expenseTable.belongsTo(userTable);

userTable.hasMany(orderTable);
orderTable.belongsTo(userTable);

userTable.hasMany(forgotPasswordTable);
forgotPasswordTable.belongsTo(userTable);

userTable.hasMany(Notes);
Notes.belongsTo(userTable);

module.exports = {
  userTable,
  expenseTable,
  orderTable,
  forgotPasswordTable,
  Notes
};