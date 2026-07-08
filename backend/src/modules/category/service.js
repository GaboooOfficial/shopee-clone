const Category = require("./model");

const createCategory = async (categoryData) => {
  const { name, description } = categoryData;

  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    const error = new Error("Category already exists");
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.create({ name, description });
  return category;
};

const getCategories = async () => {
  return await Category.find({});
};

const updateCategory = async (id, categoryData) => {
  const { name, description } = categoryData;
  const category = await Category.findById(id);
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      const error = new Error("Category name already exists");
      error.statusCode = 400;
      throw error;
    }
    category.name = name;
  }

  if (description !== undefined) {
    category.description = description;
  }

  await category.save();
  return category;
};

const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }
  return category;
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};

