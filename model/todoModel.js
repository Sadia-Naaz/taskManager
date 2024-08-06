const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const todoSchema  = new Schema({
    todo:{
        type:String,
        minLength:3,
        maxLength:100,
        require:true,
        trim:true,
    },
    username:{
        type:String,
        require:true,
    },
})
module.exports = mongoose.model("todoModel",todoSchema);