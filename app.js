let express = require('express')
let ejs = require('ejs')
let path = require('path')
let mongose = require('mongoose')


mongose.connect(process.env.DATABASE || 'mongodb://localhost/GTDF2',{useNewUrlParser:!0})
let mongoose = mongose.connection

let app = express()

let authentication = require('./routes/authentication')

app.set('view engine', 'ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname,'static')))


app.use('/', authentication)


app.get('/', (req, res) => {
  res.render('index')
})


app.listen(process.env.port || 3000, '0.0.0.0', (req, res) => {
  console.log('Server started at port 3000...')
})
