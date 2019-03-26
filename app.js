let express = require('express')
let ejs = require('ejs')
let path = require('path')
let mongose = require('mongoose')
let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')
let passport = require('passport')
let flash = require('connect-flash')
let session = require('express-session')
let func = require('./functions')


mongose.connect(process.env.DATABASE || 'mongodb://localhost/GTDF2',{useNewUrlParser:!0})
let mongoose = mongose.connection

let app = express()

app.use(cookieParser())
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true,
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:!1}))

let authentication = require('./routes/authentication')
let gtdf = require('./routes/gtdf')

app.set('view engine', 'ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname,'static')))
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
app.use(function(req, res, next) {
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  req.flash('success', undefined)
  req.flash('error', undefined)
  res.locals.user = req.user || null
  next()
})


app.use('/', authentication)
app.use('/', gtdf)


app.get('/', (req, res) => {
  res.render('index', func.getRenderObject(req))
})


app.listen(process.env.port || 3000, '0.0.0.0', (req, res) => {
  console.log('Server started at port 3000...')
})
