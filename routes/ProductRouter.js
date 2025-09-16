import express from "express"
import { createProduct, deleteProduct, getAllProducts, getProductByID, updateProduct } from "../controllers/ProductController.js"

const productRouter = express.Router()

productRouter.get("/", getAllProducts)

productRouter.post("/", createProduct)

productRouter.delete("/:productID", deleteProduct) // /:meken passe thiyena value eka productID eka lesa gena run wenawa

productRouter.put("/:productID", updateProduct)

productRouter.get("/:productID", getProductByID)

//IDs sambanda dewal anthimatama danna order ekata daddi

export default productRouter