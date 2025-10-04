const mongoose =  require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
// name , email ,photo , password , passwordconfirm

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'A user must have name '],
        
    },
    email : {
        type: String ,
        required : [true, ' A user have a email'],
        unique: true,
        lowercase: true,
        validate : [validator.isEmail , 'please valid email'],
    },
    photo :  String ,
    role : {
        type: String,
        enum : {
            values : ['user', 'guide' , 'lead-guide', 'admin'],
            message : 'role is either : user, guide, admin, lead-guide, '
        },
        require: [true,'A user must have role'],
        default : 'user'
        
    },
    password : {
        type: String,
        required: [true , ' A user must have password'],
        minlength : [8, 'A tour name must have more or equal then 8 characters'],
        select: false
    },
    passwordConfirm :{
        type: String ,
        required : [true , 'Please confirm your password'],
        validate : {
            // bu doğrulama sadece oluşturma ve kaydetmede işe yarar
            validator : function(el) {
                return el === this.password
            },
            message : 'passwords not same'
        }
    },
    passwordChangedAt : Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active :{
       type : Boolean,
       default : true ,
       select: false
    }

})

userSchema.pre('save' , async function(next){
    if(!this.isModified('password')) return next()
    
    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined // db ye kalıcı olarak kaydedilmiyor
    next()
    
})

userSchema.pre('save' , function(next){
    if(!this.isModified('password') || this.isNew) return next()
    
    this.passwordChangedAt = Date.now() - 1000 // bir saniye sonra kaydedecek
    next() 
})
// bundan sonra aramalarda active kısmı false olanlar görünmeyecek sadece db 
userSchema.pre(/^find/, function(next){
    this.find({active: {$ne: false}})
    next()
})
userSchema.methods.correctPassword = async function (candidatePassword , userPassword){
    return await bcrypt.compare(candidatePassword , userPassword)
    // gönderilen pass ile olan pass karşılaştırıp dogru or yanlış dönecek

}
userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000 , 10)
        return JWTTimestamp < changedTimestamp
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    console.log({resetToken} , this.passwordResetToken)

    this.passwordResetExpires = Date.now() + 10*60*1000
    return resetToken
}


const User = mongoose.model(`User`, userSchema)

module.exports = User;