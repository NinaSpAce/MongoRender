var express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const router = express.Router();
var fs = require('fs');



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var data = {
    'id': id,
    'creation': creation,
    'updated': updated,
    'type': type,
    'subject': subject,
    'description': description,
    'priority': priority,
    'status': state,
    'recipient': recipient,
    'submitter': submitter,
    'assignee_id': assignee_id,
    'followers_ids': followers_ids,
    'tags': tags,        
}
router.get('/rest/list/', function(req,res){
    res.send('GET all tickets.');
    fs.readFile("tickets.txt", function(err,data){
        if (err){
            console.log(err);
        }
        else{
            console.log("File read successfully! \n");
            console.log("Contents of file now:\n");
            res.send(data)
        }
       

    });
  });
router.get('/rest/ticket/:id', function(req,res){
    res.send('GET a single ticket');
    res.send('The ticket' + req.params.id + 'is: ');
  });
router.post('/rest/ticket/', function(req,res){
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
module.exports = router;
