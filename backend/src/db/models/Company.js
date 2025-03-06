const mongoose = require("mongoose"); // Mongoose ORM for MongoDB

const companySchema = new mongoose.Schema({
  symbol: {type:String, required:true, unique:true},
  name: {type:String, required:true},
  foundingDate: {type:Date, required:true},
});

module.exports = mongoose.model("Company", companySchema);