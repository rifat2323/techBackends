const sanitize = require("sanitize-html")
const User = require('../models/user.js')
const jwt = require('jsonwebtoken')


const validateUser =  async (req,res,next)=>{
    const access_token = req.headers.access_token
    const refresh_token = req.headers.refresh_token
      console.log( `refresh token ${refresh_token}`)
    
    const refreshToken = sanitize(refresh_token)
    const accessToken = sanitize(access_token)
    if(!refreshToken ) res.status(401).send("op!ps you did it wrong ")

   
        try{
          const accessVerify = jwt.verify(refreshToken,process.env.refresh_token,(err,decode)=>{
            if(err || undefined) return res.status(401).json({error:"too late"})
           req.userName = decode.userName
             
          })
          //we can also verify that by searching for users refreshtoken vs that token we got here
          const foundUser = await User.findOne({refreshToken:refreshToken})
          if(!foundUser) return res.status(404).send("user not found")
           req.foundUser = foundUser
         next()
        }catch(error){
          res.status(500)
        }
  
  }

  module.exports = validateUser