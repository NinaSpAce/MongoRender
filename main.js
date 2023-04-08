
// --- This is the standard stuff to get it to work on the browser
const express = require('express');
const bodyParser = require('body-parser');
var fs = require('fs');
const { send } = require('process');
const app = express();
const port = 3000;
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



app.get('/rest/list/', function(req,res){

    fs.readFile("./tickets.json", 'utf8', (err,jsonString) => {
        if (err){
            console.error(err);
          return;
        }
        try{
          const tickets = JSON.parse(jsonString);
            console.log("File read successfully!");
            console.log("Contents of file now: ");
            res.json(tickets);
        }
        catch (err) {
          console.error(err);
        }
    });
  });
app.get('/rest/ticket/:id', function(req,res){
 const id = req.params.id;
    console.log('Looking for: ' + id);
  
     fs.readFile("./tickets.json", 'utf8', (err,jsonString) => {
        if (err){
            console.error(err);
          return;
        }
          try{
            const tickets = JSON.parse(jsonString);
            const ticket = tickets.find(t => t.id === id);
            if (ticket){
              console.log(`Ticket with ID ${id} found!`);
              res.json(ticket);
            }
            else{
            console.log(`Ticket with ID ${id} not found!`);
            res.status(404);
            }
          }
          catch(err){
            console.error(err);
          }
       });
  });
app.post('/rest/ticket/', function(req,res){
   const data = req.body;
   fs.readFile("./tickets.json", 'utf8', (err,jsonString) => {
    if (err){
        console.error(err);
      return;
    }
    try{
      const currentdata = JSON.parse(jsonString);
      currentdata.push(data);
    
    fs.writeFile("./tickets.json", JSON.stringify(currentdata, null, 2), (err) => {
        if (err){
            console.error(err);
            res.status(500);
        }
        else{
            console.log("File written successfully.");
            res.status(200).json(data);
        }
    });
  }
  catch(err){
    console.error(err);
    res.status(500).send("Error parsing JSON data!");
  }
});
});
