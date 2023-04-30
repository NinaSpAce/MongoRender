const MongoClient = require("mongodb").MongoClient;
var XMLJS = require('xml2js');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const fetch = require('node-fetch');
const port = 3000;

// The uri string must be the connection string for the database (obtained on Atlas).
const uri = "mongodb+srv://classuser:LJ6fvgWHY1H4eJ5C@cmps-415.joavhvm.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser : true});

app.listen(port);
console.log('Server started at http://localhost:' + port);


app.use(express.json());
app.use(bodyParser.json());
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
      return;
  } else {
      console.log('Form has been loaded\n');
      res.write(contents + "<br>");
      res.end();
  }
});
});

//GET all tickets
app.get('/rest/list/', async function(req,res){
  const tickets = client.db('CMPS415').collection('atlas');
  try {
    const docs = await tickets.find({}).toArray();
    console.log('Tickets retrieved!\n', docs);
    res.setHeader('Content-Type', 'application/json');
    res.send(docs);
  } catch (err) {
    console.error('Error querying MongoDB:', err);
    res.status(500).send({ err: 'Internal Server Error' });
  }
});


//GET BY ID
app.get('/rest/list/:id', async function(req,res){
  const ticket = client.db('CMPS415').collection('atlas');
   const ticketid = (req.params.id);
      console.log('Looking for: ' + ticketid);
      try{
        const doc= await ticket.findOne({ id: ticketid });
          console.log('Ticket found!\n', doc);  
          res.setHeader('Content-Type', 'application/json');
          res.send(doc);
      }
      catch(err){
       console.error('Error: ', err);
       res.status(500);
       
    }
  });

  //GET A XML TICKET
  app.get('/rest/xml/list/:id', async function(req, res) {
    const ticket = client.db('CMPS415').collection('atlas');
    const ticketid = req.params.id;
    console.log('Sending a get request to grab a json object...');
    
    try {
      const doc = await ticket.findOne({ id: ticketid });
      console.log('JSON Ticket found!\n');
      
      if (doc) {
        const Response = await fetch('https://mongo-cmps415.onrender.com/rest/list/3');
        const JSONData = await Response.json();
        
        const xmlBuild = new XMLJS.Builder();
        const xmlData = xmlBuild.buildObject(JSONData);

        res.set('Content-Type', 'application/xml');
        console.log('Ticket converted to XML!\n');
        res.send(xmlData);
      } 
      else {
        console.error('Could not find ID in MongoDB.\n');
        res.status(404).send('Ticket not found.\n');
      }
    } catch(err) {
      console.error('Error: ', err);
      res.status(500).send('Internal server error.\n');
    }
  });


//UPDATE ticket
app.put('/rest/ticket/:id', async function(req,res){
  const ticket = client.db('CMPS415').collection('atlas');
  const ticketid = (req.params.id);
    console.log('Updating ticket with ID: ' + ticketid);
  try{
  const filter = { id: ticketid };
  const update = { $set: req.body };
  const options = { new: true };

  const doc = await ticket.findOneAndUpdate(filter, update, options);
  if (doc) {
    console.log('Ticket updated successfully:', doc);
    res.status(200).json(doc);
  } 
  else {
    console.error('Could not find ticket with ID:', ticketid);
    res.status(404).send('Ticket not found');
  }
    }
catch(err){  
      console.error('Error updating ticket:', err);
      res.status(500);
    }
});

//UPDATE A XML TICKET
app.put('/rest/xml/ticket/:id', async function(req,res){
  const ticket = client.db('CMPS415').collection('atlas');
  const ticketid = (req.params.id);
    console.log('Updating XML ticket with ID: ' + ticketid);
  try{
  const filter = { id: ticketid };
  const update = { $set: req.body };
  const options = { new: true };

  const doc = await ticket.findOneAndUpdate(filter, update, options);
  if (doc) {
    console.log('XML Ticket updated successfully:', doc);
    const xmlData = doc.update;
    const XML = new XMLJS.XMLSerializer();
    const xmlString = XML.serializeToString(xmlData);
    const jsData = JSON.parse(xml2json.toJson(xmlString));
    const PostResponse = await fetch('https://mongo-cmps415.onrender.com/rest/ticket/3', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: jsData
        });
        if(!PostResponse.ok){
          console.error('Error sending POST request:', PostResponse.status);
          res.status(500).send('Internal server error.\n');
        } else {
          res.status(200).json(jsData);
        }
      }
  else {
    console.error('Could not find ticket with ID:', ticketid);
    res.status(404).send('Ticket not found');
  }
    }
catch(err){  
      console.error('Error updating ticket:', err);
      res.status(500);
    }
});

//DELETE ticket
app.delete('/rest/ticket/delete/:id', async function(req,res){
  const ticket = client.db('CMPS415').collection('atlas');
  const ticketid = (req.params.id);
  console.log('Deleting ticket with ID: ' + ticketid);
   try{
    const result = await ticket.deleteOne({id: ticketid});
    console.log('Ticket ${ticketid} deleted!\n');
    res.setHeader('Content-Type', 'application/json');
    res.send(result); 
    }
    catch(err){
      console.error('Could not delete the ticket.', err);
      res.status(500);
}
});

//POST ticket
app.post('/rest/ticket/', async function(req,res){
  const tickets = client.db('CMPS415').collection('atlas');
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
  tickets.insertOne(ticket, function(err,doc) {
    
  if(err) {
    console.log('Could not add ticket', err);
    res.status(500);
    res.end();
    return;
}
else {
console.log('Ticket added!\n', doc);
res.setHeader('Content-Type', 'application/json');
res.send(doc);
res.end();
}  
});
});
