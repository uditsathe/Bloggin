//jshint esversion:6
const cookieParser = require("cookie-parser");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const FileReader= require("FileReader");
const app = express();
const bcrypt=require("bcrypt");
const jwt = require("jsonwebtoken");
const multer=require("multer"); 
const fs=require("fs");
// const LocomotiveScroll=require("locomotive-scroll");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
mongoose.connect('mongodb://127.0.0.1:27017/BLOGGINdatabase');
app.use(express.static("public"));

// following section is the footer email address click behaviour

// function copyEmailFunc(emailValue) {
//   // Get the text field
//   var copyText = document.getElementById("myInput");

//   navigator.clipboard.writeText(emailValue);

//   alert("Address copied to clipbord: " + emailValue);
// };

// document.querySelector("copyEmail").addEventListener('click', () => {
//   let email= "uditsathe@gmail.com";
//   // let author = quoteAuthor.textContent;
//   navigator.clipboard.writeText(`${email}`);
// });
// ------------------------------------------------------------


var Months = ['January', 'February', 'March', 'April',
'May', 'June', 'July', 'August', 'September',
'October', 'November', 'December'];
function whatMonth(Date){
 return Months[Date.getMonth()];
}

// var d1 =Date.now();
// console.log(d1);

var FBlog="This is the title coming from app.js";
var FContent="a part of this long text is the preview at the home page. This is the content of the featured blog that will be sent to the full page of the blog and that is why this has to be a long piece of text."
var FcontentPreview=FContent.substring(0,80)+"...";


const isAuthenticated = async function(req,res,next){
  const token=req.cookies.token;
  if(token){
    const decode = jwt.verify(token, "thisisasecret");
    req.user = await User.findById(decode._id);
    next();
  }
  else{
    const thePost = Post.find({}).sort({likes:'desc'}).limit(10).then(function(posts){
      // posts.forEach(function(post){
        //  console.log(posts);
        likeSortedPosts=posts;
        Post.find({}).sort({date:'desc'}).limit(4).then(function(sequencedPosts){
   
         res.render("home",{thePosts:likeSortedPosts,recentPosts:sequencedPosts});
        })
        //IN THIS LINE WE ARE SENDING FBlog AS THE VALUE FOR featureBlog SPECIFIED IN home.ejs
        // res.render("post",{titleOfPost:printTitle, contentOfPost:printContent});
      // })
    });
  // res.render("home.ejs",{featureBlog:FBlog, featureContentPreview:FcontentPreview});
  }
}
app.get("/", isAuthenticated,function(req, res){
  var likeSortedPosts;
  const thePost = Post.find({}).sort({likes:'desc'}).limit(10).then(function(posts){
     likeSortedPosts=posts;
     Post.find({}).sort({date:'desc'}).limit(4).then(function(sequencedPosts){

      res.render("personalHome",{thePosts:likeSortedPosts,recentPosts:sequencedPosts, currentUser:jwt.verify(req.cookies.token,"thisisasecret")._id});
     }) //IN THIS LINE WE ARE SENDING FBlog AS THE VALUE FOR featureBlog SPECIFIED IN home.ejs
      // res.render("post",{titleOfPost:printTitle, contentOfPost:printContent});
    // })
  });


 
});
app.post("/",isAuthenticated, function(req,res){
  res.render("personalHome",{featureBlog:FBlog, featureContentPreview:FcontentPreview}); //IN THIS LINE WE ARE SENDING FBlog AS THE VALUE FOR featureBlog SPECIFIED IN home.ejs
});




