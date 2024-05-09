const mongoose = require('mongoose')

const picture = new mongoose.Schema({
  Pictures:[
    {
        color:String,
        image:[]
    }
  ],
  id:{
    type:String,
    required:true
  }


})

const Picture = mongoose.model("Picture",picture)
module.exports = Picture