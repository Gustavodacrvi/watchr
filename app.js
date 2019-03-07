let express = require('express')
let path = require('path')

let app = express()


app.use(express.static(path.join(__dirname,'static')))



app.get('/', (req, res) => {
  res.render('index')
})


app.listen(process.env.port || 3000, (req, res) => {
  console.log('Server started at port 3000...')
})
