const express = require("express")

const route = express.Router()
const Sells = require('../../../models/produtselles.js')
const OrderTrack = require('../../../models/OrderTrack.js')

const S = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday",]

const percent =  (a,b)=>{
  const value  = ((a -b) / a) * 100;
  return value


}

route.get('/highlightsadmins', async (req,res)=>{
    const lastDay = Date.now() - (1000*60*60*24)
    try{
     const getTodaysSells = await Sells.find({salesAt:{$gte:Date.now()}})
       const lastDays = await Sells.find({salesAt:{$gte:lastDay,$lte:Date.now()}})
          const totalSales = getTodaysSells.reduce((a,b)=> a.total + b.total,0)
          const previousDays = lastDays.reduce((a,b)=> a.total + b.total,0)
          const totalSalesIncised = percent(totalSales,previousDays)

          const totalOrder =await OrderTrack.find({ createdAt: {$gte: Date.now()}})
          const totalOrderLastDays = await OrderTrack.find({ createdAt: {$gte:lastDay}})
          const  total_OrderIncise = percent(totalOrder,totalOrderLastDays)
          const totalProductSold = await OrderTrack.find({ $and:[{createdAt: {$gte: Date.now()}},{deliveryStatus:'delivered'}]})
          const totalProductSoldLastDays = await OrderTrack.find({ $and:[{createdAt: {$gte: lastDay}},{deliveryStatus:'delivered'}]})
          const product_sold_OrderIncise = percent(totalProductSold,totalProductSoldLastDays)



     console.log(lastDays)
     res.status(200).json({
       totalSales:totalSales,
       totalSalesIncise:totalSalesIncised || 0,
       total_Order:totalOrder.length,
       total_OrderIncise:total_OrderIncise || 0,
       product_sold:totalProductSold.length,
       product_sold_OrderIncise:product_sold_OrderIncise || 0,
       new_customer:30
     })


    }catch(error){
        console.log(error)
        return res.status(500).send("server error" + error)
    }
})

route.get('/totalreveneu', async (req,res)=>{
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

   try{
    const salesData  =  await Sells.aggregate([
        {
            $match:{
                salesAt:{$gte:sevenDaysAgo}
            }
        },
        {
            $group:{
                _id:{$dayOfWeek:"$salesAt"},
                totalRevenue:{$sum:"$total"}
            }
        },
        {
            $sort:{
                "_id":1
            }
        }

    ])
    const date = new Date();
    const todayIndex = date.getDay(); // getDay() returns 0 for Sunday, 1 for Monday, etc.
    const orderedDays = S.slice(todayIndex + 1).concat(S.slice(0, todayIndex + 1));
    /*   const h = salesData.map(item=>console.log(item)) */
    const results = orderedDays.map(dayName => {
      const dayIndex = (S.indexOf(dayName) + 1) % 7 || 7; // Adjust to match $dayOfWeek where Sunday is 1 and Saturday is 7
     
      const dayData = salesData.find(day => day._id === dayIndex);
      return {
        day: dayName,
        totalRevenue: dayData ? dayData.totalRevenue : 0
      };
    });

    return res.status(200).json(results);

   }catch(error){
    console.log(error)
    return res.status(500).send("error: " + error)
   }


})


route.get("/productSold", async (req,res)=>{
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  try{
  const salesData = await OrderTrack.aggregate([
     {
        $match:{ 
            updatedAt:{$gte:sevenDaysAgo}
        }
     },
     {
        $group:{
            _id:{$dayOfWeek:"$updatedAt"},
            totalRevenue:{$sum:"$total"}

        }
     },
     {
        $sort:{"_id":1}
     }
  ])
 const date = new Date()
 const todayIndex = date.getDay()
  const OrderDays = S.slice(todayIndex+1).concat(S.slice(0,todayIndex+1))
  const result  = OrderDays.map(dayName=>{
    const dayIndex = (S.indexOf(dayName) + 1) % 7 || 7;
     const dayData = salesData.find(day=>day._id ===dayIndex )
     return{
        day:dayName,
        totalRevenue:dayData ? dayData.totalRevenue : 0
     }
  })
  res.status(200).json(result)
  }catch(error){
    console.log(error)
    return res.status(500).send("error: " + error)
  }


})



module.exports = route