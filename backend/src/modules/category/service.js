const Category = require('./model');

const createCategory = async (categoryData) => {
  const { name, description } = categoryData;
  
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    const error = new Error('Category already exists');
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.create({ name, description });
  return category;
};

const getCategories = async () => {
  return await Category.find({});
};

module.exports = {
  createCategory,
  getCategories
};
