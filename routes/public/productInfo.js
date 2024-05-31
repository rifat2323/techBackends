const express = require('express');

const ShortProduct = require('../../models/SortInfoProduct.js')
const Product = require('../../models/detalisProduct.js')
const FilterOption = require('../../models/FilterOption.js')
const Picture = require('../../models/Picture.js')
const Joi = require('joi')
const sanitizer = require('sanitize-html');


const router = express.Router()

  const first = Joi.object({
    category:Joi.string()
  })
  const second = Joi.object({
    category:Joi.string().required(),
    setPrice:Joi.number().integer().allow(NaN).optional(),
    page:Joi.number().integer().optional()
  })
  const third = Joi.object({
    category:Joi.string().optional() || Joi.array().max(5).optional(),
     brand:Joi.string().optional() || Joi.array().max(5).optional(),
     screenSize:Joi.string().optional() || Joi.array().max(5).optional(),
     battery:Joi.string().optional() || Joi.array().max(5).optional(),
     memory:Joi.string().optional() || Joi.array().max(5).optional()
  })
router.get('/filter/:category', async (req,res) =>{
    const category = req.params.category;
    if(!category) return res.statusCode(404)
     const {error,value} = first.validate({category:category})
       if(error){
        return res.sendStatus(408)
       }
       const newCat = sanitizer(category)
    try{
      
        const filterOption = await FilterOption.find({category:newCat})
        if(!filterOption) return res.status(404).send("can't find any filter option")
            res.status(200).json(filterOption)
    }catch(error){
        console.log(error)
        return res.status(500).send("server error: " + error)
    }
})
router.post('/product/:category', async (req,res) =>{
    const category = req.params.category || "mobile";
    const sortQuery = parseInt(req.query.setPrice)
    const page = parseInt(req.query.page) || 1 ;

    const limit = 20;
    const skip =  (page -1)*limit;
     
   const body =    req.body  || {};
    console.log(category)

     const findes = Object.assign(body,{category:category})
     if(!category) return res.statusCode(404)
        
       const {erro,value} = second.validate({category:category,setPrice:sortQuery,page:page})
       const {error,valu} = third.validate(findes)
      
     
       if(error || !value){
        return res.sendStatus(408)
       }
       
      
    try{
      
        let products;

        if (sortQuery) {
            // If sort query parameter is provided, sort accordingly
            products = await ShortProduct.find(findes).skip(skip).limit(limit).sort({ price: sortQuery });
           
        } else {
            // Default sorting
            products = await ShortProduct.find(findes).skip(skip).limit(20);
           
        }
      
        if(!products) return res.status(404).send("can't find any filter option")
            res.status(200).json(products)
    }catch(error){
        console.log(error)
        return res.status(500).send("server error: " + error)
    }
})
router.get('/singleProduct/:id', async (req,res) =>{
    const id = req.params.id;
    const newId = sanitizer(id)
    if(!newId || !id) return res.sendStatus(405)
    try{ 
      
        const products = await Product.findOne({id:newId})
        if(!products) return res.status(404).send("can't find any filter option")
            res.status(200).json(products)
    }catch(error){
        console.log(error)
        return res.status(500).send("server error: " + error)
    }
})
router.get('/picture/:id', async (req,res) =>{
    const id = req.params.id;
    const color  = req.query.color
    const newId = sanitizer(id)
    if(!newId || !id) return res.sendStatus(405)
        const colors = sanitizer(color)
    try{
      
        const picture = await Picture.findOne({id:newId})
        if (!picture) {
            return res.status(404).send("Can't find any picture with the provided ID");
        }

        // Check if the Pictures array exists within the found picture object
        if (!picture.Pictures || picture.Pictures.length === 0) {
            return res.status(404).send("No pictures found for the provided ID");
        }
        const filter  = await picture.Pictures.find(item=>item.color === colors)
         
        if (!filter) {
            return res.status(404).send("No picture found with the provided color");
        }
         res.status(200).json(filter)
    }catch(error){
        console.log(error)
        return res.status(500).send("server error: " + error)
    }
})

// new Schema for search 
const searchSchema = Joi.object({
    name:Joi.string(),
    sort:Joi.number().integer().min(-1).max(1).allow(NaN)
})
/**
 * @param {import('express').Request} req -- express request object
 * @param {import('express').Response} res -- express response object
 * @param {String} req.params.query -- user query string
 * @returns {Promise<void>} --promise with json array
 * @throw {Error} 
 */

router.get('/search/:name', async(req,res)=>{
      const name = req.params.name
      const sort = parseInt(req.query.setPrice)
      if(!name) return res.status(404).send("no params for search")
         
        const afterFilter = sanitizer(name)
        if(!afterFilter) return res.status(404).send("no params for search")
    const itemSort = parseInt( sanitizer(sort))
     const {error,value} = searchSchema.validate({name:afterFilter,sort:itemSort})
     if(error){
        return res.status(404).send("op!ps something wrong")
     }
     try{
        let searchProduct ;
        if(itemSort){
             searchProduct = await ShortProduct.find({ $or:
                [
                 {productName:{$regex:afterFilter, $options:"i"}},
                 {brand:{$regex:afterFilter, $options:"i"}}
                ] 
             }).sort({price:itemSort});
        }else{
            searchProduct = await ShortProduct.find({ $or:
                [
                 {productName:{$regex:afterFilter, $options:"i"}},
                 {brand:{$regex:afterFilter, $options:"i"}}
                ] 
             });
        }
       
       res.status(200).json(searchProduct)

     }catch(error){
        console.log(error)
        res.status(500).send("file error" + error)
     }

})

router.get('/discount', async (req,res)=>{
    try{
      const discount = await ShortProduct.find({discount:{$gte:50}}).limit(20)
      if(!discount) return res.status(404).send("no discount found")
         res.status(200).json(discount)
    }catch(error){
        console.log(error)
        res.status(500).send("file error" + error)
    }
})
module.exports = router