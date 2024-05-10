const express = require('express')
require('dotenv').config()

const cors = require('cors')
const cookieParser = require("cookie-parser")
const app = express()
const mongoose = require('mongoose')
const connectDB = require('./db/connectDb.js')

app.use(express.json())
app.use(express.urlencoded({extended:true}))
//bOb0hBYtmJb9g7mw
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials:true
}))
app.use(cookieParser())
connectDB()

app.get('/',async (req,res)=>{
    console.log("hello")
    res.status(200).send("okk")
})

app.use('/',require('./routes/privet/ProductAPi.js'))
app.use('/',require('./routes/public/productInfo.js'))
mongoose.connection.on("open",()=>{
       console.log('connected to database')
    app.listen(8000,()=>{
        console.log('listening on 8000')
    })

})
