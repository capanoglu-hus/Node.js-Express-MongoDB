const express = require('express')
const tourController = require('./../controllers/tourController')
const router = express.Router();
const authController = require('./../controllers/authController')





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
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)
router.route('/top-5-cheap').get(tourController.aliasTopTours , tourController.getAllTours)

router.route('/').get(authController.protect, tourController.getAllTours).post( tourController.createTour) 

router.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updatedTour)
    .delete(authController.protect , authController.restrictTo('admin'), tourController.deleteTour)

module.exports = router;

