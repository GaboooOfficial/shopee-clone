const adminService = require("./service");
const { sendSuccess, sendError } = require("../../utils/response");

const getDashboardStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    return sendSuccess(res, stats, "Dashboard stats fetched successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getPendingStores = async (req, res) => {
  try {
    const stores = await adminService.getPendingStores();
    return sendSuccess(res, stores, "Pending stores fetched successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getAllStores = async (req, res) => {
  try {
    const stores = await adminService.getAllStores();
    return sendSuccess(res, stores, "All stores fetched successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const approveStore = async (req, res) => {
  try {
    const store = await adminService.updateStoreStatus(
      req.params.id,
      "approved",
    );
    return sendSuccess(res, store, "Store approved successfully");
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const rejectStore = async (req, res) => {
  try {
    const store = await adminService.updateStoreStatus(
      req.params.id,
      "rejected",
    );
    return sendSuccess(res, store, "Store rejected successfully");
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const toggleStoreActive = async (req, res) => {
  try {
    const store = await adminService.toggleStoreActive(req.params.id);
    return sendSuccess(
      res,
      store,
      store.isDeactivated ? "Store deactivated" : "Store activated",
    );
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const toggleUserActive = async (req, res) => {
  try {
    const user = await adminService.toggleUserActive(req.params.id);
    return sendSuccess(
      res,
      user,
      user.status === "deactivated"
        ? "Account deactivated"
        : "Account activated",
    );
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await adminService.getAllUsers();
    return sendSuccess(res, users, "Users fetched successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getDashboardStats,
  getPendingStores,
  getAllStores,
  approveStore,
  rejectStore,
  toggleStoreActive,
  toggleUserActive,
  getAllUsers,
};
