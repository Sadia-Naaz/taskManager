const validateData=({todo})=>{
return new Promise((res,rej)=>{
    if(!todo){
        rej("No todo found")
    }
    if(todo.length<3 || todo.length>50){
        rej("Todo must be between 3 and 50 characters")
    }
    if(typeof todo !== "string"){
        rej("todo is not type text");
    }
    res();
}
)
}
module.exports = validateData;