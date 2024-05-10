const express = require('express');

const ShortProduct = require('../../models/SortInfoProduct.js')
const Product = require('../../models/detalisProduct.js')
const FilterOption = require('../../models/FilterOption.js')
const Picture = require('../../models/Picture.js')

const router = express.Router()

router.get('/filter/:category', async (req,res) =>{
    const category = req.params.category;

    try{
      
        const filterOption = await FilterOption.find({category:category})
        if(!filterOption) return res.status(404).send("can't find any filter option")
            res.status(200).json(filterOption)
    }catch(error){
        console.log(error)
        return res.status(500).send("server error: " + error)
    }
})
router.get('/product/:category', async (req,res) =>{
    const category = req.params.category;

    try{
      
        const products = await ShortProduct.find({category:category}).limit(20)
        if(!products) return res.status(404).send("can't find any filter option")
            res.status(200).json(products)
    }catch(error){
        console.log(error)
        return res.status(500).send("server error: " + error)
    }
})
router.get('/singleProduct/:id', async (req,res) =>{
    const id = req.params.id;

    try{
      
        const products = await Product.findOne({id:id})
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
    

    try{
      
        const picture = await Picture.findOne({id:id})
        if (!picture) {
            return res.status(404).send("Can't find any picture with the provided ID");
        }

        // Check if the Pictures array exists within the found picture object
        if (!picture.Pictures || picture.Pictures.length === 0) {
            return res.status(404).send("No pictures found for the provided ID");
        }
        const filter  = await picture.Pictures.find(item=>item.color === color)
         
        if (!filter) {
            return res.status(404).send("No picture found with the provided color");
        }
         res.status(200).json(filter)
    }catch(error){
        console.log(error)
        return res.status(500).send("server error: " + error)
    }
})



module.exports = router