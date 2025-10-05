const mongoose = require('mongoose');
const slugify = require('slugify')
const validator = require('validator')
const User = require('./userModel')
const tourSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, 'A tour must have a name'],
        unique: true,
        trim : true,
        maxlength : [40, 'A tour name must have less or equal then 40 characters'],
        minlength : [10, 'A tour name must have more or equal then 10 characters'],
       // validate : [validator.isAlpha , 'Tour name must only contain characters']

    },
    slug :String,
    duration :{
        type: Number,
        required : [true, 'A tour must have a duratiom']
    },
    maxGroupSize : {
        type: Number,
        required: [true , 'A tour must have a group size']
    },
    difficulty: {
        type:String,
        required: [true , 'A tour must have a difficulty'],
        enum : {
            values : ['easy', 'medium' , 'difficult'],
            message : 'Difficulty is either : easy, medium, difficult'
        }
    },
    ratingsAverage:{
        type :Number ,
        default : 4.5,
        min : [1, 'rating must be above 1.0'],
        max: [5, 'rating must be below 5.0'],
        set: val => Math.round(val*10)/10 // 4.6666 -> 4.7
    },
    ratingsQuantity : {
        type: Number,
        default: 0 
    },
    price:{
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount : {
        type :Number,
        validate : {
            validator : function(val){
                // this kısmı sadece yeni data girerken kullanınca iişe yarar update de işe yaramaz
            return val < this.price;
        },
        message : `Discount price ({val}) should be below regular price`
        }
    } ,
    summary : {
        type :String,
        trim : true,  //şema tipi 
        
    },
    description : {
        type: String,
        trim : true,
        required : [true, 'A tour must have a description']
    },
    imageCover : {
        type: String,
        required : [true , 'A tour must have cover image']
    },
    images : [String],
    createdAt: {
        type: Date,
        default : Date.now(),
        select: false
    },
    startDates : [Date],
    secretTour : {
        type: Boolean,
        default : false
    },
    startLocation :{
        type:{
            type: String,
            default : 'Point',
            enum:['Point']
        },
        coordinates: [Number],
        address : String,
        description: String
    },
    locations: [
        {
            type:{ 
            type: String,
            default : 'Point',
            enum:['Point']
        },
        coordinates: [Number],
        address : String,
        description: String,
        day : Number
        }
    ],
    guides : [
        {
            type: mongoose.Schema.ObjectId, // id ile referans metodu ile veri alıyoz
            ref: 'User'
        }
    ]

},
{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
}
)

tourSchema.index({price : 1 , ratingsAverage : -1})
tourSchema.index({slug:1})
tourSchema.index({startLocation: '2dsphere'}) // yakın yerleri direkt getirecek -- geo düzlemsel olduğu için 2 boyutlu
tourSchema.index({location: '2dsphere'})
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7 
})

//sanal referans or populate 
tourSchema.virtual('reviews' ,{
    ref: 'Review',
    foreignField : 'tour',
    localField:'_id'
})

tourSchema.pre('save' , function(next){
    this.slug = slugify(this.name, {lower: true})
    next()
})

/* gömme metofu ile yapıldı
tourSchema.pre('save' , async function(next){
    const guidesPromises = this.guides.map(async id=> await User.findById(id))
    this.guides =  await Promise.all(guidesPromises)
    next()
})*/

/*tourSchema.pre('save' , function(next){
    console.log("document will save")
    next()
})

tourSchema.post('save', function(doc, next){
    console.log(doc)
    next()
})*/

// find ile başlayan bütün sorgularda çalışır
tourSchema.pre(/^find/ , function(next){
    this.find({secretTour : { $ne : true }})
    this.start = Date.now()
    next()
})
tourSchema.pre(/^find/ , function(next){
    this.populate({
    path : 'guides',
    select: '__v-passwordChangedAt'
    })
    next()
})

// tourSchema.pre('aggregate' , function(next){
//     this.pipeline().unshift({ $match : {secretTour : { $ne : true}}})
//     next()
// })
const Tour = mongoose.model('Tour' , tourSchema)

module.exports =Tour;