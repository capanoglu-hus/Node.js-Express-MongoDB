const fs = require('fs')
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');


exports.aliasTopTours = (req,res,next) =>{
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}

exports.getAllTours = catchAsync (async (req , res,next) => {
    
      const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate()
        const tours = await features.query;
        // send response
        res.status(200).json({
        status:'success',
        results : tours.length,
        data : {
            tours
        }

})
})

exports.getTour = catchAsync (async (req , res ,next) => {
 
    const tour = await Tour.findById(req.params.id)

    if(!tour){
        return next(new AppError(`not find ID ` , 404))
    }

    // Tour.findOne({_id: req.params.id})
    res.status(200).json({
        status:'success',
        data : {
            tour
        }
    })
   
  
})

exports.getTourStats  = catchAsync (async (req, res,next) =>{
   
        const stats = await Tour.aggregate([
            {
                $match : {ratingsAverage: {$gte:4.5}}
            },
            {
                $group:{
                    _id: {$toUpper : `$difficulty`}, // seviyelere göre gruplandırma yaptırıyoruz -> ratingsAverage bile olabilir 
                    numTours : { $sum : 1},
                    numRatings : {$sum : `$ratingsQuantity`},
                    avgRating :{$avg : `$ratingsAverage`},
                    avgPrice : {$avg : `$price` },
                    minPrice : {$min : `$price` },
                    maxPrice : {$max : `$price` }
                }
            },
            {
                $sort : {avgPrice: 1 }
            },
            {
                $match : {_id : {$ne : 'EASY'}}
            }
            
        ])

        res.status(200).json({
        status:'success',
        data : {
            stats
        }
    })
        
    
})

exports.getMonthlyPlan = catchAsync (async (req ,res,next) => {

        const year = req.params.year * 1 ;

        const plan = await Tour.aggregate([
            {
                $unwind : `$startDates` 
            },
            {
                $match : {
                    startDates :{
                        $gte : new Date(`${year}-01-01`),
                        $lte : new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group : {
                    _id : { $month : `$startDates`},
                    numTourStarts : {$sum : 1 },
                    tours : {$push : `$name`}
                }
            },
            {
                $addFields : { month : `$_id`}
            },
            {
                $project : {
                    _id : 0
                }
            },
            {
                $sort : {
                    numTourStarts : -1
                }
            },
            {
                $limit : 12
            }
        ])
        res.status(200).json({
            status: 'success',
            data : {
                plan
            }
        })
   
})
exports.updatedTour = catchAsync (async (req, res,next) =>{
    
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body , {
            new: true,
            runValidators : true // modelde verilerde yapılan zorunlulukları güncelleme için de yapar 
        })

         if(!tour){
        return next(new AppError(`not find ID ` , 404))
    }

        res.status(200).json({
            status: 'success',
            data : {
                tour
            }
        })
    
   

    
}) 
exports.deleteTour = catchAsync (async (req, res,next) =>{
   
    
    // 204 -> içerik yok demek o yüzden data null 
    const tour = await Tour.findByIdAndDelete(req.params.id)    
     if(!tour){
        return next(new AppError(`not find ID ` , 404))
    }
    res.status(204).json({
        status : 'success',
        data: null
    })
  
    
   
})



exports.createTour = catchAsync (async (req ,res ,next) =>{
    const newTour = await Tour.create(req.body)

        res.status(201).json({
            status : 'success',
            data :{
                tour : newTour
            }
        })
   
   /* try{
        //console.log(req.body)

        // const nweTour = new Tour({})
        // newTour.save()

        const newTour = await Tour.create(req.body)

        res.status(201).json({
            status : 'success',
            data :{
                tour : newTour
            }
        })
    } catch (err){
        console.log(err)
        res.status(400).json({
            status: 'fail',
            message : err
        })
    }
*/
})







/* eski kodlar 

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

exports.checkId = (req,res,next,val) =>{
    console.log(`Tour id is : ${val}`)
    if(req.params.id * 1 > tours.length){
        return res.status(404).json({
            status:'fail',
            message: 'ınvalid id'
        })
    }
    next()
} 

exports.checkBody = (req,res,next) =>{
    console.log(req.body)
    
    if(!req.body.name || !req.body.price ) {
        return res.status(400).json({
            status:'fail',
            message: 'body is not empty'
        })
    }
    next()
}*/






