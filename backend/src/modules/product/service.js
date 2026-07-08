const Product = require("./model");
const Store = require("../store/model");

const createProduct = async (ownerId, productData) => {
  const store = await Store.findOne({
    ownerId,
    status: "approved",
    isDeactivated: false,
  });
  if (!store) {
    const error = new Error(
      "You do not have an approved and active store. Product cannot be added.",
    );
    error.statusCode = 400;
    throw error;
  }

  const { name, description, price, stock, categoryId, imageUrl } = productData;

  const product = await Product.create({
    storeId: store._id,
    categoryId,
    name,
    description,
    price,
    stock,
    imageUrl,
  });

  return product;
};

const getStoreProducts = async (ownerId) => {
  const store = await Store.findOne({ ownerId });
  if (!store) {
    const error = new Error("Store not found");
    error.statusCode = 404;
    throw error;
  }
  return await Product.find({ storeId: store._id }).populate(
    "categoryId",
    "name",
  );
};

const updateProduct = async (ownerId, productId, productData) => {
  const store = await Store.findOne({ ownerId });
  if (!store) {
    const error = new Error("Store not found");
    error.statusCode = 404;
    throw error;
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId, storeId: store._id },
    productData,
    { new: true },
  );

  if (!product) {
    const error = new Error("Product not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  return product;
};

const deleteProduct = async (ownerId, productId) => {
  const store = await Store.findOne({ ownerId });
  if (!store) {
    const error = new Error("Store not found");
    error.statusCode = 404;
    throw error;
  }

  const product = await Product.findOneAndDelete({
    _id: productId,
    storeId: store._id,
  });
  if (!product) {
    const error = new Error("Product not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  return product;
};

const getAllProducts = async (queryFilters) => {
  const { storeId, categoryId, search } = queryFilters;
  const filter = {};

  if (storeId) filter.storeId = storeId;
  if (categoryId) filter.categoryId = categoryId;
  if (search) {
    filter.$text = { $search: search };
  }

  return await Product.find(filter)
    .populate("storeId", "name location ownerId")
    .populate("categoryId", "name");
};

const getProductById = async (id) => {
  const product = await Product.findById(id)
    .populate("storeId", "name location description")
    .populate("categoryId", "name");

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }
  return product;
};

module.exports = {
  createProduct,
  getStoreProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
};
