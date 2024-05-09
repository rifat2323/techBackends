const mongoose = require('mongoose')


const details = new mongoose.Schema({
  
    productName:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    color:[],
    discountPrice:{
        type:String,
        required:true
    },
    variant:{
        type:Array,
        required:true
    },
    highlight:[
        {
            name:String,
            icons:String,
            highlightText:String
        }
    ],
    hintInfo:{
        type:String,
        required:true
    },
    brif:[
        {
            name:String,
            icons:String,
            value:String
        }
    ],
    description:{
        type:String,
        required:true
    },
    additional:[
        {
            name:String,
            value:String
        }
    ],
    id:{
        type:String,
        required:true
    }

})

const Product = mongoose.model('Product',details)
module.exports = Product