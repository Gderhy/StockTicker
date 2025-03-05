const Company = require("../models/Company"); 

// Function to fetch all companies
async function fetchCompanies() {
  try {
    const companies = await Company.find();
    return companies;
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}

async function fetchCompanySymbols() {
  // Returns an array of company symbols
  try {
    const symbols = await Company.find().select("symbol");
    return symbols.map((company) => company.symbol);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
}

module.exports = { fetchCompanies, fetchCompanySymbols };
