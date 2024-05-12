

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:8000](http://localhost:8000) with your browser to see the result.

You can start editing the page by modifying `index.js`. 


## folder
routes have all the necessary code for each end point. it have privet for only admin also have public for public access.
## models
this have all the necessary code for mongoose models
## multer
here you can find not the best practice but over all good examples of multer use

## joi
joi is a validator . so simply what is does just validate what type of your query,params,body etc . here is a example so you can understand more.  install joi by npm i joi
go there website to learn more about joi [joi](https://joi.dev/)
1. create a schema 
```javascript
 const first = Joi.object({
    category:Joi.string()
  })
  function or api endpoint
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
```
## sanitize-html
sanitize-html is a power full library  fro xss attack simple what is does just remove any unwanted link,script or other sql statements from your request

here is a simple example
1. import it from library  or just install by npm i sanitize-html 
const sanitizer = require('sanitize-html')
let dart = <img src=x />
 const clean = sanitizer(dart) //output will be either nothing or <img/>

2. api end point example 
```javascript
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

