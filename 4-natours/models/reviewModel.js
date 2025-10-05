const mongoose = require('mongoose');
const Tour = require('./tourModel')
const reviewSchema = mongoose.Schema({
    review : {
        type: String,
        require : [true, ' A have must review'],
        maxlength : [1500, 'A review name must have less or equal then 40 characters'],
        minlength : [10, 'A review name must have more or equal then 10 characters'],
    },
    rating : {
        type : Number,
        require :[true, ' a review must have rating'],
        min: 1,
        max:5
    },
    createdAt : {
        type: Date,
        default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: `Tour`,
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: `User`,
      required: [true, 'Review must belong to a user']
    } 
},
{ //çıktı olduğunda db de olmasa bile görünmesi için???
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
})

reviewSchema.index({tour: 1, user:1} , {unique: true})
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next()
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match : {tour:tourId}
    },
    {
      $group:{
        _id : `$tour`,
        nRating : {$sum:1},
        avgRating : { $avg : `$rating`}
      }
    }
  ])

  console.log(stats)
  // tour tablosunda güncelleme yapıyor
  if(stats.length > 0){
    await Tour.findByIdAndUpdate(tourId ,{
    ratingsQuantity: stats[0].nRating ,
    ratingsAverage : stats[0].avgRating
  })
  }else {
    await Tour.findByIdAndUpdate(tourId ,{
    ratingsQuantity: 0,
    ratingsAverage : 4.5
  })
  }
  
}
// her yorumu kaydettiğimizde fonksiyonu çağırıyor
reviewSchema.post('save' , function(){
  this.constructor.calcAverageRatings(this.tour)
  
})

// yukarı da bir yorum eklendiğinde ortlama hesaplamayı gördük
// db kaydedilip çalışması lazımdı
// şimdi ilk önce dbye kaydetmeden önce tourIdsını almamız lazım 
// findByIdAnd çalışırken 

reviewSchema.pre(/^findOneAnd/, async function (next){
  this.r = await this.findOne() // id almak için
  console.log(this.r)
  next()
})

reviewSchema.post(/^findOneAnd/, async function(){
  await this.r.constructor.calcAverageRatings(this.r.tour)
})


const Review = mongoose.model('Review', reviewSchema)
module.exports = Review