// console.log(arguments)
// console.log(require('module').wrapper) // sarmalayıcı


const C = require('./test-module-1.js')
const Calc1 = new C()
console.log(Calc1.add(5,8))

// exports 
const Cal2 = require('./test-module-2.js')
console.log(Cal2.multiplay(5 , 8 ))

require('./test-module-3.js')(); // module ön bellege alıyor bu yüzden bir defa "Hello from the module" çalışıyor
require('./test-module-3.js')();
require('./test-module-3.js')();