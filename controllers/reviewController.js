import Review from "../models/review.js";
import { isAdmin } from "./userController.js";

// generate next reviewId
async function generateNextReviewId() {
  const latestReview = await Review.findOne().sort({ createdAt: -1 });
  let reviewId = "REV0000001";

  if (latestReview != null) {
    const latestId = latestReview.reviewId;
    const numberPart = parseInt(latestId.replace("REV", ""));
    const newNumber = numberPart + 1;
    reviewId = "REV" + newNumber.toString().padStart(7, "0");
  }
  return reviewId;
}

// post /api/reviews
export async function createReview(req, res) {
  if (req.user == null) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }
  try {
    const { rating, comment } = req.body;
    if (rating < 1 || rating > 5) {
      res.status(400).json({
        message: "Invalid rating value",
      });
      return;
    }
    const reviewId = await generateNextReviewId();
    const finalName =
      req.user.firstName && req.user.lastName
        ? `${req.user.firstName} ${req.user.lastName}`
        : "Anonymous";
    const newReview = new Review({
      reviewId: reviewId,
      email: req.user.email,
      name: finalName,
      rating: rating,
      comment: comment || "",
    });
    await newReview.save();
    res.status(201).json({
      message: "Review created successfully",
      review: newReview,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error creating review",
      error: error.message,
    });
  }
}

// get /api/reviews everyone can see
export async function getAllReviews(req, res) {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching reviews",
      error: error.message,
    });
  }
}

export async function deleteReview(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({
      message: "Only admin can delete reviews",
    });
    return;
  }
  const { reviewId } = req.params;
  try {
    const result = await Review.deleteOne({ reviewId: reviewId });
    if (result.deletedCount === 0) {
      res.status(404).json({
        message: "Review not found",
      });
    } else {
      res.status(200).json({
        message: "Review deleted successfully",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error deleting review",
      error: error.message,
    });
  }
}
