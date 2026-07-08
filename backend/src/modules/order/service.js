const Order = require("./model");
const Product = require("../product/model");
const Store = require("../store/model");

const placeOrder = async (customerId, orderData) => {
  const { items, shippingAddress } = orderData;

  if (!items || items.length === 0) {
    const error = new Error("No items in the order");
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
      const error = new Error(
        `Insufficient stock for product: ${product.name}`,
      );
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
      price: product.price,
    });
  }

  const order = await Order.create({
    customerId,
    items: processedItems,
    totalAmount,
    shippingAddress,
    status: "pending",
    trackingHistory: [
      {
        status: "pending",
        updatedBy: "customer",
        notes: "Order placed successfully. Awaiting store confirmation.",
      },
    ],
  });

  return order;
};

const getCustomerOrders = async (customerId) => {
  return await Order.find({ customerId })
    .populate("items.productId", "name imageUrl")
    .populate("items.storeId", "name");
};

const getStoreOrders = async (ownerId) => {
  const store = await Store.findOne({ ownerId });
  if (!store) {
    const error = new Error("Store not found");
    error.statusCode = 404;
    throw error;
  }

  const orders = await Order.find({ "items.storeId": store._id })
    .populate("customerId", "email profile")
    .populate("items.productId", "name imageUrl");

  return orders;
};

const updateOrderStatus = async (user, orderId, status, notes = "") => {
  let order;

  if (user.role === "store_owner") {
    const store = await Store.findOne({ ownerId: user._id });
    if (!store) {
      const error = new Error("Store not found");
      error.statusCode = 404;
      throw error;
    }

    order = await Order.findOne({
      _id: orderId,
      "items.storeId": store._id,
    });
  } else if (user.role === "courier") {
    order = await Order.findById(orderId);
  } else {
    const error = new Error("Unauthorized role");
    error.statusCode = 403;
    throw error;
  }

  if (!order) {
    const error = new Error("Order not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  order.status = status;

  if (!order.trackingHistory) {
    order.trackingHistory = [];
  }

  order.trackingHistory.push({
    status,
    updatedBy: user.role,
    notes: notes || `Order status updated to ${status}.`,
  });

  await order.save();
  return order;
};

const cancelOrder = async (customerId, orderId) => {
  const order = await Order.findOne({ _id: orderId, customerId });
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  if (order.status !== "pending" && order.status !== "processing") {
    const error = new Error(
      "Order cannot be cancelled because it is already " + order.status,
    );
    error.statusCode = 400;
    throw error;
  }

  // Restore inventory stocks
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }

  order.status = "cancelled";
  if (!order.trackingHistory) {
    order.trackingHistory = [];
  }
  order.trackingHistory.push({
    status: "cancelled",
    updatedBy: "customer",
    notes: "Order cancelled by customer. Refund/restock processed.",
  });

  await order.save();
  return order;
};

const updateShippingAddress = async (customerId, orderId, address) => {
  if (!address || !address.trim()) {
    const error = new Error("Address is required");
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findOne({ _id: orderId, customerId });
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  if (order.status !== "pending") {
    const error = new Error(
      "Shipping address can only be changed while the order is pending",
    );
    error.statusCode = 400;
    throw error;
  }

  order.shippingAddress = address;
  await order.save();
  return order;
};

const getCourierOrders = async () => {
  return await Order.find({
    status: { $in: ["processing", "shipped", "intransit", "unsuccessful"] },
  })
    .populate("customerId", "email profile")
    .populate("items.productId", "name imageUrl")
    .populate("items.storeId", "name");
};

module.exports = {
  placeOrder,
  getCustomerOrders,
  getStoreOrders,
  updateOrderStatus,
  cancelOrder,
  updateShippingAddress,
  getCourierOrders,
};
