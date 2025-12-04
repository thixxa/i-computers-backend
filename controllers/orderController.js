import Order from "../models/order.js";
import Product from "../models/Product.js";
import { isAdmin } from "./userController.js";


export async function createOrder(req,res){

    //check if user is authenticated
    if(req.user == null){
        res.status(401).json({
            message : "Unauthorized",
        });
        return;
    }

    try{
        //order id eka yanna one ORD000001 wage

        const latestOrder = await Order.findOne().sort({date : -1}) //latest order eka gannawa

        let orderId = "ORD000001" //default eka

        if(latestOrder != null){

            let latestOrderId = latestOrder.orderId //latest order id eka gannawa
            let latestOrderNumberString = latestOrderId.replace("ORD","") //ORD eka remove krnwa
            let latestOrderNumber = parseInt(latestOrderNumberString) //string eka number ekata convert krnwa

            let newOrderNumber = latestOrderNumber + 1 //1 ekak add krnwa

            //new order number eka ORD000002 wage krnwa
            let newOrderNumberString = newOrderNumber.toString().padStart(6,'0') //6 digit ekak widihata padding krnwa 0 dala

            orderId = "ORD" + newOrderNumberString;

        }
        const items = []
        let total = 0

        for(let i=0; i<req.body.items.length; i++){

            const product = await Product.findOne({productID : req.body.items[i].productID}) 

            if(product == null){
                return res.status(400).json({
                    message : `Product with ID ${req.body.items[i].productID} not found`,
                });
            }

            //check if stock is available
            // if(product.stock < req.body.items[i].quantity){
            //     return res.status(400).json({
            //         message : `Insufficient stock for product ID ${req.body.items[i].productId}`,
            //     });
            // }

            items.push({
                productID : product.productID,
                name : product.name,
                price : product.price,
                quantity : req.body.items[i].quantity,
                image : product.images[0] //first image eka gannwa
            })
            total += product.price * req.body.items[i].quantity //total amount eka calculate krnwa
        }
        let name = req.body.name;

        if(name == null){
            name = req.user.firstName + " " + req.user.lastName;
        }

        //create new order eka
        const newOrder = new Order({
            orderId : orderId,
            email : req.user.email,
            name : name,
            address : req.body.address,
            total : total,
            items : items,
            phone : req.body.phone
        })

        await newOrder.save();
        return res.status(201).json({
            message : "Order created successfully",
            orderId : orderId,
        });

    }catch(error){
        console.log(error);

        return res.status(500).json({
            message : "Error creating order",
            error : error.message,
        });
    }

}
export async function getOrders(req,res){
    if(req.user == null){
        res.status(401).json({
            message : "Unauthorized"
        });
        return;
    }

    if(isAdmin(req)){
        const orders = await Order.find().sort({date : -1});
        res.json(orders);
    }else{
        const orders = await Order.find({ email: req.user.email }).sort({date : -1,});
        res.json(orders);
    }
}

export async function updateOrderStatus(req,res){
    if(!isAdmin(req)){
        res.status(401).json({
            message : "Unauthorized"
        });
        return;
    }
    try{
        const orderId = req.params.orderId;
        const status = req.body.status;
        const notes = req.body.notes;

        await Order.updateOne(
            { orderId: orderId },
            { status: status, notes: notes }
        );
        res.json({
            message : "Order status updated successfully"
        });
    }
    catch(error){
        res.status(500).json({
            message : "Error updating order status",
            error : error.message
        });
    }
}