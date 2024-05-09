const mongoose = require('mongoose')


const sort = new mongoose.Schema({

   image:{
    type:String,
    required:true
   },
   price:{
    type:String || Number ,
    required:true
   },
   productName:{
    type:String,
    required:true
   },
   id:{
    type:String,
    required:true
   },
   discount:String,
   brand:{
    type:String
   },
   screenSize:String,
   memory:String,
   battery:String,
   megapixel:String
   

})

const ShortProduct = mongoose.model('ShortProduct',sort)

module.exports = ShortProduct