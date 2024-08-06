const express = require("express");
const mongoose = require("mongoose");
const userModel = require("./model/userModel");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { varifiedUser, loginValidation, validateEmail, generateToken, sendVerificationMail } = require("./utils/authUtils");
const session  = require("express-session");
const isAuthMiddleware = require("./middlewares/isAuth");
const validateData = require("./utils/todoUtils");
const todoModel = require("./model/todoModel");
const accessMiddleware = require("./middlewares/accessMiddleware");
const mongoDbSession = require("connect-mongodb-session")(session);
const jwt = require("jsonwebtoken");

//constants
const app  = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI; 
const store = new mongoDbSession({
    uri:MONGO_URI,
    collection:"sessions"
})
//connect db
mongoose.connect(MONGO_URI).then(()=>console.log("db is connected")).catch((err)=>console.log(err));

//middleware

app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("public"));
app.use(session({
    secret:process.env.SECRET_KEY,
    store:store,
    resave:false,
    saveUninitialized:false,
}))

//apis

app.get("/",(req,res)=>{
    return res.render("Landing");
})

app.get("/register",(req,res)=>{
    return res.render("registerPage");
})

app.get("/login",(req,res)=>{
    return res.render("loginPage");
})
//registeration api

app.post("/register", async (req, res) => {
  console.log(req.body);
  const { name, email, username, password } = req.body;

  //data validation
  try {
    await varifiedUser({ name, email, username, password });
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }

  try {
    //check email exist or not
    const userEmailExist = await userModel.findOne({ email });

    if (userEmailExist) {
      return res.status(400).json("Email already exist.");
    }

    const userUsernameExist = await userModel.findOne({ username });

    if (userUsernameExist) {
      return res.status(400).json("Username already exist.");
    }

    //hash the password

    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.SALT)
    );

    const userObj = new userModel({
      //schema : client
      name: name,
      email: email,
      username: username,
      password: hashedPassword,
    });

    const userDb = await userObj.save();
    
    //genreate token for email varification
    const token = generateToken(email);
    //send email to user
    sendVerificationMail(email,token);
    console.log("registered successfully");
    return res.redirect("/login");
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
});
app.get("/verify/:token",async(req,res)=>{
  console.log("verified");
  const token=req.params.token;
  const email=jwt.verify(token,process.env.SECRET_KEY);
  try{
   const data =  await userModel.findOneAndUpdate({email:email},{isEmailValid:true});
   console.log("data:",data);
    return res.status(200).json("email varifies successfully");
  }catch(err){
    res.send({
      status:400,
      message:err.message,
    })
  }
})
//on click of submit btn in the login form login post api will hit

app.post("/login",async(req,res)=>{
    
const{loginID,password} = req.body;
console.log(req.body);
//check weather loginID or password is there 
if(!loginID || !password){
        return res.status(400).json("please fill out all the fields");
      }

//check the type of loginID
if(typeof(loginID) !=='string'){
    return res.status(400).json("email type is not text");
}

  //check the type of password    
if(typeof(password) !=="string"){
    return res.status(400).json("password is not type text");
}

//find the user in database according to the login credentials
try{
let userDB={};
if(validateEmail({key:loginID})){
    userDB  = await userModel.findOne({email:loginID});
    console.log(userDB);
    if(!userDB.isEmailValid){
      return res.status(400).json("Please varify your mail by clicking on the link sent on your email address");    
    }

}else{
    userDB = await userModel.findOne({username:loginID});
}
console.log(userDB);

//comapare the user password and the encrypted password in the userDB object
const isMatch = await bcrypt.compare(password,userDB.password);

if(!isMatch){
    return res.status(400).json("password is incorrect");
}

req.session.isAuth = true;
console.log(req.session);
req.session.user = {
    userId : userDB._id,
    username:userDB.name,
    email:userDB.email,
}
res.redirect("/dashboard");
// redirection is not the part of server, it is only implemented here for the sake of workflow
// return res.status(200).json("login success"); 
   
}
catch(error){
    console.log(error);
    return res.status(500).json({message:"internal server error",error:error});
}
});

app.get("/dashboard",isAuthMiddleware,(req,res)=>{
  res.render("dashboard");
})

//to delete the session from a single device---->>>>>>>>

app.post("/logout",isAuthMiddleware,(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            res.status(500).json(err);
        }else{
            res.status(200).json("logout successfully");
        }
    })
})

// to delete the session from all devices

