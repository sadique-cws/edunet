var express  = require('express')
var app = express()
var session = require("express-session")

var flash = require("express-flash")
var cookie = require("cookie-parser")


app.use(session({secret:"hello"}))
//json parser
app.use(express.json())
app.use(express.urlencoded({extended:true}))

var route = require("./url.js");

//static directories
app.use(express.static("public"));
app.use(express.static("photos"));

app.use("/protected_page",function(err,req,res,next){
    console.log(err);
    res.redirect("/login");
})

app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});

//route config
app.use("/",route);

//view engine
app.set("views","./views");
app.set("view engine","pug")



//session and cookie
app.use(flash())
app.use(cookie())




app.listen(3000,function(){
    console.log("your project runing on http://127.0.0.1:3000")
})