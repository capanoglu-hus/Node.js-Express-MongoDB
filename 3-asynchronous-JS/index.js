const fs = require('fs')

const superagent = require('superagent')

const readFilePro = file => {
    return new Promise((resolve ,reject) =>{
        fs.readFile(file, (err,data) =>{
            if(err) reject("başarısız okuma")
                resolve(data)
        })
    })
}

const writeFilePro = (file, data) => {
    return new Promise((resolve , reject) => {
        fs.writeFile(file,data, err =>{
            if(err) reject('yazma başarısız')
            resolve('başarılı yazma')
        })
    })
}

const getDogPic = async () => {
    try {
        const data = await readFilePro(`${__dirname}/dog.txt`)
        console.log(`Breed: ${data} `)

        const res1Pro = await  superagent.get(`https://dog.ceo/api/breed/${data}/images/random`)
       

        const res2pro = await  superagent.get(`https://dog.ceo/api/breed/${data}/images/random`)
      


        const res3Pro = await  superagent.get(`https://dog.ceo/api/breed/${data}/images/random`)
        

        const all = await Promise.all([res1Pro , res2pro ,res3Pro])
        const imgs = all.map(el => el.body.message)
        console.log(imgs)

        await writeFilePro('dog-img.txt' , imgs.join(`\n`) )
        console.log('Random dog image saved file')

    } catch (err) {
        console.log(err)
    }
    return '2'
}
 
( async () => {
    try {
        console.log("1")
        const x = await getDogPic();
        console.log(x);
        console.log("3")
    } catch (error) {
        console.log('ERROR ')
    }
})();



// zincirleme promise ile döndürüp birbirine zincirleyebiliriz

/*readFilePro(`${__dirname}/dog.txt`)
    .then(data => {
    console.log(`Breed: ${data} `)

    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`)
    })
    .then(res => {
        console.log(res.body.message)

        return writeFilePro('dog-img.txt' , res.body.message )
    })
    .then(() => {
        console.log('Random dog image saved file')
    })
    .catch( err => {
        console.log(err.message)
    })
*/

