const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, }));

const corsOptions = {
  origin: 'http://localhost:8080',
};

app.use(cors(corsOptions));


app.post('/signup', (req, res) => {
  console.log(req.body.content);
  res.send(req.body.content);
});


app.listen(3000);
