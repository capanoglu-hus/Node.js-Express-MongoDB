const mongoose = require('mongoose');
const slugify = require('slugify')
const validator = require('validator')
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
        max: [5, 'rating must be below 5.0']
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
    }

},
{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
}
)

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7 
})

tourSchema.pre('save' , function(next){
    this.slug = slugify(this.name, {lower: true})
    next()
})

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
    next()
})

tourSchema.pre('aggregate' , function(next){
    this.pipeline().unshift({ $match : {secretTour : { $ne : true}}})
    next()
})
const Tour = mongoose.model('Tour' , tourSchema)

module.exports =Tour;