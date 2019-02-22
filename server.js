const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set("port", process.env.PORT || 8000);










require('./app/routes')(app, {});
app.listen(app.get("port"), function(){
    console.log("server started on port " + app.get("port"));
});