app.get("/genre", function(req,res){
res.render("genre");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
//----------------------------------------------------------------------------
//SCHEMA DEFINITIONS FOLLOW
const userSchema=new mongoose.Schema({
  
  firstName:{
      type:String,
      required:true,
      min:2,
      max:50
  },
  lastName:{
      type:String,
      required:true,
      min:2,
      max:50
  },
  email:{
      type:String,
      required:true,
      max:50,
      unique:true
  },
  password:{
      type:String,
      required:true,
      min:5,
  },
  salt:{
    type:String
  },
  postIds:{
     type:[]
  },
  bio:{
    type:String
  }
},
{timestamps:true}
);

const User = mongoose.model("User", userSchema);

const blogSchema = new mongoose.Schema({
  userId:{
    type: String,
    required:true
  },
  title:{
    type:String,
    max:120,
    required:true
  },
  content:{
   type:String,
   max:6000,
   required:true
  },
  date:{
    type:Date
  },
  likes:{
    type:Number
  },
  thumbnailPath:{
    type:String
  },
  charCount:{
    type:Number
  }
})

const Post =mongoose.model("Post", blogSchema);

//---------------------------------------------------------------------------------------------------
//LOGIN PAGE CODE
app.get("/login", function(req,res){
  res.render("login.ejs");
})

app.post("/login",async function(req,res){
  try{
    const enteredEmail=req.body.email;
    User.findOne({email:enteredEmail}).then(async function(user){
        const enteredPass= req.body.password;
        const salt= user.salt;
        const enteredPassHash=await bcrypt.hash(enteredPass,salt);
        if(user.password == enteredPassHash){
          const tokenVal = jwt.sign({_id:user._id},"thisisasecret");
          res.cookie("token",tokenVal,{ expires: new Date(Date.now() + 1296000*1000), httpOnly: true });
          // console.log(tokenVal);
          console.log("password match successful login, cookie generated");
          res.redirect("/");
        }
        else{
          console.log("passwords don not match");
          res.redirect("/login");
        }
      // else{
      //   console.log("no user for that email");
      //   res.redirect("/login");
      // }
    })
  }
  catch(err){
    console.log(err);
    res.redirect("/login");
  }
})
//-------------------------------------------------------------------------------------------------------
//COMPOSE PAGE CODE
app.get("/compose",isAuthenticated,function(req,res){
  // console.log("token on compose page: "+req.cookies.token);
  res.render("compose");
});

let fName;
const storage =multer.diskStorage({
  destination: function(req,file,cb){
    return cb(null, "./public/images");
  },
  filename:function (req,file,cb){
   let OriginalTrim=file.originalname.replace(/ +/g, "");////IMP LINE WHERE WE REMOVE SPACES FROM A NAME
   fName= `${Date.now()}-${OriginalTrim}`;
    return cb(null, fName);
  },
});
const upload=multer({storage});

app.post("/compose",isAuthenticated,upload.single("photo"), function(req,res){

  let thumbPath="";
  if(req.body.photo !=""){
   thumbPath="images/"+fName;
  }
  const post = new Post({
    userId:req.user._id,
    title:req.body.title,
    content:req.body.content,
    date:Date.now(),
    thumbnailPath:thumbPath,
    likes:18
  });
  const postId=post._id;
  post.save();
  res.redirect("/posts/"+postId);
  console.log(thumbPath);
  console.log(req.user.firstName+"has added a new post");
});

//--------------------------------------------------------------------------------------------------------
//EDIT POST PAGE CODE
app.get("/posts/:postId/edit",function(req,res,file){
  var requestedPost=req.params.postId;
  Post.findOne({_id:requestedPost}).then(function(post){
    var thumbnailVisiblity="";
    if(post.thumbnailPath ==""){
      thumbnailVisiblity="display:none;"
    }
    res.render("editPostPage",{post:post, isThumbnailPresent:thumbnailVisiblity});
  })
})

app.post("/posts/:postId/edit",async function(req,res){  
var deletePath="";
var query = {'_id':req.params.postId};
//RIGHT NOW THE THUMBNAIL UPDATING FUNCTIONALITY IS OFF SO THIS PART IS COMMENTED OUT
  // if(req.body.photo!=null){
      
  // //  await Post.findOne({_id:req.params.postId}).then(async function(post){
  // //     const op = await post.updateOne({title:req.body.title});
  // //     // const change =(await Post.updateOne({_id:req.params.postId}, {title:req.body.title, content:req.body.content, date:Date.now()}));
  // //        console.log(post.title);
  // //   })
  // Post.findOne({_id:req.params.postId}).then(upload.single("updatePhoto"),function(post){
  //   deletePath="images/"+post.thumbnailPath;
  //   let thumbPath="images/"+fName;
  //   var updateThumbnail={thumbnailPath:thumbPath};
  //   Post.findOneAndUpdate(query,updateThumbnail);
  //  })
  // }
  console.log(req.body);
  updateTitle=req.body.updateTitle;
  updateContent=req.body.updateContent;
  newDate=Date.now();
  // var update={title:req.body.updateTitle, content:req.body.updateContent, date:Date.now()};
  await Post.updateOne(query,{title:updateTitle, content:updateContent, date:newDate});
  res.redirect("/posts/"+req.params.postId);
  if(deletePath != ""){
  fs.unlink(deletePath);
  }
})
app.post("/posts/:postId/delete",function(req,res){
  Post.deleteOne({_id:req.params.postId},).then(function(post){
    console.log("one blog deleted");
    res.redirect("/user/"+req.user._id);
  })
})
//-------------------------------------------------------------------------------

//PERSONAL HOME PAGE CODE
// app.get("/personalHome",isAuthenticated,function(req,res){
//   console.log(req.cookies.token);
//   res.redirect("/");
// })
//--------------------------------------------------------------------------------------------------------
//LOGOUT REQUEST CODE
app.get("/logout",isAuthenticated,function(req,res){
  console.log("logout successful, killing token then redirecting");
  res.cookie("token",null,{ expires:new Date(Date.now()), httpOnly: true });
  res.redirect("/");
})
//----------------------------------------------------------------------------

//POST VIEW PAGE CODE FOLLOWS



app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;
  var thumbnailNotPresent="";
  var token=req.cookies.token;
  if(token){
    const decode = jwt.verify(token, "thisisasecret");
    curUserId = decode._id;
    Post.findOne({_id:requestedPostId}).then(function(postDis){
      if(postDis.thumbnailPath == ""){
        thumbnailNotPresent='"display: none;"';
      }
      var name="";
      User.findOne({_id:postDis.userId}).then(function(author){
        if(curUserId==author._id){
        name=author.firstName+" "+author.lastName;
        console.log(name);
        res.render("post",{
          post: postDis,
          isThumbnailPresent:thumbnailNotPresent,
          authorName:name,
          user:author,
          showEdit:"",
          showDelete:"",
          logoutVisible:"",
          loginVisible:"display:none;",
          currentUser:curUserId
        });
        }
        else{
          name=author.firstName+" "+author.lastName;
          console.log(name);
          res.render("post",{
            post: postDis,
            isThumbnailPresent:thumbnailNotPresent,
            authorName:name,
            user:author,
            showEdit: "display:none;",
            showDelete: "display:none;",
            logoutVisible:"",
            loginVisible:"display:none;"
          });
        } 
      })
     })
  }
  else{
    Post.findOne({_id:requestedPostId}).then(function(postDis){
      if(postDis.thumbnailPath == ""){
        thumbnailNotPresent='"display: none;"';
      }
      var name="";
      User.findOne({_id:postDis.userId}).then(function(author){
        name=author.firstName+" "+author.lastName;
        res.render("post",{
          post: postDis,
          isThumbnailPresent:thumbnailNotPresent,
          authorName:name,
          user:author,
          showEdit:"display:none;",
          showDelete:"display:none;",
          logoutVisible:"display:none;",
          loginVisible:"",
        })
      })
     });
  }
});
//-------------------------------------------------------------------------------

