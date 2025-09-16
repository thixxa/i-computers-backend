import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        productID : {
            type : String,
            required : true,
            unique : true
        },
        name : {
            type : String,
            required : true
        },
        altNames : {
            type : [String],  //string array ekak. samana nam
            default : []
        },
        description : {
            type : String,
            required : true
        },
        price : {
            type : Number,
            required : true
        },
        labelledPrice : {
            type : Number,
            required : true
        },
        images : {
            type : [String],
            required : true
        },
        category : {
            type : String,
            required : true
        },
        brand : {
            type : String,
            required : true,
            default : "No brand"
        },
        stock : {
            type : Number,
            required : true,
            default : 0
        },
        isAvailable : {
            type : Boolean,
            default : true
        }
    }
)

const Product = mongoose.model("Product" , productSchema)

export default Product;