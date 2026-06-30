const Order = require('./model');
const Product = require('../product/model');
const Store = require('../store/model');

const placeOrder = async (customerId, orderData) => {
  const { items, shippingAddress } = orderData;

  if (!items || items.length === 0) {
    const error = new Error('No items in the order');
    error.statusCode = 400;
    throw error;
  }

  let totalAmount = 0;
  const processedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      const error = new Error(`Product not found: ${item.productId}`);
      error.statusCode = 404;
      throw error;
    }

    if (product.stock < item.quantity) {
      const error = new Error(`Insufficient stock for product: ${product.name}`);
      error.statusCode = 400;
      throw error;
    }

    product.stock -= item.quantity;
    await product.save();

    totalAmount += product.price * item.quantity;

    processedItems.push({
      productId: product._id,
      storeId: product.storeId,
      quantity: item.quantity,
      price: product.price
    });
  }

  const order = await Order.create({
    customerId,
    items: processedItems,
    totalAmount,
    shippingAddress,
    status: 'pending'
  });

  return order;
};

const getCustomerOrders = async (customerId) => {
  return await Order.find({ customerId })
    .populate('items.productId', 'name imageUrl')
    .populate('items.storeId', 'name');
};

const getStoreOrders = async (ownerId) => {
  const store = await Store.findOne({ ownerId });
  if (!store) {
    const error = new Error('Store not found');
    error.statusCode = 404;
    throw error;
  }

  const orders = await Order.find({ 'items.storeId': store._id })
    .populate('customerId', 'email profile')
    .populate('items.productId', 'name imageUrl');

  return orders;
};

const updateOrderStatus = async (ownerId, orderId, status) => {
  const store = await Store.findOne({ ownerId });
  if (!store) {
    const error = new Error('Store not found');
    error.statusCode = 404;
    throw error;
  }

  const order = await Order.findOne({ _id: orderId, 'items.storeId': store._id });
  if (!order) {
    const error = new Error('Order not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }

  order.status = status;
  await order.save();
  return order;
};

module.exports = {
  placeOrder,
  getCustomerOrders,
  getStoreOrders,
  updateOrderStatus
};
