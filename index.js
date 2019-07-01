const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
require('express-group-routes')
const app = express()


app.use(bodyParser.json())

const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_chat'
})

const jwtMW = exjwt({
  secret: 'hallo'
});

app.group("/api/v1", (router) => {
  router.post('/login', (req, result) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
      connection.query(`SELECT * FROM tbl_user WHERE username ="${username}" AND password = "${password}"`, function (res, rows, fields) {
        if (rows.length > 0) {
          let token = jwt.sign({ idUser: rows[0].id_user }, 'hallo', { expiresIn: 129600 })
          result.status(200).send({ message: "Suscced", token: token })
        } else {
          result.send({ message: "Data user not found!" })
        }
      });
    } else {
      result.send('Please enter Username and Password!')
    }
  });

  router.get('/authentic', jwtMW, (req, res) => {
    var token = req.headers.authorization
    token = token.replace('Bearer ', '');
    var decoded = jwt.decode(token);
    res.send({ data: decoded.idUser });
  });

  router.get('/chats', jwtMW, (req, res) => {
    connection.query('SELECT * FROM tbl_chat, tbl_user WHERE tbl_user.id_user=tbl_chat.id_user ORDER BY tbl_chat.id ASC', function (err, rows, ) {
      if (err) throw err
      res.send(rows)
    })
  })

  router.get('/chat/:id', jwtMW, (req, res) => {
    const idUser = req.params.idUser
    connection.query(`SELECT * FROM tbl_chat WHERE id_user=${idUser}`, function (err, rows, fields) {
      if (err) throw err
      res.send(rows)
    })
  })

  router.post('/chat', jwtMW, (req, res) => {
    const chat = req.body.chat
    const time = req.body.time
    const idUser = req.body.idUser
    connection.query(`INSERT INTO tbl_chat (chat, time, id_user) values ("${chat}","${time}",${idUser})`, function (err, rows, fields) {
      if (err) throw err
      res.send(rows)
    })
  })

  router.patch('/chat/:id', jwtMW, (req, res) => {
    const id = req.params.id
    const chat = req.body.chat
    connection.query(`UPDATE tbl_chat SET chat="${chat}" WHERE id=${id}`, function (err, rows, fields) {
      if (err) throw err
      res.send(rows)
    })
  })

  router.delete('/chat/:id', jwtMW, (req, res) => {
    const id = req.params.id
    connection.query(`DELETE FROM tbl_chat WHERE id=${id}`, function (err, rows, fields) {
      if (err) throw err
      res.send(rows)
    })
  })
})

app.listen('7000', () => console.log('App Running !'))