const fs = require('fs') // dosya okumaya yarayan mmodul
const http = require('http') //sunucu
const url = require('url') // yönlendirme için 
const slugify = require(`slugify`)
const replaceTemplate =  require(`./modules/replaceTemplate.js`); // modul oluşturma 
       
// lugify -> url ad düzenleme 
// nodemon -> her değişiklikte oto. sunucu yenilenecek




// FILES
/**  blocking -> senkron olduğunu için sonraki işlemleri engelleyebilir
const textIn = fs.readFileSync('./starter/txt/input.txt', 'utf-8')
//starter\txt\input.txt -> dosya yolu
// karakter kodlaması
console.log(textIn)

const textOut = `This is what we know avocode : ${textIn}.
created on ${Date.now()}`;

fs.writeFileSync('./starter/txt/output.txt', textOut)

// dosya yolu + ne yazılacağı  

console.log('File write')

/* const Hello = 'Hellloo'

console.log(Hello) 

// asenkron -> no blocking 
fs.readFile('./starter/txt/start.txt', 'utf-8' , (err, data1) => {
    console.log(data1)
        fs.readFile(`./starter/txt/${data1}.txt`,'utf-8' ,(err, data2)=>{
        console.log(data2);
            fs.readFile(`./starter/txt/append.txt`,'utf-8' ,(err, data3)=>{
        console.log(data3);

        fs.writeFile('./starter/txt/final.txt', `${data2}\n${data3}`,'utf-8', err => {
            console.log('your file write ')
        })
        })
    })
})
console.log('WİLL READ FİLE') */

//SERVER



const tempOverview  = fs.readFileSync(`${__dirname}/templates/template-overview.html`,'utf-8')
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`,'utf-8')
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`,'utf-8')

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`,'utf-8');
const dataObj = JSON.parse(data);

const slugs= dataObj.map(el => slugify(el.productName , {lower: true}))

console.log(slugs)

const server = http.createServer((req,res) => {
    //require -> istek
    //response -> yanıt 

    const {query , pathname} = url.parse(req.url, true) // gidilen url'i çözümleyip döndürüyor 
   
    
    //overview page
    if(pathname === '/' || pathname === '/overview'){
        res.writeHead(200 , {'Content-type': 'text/html'})
        const cardsHtml = dataObj.map(el => replaceTemplate(tempCard , el)).join('');
        const output = tempOverview.replace(`{%PRODUCT_CARDS%}` , cardsHtml)
        res.end(output);

    } else if (pathname === ('/product')) {
        res.writeHead(200 , {'Content-type': 'text/html'})
        const product = dataObj[query.id]
        const output = replaceTemplate(tempProduct , product)
        res.end(output);

    } else if( pathname === '/api' ){
        res.writeHead(200 , {'Content-type': 'application/json'})
        res.end(data);

    }
     else {
        res.writeHead(404,{
            'Content-type':'text/html',
            'my-own-header':'helloooo'
        })
        res.end(`<h1> PAGE NOT FOUND </h1>`)
       // res.end('youre the one of the brıghest of all and some day everyone wıll notıce and apprıcıate that')
    }
      
    } 
);

server.listen(8000,'127.0.0.1', () => {
    console.log('Listening 8000 port ')
})
                                                                   