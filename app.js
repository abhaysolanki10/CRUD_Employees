const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const NodeCouchdb = require('node-couchdb');

const auth_username = 'abhaysinh';
const auth_password = 'abhay1234';

const couch = new NodeCouchdb({
  auth: {
    user: auth_username,
    pass: auth_password  
  }
});
couch.listDatabases().then(function(dbs){
  console.log(dbs);
});


const dbname = "employees_details"
const viewUrl = "_design/allemployees/_view/all";
const app = express();


app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));



app.get('/',function(req,res){

  couch.get(dbname,viewUrl).then(function(data,header,status){
      res.render('index',{
        employees:data.data.rows
      });
  },function(err){
    res.send(err);
  });
  

});

app.post('/employees/add',function(req,res){
  const name = req.body.firstname;
  const email = req.body.email;
  couch.uniqid().then(async function(ids){
    const id = ids[0];
    
    const nano = require('nano')('http://abhaysinh:abhay1234@localhost:5984'); // Replace with your CouchDB URL
    const db = nano.db.use('employees_details'); // Replace 'employees' with your database name
    
    try {
      // Query the database to check if an employee with the same name already exists
      const queryResult = await db.find({
        selector: {
          name: { "$eq": name },
          email: { "$eq": email }
        },
        limit: 1
      });
  
      if (queryResult.docs.length > 0) {
        // If an employee with the same name already exists, display an alert box
        res.send("<script>alert('An employee with the same name already exists.'); window.location='/';</script>");
        // Return to avoid further execution
        return;
      }
  
      // If the name is unique, proceed to add the new employee to the database
      await db.insert({
        _id: id,
        name: name,
        email: email
      });
      res.redirect('/');
    } catch (error) {
      console.error('Error adding employee:', error);
      res.status(500).send('Error adding employee. Please try again later.');
    }

    // couch.insert('employees_details',{
    //   _id:id,
    //   name:name,
    //   email:email
    // }).then(function(data,headers,status){
    //   res.redirect('/');
    // },function(err){
    //   res.send(err);
    // });
  });
});


app.post('/employees/delete/:id',function(req,res){
  couch.del("databaseName", "some_document_id", "document_revision").then(({data, headers, status}) => {

});
app.listen(3000,function(){
  console.log("server running properly");
});