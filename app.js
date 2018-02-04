const express = require('express')
const Sequelize = require('sequelize')
var cors = require('cors')
var qs = require('querystring');

var multer = require('multer')
const app = express()

app.use(cors())

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
      let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
      cb(null, Date.now() + ext)
  }
});
var upload = multer({storage: storage})
app.get('/', (req, res) => res.send('Hello World!'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))

app.get('/user', function (req, res) {
  var json = {username: 'krishna', pwd: 'secret' }
  res.send(json)
})
app.post('/uploadDesign', upload.any(), function(req, res) {
  console.log(req.files[0])
  sequelize.sync()
    .then(() => Design.create({
      originalName: req.files[0].originalname,
      serverFileName: req.files[0].filename
    }))
})

app.get('/designs', function(req, res) {
  var designs = Design.findAll()
  designs.then(function(data) {
    res.send(data)
  })
})
app.get('/design', function(req, res) {
  Design.findById(req.query.id)
    .then(function(data) {
      res.send(data)
    })
})
app.get('/designHistory', function(req, res) {
  DesignHistory.findAll({where: {designId: req.query.id}})
    .then(function(data) {
      res.send(data)
    })
})
app.post('/design', upload.any(), function(req, res) {
  var id = parseInt(req.query.id);
  Design.findById(req.query.id)
    .then(function(data) {
      DesignHistory.create({
          originalName: data.originalName,
          designId: req.query.id,
          serverFileName: data.serverFileName
        })
    })
  Design.update({
      serverFileName: req.files[0].filename
    },
    {
      where: {id: req.query.id}
    })
  res.send()
})
app.get('/designFile', function(req, res) {
  res.sendFile(`${__dirname}/uploads/${req.query.serverFileName}`)
})
const sequelize = new Sequelize('designeditor', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  operatorsAliases: false
})

const Design = sequelize.define('design', {
  originalName: Sequelize.STRING,
  serverFileName: Sequelize.STRING
})

const DesignHistory = sequelize.define('designhistory', {
  originalName: Sequelize.STRING,
  serverFileName: Sequelize.STRING,
  designId: {
    type: Sequelize.INTEGER,
    references: {
      model: 'designs',
      key: 'id'
    }
  }
})