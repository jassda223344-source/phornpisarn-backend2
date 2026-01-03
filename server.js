const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = 'PHORNPISARN_SECRET';

const db = new sqlite3.Database('./db.sqlite');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT
  )`);
});

const seed = async () => {
  const users = [
    ['JOY2','08314025547788'],
    ['Yanisa','06602070517788'],
    ['Pisarn','08333855287788'],
    ['Ouee1','0838926475'],
  ];
  for (let u of users) {
    const h = await bcrypt.hash(u[1],10);
    db.run('INSERT OR IGNORE INTO users(username,password) VALUES (?,?)',[u[0],h]);
  }
};
seed();

app.post('/login',(req,res)=>{
  const {username,password}=req.body;
  db.get('SELECT * FROM users WHERE username=?',[username],async(_,u)=>{
    if(!u) return res.sendStatus(401);
    if(await bcrypt.compare(password,u.password)){
      res.json({token:jwt.sign({username},SECRET)});
    } else res.sendStatus(401);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('RUN ON ' + PORT));
