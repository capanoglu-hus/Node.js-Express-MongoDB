const fs = require('fs')
const Tour = require('./../models/tourModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerController')

exports.aliasTopTours = (req,res,next) =>{
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}
exports.getAllTours = factory.getAll(Tour)
// exports.getAllTours = catchAsync (async (req , res,next) => {
    
//       const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate()
//         const tours = await features.query;
//         // send response
//         res.status(200).json({
//         status:'success',
//         results : tours.length,
//         data : {
//             tours
//         }

// })
// })

/*exports.getTour = catchAsync (async (req , res ,next) => {
    console.log(req.params.id)
    const tour = await Tour.findById(req.params.id).populate('guides')
    console.log(tour)
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
   
  
})*/
exports.getTour = factory.getOne(Tour , {path:'reviews'})
// exports.getTour = catchAsync(async (req, res, next) => {
    
//   const tour = await Tour.findById(req.params.id).populate('reviews');
  
//   /*populate({
//     path : 'guides',
//     select: '__v-passwordChangedAt'
//   }); */// kişilerin id ile bilgilerini getiriyor
//   // Tour.findOne({ _id: req.params.id })

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   });
// });

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
// exports.updatedTour = catchAsync (async (req, res,next) =>{
    
//         const tour = await Tour.findByIdAndUpdate(req.params.id, req.body , {
//             new: true,
//             runValidators : true // modelde verilerde yapılan zorunlulukları güncelleme için de yapar 
//         })

//          if(!tour){
//         return next(new AppError(`not find ID ` , 404))
//     }

//         res.status(200).json({
//             status: 'success',
//             data : {
//                 tour
//             }
//         })   
// })

exports.updatedTour = factory.updateOne(Tour) // factory sınıfından update 

// exports.deleteTour = catchAsync (async (req, res,next) =>{
   
    
//     // 204 -> içerik yok demek o yüzden data null 
//     const tour = await Tour.findByIdAndDelete(req.params.id)    
//      if(!tour){
//         return next(new AppError(`not find ID ` , 404))
//     }
//     res.status(204).json({
//         status : 'success',
//         data: null
//     })
// })

exports.deleteTour = factory.deleteOne(Tour)


// exports.createTour = catchAsync (async (req ,res ,next) =>{
//     const newTour = await Tour.create(req.body)

//         res.status(201).json({
//             status : 'success',
//             data :{
//                 tour : newTour
//             }
//         })
   
//    /* try{
//         //console.log(req.body)

//         // const nweTour = new Tour({})
//         // newTour.save()

//         const newTour = await Tour.create(req.body)

//         res.status(201).json({
//             status : 'success',
//             data :{
//                 tour : newTour
//             }
//         })
//     } catch (err){
//         console.log(err)
//         res.status(400).json({
//             status: 'fail',
//             message : err
//         })
//     }
// */
// })

exports.createTour= factory.createOne(Tour)

exports.getTourWithin = catchAsync(async (req,res,next) => {
    console.log('deneme')
    const {distance , latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')
    // unit birimine göre mi olursa yarıçap hesaplaması değişiyor
    const radius = unit === `mi` ? distance / 3963.2 : distance/6378.1;
    if( !lat || !lng ){
        next(new AppError('please provide latitutr ans longitude in the format lat,lng',400))
    }
    console.log(distance,lat,lng,unit)

    const tours = await Tour.find({
        startLocation: { $geoWithin : { $centerSphere: [[lng,lat],radius]}} // enlem ,boylam, yarıçap
    })
    res.status(200).json({
        status : 'success',
        results: tours.length,
        data : {
            data : tours
        }
    })
})
/*
exports.getDistances = catchAsync( async(req,res,next) => {
  
    const {  latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')
    // unit birimine göre mi olursa yarıçap hesaplaması değişiyor
    if( !lat || !lng ){
        next(new AppError('please provide latitutr ans longitude in the format lat,lng',400))
    }
   
  
    //geoNeo düzlemsel olarak birleştirme boru hat aşaması

    const distances = await Tour.aggregate([
        {
            $geoNear:{
                near:{
                    type:'Point',
                    coordinates: [lng * 1 , lat * 1]
                },
                distanceField :'distance',
                distanceMultiplier:0.001
            }
        },
        {
            $project :{
                distance:1,
                name:1
            }
        }
    ])

    res.status(200).json({
        status : 'success',
        
        data : {
            data : distances
        }
    })
}) */

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }
  console.log('deneme')
  const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          distanceField: 'distance',
          spherical: true,
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);
  console.log(distances)
  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
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






