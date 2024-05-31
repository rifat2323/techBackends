const mongoose  = require('mongoose')


const user = new mongoose.Schema({
  userName:{
    type:String,
    required:true,
    unique:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String
  },
  img:String,
 refreshToken:{
    type:String
 }

},{timestamps:true})

const User = mongoose.model("User",user)
module.exports = User