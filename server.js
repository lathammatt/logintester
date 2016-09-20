'use strict';

const express = require('express')
const session = require('express-session')
var RedisStore = require('connect-redis')(session)
const bodyParser = require('body-parser')
const {cyan, red} = require('chalk')

const routes = require('./routes/')

const {connect} = require('./db/database')

const app = express()

const port = process.env.PORT || 5757
app.set('port', port)

app.set('view engine', 'pug')

if(process.env.NODE_ENV !== 'production'){
  app.locals.pretty = true
}
app.locals.company = 'login test'
app.locals.errors = {}
app.locals.body = {}

app.use(session({
  store: new RedisStore({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  }),
  secret: "secretuserkey"
}))

app.use((req, res, next) => {
  app.locals.email = req.session.email
  next()
})

app.use(({method, url, headers: {'user-agent': agent}}, res, next) => {
	const timestamp = new Date()
	console.log(`[${timestamp}] "${cyan(`${method} ${url}`)}" "${agent}"`);
	next()
})
app.use((req, res, next) => {
	console.log("Request sent to", req.url);
	next()
})
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))

app.use(routes)


connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`listening on ${port}`)
    })
  })
  .catch(console.error)