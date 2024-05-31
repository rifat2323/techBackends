const User = require('../../models/user.js');
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")
const express = require('express')
const router = express.Router()
const sanitize  =require('sanitize-html')
const joi = require('joi');
const validateUser = require('../../middleware/Uservalidate.js')
const WishList = require('../../models/wishList.js')
const ShortProduct = require('../../models/SortInfoProduct.js') 


const reg = joi.object({
    userName: joi.string(),
    email: joi.string(),
    password: joi.string(),
})
const login = joi.object({
    userName: joi.string(),
   
    password: joi.string(),
})

router.post('/userReg', async (req,res)=>{
 const userName = sanitize(req.body.userName)
 const email = sanitize(req.body.email)
 const password = sanitize(req.body.password)
  if(!userName || !email || !password) return res.status(405).send("no email or password username")
    const {error,value } = reg.validate({userName,email,password})
if(error) return res.status(405).send("validated fail")

     try{
      
        const crptPassword = await bcrypt.hash(password,10)
        const newUser = await User.create({
            userName:userName,
            email:email,
            password:crptPassword
        })
        if(!crptPassword) return res.status(404).send("op!ps cant create new user")
            res.status(200).json(newUser)




        
     }catch(error){
         res.status(500).send("server error" + error)
     }
})

//?login
router.post('/userLogin', async (req,res)=>{
 const userName = sanitize(req.body.userName)
 
 const password = sanitize(req.body.password)

  if(!userName ||  !password) return res.status(405).send("no  password or username")
    const {error,value } = login.validate({userName,password})
if(error) return res.status(405).send("validated fail")

     try{
      
        const findUser = await User.findOne({userName:userName})
        if(!findUser) return res.status(404).send("user not found")
            const match  = await bcrypt.compare(password, findUser.password)
        if(!match) return res.status(404).send("password mismatch")
        const accessToken = jwt.sign( 
      {
        userName:findUser.userName,
        email:findUser.email
       }, process.env.access_token,{expiresIn:'1d'})
        const refreshToken = jwt.sign( 
      {
        userName:findUser.userName,
        
       }, process.env.refresh_token,{expiresIn:'1d'})
       findUser.refreshToken = refreshToken
       await findUser.save()
        res.cookie("access_token",accessToken,{maxAge:60*60*1000,httpOnly:true,secure:true})
        res.cookie("refresh_token",refreshToken,{maxAge:60*60*1000,httpOnly:true,secure:true })
        res.status(200).send({authorized:true})
       
     }catch(error){
         res.status(500).send("server error" + error)
     }
})
//?login with google
router.post('/withgoogle', async (req,res)=>{
    const user = sanitize(req.body.jwt)
    if(!user) return res.status(404).send("no user")
     try{ 
        const decode = jwt.decode(user)
        if(!decode) return res.status(405).send("can't decode")
        if(!decode.email || !decode.name || !decode.email_verified  ) return res.status(408).send("you have error")
         const findUser = await User.findOne({email:decode.email})
           if(findUser){
            if(findUser.userName !== decode.name) return res.status(403).send("user name not match")
                const accessToken = jwt.sign( 
                    {
                      userName:findUser.userName,
                      email:findUser.email
                     }, process.env.access_token,{expiresIn:"1d"})
                      const refreshToken = jwt.sign( 
                    {
                      userName:findUser.userName,
                      
                     }, process.env.refresh_token,{expiresIn:"1d"})
                     findUser.refreshToken = refreshToken
                     await findUser.save()
                      res.cookie("access_token",accessToken,{maxAge: 60*60*60*1000, httpOnly:true,secure:true})
                      res.cookie("refresh_token",refreshToken,{maxAge: 60*60*60*1000, httpOnly:true,secure:true})
                      res.status(200).json({authorized:true})
           }else{
           
            const accessToken = jwt.sign( 
                {
                  userName:decode.name,
                  email:decode.email
                 }, process.env.access_token,{expiresIn:"1d"});

                  const refreshToken = jwt.sign( 
                {
                  userName:decode.name,
                  
                 }, process.env.refresh_token,{expiresIn:"1d"});
                 const newUser = await User.create({
                    userName:decode.name,
                    email:decode.email,
                    img:decode.picture,
                    refresh_token:refreshToken
                })
                if(!newUser) return res.status(405).send("can't create new user")
               
                  res.cookie("access_token",accessToken,{maxAge: 60*60*60*1000, httpOnly:true,secure:true})
                  res.cookie("refresh_token",refreshToken,{maxAge: 60*60*60*1000, httpOnly:true,secure:true})
                  res.status(200).json({authorized:true})
            
           }
      
     }catch(error){
        res.status(500).send("server error" + error)
     }
})

router.get('/userinfo',validateUser, async (req,res)=>{
  const name = req.userName
  const foundUser = req.foundUser
      try{
         res.status(200).json({name:foundUser.userName, email:foundUser.email,img:foundUser.img || null})
      }catch(error){
        return res.status(500).send("server error: " + error)
      }

  

})
router.get('/userlogout',validateUser, async (req,res)=>{
    const foundUser = req.foundUser
  try{
     const userLog = await User.findById(foundUser._id)
     if(!userLog) return res.status(404).send("no user found")
       userLog.refreshToken = '';
       await userLog.save()
       res.clearCookie('access_token')
       res.clearCookie('refresh_token')
       res.status(200).json({logOut:true})
  }catch(error){
    return res.status(500).send("server error: " + error)
  }
})


router.get('/addedtowishlist',validateUser, async(req,res)=>{
  try{
  const userId = req.foundUser._id; // Ensure you're getting the user ID from the found user
    const productId = sanitize(req.query.productId); // Assuming the product ID is sent as a query parameter

    if (!productId) return res.status(400).send("Product ID is required");
      console.log(productId)
    let wishList = await WishList.findOne({ userId });
      const product = await ShortProduct.findOne({id:productId})
    if (!wishList) {
      // Create a new wishlist if it doesn't exist
      wishList = new WishList({ userId:userId, productIdes: [product._id] });
      await wishList.save();
      return res.status(200).send("Product added ");
    } else {
      // Check if the product ID is already in the wishlist
       const already  = wishList.productIdes.find(item => item.toString() === product._id.toString())
        
       if(already) return res.status(200).send("product already in wishlist")
        // Add the product ID to the wishlist
        wishList.productIdes.push(product._id);
        await wishList.save();
        return res.status(200).send("Product added to wishlist");
      
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
})


router.get('/userwishlist', validateUser, async (req, res) => {
  try {
    const userId = req.foundUser._id; // Ensure you're getting the user ID from the found user

    let wishList = await WishList.findOne({ userId }).populate('productIdes');

    if (!wishList) {
      return res.status(404).send("Wishlist not found");
    }

    res.status(200).json(wishList);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/removefromwishlist/:id', validateUser, async (req,res)=>{
  const userId = req.foundUser._id;
  const productId = req.params.id // Ensure you're getting the user ID from the found user

  
   try{
    let wishLists = await WishList.findOne({ userId });
  

  if (!wishLists) {
    return res.status(404).send("Wishlist not found");
  }
  wishLists.productIdes = wishLists.productIdes.filter(item => item.toString() !== productId.toString());
     await wishLists.save()
    return res.status(200).json({updated: "updated"})
   }catch(error){
    console.error(error);
    return res.status(500).send("Internal Server Error");
   }

})


module.exports = router