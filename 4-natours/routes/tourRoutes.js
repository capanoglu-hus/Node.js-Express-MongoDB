const express = require('express')
const tourController = require('./../controllers/tourController')
const router = express.Router();
const authController = require('./../controllers/authController')
const reviewRouter = require('./reviewRoutes')




/*const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

const getAllTours = (req , res) => {
    console.log(req.requestTime)
    res.status(200).json({
        status:'success',
        requestTime: req.requestTime,
        results: tours.length,
        data : {
            tours
        }
    })
}

const getTour = (req , res) => {
    console.log(req.params)
    const id = req.params.id * 1 ; // dizeyle gelen datayı sayıya çeviriyor
    const tour = tours.find(el => el.id === id)

    if(!tour) {
        return res.status(404).json({
            status: 'fail',
            data: 'INVALID ID'
        })
    }

    res.status(200).json({
        status : 'success' , 
        data : {
            tour 
        }
    })
}

const updatedTour = (req, res) =>{
    if(req.params.id * 1 > tours.length){
        return res.status(404).json({
            status:'fail',
            message: 'ınvalid id'
        })
    }

    res.status(200).json({
        status : 'success',
        data : {
            tour: '<Updated TOUR >'
        }
    })
}
const deleteTour =(req, res) =>{
    if(req.params.id * 1 > tours.length){
        return res.status(404).json({
            status:'fail',
            message: 'ınvalid id'
        })
    }
    // 204 -> içerik yok demek o yüzden data null 
    res.status(204).json({
        status : 'success',
        data: null
    })
}

const createTour = (req ,res) =>{
    //console.log(req.body)
    const newId = tours[tours.length - 1].id + 1 ;
    const newTour = Object.assign({id : newId } , req.body)

    tours.push(newTour)

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        err => res.status(201).json({
            status : 'success',
            data :{
                tour : newTour
            }
        })
    )
}
*/

// router.param('id', tourController.checkId)
router.route('/tour-stats').get(tourController.getTourStats)
router.route('/monthly-plan/:year').get(authController.protect , authController.restrictTo('admin','lead-guide','guide'),tourController.getMonthlyPlan)
router.route('/top-5-cheap').get(tourController.aliasTopTours , tourController.getAllTours)

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getTourWithin)
// /tours-within/233/center/-40,45/unit/mi

router.route('/distance/:latlng/unit/:unit').get(tourController.getDistances)
// /distance/-40,45/unit/mi

router.route('/')
    .get(tourController.getAllTours)
    .post( authController.protect , authController.restrictTo('admin','lead-guide'), tourController.createTour) 

router.route('/:id')
    .get(tourController.getTour)
    .patch(authController.protect , authController.restrictTo('admin','lead-guide'), tourController.updatedTour)
    .delete(authController.protect , authController.restrictTo('admin','lead-guide'), tourController.deleteTour)


// review kısmında da aynı şeyleri yapıyoruz o yüzden iki routerı birleştiriyor   
//router.route('/:tourId/reviews').post(authController.protect , authController.restrictTo('user') , reviewController.createReview)
router.use('/:tourId/reviews' , reviewRouter)
// iç içe urllerde kullanılır  /tours/toursid/reviews gibi
module.exports = router;

