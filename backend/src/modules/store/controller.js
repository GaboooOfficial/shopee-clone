const storeService = require("./service");
const { sendSuccess, sendError } = require("../../utils/response");

const createStore = async (req, res) => {
  try {
    const store = await storeService.createStore(req.user._id, req.body);
    return sendSuccess(
      res,
      store,
      "Store application submitted successfully",
      201,
    );
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const getMyStore = async (req, res) => {
  try {
    const store = await storeService.getMyStore(req.user._id);
    if (!store) {
      return sendError(res, "No store associated with this account", 404);
    }
    return sendSuccess(res, store, "My store fetched successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const updateStore = async (req, res) => {
  try {
    const store = await storeService.updateStore(
      req.user._id,
      req.params.id,
      req.body,
    );
    return sendSuccess(res, store, "Store details updated successfully");
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const getApprovedStores = async (req, res) => {
  try {
    const stores = await storeService.getApprovedStores();
    return sendSuccess(res, stores, "Approved stores fetched successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const deleteStore = async (req, res) => {
  try {
    const store = await storeService.deleteStore(req.user._id, req.params.id);
    return sendSuccess(res, store, "Store deleted successfully");
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  createStore,
  getMyStore,
  updateStore,
  getApprovedStores,
  deleteStore,
};
