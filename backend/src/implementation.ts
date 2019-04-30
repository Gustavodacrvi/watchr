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

export const createDatabaseConnection = () => {
  mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
  });
  const connection = mongoose.connection;
};

User.checkIfEmailIsTaken = (email: string, callback: any) => {
  User.findOne({ email: email.trim() }, (err: any, doc: any) => {
    if (doc) {
      callback(true);
    } else {
      callback(false);
    }
  });
};

User.checkIfUsernameIsTaken = (username: string, callback: any) => {
  User.findOne({ username: username.trim() }, (err: any, doc: any) => {
    if (doc) {
      callback(true);
    } else {
      callback(false);
    }
  });
};

User.createUser = (user: object, callback: any) => {
  const newUser = new User(user);
  newUser.save(callback);
};

User.getUserByUsername = (username: string, callback: any) => {
  User.findOne({ username: username.trim() }, (err: any, doc: any) => {
    if (doc === null) {
      callback(false);
    } else {
      callback(doc);
    }
  });
};

User.comparePassword = (candidatePassword: string, hash: string, callback: any) => {
  bcrypt.compare(candidatePassword, hash, (err: any, isMatch: boolean) => {
    callback(isMatch);
  });
};

User.getPasswordHash = (password: string, callback: any) => {
  bcrypt.genSalt(10, (err: any, salt: any) => {
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

User.getUserByToken = (token: string, callback: any) => {
  User.findOne({ sessionToken: token }, (err: any, doc: any) => {
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
