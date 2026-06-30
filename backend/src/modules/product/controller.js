const productService = require('./service');
const { sendSuccess, sendError } = require('../../utils/response');

const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.user._id, req.body);
    return sendSuccess(res, product, 'Product added successfully', 201);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const getStoreProducts = async (req, res) => {
  try {
    const products = await productService.getStoreProducts(req.user._id);
    return sendSuccess(res, products, 'Store products fetched successfully');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.user._id, req.params.id, req.body);
    return sendSuccess(res, product, 'Product updated successfully');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.user._id, req.params.id);
    return sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);
    return sendSuccess(res, products, 'Products fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return sendSuccess(res, product, 'Product fetched successfully');
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  createProduct,
  getStoreProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById
};
