var mysql = require("mysql")


var conn = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"edunet",
    multipleStatements:true,
    dateStrings: true

});

conn.connect(function(err){
    if (err) throw err;

    console.log("connected");


})


module.exports = conn;