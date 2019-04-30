import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  sessionToken: String,
  sessionTokenExpireDate: Number,
});

export const User = mongoose.model('User', userSchema);

import { UserObj } from './interfaces';

export const createDatabaseConnection = () => {
  mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
  });
  const connection = mongoose.connection;
};

User.checkIfEmailIsTaken = (email: string, callback: CallableFunction) => {
  User.findOne({ email: email.trim() }, (err: any, doc: UserObj) => {
    if (doc) {
      callback(true);
    } else {
      callback(false);
    }
  });
};

User.checkIfUsernameIsTaken = (username: string, callback: CallableFunction) => {
  User.findOne({ username: username.trim() }, (err: any, doc: UserObj) => {
    if (doc) {
      callback(true);
    } else {
      callback(false);
    }
  });
};

User.createUser = (user: UserObj, callback: CallableFunction) => {
  const newUser = new User(user);
  newUser.save(callback);
};

User.getUserByUsername = (username: string, callback: CallableFunction) => {
  User.findOne({ username: username.trim() }, (err: any, doc: UserObj) => {
    if (doc === null) {
      callback(false);
    } else {
      callback(doc);
    }
  });
};

User.comparePassword = (candidatePassword: string, hash: string, callback: CallableFunction) => {
  bcrypt.compare(candidatePassword, hash, (err: any, isMatch: boolean) => {
    callback(isMatch);
  });
};

User.getPasswordHash = (password: string, callback: CallableFunction) => {
  bcrypt.genSalt(10, (err: any, salt: string) => {
    bcrypt.hash(password, salt, (err2: any, hash: string) => {
      callback(hash);
    });
  });
};

User.dateExpired = (expireDate: number) => {
  if (Date.now() > expireDate) {
    return true;
  }
  return false;
};

User.getUserByToken = (token: string, callback: CallableFunction) => {
  User.findOne({ sessionToken: token }, (err: any, doc: UserObj) => {
    if (doc === null) {
      callback(false);
    } else {
      callback(doc);
    }
  });
};

User.createToken = (callback: any) => {
  crypto.randomBytes(20, (err: any, buf: any) => {
    const token = buf.toString('hex');
    callback(token);
  });
};
