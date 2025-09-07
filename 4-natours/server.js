const dotenv = require('dotenv')
const app = require('./app')

dotenv.config({path: './config.env'})

console.log(process.env)

const port = 8000
app.listen(port , ( )=> {
console.log(`app running listen port ${port}`)

})