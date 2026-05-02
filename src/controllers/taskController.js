const pool = require("../config/db");
const {validate:isUUID} = require("uuid");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

//create task 
exports.createTask = asyncHandler(async (req, res) =>{
 
    const {title,description,priority,duedate}= req.body;

    if(!title){
        throw new AppError("Title is required",400);
    }

   const result = await pool.query("Insert into tasks (user_id,title,description,priority,duedate) values ($1,$2,$3,$4,$5)",[req.user.userId,title,description,priority,duedate]);

    res.status(201).json({success : true , message : "Task Created" , task : result.rows[0] });
  }
)


//get task 
exports.getTask = asyncHandler(async (req,res) => {

    const result = await pool.query("select * from tasks where user_id = $1 ORDER BY created_at DESC",[req.user.userId]);

    res.status(200).json({success : true , Message : "Task list found", task : result.rows});
    
});


//update task 
exports.updateTask = asyncHandler(async (req,res) =>{
  
        const {id} = req.params;

        const{title,status} = req.body;

        if(!isUUID(req.params.id)){
            throw new AppError ("Invalid task id",400);
        }

        const result = await pool.query("UPDATE tasks SET title =$1,status =$2 WHERE id =$3 AND user_id = $4 RETURNING* ",[title,status,id,req.user.userId]);

        if(result.rowCount === 0){
           throw new AppError("Task not found",404);
        }

        res.status(200).json({success : true, message : "Task updated" , task : result.rows[0]});
        
});

//delete task 
exports.deleteTask =asyncHandler(async (req,res) =>{

    const {id} = req.params;

    if(!isUUID(id)){
        throw new AppError("Invalid task id",400);
    }

    const result = await pool.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING* ",[id,req.user.userId]);

    if(result.rowCount === 0){
        throw new AppError("Task not found",404);
    }

    res.status(200).json({success : true, message : "Task Deleted" , task : result.rows[0]});
    
})