const fs = require('fs')
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');


exports.aliasTopTours = (req,res,next) =>{
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'
    next()
}

exports.getAllTours = async (req , res) => {
    try {
        // build query
       /* const queryObj = { ...req.query };
        const excludeFields = [`page` , `sort` , `limit` , `fields`]
        excludeFields.forEach(el => delete queryObj[el])
        //const query = Tour.find(queryObj)

        // Advenced Filtreing
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g , match => `$${match}`)
        queryStr = queryStr.replace(/("(\w+)":\s*"(\d+)")/g, '$1: $3');
        console.log(JSON.parse(queryStr))

        let query = Tour.find(JSON.parse(queryStr))*/

        //sorting
        /*if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ')
            console.log(sortBy)
            query = query.sort(sortBy)
        }else {
            query =query.sort('-createdAt')
        }*/
        
        // field limiting
        /*if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ')
            query = query.select(fields)
        }else {
            query = query.select('-__v')
        }*/

        // pagination 
        /*const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1 ) * limit;

        query = query.skip(skip).limit(limit)

        if(req.query.page){
            const numTours = await Tour.countDocuments()
            if(skip >= numTours) throw new Error('This page does not exist')
        }*/

        /*
        const tours = await Tour.find()
            .where('duration')
            .equals(5)
            .where('difficulty')
            .equals('easy')
        */
        // execute query
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
    } catch(err) {
        console.log(err)
        res.status(404).json({
            status : 'fail',
            message : err
        })
    }
    
}

exports.getTour = async (req , res) => {
   try {
    const tour = await Tour.findById(req.params.id)
    // Tour.findOne({_id: req.params.id})
    res.status(200).json({
        status:'success',
        data : {
            tour
        }
    })
   } catch (err) {
    res.status(404).json({
            status : 'fail',
            message : err
        })
   }
  
}

exports.getTourStats  = async (req, res) =>{
    try {
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
        
    } catch (err) {
        console.log(err)
        res.status(404).json({
            status : 'fail',
            message : err
        })
    }
}

exports.getMonthlyPlan = async (req ,res) => {
    try {
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
    } catch (err) {
        console.log(err)
        res.status(404).json({
            status : 'fail',
            message : err
        })
    }
}
exports.updatedTour = async (req, res) =>{
    try{
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body , {
            new: true,
            runValidators : true // modelde verilerde yapılan zorunlulukları güncelleme için de yapar 
        })

        res.status(200).json({
            status: 'success',
            data : {
                tour
            }
        })
    
    }catch (err) {
        res.status(404).json({
            status : 'fail',
            message : err
        })
    }

    
}
exports.deleteTour = async (req, res) =>{
   try {
    // 204 -> içerik yok demek o yüzden data null 
    await Tour.findByIdAndDelete(req.params.id)    
    res.status(204).json({
        status : 'success',
        data: null
    })
   } catch (err) {
        res.status(404).json({
            status : 'fail',
            message : err
        })
   }
    
   
}

exports.createTour = async (req ,res) =>{
    try{
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

}







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






