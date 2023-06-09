const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

const router = express.Router()

const cors = {
  // 为什么设置为 localhost 不能携带cookie
  // 'Access-Control-Allow-Origin': 'http://localhost:8080',
  'Access-Control-Allow-Origin': 'http://127.0.0.1:8080',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

router.post('/more/server2', function (req, res) {
  res.set(cors)
  res.json(req.cookies)
})

router.options('/more/server2', function (req, res) {
  res.set(cors)
  res.end()
})

app.use(router)

const port = 8088
module.exports = app.listen(port)
