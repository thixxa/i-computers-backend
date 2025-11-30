import express from "express"
import { createProduct, deleteProduct, getAllProducts, getProductByID, updateProduct, searchProducts } from "../controllers/ProductController.js"

const productRouter = express.Router()

productRouter.get("/", getAllProducts)

productRouter.get("/trending", (req,res)=>{
    res.json({message : "Trending products endpoint"})
})

productRouter.post("/", createProduct)

productRouter.get("/search/:query", searchProducts)

productRouter.get("/:productID", getProductByID)

productRouter.delete("/:productID", deleteProduct) // /:meken passe thiyena value eka productID eka lesa gena run wenawa

productRouter.put("/:productID", updateProduct)

//IDs sambanda dewal anthimatama danna order ekata daddi

export default productRouter