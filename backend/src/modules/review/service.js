const Review = require("./model");
const Order = require("../order/model");
const Product = require("../product/model");

const createReview = async (customerId, reviewData) => {
  const { orderId, productId, rating, reviewText } = reviewData;

  if (!rating || rating < 1 || rating > 5) {
    const error = new Error("Rating must be between 1 and 5");
    error.statusCode = 400;
    throw error;
  }

  if (!reviewText || !reviewText.trim()) {
    const error = new Error("Review text is required");
    error.statusCode = 400;
    throw error;
  }

  // Verify order exists, belongs to the customer, and is completed (delivered / package delivered)
  const order = await Order.findOne({
    _id: orderId,
    customerId,
    status: { $in: ["delivered", "package delivered"] },
  });

  if (!order) {
    const error = new Error("Order not found, not completed, or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  // Verify product is in order
  const itemInOrder = order.items.find(
    (item) => item.productId.toString() === productId.toString(),
  );
  if (!itemInOrder) {
    const error = new Error("This product is not part of the specified order");
    error.statusCode = 400;
    throw error;
  }

  // Create review
  const review = await Review.create({
    orderId,
    productId,
    customerId,
    rating,
    reviewText,
  });

  return review;
};

const getProductReviews = async (productId) => {
  return await Review.find({ productId })
    .populate("customerId", "profile email")
    .sort({ createdAt: -1 });
};

module.exports = {
  createReview,
  getProductReviews,
};
