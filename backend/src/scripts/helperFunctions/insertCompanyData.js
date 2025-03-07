const CompanyModel = require("../../db/models/Company");

const insertCompanyData = async ({companyName, symbol, foundingDate}) => {
  try {
    const CompanyEntry = new CompanyModel({
      name: companyName,
      symbol,
      foundingDate,
    });
    await CompanyEntry.save();
    console.log(`Company data for ${symbol} inserted successfully.`);
  } catch (error) {
    console.error("Error inserting company data:", error);
  }
};

module.exports = { insertCompanyData };