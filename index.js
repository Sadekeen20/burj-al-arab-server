const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require("firebase-admin");
require('dotenv').config();
console.log(process.env.DB_PASS)
const app = express()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.luzew.mongodb.net/burjAlArab?retryWrites=true&w=majority`;

const port = 5000;

const pass="ArabianHorse79";



var serviceAccount = require("./configs/burj-al-arab-44954-firebase-adminsdk-bwswy-1db82d2013.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});

app.use(cors());
app.use(bodyParser.json());

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(uri, { useNewUrlParser: true ,useUnifiedTopology:true});
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  
  app.post("/addBooking",(req,res) =>{
      const newBooking = req.body;
      bookings.insertOne(newBooking)
      .then(result =>{
        console.log(result)
         res.send(result.insertedCount >0); 
      })
      // console.log(newBooking);
  })

  
//on server side , fetching the data + // with user specified
app.get('/bookings', (req, res) => {
  const bearer = req.headers.authorization;
  if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      admin.auth().verifyIdToken(idToken)
          .then(function (decodedToken) {
              const tokenEmail = decodedToken.email;
              const queryEmail = req.query.email;
              if (tokenEmail == queryEmail) {
                  bookings.find({ email: queryEmail})
                      .toArray((err, documents) => {
                          res.status(200).send(documents);
                      })
              }
              else{
                  res.status(401).send('un-authorized access')
              }
          }).catch(function (error) {
              res.status(401).send('un-authorized access')
          });
  }
  else{
      res.status(401).send('un-authorized access')
  }
})



});




app.listen(port);




