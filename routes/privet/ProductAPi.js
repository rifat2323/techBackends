const express = require('express')
const ShortProduct = require('../../models/SortInfoProduct.js')
const router = express.Router()
const Product = require('../../models/detalisProduct.js')
const coludanary =  require('cloudinary').v2
const multer  =require('multer')
const path  =require('path')
const  fs = require('fs')

 coludanary.config({
   cloud_name: process.env.CloudName, 
   api_key: process.env.Apikey, 
   api_secret: process.env.apisecret 
 })

 const storage = multer.diskStorage({
    destination : function (req,file,cb){
      cb(null,path.join(__dirname,'..','..','picture'))
    },
    filename: function (req, file, cb) {
      const newFileName = `${Date.now()}_${file.originalname}`;
      cb(null, newFileName) 
    }
 })
 const upload = multer({storage:storage})
router.post('/shortProduct',async (req,res)=>{
    const {image,price,productName,id,brand,screenSize,memory,battery} = req.body;
     try{
       const newProduct = await ShortProduct.create({image,price,productName,id,brand,screenSize,memory,battery})
       if(!newProduct){
        res.status(404).send(" can't post")
       }
       res.status(200).send(newProduct)
     }catch(error){
        res.status(500).send("server error: " + error)
     }
})

router.post('/product',async (req,res)=>{
    const {productName,price,color,discountPrice,variant,highlight,hintInfo,brif,description,additional,id} = req.body

 try{
   const newProduct = await Product.create({productName,price,color,discountPrice,variant,highlight,hintInfo,brif,description,additional,id})
   if(!newProduct) {
      return res.status(404).send("can't post the product something wrong")
   }
   res.status(200).json(newProduct)
 }catch(error){
    console.log(error)
 }


})


router.post('/pictures',upload.fields([
{
   name:"color1",
   maxCount:4
},
{
   name:"color2",
   maxCount:4
},
{
   name:"color3",
   maxCount:4
},
{
   name:"color4",
   maxCount:4
}

]),async (req,res)=>{

    if(req.files.color1){
      req.files.color1.map( async (item,index)=>{
         try{
            const result = await coludanary.uploader.upload(item.path,{folder:"tech"})
            return res.status(200).json(result)
         }catch(error){
            console.log(error)
         }
     
      })
    }
   res.status(200)
})



module.exports = router