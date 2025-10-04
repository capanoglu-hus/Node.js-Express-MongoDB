const crypto = require('crypto')
const {promisify} = require('util')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id => {
     return jwt.sign({id : id} , process.env.JWT_SECRET, {
        expiresIn : process.env.JWT_EXPIRES_IN
    } )
}

const createSendToken = (user, statusCode, res ) => {
    const token = signToken(user._id)
    const cookieOptions = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24* 60*60*100 ), // 90 günü saniyeye ceviriyoruz
        httpOnly : true,
    }
    // sadece pro. da https ile gönderim 
    if(process.env.NODE_ENV === `production`) cookieOptions.secure = true;
    res.cookie(`jwt`, token , cookieOptions)
    user.password = undefined // şifre görünürlüğü kaldırıldı
    res.status(statusCode).json({
        status : 'success',
        token,
        data :{
            user 
        }
    })
}

exports.signup = catchAsync(async (req, res,next ) => {
    const newUser = await User.create({
        name : req.body.name,
        email: req.body.email,
        password : req.body.password,
        passwordConfirm : req.body.passwordConfirm

    });

    // kullanıcı db idsi , secret , geçerlilik süresi
    createSendToken(newUser,201,res)
    
})

exports.login = catchAsync( async (req, res, next) => {
    const {email , password} = req.body;
    // eger email veya pass hiç girilmemişse
    if(!email || !password){
        return next(new AppError('please provide email or pass' ,401))
    }
    // mail ve pass db ile tutmazsa 
    const user = await User.findOne({email}).select(`+password`)
    if(!user || !await user.correctPassword(password, user.password)){
        return next (new AppError('please control mail or pass',401))
    }
    // jwt token gönderme 
     createSendToken(user,200,res)
    
})

exports.protect = catchAsync (async (req, res, next) =>{
    let token ;
    // token varlığı için kontrol
    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ){
        token = req.headers.authorization.split(' ')[1]
    }
    console.log(token)

    if(!token){
        return next(new AppError('you need access',401))
    }

    // token doğruluğu
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    // kullanıcıyı kontrol etme
    const currentUser = await User.findById(decoded.id)
    if(!currentUser){
        return next(new AppError('The user is not here ',401))
    }
    // kullanıcı parolayı değiştirmişse token doğruluğu
    if (currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User chabged password. again login',401))
    }

    req.user = currentUser
  next()  
})

exports.restrictTo = (...roles) => {
    return (req,res,next) => {
        // roles benim router kısmında izin veriklerim user rolunu aynı mı diye kontrol ediyor
        if(!roles.includes(req.user.role)){
            return next(
            new AppError('you do not have permission' , 403)
        )
        }
     next()   
    }
    
}

exports.forgotPassword = catchAsync(async (req,res,next) => {
    // post yöntemi ile kullanıcı mail alması kontrol edilir
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return next(new AppError('Not user email', 404))
    }
    // pass için reset token üretme
    const resetToken = user.createPasswordResetToken()
    await user.save({validateBeforeSave: false}) // gönderilen resetToken olayları kaydetmek için


      const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    console.log(message)

    try {
        await sendEmail({
        email : user.email,
        subject: 'your password reset token valid 10 dk',
        message

    })

    res.status(200).json({
        status: 'success',
        message : ' TOKEN SENT TO EMAİL'
    })
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false}) // doğrulayacıları kapatıyoruz
        return next(new AppError('error sending email try again later', 500))
    }
    

})

exports.resetPassword = catchAsync (async (req,res,next) => {
    // token doğruluğunu kontrol
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires : {$gt : Date.now()}
    })

    if(!user){
        return next(new AppError('Token is invalid or has expited', 400))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save()

    // kullancının giriş yapnası 
     createSendToken(user,200,res)
})

exports.updatePassword = catchAsync (async (req,res,next) => {
    // kullanıcı bulman gerek 
    const user = await User.findById(req.user.id).select(`+password`)
    if(!user){
        return next(new AppError('Not user find id', 404))
    }
    // girilen pass ile doğru mu ? kontrol

    if(!await user.correctPassword(req.body.passwordCurrent, user.password)){
        return next( new AppError(' current password not correct', 401))
    }

    // 
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save() // modelde pre ve doğrulayıcılar çalışsın diye böyle kaydediyoruz

     createSendToken(user,200,res)
})

