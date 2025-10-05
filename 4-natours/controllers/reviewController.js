const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const Review = require('./../models/reviewModel')
const factory = require('./handlerController')

// exports.getAllReview = catchAsync(async(req,res,next) => {
//     let filter = {}
//     if(req.params.tourId) filter = {tour: req.params.tourId}
//     const reviews = await Review.find(filter).populate('user', 'name photo')
//     .populate('tour', 'name')
//     if(!reviews){
//         return next(new AppError('not find reviews', 404))
//     }
//     res.status(200).json({
//         status:'succss',
//         results : reviews.length,
//         data:{
//             reviews
//         }
//     })

// })
exports.getAllReview = factory.getAll(Review)
// exports.getReview = catchAsync( async (req,res,next) => {
//     const review = await Review.findById(req.params.id);
//     if(!review){
//         return next(new AppError('not find id review' , 404 ))
//     }
//     res.status(200).json({
//         status:'success',
//         data :{
//             review
//         }
//     })
// })
exports.getReview = factory.getOne(Review)
// exports.updateReview = catchAsync(async (req,res,next) => {
//     const review = await Review.findByIdAndUpdate(req.params.id , req.body ,{
//           new: true,
//             runValidators : true // modelde verilerde yapılan zorunlulukları güncelleme için de yapar 
//     })
//     if(!review) {
//         return next(new AppError('not find review ' , 404))
//     }
//     res.status(200).json({
//         status:'success',
//         data: {
//             review
//         }
//     })
// })

exports.updateReview = factory.updateOne(Review)

// exports.deleteReview = catchAsync(async(req,res,next) => {
//     const review = await Review.findByIdAndDelete(req.params.id)
//     if(!review){
//         return next(new AppError('not find id ',404))
//     }
//     res.status(200).json({
//         status:'success',
//         data: null
//     })
// })

exports.deleteReview = factory.deleteOne(Review)

// exports.createReview = catchAsync(async (req,res,next) => {
//     if(!req.body.tour) req.body.tour = req.params.tourId;
//      if(!req.body.user) req.body.user = req.user.id;
//     const newReview = await Review.create(req.body)

//      res.status(201).json({
//             status : 'success',
//             data :{
//                 review : newReview
//             }
//     })
// })
// create review için iç içe url yüzünden ara yazılım oluşturduk -- bunu router sınıfında öneden eklensin diyerek kullanacaz
exports.setTourUserIds = (req,res,next) => {
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next()
}
exports.createReview = factory.createOne(Review)
