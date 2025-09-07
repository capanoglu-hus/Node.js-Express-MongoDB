const EventEmitter = require('events');
const http = require('http')

/*const myEmitter = new EventEmitter();

myEmitter.on("newSale", () => {
    console.log("There was a sale")
})

myEmitter.on("newSale", () => {
    console.log("Costumer name : jonas" )
})

myEmitter.on("newSale", stock => {
    console.log(`There are now ${stock} items left in stock`)
})

myEmitter.emit("newSale",9)*/

const server =  http.createServer(); // dinleme 

server.on("request",(req,res) => {
    console.log('Request received')
    res.end('Request received')
})

server.on("request",(req,res) => {
    
    console.log("another Request ")
})

server.on('close',() => {
    
    res.end('Server closed')
})

server.listen(8000,"127.0.0.1", ()=> {
     console.log('Waiting')
})