//USER PAGE REDIRECT
app.get("/user/:userId", function(req,res){
  var requestedUserId=req.params.userId;
  console.log(requestedUserId);
  var token=req.cookies.token;
  if(token){
  var currentUser=jwt.verify(token,"thisisasecret")._id;
  console.log(currentUser);
  if(currentUser==requestedUserId){
    User.findOne({_id:requestedUserId}).then(function(postAuthor,req){
      Post.find({userId:postAuthor._id}).sort({likes:'desc'}).then(function(posts,req){
        res.render("user",{
          user:postAuthor,
          posts:posts,
          loginVisible:"display:none;",
          logoutVisible:"",
          userAuthenticOrNot:"top: 2rem;"
        })
      })
    })
  }
  else{
    User.findOne({_id:requestedUserId}).then(function(postAuthor,req){
      Post.find({userId:postAuthor._id}).sort({likes:'desc'}).then(function(posts,req){
        res.render("user",{
          user:postAuthor,
          posts:posts,
          loginVisible:"display:none;",
          logoutVisible:"",
          userAuthenticOrNot:"display:none;"
        })
      })
    })
  }
}
else{
  User.findOne({_id:requestedUserId}).then(function(postAuthor,req){
    Post.find({userId:postAuthor._id}).sort({likes:'desc'}).then(function(posts,req){
      res.render("user",{
        user:postAuthor,
        posts:posts,
        logoutVisible:"display:none;",
        loginVisible:"",
        userAuthenticOrNot:"display:none;"
      })
    })
  })
}
});



