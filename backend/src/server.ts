import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { createDatabaseConnection, User } from './implementation';
createDatabaseConnection();

import { UserObj, CallbackFunction } from './interfaces';

const app = express();


const corsOptions = {
  origin: 'http://localhost:8080',
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


const SESSION_EXPIRE_DATE = 2419200000;

app.post('/signup', (req: any, res: any, next: CallableFunction) => {
  User.checkIfUsernameIsTaken(req.body.username, (usernameTaken: boolean) => {
    if (usernameTaken) {
      res.send({ error: 'usernameTaken' });
      next();
    } else {
      User.checkIfEmailIsTaken(req.body.email, (emailTaken: boolean) => {
        if (emailTaken) {
          res.send({ error: 'emailTaken' });
          next();
        } else {
          User.getPasswordHash(req.body.password, (hash: string) => {
            User.createToken((token: string) => {
              User.createUser({
                username: req.body.username.trim(),
                email: req.body.email.trim(),
                password: hash,
                sessionToken: token,
                sessionTokenExpireDate: Date.now() + SESSION_EXPIRE_DATE,
              }, () => {
                res.send({ error: '' });
                next();
              });
            });
          });
        }
      });
    }
  });
});

app.post('/login', (req: any, res: any, next: CallableFunction) => {
  User.getUserByUsername(req.body.username, (doc: UserObj) => {
    if (!doc) {
      res.send({ error: 'usernameNotFound' });
      next();
    } else {
      User.comparePassword(req.body.password, doc.password, (isMatch: boolean) => {
        if (!isMatch) {
          res.send({ error: 'wrongPassword' });
          next();
        } else {
          if (User.dateExpired(doc.sessionTokenExpireDate)) {
            User.createToken((token: string) => {
              doc.sessionToken = token;
              doc.sessionTokenExpireDate = Date.now() + SESSION_EXPIRE_DATE;
              doc.markModified('sessionToken');
              doc.markModified('sessionTokenExpireDate');
              doc.save(() => {
                res.send({ error: '', user: {
                  username: doc.username,
                  email: doc.email,
                }, sessionToken: token});
                next();
              });
            });
          } else {
            res.send({ error: '', user: {
              username: doc.username,
              email: doc.email,
            }, sessionToken: doc.sessionToken});
            next();
          }
        }
      });
    }
  });
});

app.post('/autologin', (req: any, res: any, next: CallableFunction) => {
  User.getUserByToken(req.body.token, (doc: UserObj) => {
    if (!doc) {
      res.send({ validToken: false });
      next();
    } else {
      if (User.dateExpired(doc.sessionTokenExpireDate)) {
        res.send({ validToken: false });
        next();
      } else {
        res.send({
          user: {
            username: doc.username,
            email: doc.email,
          },
          validToken: true,
        });
        next();
      }
    }
  });
});

app.listen(3000);
