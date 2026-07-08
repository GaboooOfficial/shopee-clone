const reviewService = require("./service");
const { sendSuccess, sendError } = require("../../utils/response");

const createReview = async (req, res) => {
  try {
    const review = await reviewService.createReview(req.user._id, req.body);
    return sendSuccess(res, review, "Review submitted successfully", 201);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await reviewService.getProductReviews(productId);
    return sendSuccess(res, reviews, "Product reviews fetched successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  createReview,
  getProductReviews
};
