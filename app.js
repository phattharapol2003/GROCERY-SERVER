const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');
const secret = 'panida'
// const bodyParser = require('bode-parser');
// const jsonParser = bodyParser.json();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'panida',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database');
});

app.listen(3000, function() {
  console.log('Server is running on port 3000');
});

app.post('/register', function (req,res, next) {
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  db.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [req.body.name, req.body.email, hash ],
    function(err, result, fields) {
        if(err) {
          res.json({status: 'error', message: err})
          return 
        }
      res.json({status : 'ok'})
    }
  );
});
});

app.post('/login', function (req,res,next) {
  db.query(
    'SELECT * FROM users WHERE email=?',
    [req.body.email],
    function(err, users, fields) {
        if(err) {
          res.json({statis: 'error', meesage: err})
          return 
        }
        if (users.length == 0) { 
          res.json({status: 'error', message: 'no user found'})
          return
      }
      bcrypt.compare(req.body.password, users[0].password, function(err, isLogin) {
        if (isLogin) {
          var token = jwt.sign({ email: users[0].email }, secret, { expiresIn: '1h' });
          res.json({status: 'ok', message: 'login success', token})
        } else {
          res.json({status: 'error', message: 'login failed'})
        }
      });
    }
  );
});

app.post('/authen', function (req,res,next) {
  try {
    const token = req.headers.authorization.split(' ')[1]
    var decoded = jwt.verify(token, secret);
    res.json({status: 'ok', decoded})
  } catch(err) {
    res.json({status: 'error', message: err.message})
  }
})