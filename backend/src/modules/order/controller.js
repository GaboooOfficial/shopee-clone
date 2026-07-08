const orderService = require("./service");
const { sendSuccess, sendError } = require("../../utils/response");

const placeOrder = async (req, res) => {
  try {
    const order = await orderService.placeOrder(req.user._id, req.body);
    return sendSuccess(res, order, "Order placed successfully", 201);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const getCustomerOrders = async (req, res) => {
  try {
    const orders = await orderService.getCustomerOrders(req.user._id);
    return sendSuccess(res, orders, "Your orders fetched successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getStoreOrders = async (req, res) => {
  try {
    const orders = await orderService.getStoreOrders(req.user._id);
    return sendSuccess(res, orders, "Store orders fetched successfully");
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return sendError(res, "Status is required", 400);
    }
    const order = await orderService.updateOrderStatus(
      req.user._id,
      req.params.id,
      status,
    );
    return sendSuccess(res, order, "Order status updated successfully");
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(req.user._id, req.params.id);
    return sendSuccess(res, order, "Order cancelled successfully");
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const updateShippingAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const order = await orderService.updateShippingAddress(
      req.user._id,
      req.params.id,
      address,
    );
    return sendSuccess(res, order, "Shipping address updated successfully");
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

module.exports = {
  placeOrder,
  getCustomerOrders,
  getStoreOrders,
  updateOrderStatus,
  cancelOrder,
  updateShippingAddress,
};
