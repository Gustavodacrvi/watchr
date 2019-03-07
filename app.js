let express = require('express')

let app = express()


app.get('/', (req, res) => {
  res.send('asdf')
})


app.listen(process.env.port || 3000, (req, res) => {
  console.log('Server started at port 3000...')
})
