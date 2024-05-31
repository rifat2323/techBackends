const express = require("express")
const router = express.Router()
const validateUser = require('../../middleware/Uservalidate.js')
const Cart = require("../../models/Cart.js")
const sanitize  =require('sanitize-html')
const ShortProduct = require('../../models/SortInfoProduct.js') 
const stripe = require('stripe')(process.env.STRIPE_SECRET)
const OrderTrack = require('../../models/OrderTrack.js')

/**
 * 
 * @param {Array} array 
 */
const total = (array) =>{

   const restToatl = array.reduce((index,t)=> index + (t.productId.price * t.productCount),0)
   return restToatl

}

/**
 * 
 * @param {Array} array 
 */


 router.get('/addedtocart',validateUser, async (req,res)=>{
    const userId = req.foundUser._id;
    const productId = sanitize(req.query.productId); 
    const findProduct = await ShortProduct.findOne({ id:productId });
    if(!findProduct) return res.status(404).send("product not found");


    let CartItems = await Cart.findOne({userId:userId}).populate('productIdes.productId')
    /* console.log(CartItems.productIdes) */

     try{
        if(!CartItems){
            const newAdd= await Cart.create({
               userId:userId,
               productIdes:[{productId:findProduct._id,productCount:1}],
               total:findProduct.price

            })
            if(!newAdd) return res.status(406).send("can't add")
                return res.status(200).send("product added successfully")
        }else{
          const alreadyThere = CartItems.productIdes.find(item => item.productId._id.toString() ===findProduct._id.toString()  )
           if(alreadyThere) return res.status(200).send("product already there")
          const pushed =  CartItems.productIdes.push({productId:findProduct._id, productCount:1})
           const tolal =  CartItems.total = Number(CartItems.total +findProduct.price )
           if(!pushed || !tolal ) return res.status(405).send("no pushed")
         
        }
        await CartItems.save()
        return res.status(200).send("new product added successfully")
      
     }catch(error){
        console.log(error)
     }


 })

 router.get('/cartdetalis',validateUser, async(req,res)=>{
   const userId = req.foundUser._id;
     try{
      const foundCart = await Cart.findOne({userId:userId}).populate("productIdes.productId")
      if(!foundCart) return res.status(408).send("no cart items found")

         return res.status(200).json({items:foundCart.productIdes, total:foundCart.total, afterTotal:foundCart.totalAfterDiscount})


     }catch(error){

      console.log(error)
      return res.status(500).send("error: " + error)
     }


 })

 router.get('/cartnumber/:id',validateUser, async (req,res)=>{
   const productNumber  =  sanitize( Number(req.query.productNumber))
   const userId = req.foundUser._id;
   const id = req.params.id
   if(isNaN(productNumber)){
      return res.status(404).send("not a number")
   }
   
   try{
      const foundCart = await Cart.findOne({userId:userId}).populate("productIdes.productId")
      if(!foundCart) return res.status(408).send("no cart items found")
         const findItem = foundCart.productIdes.find(item=>item._id.toString() === id.toString())
      if(!findItem) return res.status(404).send("no item found")

         findItem.productCount = productNumber

     const totals = total(foundCart.productIdes)
     foundCart.total = totals
       await foundCart.save()
       return res.status(200).send({productUpdate:true})

   }catch(error){
      console.log(error)
      return res.status(500).send("error: " + error)
   }

 })
 router.get('/removefromcart/:id',validateUser, async (req,res)=>{
   
   const userId = req.foundUser._id;
   const id = req.params.id
  
   
   try{
      let foundCart = await Cart.findOne({userId:userId}).populate("productIdes.productId")
      if(!foundCart) return res.status(408).send("no cart items found")
         foundCart.productIdes = foundCart.productIdes.filter(item=>item._id.toString() !== id.toString())
         

      

     const totals = total(foundCart.productIdes)
     foundCart.total = totals
       await foundCart.save()
       return res.status(200).send({productDelete:true})

   }catch(error){
      console.log(error)
      return res.status(500).send("error: " + error)
   }

 })

 router.get('/checkoutseasson',validateUser, async (req,res)=>{
   const userId = req.foundUser._id;
   const id = userId.toString()
   try{
      const findUserCart = await Cart.findOne({userId:userId}).populate("productIdes.productId")
       if(!findUserCart) return res.status(400).send("user don't have any cart information")
         const  line_items =  findUserCart.productIdes.map(item=>({

            price_data:{
               currency:"usd",
               product_data:{
                    name:item.productId.productName,
                    images :[item.productId.image],
                     
   
               } ,
               unit_amount:item.productId. price*100
   
   
            },
            quantity:item.productCount

      }))

       const data = await stripe.checkout.sessions.create({
         mode: 'payment',
         metadata:{
           userId:id
         },
         line_items,
         success_url:`http://localhost:3000`,
         cancel_url :`http://localhost:3000`,
         payment_method_types:['card'],
        


       })
       console.log(data.url)
       res.json({ url: data.url });
   }catch(error){

      console.log(error)
      res.status(500).send("error: " + error)
   }
 })
 router.get('/ordertrackuser',validateUser, async (req,res)=>{
   
   const userId = req.foundUser._id;
 try{
   const findTrack = await OrderTrack.findOne({$and:[{userId:userId},{active:true}]}).sort({createdAt:1})
   if(!findTrack) return res.status(400).send("no track order found")
    
      res.status(200).json(findTrack.deliveryStatus)
 }catch(error){
   console.log(error)
   res.status(500).send("server error: " + error)
 }
})
router.get('/orderhistoryuser',validateUser, async (req,res)=>{
   const userId = req.foundUser._id;
 try{
   const findTrack = await OrderTrack.find({userId:userId}).sort({createdAt:1}).populate('productIdes.productId')
   if(!findTrack) return res.status(400).send("no track order found")
      console.log(findTrack)
      res.status(200).json(findTrack)
 }catch(error){
   console.log(error)
   res.status(500).send("server error: " + error)
 }
})


 router.post('/webhook', async (req,res)=>{
   const event = req.body
 try{
 if(event.type === 'checkout.session.completed'){
   const data =  event.data.object
   if(data.status === "complete"){
       const foundUser = await Cart.findOne({userId:data.metadata.userId})
       const newOrderTrack = await OrderTrack.create({
         userId:foundUser.userId,
         productIdes:foundUser.productIdes,
         total: foundUser.total,
         deliveryStatus:"paid"
       })
       foundUser.productIdes = []
        await foundUser.save()
     console.log(newOrderTrack)
   }
    
   
 }
 res.status(200).send("you got it right")
 }catch(error){
   console.log(error)
   return res.status(500).send("error: " + error)
 }
 })


  module.exports = router