app.get("/post", function(req,res){
res.render("post.ejs",{titleOfPost:printTitleOnPost, contentOfPost:printContentOnPost });
})

//---------------------------------------------------------------------------------------------------
//REGISTER PAGE CODE FOLLOWS

app.get("/register",function(req,res){
  res.render("register.ejs");
})

app.post("/register",upload.single("photo"), async (req,res)=>{
  try{
  
  if(User.findOne({email:req.body.email})==null){
    console.log("user already exists");
    res.redirect("/register");
  }
  let dpPath="images/"+fName;
  const password =req.body.password;
  const salt = await bcrypt.genSalt();
  const passwordHash=await bcrypt.hash(password,salt);

  const user = new User({
    firstName:req.body.firstName,
    lastName:req.body.lastName,
    email:req.body.email,
    password:passwordHash,//TOSTORE PASSWORD HERE AND HANCE KEEP OURSELF SAFE FROM DB SECURITY LAPSES WE USE SALTING
    salt:salt,
    bio:req.body.bio
  });
  await user.save();
  console.log("new user saved");
}

catch(err){
   console.log(err);
}
})

//------------------------------------------------------------------------------------------------------
//ACCOUNT SETTINGS PAGE CODE
app.get("/users/:userId/settings", isAuthenticated,function(req,res){
  var settingReqUser=req.params.userId;
  var token = req.cookies.token;
  if(token){
    if(settingReqUser == jwt.verify(token,"thisisasecret")._id){
      User.findOne({_id:settingReqUser}).then(function(user){
        res.render("settings.ejs",{
          showForm1:"",
          showForm2:"display:none;",
          user:user
        });
      })
    }
  }
})
app.post("/users/:userId/requestSettings", isAuthenticated,async function(req,res){
var userEmail=req.body.email;
var reqPass=req.body.reqPassword;
const findUser = await User.findOne({email:userEmail}).then(async function(user){
  var salt=user.salt;
  var pass= await bcrypt.hash(reqPass,salt);
  if(user.password==pass){
    res.render("settings.ejs",
    {
      showForm1:"display:none;",
      showForm2:"",
      user:user
    });
  }
});
if(!findUser){
  res.redirect("/");
}
})
app.post("/submitSettings", isAuthenticated, async function(req,res){
  var userFName=req.body.firstName;
  var userLName=req.body.lastName;
  var newEmail=req.body.email;
  var newPassword=req.body.newPassword;
  var confirmPassword=req.body.repeatNewPassword;
  var newBio = req.body.bio;
  if(newPassword == ""){
    res.redirect("/submitSettings");
  }
  if(newPassword==confirmPassword){
    var newSalt = await bcrypt.genSalt();
    var newPasswordHash=await bcrypt.hash(newPassword,newSalt);
     await User.updateOne({_id:req.params.userId},{firstName:userFName, lastName:userLName, email:newEmail, password:newPasswordHash,salt:newSalt,bio:newBio});
     res.redirect("/");
  }
  else{
    res.redirect("/submitSettings");
  }
})