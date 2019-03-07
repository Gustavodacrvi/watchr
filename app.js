let express = require('express')
let ejs = require('ejs')
let path = require('path')

let app = express()

let authentication = require('./routes/authentication')

app.set('view engine', 'ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname,'static')))


app.use('/', authentication)


app.get('/', (req, res) => {
  res.render('index')
})


app.listen(process.env.port || 3000, (req, res) => {
  console.log('Server started at port 3000...')
})
