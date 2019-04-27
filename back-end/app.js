const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const mongoose = require('mongoose');

const app = express();



mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: !0,
});
const connection = mongoose.connection;

const corsOptions = {
  origin: 'http://localhost:8080',
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, }));



const User = require('./mongodbModel');


app.post('/signup', (req, res) => {
  User.createUser(new User({
    username: req.body.username.trim(),
    email: req.body.email.trim(),
    password: req.body.password.trim(),
  }), () => {
    res.send();
  });
});



app.listen(3000);
