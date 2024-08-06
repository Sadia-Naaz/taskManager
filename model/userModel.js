const mongoose  = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
     type:String,
     required:true,

    },
    email:{
     type:String,
     required:true,
     unique:true,
    },
    username:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    isEmailValid:{
        type:Boolean,
        default:false,
        required:true,
    }
})

const userModel = new mongoose.model("user",userSchema);
module.exports = userModel;