app.post("/logout-from-all",isAuthMiddleware,async(req,res)=>{
    const username = req.session.user.username;
    const sessionSchema = new mongoose.Schema(
        {id:"string"},
        {strict:false}
    );
    const sessionModel = mongoose.model("session",sessionSchema);
    try{
    const deleteDB = await sessionModel.deleteMany({"session.user.username":username});
    console.log(deleteDB);
    res.status(200).json("logout from all devices");
    }catch(err){
        res.status(500).json(err);
    }
})


//to-do creation api=------------>>>>>>>>>>
app.post("/create-item", isAuthMiddleware,accessMiddleware, async (req, res) => {
    console.log(req.body);
  
    const todo = req.body.todo;
    const username = req.session.user.username;
  
    //data validation
    try {
      await validateData({ todo });
    } catch (error) {
      return res.send({
        status: 400,
        message: error,
      });
    }
  
    const todoObj = new todoModel({
      todo: todo,
      username: username,
    });
  
    try {
      const todoDb = await todoObj.save();
      console.log(todoDb);
  
      // return  res.status(201).json("")
      return res.send({
        status: 201,
        message: "Todo created successfully",
        data: todoDb,
      });
    } catch (error) {
      return res.send({
        status: 500,
        message: "Internal server error",
        error: error,
      });
    }
  });
//   app.get("/raed-item",isAuthMiddleware, async (req,res)=>{
//     const username = req.session.user.username;
//     try{
//         const todoDb = await todoModel.find({username});
//         console.log(todoDb)
//               if (todoDb.length === 0) {
//                     return res.send({
//                       status: 203,
//                       message: "No todo found.",
//                     });
//                   }
//         return res.send({
//             status:200,
//             message:"Todo List",
//             data:todoDb,
//         })
//     }
//     catch(err){
//         console.log(err)
//     return  res.send({
//             status:500,
//             message:"Internal server error",
//             error:err,
//         });
//     };
//   });

  //read api-------->>>>>>>>>>>
  app.get("/read-item", isAuthMiddleware, async (req, res) => {
    const username = req.session.user.username;
    const SKIP = parseInt(req.query.skip) || 0 ;
    console.log(SKIP);
    try {
      //it was used to find db of user without pagination
      // const todoDb = await todoModel.find({ username });
      const todoDb = await todoModel.aggregate([
        {
          $match:{username:username},
        },
        {
          $skip:SKIP,
        },
        {
          $limit:3,
        }
      ]);
   
  console.log(todoDb)
      if (todoDb.length === 0) {
        return res.send({
          status: 203,
          message: "No todo found.",
        });
      }
  
      return res.send({
        status: 200,
        message: "Read success",
        data: todoDb,
      });
    } catch (error) {
      console.log(error);
      return res.send({
        status: 500,
        message: "Internal server error",
        error: error,
      });
    }
  });

  //edit api----->>>>>>>>>>>>>>>

  app.post("/edit-item",isAuthMiddleware, async(req,res)=>{
    const newData = req.body.newData;
    const todoId = req.body.todoId;
    //username of the person who have login-->>
    const reqUserName = req.session.user.username;
    //validate the newly addeddata
    //when i am passing an array as todo in the postman server is getting crashed.
    try{
      await validateData({todo:newData});
    }
    catch(err){
      res.send({status:400,message:err});
    }
    try{
    //find database corresponding the given todoId
    const todoDb  = await todoModel.findOne({_id:todoId});
      if(!todoDb){
        return res.send({
          status:400,message:"no records found"
        })
      }
      //varify user
      if(todoDb.username !== reqUserName){
        return res.send({
          status:403,message:"update is not allowed",
        })
      }
        const updatedTodo = await todoModel.findOneAndUpdate({_id:todoId},{todo:newData});
        console.log(updatedTodo);
        res.send({
            status:200,
            message:"updated successfully",
            data:updatedTodo
        })
    }
    catch(err){
        res.status(500).json(err);
    }
  })

  ///delete api to remove the todo.A user can delete his own todos only not others

  app.post("/delete-item",isAuthMiddleware,async(req,res)=>{
    const todoId =req.body.todoId;
    const reqUserName = req.session.user.username;
    try{
      //find database corresponding the given todoId
     const todoDb = await todoModel.findOne({_id:todoId});
     if(!todoDb){
      return res.send({
        status:400,
        message:"no data found",
      })
     }
     ///varify user
     if(todoDb.username!== reqUserName){
      return res.send({
        status:403,
        message:"deletion is not allowed",
      })
     }
     const deletedData = await todoModel.findOneAndDelete({_id:todoId});
    return  res.send({
      status:200,
      message:"data deleted successfully",
      data:deletedData,
     })
     }catch(err){
      console.log(err);
      return res.send({
        status:400,
        error:err
      })
     }
  })
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})