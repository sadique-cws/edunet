var express  = require('express')
var conn = require("./lib/db");
var router = express.Router()
var multer = require("multer")
var path = require("path");
const { nextTick } = require('process');

//image uploading setup
var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"photos")
    },
    filename: function(req,file,cb){
        cb(null,file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({storage:storage})


//all route here
router.get("/",function(req,res){
    data = {}
    query = conn.query("select * from topics; select * from posts JOIN topics ON posts.topic_id=topics.id;select * from posts order by visit_times DESC",(err,result)=>{
        res.render("home",{topics:result[0],posts:result[1],top_post:result[2]})
    })

})


//category filteration 
router.get("/category/:id",function(req,res){
    data = {}
    query = conn.query("select * from topics; select * from posts JOIN topics ON posts.topic_id=topics.id where posts.topic_id=?;select * from posts order by visit_times DESC",[req.params.id],(err,result)=>{
        res.render("home",{topics:result[0],posts:result[1],top_post:result[2],filtered:true})
    })

})

//insertion
router.get("/insert",(req,res)=>{
    conn.query("select * from topics",(err,result) => {
        return res.render("insert",{topics: result});
    })
})

router.get("/post/:id",(req,res)=>{
    sql = "select * from posts JOIN topics ON posts.topic_id = topics.id where posts.p_id = ?;select * from topics;update posts SET visit_times= visit_times + 1 where p_id=?;select * from posts JOIN topics ON posts.topic_id = topics.id  where p_id != ?"
    conn.query(sql,[req.params.id,req.params.id,req.params.id],(err,result) => {
        //first [0] for multi statement query and second [0] for single view record
        return res.render("post",{post: result[0][0],topics:result[1],related_posts:result[3]});
    })
})

router.post("/insert",upload.single("image"),(req,res)=>{
    sql = "insert into posts (p_title, topic_id, author, content, status, image) value (?,?,?,?,?,?)";
    conn.query(sql,[req.body.p_title,req.body.topic_id,req.body.author,req.body.content,1,req.file.filename],(err,result) => {
        if(err) throw err;
    })
})

router.get("/login",(req,res)=>{
    return res.render("login");
})

router.get("/register",(req,res)=>{
    req.session.user = "alok@gmail.com"
    console.log(req.session.user)
    return res.render("register");
})

var Users = [];

router.post("/register",(req,res)=>{
    if(! req.body.email || ! req.body.password){
        res.status("400");
        res.send("Invalid Details");
    }
    else{
        Users.filter(function(user){
            if(user.email === req.body.email){
                res.render("register",{
                    message:"User already Exist! login or choose another user"
                })
            }
        });
        var newUser = {email: req.body.email , password: req.body.password}
            Users.push(newUser);
            req.session.user = newUser;
            res.redirect("/protected_page");
    }

});

router.get("/protected_page",checkSignIn,(req,res)=>{
    res.render("profile",{email:req.session.user.email})
})
function checkSignIn(req,res,next){
    if(req.session.user){
        next();
    }
    else{
        var err = new Error("not logged in!");
        console.log(req.session.user);
        next(err);
    }
}

module.exports = router
