import express from "express";
import { getAllReviews, createReview, deleteReview } from "../controllers/reviewController.js";


const reviewRouter = express.Router();

reviewRouter.get("/", getAllReviews);
reviewRouter.post("/", createReview);
reviewRouter.delete("/:reviewId", deleteReview);

export default reviewRouter;