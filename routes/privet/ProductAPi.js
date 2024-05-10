const express = require('express')
const ShortProduct = require('../../models/SortInfoProduct.js')
const router = express.Router()
const Product = require('../../models/detalisProduct.js')
const coludanary =  require('cloudinary').v2
const multer  =require('multer')
const path  =require('path')
const  fs = require('fs/promises')
const Picture = require('../../models/Picture.js')
const FilterOption = require('../../models/FilterOption.js')

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
    return res.status(500).send("server error")
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
 const {color1,color2,color3,color4,id} = req.body;
 

   try{
     
      let wholeArray = []
      
      if(req.files.color1){

         const picture1 = await Promise.all( req.files.color1.map( async (item,index)=>{
            try{
               const result = await coludanary.uploader.upload(item.path,{folder:"tech"})
                   
                    
                   
                await fs.unlink(item.path)
                return result.url
            }catch(error){
               console.log(error)
            }
        
         }))
         let tempObej ={
            color:color1,
            image:picture1
         }
         wholeArray.push(tempObej)
       }
      if(req.files.color2){

        const picture2 = await Promise.all( req.files.color2.map( async (item,index)=>{
            try{
               const result = await coludanary.uploader.upload(item.path,{folder:"tech"})
                   
                    
                   
                await fs.unlink(item.path)
                return result.url
               
            }catch(error){
               console.log(error)
            }
           
         }))
         let tempObej ={
            color:color2,
            image:picture2
         }
         wholeArray.push(tempObej)
       }
      if(req.files.color3){

        const picture3 =await Promise.all( req.files.color3.map( async (item,index)=>{
            try{
               const result = await coludanary.uploader.upload(item.path,{folder:"tech"})
                 
                      
                await fs.unlink(item.path)
                return result.url
               
            }catch(error){
               console.log(error)
            }
        
         }))
         let tempObej ={
            color:color3,
            image:picture3
         }
         wholeArray.push(tempObej)
       }
      if(req.files.color4){

        const picture4 = await Promise.all( req.files.color4.map( async (item,index)=>{
            try{
               const result = await coludanary.uploader.upload(item.path,{folder:"tech"})
                   
                    
                      
                await fs.unlink(item.path)
                return result.url
               
            }catch(error){
               console.log(error)
            }
        
         }))
         let tempObej ={
            color:color4,
            image:picture4
         }
         wholeArray.push(tempObej)
       }

    
   
    
   
      const newResult  =  await Picture.create({Pictures:wholeArray,id:id})
      if(!newResult) return res.status(404).send("no picture uploaded")
      res.status(200).json(newResult)
   }catch(error){
      console.error("error" + error)
      return res.status(500).send('server error')
   }
  
})

router.post("/filter",async (req,res)=>{
   const {title,checkBoxValue,category} = req.body
   if(!title,!checkBoxValue){
      return res.status(404).send("nothing here")
   }
try{
   const newFilter =  await FilterOption.create({title:title,checkBoxValue:checkBoxValue,category:category})
   if(!newFilter) return res.status(404).send("nothing here")
      res.status(200).json(newFilter)
   
}catch(error){
   console.error("error" + error)
   return res.status(500).send('server error')
}
})

module.exports = router