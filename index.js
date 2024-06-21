const express = require('express')
require('dotenv').config()

const cors = require('cors')
const cookieParser = require("cookie-parser")
const app = express()
const mongoose = require('mongoose')
const connectDB = require('./db/connectDb.js')
 const {CronJob} = require('cron')
 const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const helmet = require('helmet')
const {rateLimit} = require('express-rate-limit')

const limiter  = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false,
})
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.use(cors({
    origin: ['https://techfrontend.onrender.com','http://localhost:5173','http://localhost:3000'],
    credentials:true
    
}))


connectDB()
app.use(limiter)
app.use(helmet())
app.get('/',async (req,res)=>{
    console.log("hello")
    res.status(200).send("okk hello there bro im not down")
})
app.use('/',require('./routes/privet/User.js'))
app.use('/',require('./routes/privet/ProductAPi.js'))
app.use('/',require('./routes/public/productInfo.js'))
app.use('/', require('./routes/privet/Cart.js'))
app.use('/admin',require('./routes/privet/admin/allEndPoint.js'))
app.use('/adminpost', require('./routes/privet/admin/ShorDetails.js'))
app.use("/adminshow", require('./routes/privet/admin/Charts.js'))


//  new CronJob(
//     '*/100 * * * * *',
//     async function () {
//         try {
//             const response = await fetch('https://techbackendss.onrender.com/');
//             const text = await response.text();
            
//             console.log('Pinged server:', text )
//         } catch (error) {
//             console.error('Error pinging server:', error);
//         }
// 	}, // onTick
// 	null, // onComplete
// 	true,
//     'utc'

// )


mongoose.connection.on("open",()=>{
       console.log('connected to database')
    app.listen(8000,()=>{
        console.log('listening on 8000')
    })

})
