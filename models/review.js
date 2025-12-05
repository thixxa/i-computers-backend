import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        reviewId: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: false,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;