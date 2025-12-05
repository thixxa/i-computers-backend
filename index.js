import express from "express"
import mongoose from "mongoose"
import userRouter from "./routes/userRouter.js"
import jwt from "jsonwebtoken"
import productRouter from "./routes/ProductRouter.js"
import cors from "cors"
import dotenv from "dotenv"
import orderRouter from "./routes/orderRouter.js"
import reviewRouter from "./routes/reviewRouter.js"

dotenv.config()
const mongoURL = process.env.MONGO_URL

//project ekayi cluster ekayi sambanda karana eka
mongoose.connect(mongoURL)
.then( ()=>{
    console.log("Connected to mongoDB cluster")
}).catch( (error)=>{
    console.log(error);
})

const app = express()

app.use(cors()) //cors eka use krnwa. meken wenne different origin wala front end ekak thiyenawanm eken api ekata call krnna puluwan wenawa

app.use(express.json())

//decrypt karana middleware eka
app.use((req,res,next)=>{
    const authorizationHeader = req.header("Authorization") // req eke ena header eka kiyawa ganna. authorization kiyanne header eke thiyena header wargayak
    
    //header eka eddi ekata 'Bearer ' kiyala kallak add wenawa. eka ayin karanna one
    if(authorizationHeader != null){
        const token = authorizationHeader.replace("Bearer ", "")

        jwt.verify(token, process.env.JWT_SECRET, 
            (error,content)=>{
                if(content == null){
                    res.status(401).json({
                        message : "Invalid token"
                    })
                }else{
                    req.user = content
                    next() //meka function ekak. meken wenne adala kenata meka yawana eka
                }
        })
    }else{
        next() //token ekak nathuawa apuwama yawanna.token ekak hadanna wage yana ayata
    }
})

//index.js ekata studentRouter.js eka sambanda kara(main road ekata athuru para haduwa)
//plug krnawa kynne mekta

app.use("/api/users", userRouter)
app.use("/api/products", productRouter)
app.use("/api/orders", orderRouter)
app.use("/api/reviews", reviewRouter);

app.listen(3000, ()=>{
    console.log("server is running on port 3000")
})