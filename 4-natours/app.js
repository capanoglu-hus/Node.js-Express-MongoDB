 /* const express = require('express')
const fs = require('fs')
const morgan = require('morgan')

const app = express()

// 1 -> middleware 
app.use(express.json()) // gelen isteklerdeki verileri kullanmamıza yarayan ara yazılım
app.use(morgan('dev')) // 3. part ara yazılım
app.use((req, res, next) => {
    console.log("Helloo middleware")
    next() // next'i koymazsan diger işleme geçemez
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})

/*app.get('/', (req, res) =>{
    console.log("get istegi alındı")
    res.status(200).json({message: 'Hello server' , app : 'Natours'})
})

app.post('/' , (req ,res) =>{
    console.log("post istegi alındı")
    res.send('You send post request')
})*/ 

/*const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))

// 2 -> api 
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

const getAllUsers = (req,res) =>{
    res.status(500).json({
        status: 'error',
        message : 'not yet api'
    })
}
const getUser = (req,res) =>{
    res.status(500).json({
        status: 'error',
        message : 'not yet api'
    })
}

const createUser = (req,res) =>{
    res.status(500).json({
        status: 'error',
        message : 'not yet api'
    })
}

const deleteUser = (req,res) =>{
    res.status(500).json({
        status: 'error',
        message : 'not yet api'
    })
}
const updatedUser = (req,res) =>{
    res.status(500).json({
        status: 'error',
        message : 'not yet api'
    })
}
 // 3 -> routing - yönlendirme
// app.get('/api/v1/tours' , getAllTours )

// app.get('/api/v1/tours/:id' , getTour)

// app.patch('/api/v1/tours/:id' ,updatedTour)

// app.delete('/api/v1/tours/:id' , deleteTour)

// app.post('/api/v1/tours' ,createTour)

// zincirleme yapılabilir
const tourRouter = express.Router() // bunu bağlı olanları yönlediriyor - yönlendirme monte edilmesi
app.use('/api/v1/tours', tourRouter) //- kendi api için middleware

tourRouter.route('/').get(getAllTours).post(createTour) 

tourRouter.route('/:id').get(getTour).patch(updatedTour).delete(deleteTour)

const userRouter = express.Router() // bunu bağlı olanları yönlediriyor - yönlendirme monte edilmesi
app.use('/api/v1/users', userRouter) //- kendi api için middleware

userRouter.route('/').get(getAllUsers).post(createUser)

userRouter.route('/:id').get(getUser).patch(updatedUser).delete(deleteUser)



// 4 -> sunucu başlatma 
const port = 8000
app.listen(port , ( )=> {
console.log(`app running listen port ${port}`)
})


*/

const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit') 
const helmet = require('helmet')
const AppError =  require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes')
//const mongoSanitize = require('express-mongo-sanitize')
//const xss = require('xss-clean')
const hpp = require('hpp')


const app = express()

//app.use(helmet())
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev')) // 3. part ara yazılım
}

// aynı IP içinde bir saatlik izin
const limiter = rateLimit({
    max: 100,
    windowMs : 60*60*1000,
    message : 'too many requests'
})

app.use('/api' , limiter) // sadece api ile olanları etkilesin diye

// 10 kb üstü veriler kabul edilmeyecek
app.use(express.json({limit : `10kb`})) // gelen isteklerdeki verileri kullanmamıza yarayan ara yazılım
// verileri okuduktan sonra veri temizliği yapılacak
// veri alırken noSQL sorgusu ile manipüle edilebilir
// app.use(mongoSanitize()) // genel olarak işaretleri filtreliyor

//app.use(xss()) // kötü amaçlı html i temizler

app.use(hpp({
    whitelist:['duration' , 'ratingsQuantity','ratingsAverage', 'maxGroupSize', 'difficulty','price']
})) //parametre sorunlarını önler

app.use(express.static(`${__dirname}/public`))
app.use((req, res, next) => {
    console.log("Helloo middleware")
    next() // next'i koymazsan diger işleme geçemez
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// farklı gelen url engelleme 
app.all('/{*splat}', (req, res, next) => {
    /*res.status(404).json({
        status: 'fail',
        message: 'URL bu sunucuda bulunamadı'
    })*/
  /* const err = new Error(`cant find ${req.originalUrl} on this server`)
   err.status = `fail`
   err.statusCode = 404
*/
   next(new AppError(`cant find ${req.originalUrl} on this server` ,404 ))
})

app.use(globalErrorHandler)

module.exports = app;