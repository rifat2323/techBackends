const mongoose = require('mongoose');
const ShortProduct = require('./SortInfoProduct.js');
const User = require('./user.js');




const cart = new mongoose.Schema({

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
        }
    }
   ],
   total:Number,
   totalAfterDiscount:Number

   



})
const Cart = mongoose.model("Cart",cart)
module.exports = Cart