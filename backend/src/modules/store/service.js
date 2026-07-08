const Store = require("./model");

const createStore = async (ownerId, storeData) => {
  const { name, description, location } = storeData;

  const existingStore = await Store.findOne({ ownerId });
  if (existingStore) {
    const error = new Error(
      "You already have a store or a pending store application",
    );
    error.statusCode = 400;
    throw error;
  }

  const nameExists = await Store.findOne({ name });
  if (nameExists) {
    const error = new Error("Store name is already taken");
    error.statusCode = 400;
    throw error;
  }

  const store = await Store.create({
    ownerId,
    name,
    description,
    location,
    status: "pending",
    isDeactivated: false,
  });

  return store;
};

const getMyStore = async (ownerId) => {
  const store = await Store.findOne({ ownerId });
  return store;
};

const updateStore = async (ownerId, storeId, storeData) => {
  const store = await Store.findOne({ _id: storeId, ownerId });
  if (!store) {
    const error = new Error("Store not found or you are not the owner");
    error.statusCode = 404;
    throw error;
  }

  if (storeData.name && storeData.name !== store.name) {
    const nameExists = await Store.findOne({ name: storeData.name });
    if (nameExists) {
      const error = new Error("Store name is already taken");
      error.statusCode = 400;
      throw error;
    }
    store.name = storeData.name;
  }

  if (storeData.description !== undefined)
    store.description = storeData.description;
  if (storeData.location) store.location = storeData.location;

  await store.save();
  return store;
};

const getApprovedStores = async () => {
  return await Store.find({ status: "approved", isDeactivated: false });
};

const deleteStore = async (ownerId, storeId) => {
  const store = await Store.findOne({ _id: storeId, ownerId });
  if (!store) {
    const error = new Error("Store not found or you are not the owner");
    error.statusCode = 404;
    throw error;
  }

  await Store.findByIdAndDelete(storeId);

  // Clean up products associated with the store
  const Product = require("../product/model");
  await Product.deleteMany({ storeId });

  return store;
};

module.exports = {
  createStore,
  getMyStore,
  updateStore,
  getApprovedStores,
  deleteStore,
};

