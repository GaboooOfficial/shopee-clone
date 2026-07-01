const Store = require("../store/model");
const User = require("../auth/model");
const Order = require("../order/model");
const Product = require("../product/model");

const getPendingStores = async () => {
  return await Store.find({ status: "pending" }).populate(
    "ownerId",
    "email profile",
  );
};

const getAllStores = async () => {
  return await Store.find({}).populate("ownerId", "email profile");
};

const updateStoreStatus = async (storeId, status) => {
  if (!["approved", "rejected"].includes(status)) {
    const error = new Error("Invalid status value");
    error.statusCode = 400;
    throw error;
  }
  const store = await Store.findByIdAndUpdate(
    storeId,
    { status },
    { new: true },
  );
  if (!store) {
    const error = new Error("Store not found");
    error.statusCode = 404;
    throw error;
  }
  return store;
};

const toggleStoreActive = async (storeId) => {
  const store = await Store.findById(storeId);
  if (!store) {
    const error = new Error("Store not found");
    error.statusCode = 404;
    throw error;
  }
  store.isDeactivated = !store.isDeactivated;
  await store.save();
  return store;
};

const toggleUserActive = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  if (user.role === "admin") {
    const error = new Error("Cannot deactivate admin accounts");
    error.statusCode = 400;
    throw error;
  }
  user.status = user.status === "active" ? "deactivated" : "active";
  await user.save();
  return user;
};

const getAllUsers = async () => {
  return await User.find({ role: { $ne: "admin" } }, "-password");
};

const getDashboardStats = async () => {
  const orders = await Order.find({ status: { $ne: "cancelled" } });
  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );
  const totalOrders = orders.length;
  const registeredUsers = await User.countDocuments({ role: { $ne: "admin" } });
  const merchantStores = await Store.countDocuments({});
  const activeProducts = await Product.countDocuments({ stock: { $gt: 0 } });

  const recentOrders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("customerId", "email profile")
    .populate("items.productId", "name")
    .populate("items.storeId", "name");

  return {
    totalRevenue,
    totalOrders,
    registeredUsers,
    merchantStores,
    activeProducts,
    recentOrders,
  };
};

module.exports = {
  getDashboardStats,
  getPendingStores,
  getAllStores,
  updateStoreStatus,
  toggleStoreActive,
  toggleUserActive,
  getAllUsers,
};
