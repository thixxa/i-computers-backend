import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        orderId :{ //ORD001 idan patan ganne
            type: String,
            required: true,
            unique: true
        },
        email:{
            type: String,
            required: true
        },
        name:{
            type: String,
            required: true,
        },
        address:{
            type: String,
            required: true
        },
        date:{
            type: Date,
            required: true,
            default: Date.now //current date eka denna
        },
        total:{
            type: Number,
            required: true
        },
        status:{
            type: String,
            required: true,
            default: "Pending" //Pending, Shipped, Delivered
        },
        phone:{
            type: String,
            required: false
        },
        notes:{
            type: String,
            required: false
        },
        items:[ 
            {
                productID:{
                    type: String,
                    required: true
                },  
                name:{
                    type: String,
                    required: true
                },
                price:{
                    type: Number,
                    required: true
                },
                quantity:{
                    type: Number,
                    required: true
                },
                image:{
                    type: String,
                    required: true
                }
            }
        ]

    }
)

const Order = mongoose.model("Order", orderSchema)

export default Order;