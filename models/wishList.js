const mongoose = require('mongoose')
const ShortProduct = require('./SortInfoProduct.js')




const wishList = new mongoose.Schema({

  userId :{
    type:String,
    required:true
  },
  productIdes:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:ShortProduct

    }
  ]

})

const WishList = mongoose.model('WishList',wishList)
module.exports = WishList