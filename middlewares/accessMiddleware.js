const accessModel = require("../model/accessModel");

const accessMiddleware=async(req,res,next)=>{
    //getting the session id 
const sid = req.session.id;
try{
// is this session  id exist in our db?
const accessDb  = await accessModel.findOne({sessionId:sid});

//if does't exist create an object and store inside the db
//it means user is sending the request for the first time

if(!accessDb){
const accessObj = new accessModel({
    sessionId:sid,
    lastReqTime:Date.now(),
})
accessObj.save();
//now user can perform action by calling the controller;
next();
}
//let'say sid exists already in the db i.e request has been made previously
//now check the diffrence in time between the last request and the current request

// const diff = (Date.now()-accessDb.lastReqTime)/(1000*60) is not working////////////////////////////////////////////

const diff = (Date.now()-accessDb.lastReqTime);
console.log(diff);
//check if difference is less than a fixed time (user  is making a request before a fixed time)
//don't allow 
if(diff < 1000 ){
    alert("not allowed within a minute")
  return  res.send({
        status:400,message:"too many requests",
    })
}
//if the user already exists and request time is greater than differnce than allow user
next(); 
}
catch(err){
    console.log(err);
    res.send({
        status:500,message:"internal db error",Err:err,
    })
}

}
module.exports = accessMiddleware;