const User = require('./../models/userModel')
const catchAsync =  require('./../utils/catchAsync')
const AppError = require('../utils/appError');
const factory = require('./handlerController')

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el]= obj[el]
    }) 
    return newObj
}

exports.getMe = (req,res,next) => {
    req.params.id = req.user.id
    next()
}

exports.getAllUsers = factory.getAll(User)
// exports.getAllUsers = catchAsync( async (req,res ,next) =>{
//     const user = await User.find() 
//     res.status(200).json({
//         status: 'success',
//         results: user.length,
//         data : {
//             user
//         } 
//     })
// })

exports.updateMe = catchAsync (async (req,res,next) => {
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('this is not update password ', 400))
    }
    // istenmeyen alanları filtreliyor
    const filterBody = filterObj(req.body , 'name', 'email')
    const updatedUser = await User.findByIdAndUpdate(req.user.id ,  filterBody , {
        new: true,
        runValidators:true
    })
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }

    })
})
exports.getUser = factory.getOne(User)
exports.deleteUser = factory.deleteOne(User)
exports.updatedUser = factory.updateOne(User)


exports.deleteMe = catchAsync( async(req,res,next) => {
    const user = User.findByIdAndUpdate(req.user.id, {active : false})
    res.status(204).json({
        status:'success',
        data: null

    })

})