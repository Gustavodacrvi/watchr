let express = require('express');
let bodyParser = require('body-parser');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, }));


app.get('/hello', (req, res) => {
  res.send('hello');
});


app.listen(3000);
