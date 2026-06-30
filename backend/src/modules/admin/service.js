const Store = require('../store/model');
const User = require('../auth/model');

const getPendingStores = async () => {
  return await Store.find({ status: 'pending' }).populate('ownerId', 'email profile');
};

const getAllStores = async () => {
  return await Store.find({}).populate('ownerId', 'email profile');
};

const updateStoreStatus = async (storeId, status) => {
  if (!['approved', 'rejected'].includes(status)) {
    const error = new Error('Invalid status value');
    error.statusCode = 400;
    throw error;
  }
  const store = await Store.findByIdAndUpdate(
    storeId,
    { status },
    { new: true }
  );
  if (!store) {
    const error = new Error('Store not found');
    error.statusCode = 404;
    throw error;
  }
  return store;
};

const toggleStoreActive = async (storeId) => {
  const store = await Store.findById(storeId);
  if (!store) {
    const error = new Error('Store not found');
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
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  if (user.role === 'admin') {
    const error = new Error('Cannot deactivate admin accounts');
    error.statusCode = 400;
    throw error;
  }
  user.status = user.status === 'active' ? 'deactivated' : 'active';
  await user.save();
  return user;
};

const getAllUsers = async () => {
  return await User.find({ role: { $ne: 'admin' } }, '-password');
};

module.exports = {
  getPendingStores,
  getAllStores,
  updateStoreStatus,
  toggleStoreActive,
  toggleUserActive,
  getAllUsers
};
