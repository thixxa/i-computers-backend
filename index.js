import express from "express"
import mongoose from "mongoose"
import userRouter from "./routes/userRouter.js"
import jwt from "jsonwebtoken"
import productRouter from "./routes/ProductRouter.js"

const mongoURL = "mongodb+srv://thisanda:2002@cluster0.m9whicb.mongodb.net/CBC_Database?retryWrites=true&w=majority&appName=Cluster0"

//project ekayi cluster ekayi sambanda karana eka
mongoose.connect(mongoURL)
.then( ()=>{
    console.log("Connected to mongoDB cluster")
})

const app = express()

app.use(express.json())

//decrypt karana middleware eka
app.use((req,res,next)=>{
    const authorizationHeader = req.header("Authorization") // req eke ena header eka kiyawa ganna. authorization kiyanne header eke thiyena header wargayak
    
    //header eka eddi ekata 'Bearer ' kiyala kallak add wenawa. eka ayin karanna one
    if(authorizationHeader != null){
        const token = authorizationHeader.replace("Bearer ", "")

        jwt.verify(token, "secretKey96$2025", 
            (error,content)=>{
                if(content == null){
                    console.log("Invalid token")
                    res.json({
                        message : "Invalid token"
                    })
                }else{
                    console.log(content)
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

app.use("/users", userRouter)
app.use("/products", productRouter)

app.listen(3000, ()=>{
    console.log("server is running on port 3000")
})