
// --- This is the standard stuff to get it to work on the browser
const express = require('express');
const bodyParser = require('body-parser');
var fs = require('fs');
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

    fs.readFile("tickets.txt", 'utf8', (err,data) => {
        if (err){
            console.error(err);
          return;
        }
        else{
            console.log("File read successfully! \n");
            console.log("Contents of file now:\n");
            res.send(data);
        }
    });
    

  });
app.get('/rest/ticket/:id', function(req,res){
 const searchKey = "{ id: " + req.params.id + "' }";
    console.log('Looking for: ' + searchKey);
  
     fs.readFile("tickets.txt", 'utf8', (err,data) => {
        if (err){
            console.error(err);
          return;
        }
          else if(searchKey == true){
            console.log("Ticket found! \n");
            console.log("Contents of ticket are:\n");
            res.send(data);
          }
       });
  });
app.post('/rest/ticket/', function(req,res){
    res.send('CREATE a new ticket');
    const id = req.body.id;
    const creation = req.body.creation;
    const updated = req.body.updated;
    const type = req.body.type;
    const subject = req.body.subject;
    const description = req.body.description;
    const priority = req.body.priority;
    const status = req.body.state;
    const recipient = req.body.recipient;
    const submitter = req.body.submitter;
    const assignee_id= req.body.assignee_id;
    const followers_ids = req.body.followers_ids;
    const tags = req.body.tags;


    var data = {
        'id': id,
        'creation': creation,
        'updated': updated,
        'type': type,
        'subject': subject,
        'description': description,
        'priority': priority,
        'status': status,
        'recipient': recipient,
        'submitter': submitter,
        'assignee_id': assignee_id,
        'followers_ids': followers_ids,
        'tags': tags,        
    }

    var JSONdata = JSON.stringify(data);

    fs.writeFile("tickets.txt", JSONdata, function(err){
        if (err){
            console.log(err);
        }
        else{
            console.log("File written successfully\n");
        }
    });
});


