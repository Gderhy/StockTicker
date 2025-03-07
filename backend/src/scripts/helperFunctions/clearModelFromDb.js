/*
  This function clears all data from a given model in the database.
  It is used to reset the database before loading new data.
*/
const clearModelFromDb = async (model) => {
  try {
    await model.deleteMany({});
    console.log(`Cleared existing ${model.collection.name} data.`);
  } catch (error) {
    console.error(`Error clearing ${model.collection.name} data:`, error);
  }
};

module.exports = { clearModelFromDb };
