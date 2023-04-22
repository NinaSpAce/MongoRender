
const { MongoClient } = require("mongodb");
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const port = 3000;

// The uri string must be the connection string for the database (obtained on Atlas).
const uri = "mongodb+srv://classuser:LJ6fvgWHY1H4eJ5C@cmps-415.joavhvm.mongodb.net/?retryWrites=true&w=majority";

const connectToDB = async () => {
  const client = new MongoClient(uri);
  await client.connect();
  console.log("Connected to MongoDB!");
  const db = client.db('CMPS415');
  const collection = db.collection('atlas');
  return collection;
}

app.listen(port);
console.log('Server started at http://localhost:' + port);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// routes will go here

// Default route:
app.get('/', function(req, res) {
  const myquery = req.query;
  var outstring = 'Starting... ';
  res.send(outstring);
});

//form
app.get('/form', function(req, res){
res.setHeader('Content-Type', 'text/html');
fs.readFile('./form.html', 'utf8', (err, contents) => {
  if(err) {
      console.log('Form file Read Error', err);
      res.write("<p>Form file Read Error");
      res.end();
  } else {
      console.log('Form has been loaded\n');
      res.write(contents + "<br>");
  }
});
});

//GET all tickets
app.get('/rest/list/', async function(req,res){
  const collection = await connectToDB();
  collection.find({}).toArray(function(err, docs) {
    if (err) {
      console.error('Error querying MongoDB:', err);
      res.status(500);
      res.end();
      return;
    }
    else {
      console.log('Tickets retrieved!\n');
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(docs);
  });
  });

//GET by id
app.get('/rest/list/:id', async function(req,res){
const collection = await connectToDB();
 const id = parseInt(req.params.id);
    console.log('Looking for: ' + id);
    collection.findOne({ id: id }, function(err, doc) {
      if (err) {
        console.error('Could not find ID in MongoDB.', err);
        res.status(500);
        res.end();
        return;
      }
      else {
        console.log('Ticket found!\n');
      }
    res.setHeader('Content-Type', 'application/json');
    res.send(doc);
  });
});

//POST ticket
app.post('/rest/ticket/', async function(req,res){
  const collection = await connectToDB();
  const ticket = {
    id: req.body.id,
    created_at: req.body.created_at,
    updated_at: req.body.updated_at,
    type: req.body.type,
    subject: req.body.subject,
    description: req.body.description,
    priority: req.body.priority,
    status: req.body.status,
    recipient: req.body.recipient,
    submitter: req.body.submitter,
    assignee_id: req.body.assignee_id,
    follower_ids: req.body.follower_ids
  };
  collection.insertOne(ticket, function(err) {
    if (err) {
      console.error('Could not insert the ticket.', err);
      res.status(500);
      res.end();
      return;
    }
    else {
      console.log('Ticket added!\n');
    }
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/rest/list/');
    
});
});

//UPDATE ticket
app.put('/rest/ticket/:id', async function(req){
  const collection = await connectToDB();
  const id = parseInt(req.params.id);
    console.log('Updating ticket with ID: ' + id);

  const form = document.querySelector('#ticket-form');
  const formData = new FormData(form);


  fetch(`/rest/ticket/${id}`, {
    method: 'PUT',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    console.log('Ticket updated:', data);
  })
  .catch(error => console.error('Error updating ticket:', error));
});

//DELETE ticket
app.delete('/rest/ticket/delete/:id', async function(req,res){
  const collection = await connectToDB();
  const id = parseInt(req.params.id);
  console.log('Deleting ticket with ID: ' + id);
  collection.deleteOne({id: new ObjectId(id)}, function(err, result) {
    if (err) {
      console.error('Could not delete the ticket.', err);
      res.status(500);
      res.end();
      return;
    }
    else {
      console.log('Ticket deleted!\n');
  }
})
});


