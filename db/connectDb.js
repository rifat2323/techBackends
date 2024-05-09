const mongoose  = require('mongoose')


const connectDB = async ()=>{
    try{
     const connect = await mongoose.connect(process.env.DB)
    }catch(error){
        console.error(error)
    }
}

module.exports = connectDB