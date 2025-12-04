import Product from "../models/Product.js";
import {isAdmin} from "./userController.js"

export function createProduct(req,res){

    if(!isAdmin(req)){
        res.status(403).json({
            message : "Forbidden"
        });
        return;
    }

    const product = new Product(req.body)

    product.save().then(()=>{
        res.json({
            message : "Product created successfully"
        });
    }).catch((error)=>{
        res.status(500).json({
            message : "Error creating products"
        });
    });
}

export function getAllProducts(req,res){

    if(isAdmin(req)){
        Product.find().then((products)=>{
            res.json(products)
        }).catch((error)=>{
            res.status(500).json({
                message : "Error fetching products",
                error : error.message,
            });
        });
    }else{
        Product.find({isAvailable : true}).then((products)=>{
            res.json(products)
        }).catch((error)=>{
            res.status(500).json({
                message : "Error fetching products",
                error : error.message,
            });
        });
    }
}

export function deleteProduct(req,res){
    if(!isAdmin(req)){
        res.status(403).json({
            message : "Only admin can delete products"
        })
        return
    }

    const productID = req.params.productID //params kiyanne reqest eke uda kotasata

    //ewala thiyena ID ekata samana ID eka thiyena eka delete krnna
    Product.deleteOne({productID : productID}).then(()=>{
        res.json({
            message : "Product deleted successfully"
        })
    })
    //mehema karama apita puluwan
    // localhost:3000/products/PRO001  kiyala req eka ywala product eka delete krnna
    //boruwata jason file ekakma hdnne one na 
    //ex.  localhost:3000/products/GAMING-CHAIR-001
    
}


export function updateProduct(req,res){
    //delete eke wagema reqest eke agata ellala yawanawa productID eka
    //aluth values tika json ekaka dala yawanawa

    if(!isAdmin(req)){
        res.status(403).json({
            message : "Only admin can update products"
        })
        return
    }

    const productID = req.params.productID

    Product.updateOne({productID : productID}, req.body).then(()=>{
        res.json({
            message : "Product updated successfully"
        })
    })
}

//ID eka dila eka product ekak wage wisthara ganna
export function getProductByID(req,res){
    const productID = req.params.productID

    Product.findOne({productID : productID}).then((product)=>{
        if(product == null){
            res.status(404).json({
                message : "Product not found"
            })
        }
        else{
            res.json(product)
        }
    }).catch((error)=>{
        res.status(500).json({
            message : "Error fetching product",
            error : error.message
        })
    })
}

export async function searchProducts(req,res){
    const query = req.params.query
    try{
        const products = await Product.find(
            {
                //$or dala liyanne pahala deken onema ekakdi pennna puluwan kiyala
                $or: [
                    { name : { $regex : query, $options : 'i' } }, // 'i' option eka case insensitive weyi kiyala
                    { altNames : { $elemMatch : { $regex : query, $options : 'i' } } } // altNames array eke thiyena eka athule match krnna
                ],
                isAvailable : true
            }
        )
        return res.json(products);

    }catch(error){
        res.status(500).json({
            message : "Error searching products",
            error : error.message
        })
    }
}

