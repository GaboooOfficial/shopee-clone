const categoryService = require("./service");
const { sendSuccess, sendError } = require("../../utils/response");

const create = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return sendSuccess(res, category, "Category created successfully", 201);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const getAll = async (req, res) => {
  try {
    const categories = await categoryService.getCategories();
    return sendSuccess(res, categories, "Categories fetched successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  create,
  getAll,
};
