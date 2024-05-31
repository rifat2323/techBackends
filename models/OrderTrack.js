const mongoose = require('mongoose')
const User = require('./user.js')
const ShortProduct = require('./SortInfoProduct.js')


const order = new mongoose.Schema({
     userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:User
     },
     productIdes:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:ShortProduct,
                required:true
            },
            productCount:{
                type:Number,
                required:true
            },
            _id:  mongoose.Types.ObjectId
        }
       ],
       total:Number,
       paid: {
         type:Boolean,
         default:true
       },
     deliveryStatus :{
        type:String,
        enum:['paid','way', 'delivered']
     },
     active:{
        type:Boolean,
        default:true
     }
},{timestamps:true})

const OrderTrack = mongoose.model("OrderTrack",order )
module.exports = OrderTrack