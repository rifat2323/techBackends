
const coludanary =  require('cloudinary').v2
const multer  =require('multer')
const path  =require('path')
const  fs = require('fs/promises')
const ShortDetails = require('../.././../models/SortInfoProduct.js')
const express = require('express')
const router = express.Router()
const Product = require('../../../models/detalisProduct')
coludanary.config({
    cloud_name: process.env.CloudName, 
    api_key: process.env.Apikey, 
    api_secret: process.env.apisecret 
  })

  const storage = multer.diskStorage({
    destination : function (req,file,cb){
      cb(null,path.join(__dirname,'..','..','..','picture'))
    },
    filename: function (req, file, cb) {
      const newFileName = `${Date.now()}_${file.originalname}`;
      cb(null, newFileName) 
    }
 })
 const upload = multer({storage:storage})

 router.post('/shortdetailse/mobile', upload.single('image'),async (req,res)=>{
    const {BrandName,ScreenSize,Memory,Battery,id,discount} = JSON.parse(req.body.sortObj) 
    if(!BrandName || !ScreenSize || !Memory || !Battery || !id) return res.status(404).send('all status need')
    const img = req.file.path
    console.log(Battery,Memory)
   let screenSize;
   let memory;
   let battery;
   const findProduct = await Product.findOne({uniqId:id})
   if(!findProduct) return res.status(404).send("no product found")
 try{

  const result = await coludanary.uploader.upload(img, {
    resource_type:"image",
    folder:"tech"
  })
  await fs.unlink(img)
  if (parseFloat(ScreenSize) <= 5.5) {
    screenSize = "small";
  } else if (parseFloat(ScreenSize) <= 6.5) {
    screenSize = "medium";
  } else if (parseFloat(ScreenSize) <= 18.5) {
    screenSize = "large";
  } else {
    screenSize = "Small (<=5.5)"; // You can set a default value if needed
  }

  if (parseInt(Battery) <= 3000) {
    battery = "<3000";
  } else if (parseInt(Battery) <= 5000) {
    battery = "3000-5000";
  } else if (parseInt(Battery) <= 10000) {
    battery = ">5000";
  } else {
    battery = "<3000"; // You can set a default value if needed
  }

  if (parseInt(Memory) <= 4) {
    memory = "2-4";
  } else if (parseInt(Memory) <= 8) {
    memory = "4-8";
  } else if (parseInt(Memory) <= 100) {
    memory = "8-16";
  } else {
    memory = "2-4"; // You can set a default value if needed
  }
  const newObj = await ShortDetails.create({
    screenSize,memory,battery,brand:BrandName,image:result.url,price:findProduct.discountPrice,productName:findProduct.productName,id:findProduct.id,category:"mobile",discount:discount
  })
  console.log(battery,memory)
 res.status(200).json(newObj)

 }catch(error){
    console.log(error)
    return res.status(500).send("server error" + error)
 }


 })
 router.post('/shortdetailse/computers', upload.single('image'),async (req,res)=>{
    const {ssd,ram,processor,id,discount} = JSON.parse(req.body.sortObj) 
    if(!ssd,!ram,!processor|| !id) return res.status(404).send('all status need')
    const img = req.file.path
   
   
   const findProduct = await Product.findOne({uniqId:id})
   if(!findProduct) return res.status(404).send("no product found")
 try{

  const result = await coludanary.uploader.upload(img, {
    resource_type:"image",
    folder:"tech"
  })
  await fs.unlink(img)
 
  const newObj = await ShortDetails.create({
    ssd:ssd,ram:ram,processor:processor,image:result.url,price:findProduct.discountPrice,productName:findProduct.productName,id:findProduct.id,category:"computers",discount:discount
  })
 
 res.status(200).json(newObj)

 }catch(error){
    console.log(error)
    return res.status(500).send("server error" + error)
 }


 })


 module.exports = router