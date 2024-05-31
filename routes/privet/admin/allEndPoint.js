const jwt = require("jsonwebtoken")
const sanitizer = require("sanitize-html")
const joi = require('joi')
// this page only for admin details. all the necessary details will be provided by this page,
const express = require('express')
const router = express.Router()
const User = require('../../../models/user.js')

const Sells = require('../../../models/produtselles.js')
const OrderTrack = require('../../../models/OrderTrack.js')

router.get('/user', async (req,res)=>{
 const page = sanitizer( req.query.page) || 1

 const currentPage = (page -1) * 20

 try{ 
    const allUser = await User.find().skip(currentPage).limit(20)
    if(!allUser) return res.status(404).send("User not found")
      const newarray = allUser.map(item=>({userName:item.userName,email:item.email,img:item.img, _id:item._id  }))
 
     res.status(200).json(newarray)   

 }catch(error){
    console.lof(error)
    return res.status(500).send("Error: " + error)
 }
})
router.get('/user/:id', async (req,res)=>{
   const userId =  sanitizer( req.params.id)
 

 try{ 
    const allUser = await User.findOne({_id:userId})
    if(!allUser) return res.status(404).send("User not found")
      const userBuy = await Sells.find({userId:userId}).populate('productIds.productId')

       const userObj = {
         userName:allUser.userName, 
         email:allUser.email,
         img:allUser.img
       }
  
     res.status(200).json({userInfo:userObj,userBuyInfo:userBuy})   

 }catch(error){
    console.lof(error)
    return res.status(500).send("Error: " + error)
 }
})

router.get('/activeorder',  async (req,res)=>{
   try{
    const orders = await OrderTrack.find({$and:[{active:true},{$or:[{deliveryStatus:"paid"},{deliveryStatus:"way"}]}]}).sort({createdAt:1})
    if(!orders) return res.status(404).send("can't find order")
      res.status(200).json(orders)
   }catch(error){
      console.log(error)
      res.status(500).send("Error: " + error)
   }

})
router.get('/updateorderstatus', async (req,res)=>{
   const id = req.query.id;
    const status = req.query.status;
    if(!id || !status) return res.status(400).send("no id or status available please update those information")

    try{
     const findOrder = await OrderTrack.findOne({_id:id})
     if(!findOrder) return res.status(404).send("can't find the order")
      if(status === "way"){
         findOrder.deliveryStatus = status;
         await findOrder.save()
        return res.status(200).json({updatedStatus : "success"})
      }else if( status == "delivered"){
         findOrder.deliveryStatus = status;
         findOrder.active = false;
         const selles = await Sells.create({
            userId: findOrder.userId,
            productIds: findOrder.productIdes,
            total:findOrder.total
         })
         await findOrder.save()
       return res.status(200).json({delivered : "success"})
      }else {
         return res.status(400).json({status : "unknown"})
      }
     
    }catch(error){
      return res.status(500).send("Error: " + error)
    }

})

module.exports = router