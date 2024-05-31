const mongoose =require('mongoose')
const User = require('./user.js')
const ShortProduct = require('./SortInfoProduct.js')





const selles = new mongoose.Schema({
       userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User
       },
       productIds:[
        {
            productId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:ShortProduct,
                required:true
            },
            productCount:{
                type:Number,
                required:true
            }
        }
       ],
       total:Number,
       salesAt: {
        type:Date,
        default:Date.now()

       }



},{timestamps:true})
const Sells =  mongoose.model("Sells", selles)
module.exports = Sells