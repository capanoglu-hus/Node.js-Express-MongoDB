const fs = require('fs')
const server = require('http').createServer()

server.on('request', (req , res) => {
    // çözüm 1 -> bu çözüm ile ilk başta dosyayı belleğe yükleyecek, sonra gönderecek
   /* fs.readFile("test-file.txt", (err ,data) => {
        if (err) console.log(err)
        res.end(data)
    })*/

   // çözüm 2 --> streams kullanmak 
   /*const readable = fs.createReadStream("test-file.txt")
   readable.on("data", chunk =>{
    res.write(chunk)
   })

   readable.on("end", ()=>{
    res.end()
   })
   readable.on("error" , err =>{
    res.statusCode(500)
    res.end("File not founddddd")
   })*/

   // çözüm 3 -> pipe()
   // geri basınç sorunu -> okunabilir veri hızına yazılabilir verinin yetişememesi 
   const readable = fs.createReadStream("test-file.txt");
   readable.pipe(res); 


})

server.listen(8000,"127.0.0.1", () =>{
    console.log("Listening..")
})