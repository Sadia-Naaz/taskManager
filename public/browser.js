let skip = 0;
//initially skip 0 elements
window.onload = genrateTodo();
//as soon as loading todos

function genrateTodo(){
    axios
    .get(`/read-item?skip=${skip}`)//sending request with skip value 0 
    .then((res)=>{
        if(res.data.status !== 200){
            alert(res.data.message);
            return;
        }
        const todos  = res.data.data;
        //increase the skip value as data loads
        skip += todos.length;
        console.log(skip);
    // genrate todos dynamically
   
            console.log("entered in if block");
            document.getElementById("item_list").insertAdjacentHTML(
        "beforeend",
        todos
          .map((item) => {
            return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
      <span class="item-text">${item.todo}</span>
      <div>
      <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
      <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
      </div></li>`;
          })
          .join("")
      );
    }
  
    )
    .catch((Err)=>console.log(Err));
}

//writing logic for edit and delete functionalites---->>>>>>

document.addEventListener("click",function(event){
 
    if(event.target.classList.contains("edit-me")){
        console.log("edit btn is clicked");
        const todoId =event.target.getAttribute("data-id");//because data-id is the custom attribute;
        const newData = prompt("enter new todo");
        console.log(newData);
        axios.post("/edit-item", { todoId,newData })
        .then((res)=>{
            if(res.status !==200){
                alert(res.data.message);
            }
           
const textElement =  event.target.parentElement.previousElementSibling;
if(textElement){
    textElement.innerHTML = newData;
}
    }).catch((err)=>console.log(err));
    }
else if(event.target.classList.contains("delete-me")){
        console.log("delete btn is clicked");
        const todoId = event.target.getAttribute("data-id");
        console.log(todoId);
        axios.post("/delete-item",{todoId})
        .then((res)=>{
            if(res.data.status!==200){
                alert(res.data.message);
                return;
            }
            event.target.parentElement.parentElement.remove();
        })
        .catch((err)=>console.log(err));
        //calling create-item api.
    }
    else if(event.target.classList.contains("add_item")){
        const todo = document.getElementById("create-todo").value;
        console.log(todo);
        axios.post("/create-item",{todo})
        .then((res)=>{
            if(res.data.status !==201){
                alert(res.data.message);
                return;
            }
            //empty the input box after clicking on add button
            document.getElementById("create-todo").value = "";
        //now getting the <li> element from client and inserting newly created todo at the bottom of todo list.
        document.getElementById("item_list").insertAdjacentHTML("beforeend",`<li class="todo-card">
            <span class="item-text">${res.data.data.todo}</span>
            <div>
            <button class="edit-me" data-id="${res.data.data.id}">Edit</button>
            <button class="delete-me" data-id="${res.data.data.id}">Delete</button>
            </div>
            </li>`)

        }).catch((err)=>console.log(err));
    }
    else if(event.target.classList.contains("show_more")){
        genrateTodo();
    }


 
})
