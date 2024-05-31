const express = require('express')
require('dotenv').config()

const cors = require('cors')
const cookieParser = require("cookie-parser")
const app = express()
const mongoose = require('mongoose')
const connectDB = require('./db/connectDb.js')
 const {CronJob} = require('cron')
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.use(cors({
    origin: ['http://localhost:3000','http://localhost:5173'],
    credentials:true
    
}))


connectDB()

app.get('/',async (req,res)=>{
    console.log("hello")
    res.status(200).send("okk")
})
app.use('/',require('./routes/privet/User.js'))
app.use('/',require('./routes/privet/ProductAPi.js'))
app.use('/',require('./routes/public/productInfo.js'))
app.use('/', require('./routes/privet/Cart.js'))
app.use('/admin',require('./routes/privet/admin/allEndPoint.js'))
app.use('/adminpost', require('./routes/privet/admin/ShorDetails.js'))
new CronJob(
    '*/30 * * * * *',
    function () {
		console.log('You will see this message every second');
	}, // onTick
	null, // onComplete
	true,
    'utc'

)
mongoose.connection.on("open",()=>{
       console.log('connected to database')
    app.listen(8000,()=>{
        console.log('listening on 8000')
    })

})
