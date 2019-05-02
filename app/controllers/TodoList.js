const express = require('express');
const mongoose = require('mongoose');
const TodoListModel = mongoose.model('TodoListModel');
const TodoItemsModel = mongoose.model('TodoItemsModel');
const FriendModel = mongoose.model('Friend');
const NotificationModel = mongoose.model('Notification');
const shortid = require('shortid');
const notificationController = require('../controllers/notificationController')

const logger = require('../libs/loggerLib');
const response = require('../libs/responseLib');
const check = require('../libs/checkLib');
const time = require('../libs/timeLib');

let addList = (req,res) =>{




    if(req.body.title){
        TodoListModel.findOne({title : req.body.title}).exec((err,ToDoItemDetails) => {
            if(err){
                logger.info('Failed to add Todo Item','TodoSingleUser.addTodoItem',10);
                console.log(err);
                let apiResponse = response.generate(true,'Failed to add Todo Item',500,null);
                res.send(apiResponse);
            }else if(check.isEmpty(ToDoItemDetails)){
                let newTodoItem = new TodoListModel({
                id : shortid.generate(),
                userId : req.user.userId, 
                title : req.body.title,
                description : req.body.description,
                created : time.now()
                })

                newTodoItem.save((err, newTodoItem)=>{
                    if(err){
                        console.log(err);
                        logger.error('Failed to add new Todo Item','TodoSingleUser.addTodoItem',10);
                        let apiResponse = response.generate(true,'Failed to create new Todo Item',500,null);
                        res.send(apiResponse);
                        
                    }else{
                        let newTodoItemObj = newTodoItem.toObject();
                        let apiResponse = response.generate(false,'Todo Item added successfully',200,newTodoItemObj);
                        res.send(apiResponse);


                        notificationController.sendNotification({
                            userId: req.user.userId,
                            senderId: req.user.userId,
                            title: "New Todo",
                            message: `Your friend ${req.user.firstName} created a new todo.`,
                            notificationType: 'todo-create',
                            targetId: todo.todoId,
                            todo: result,
                            eventName: 'todo-notification'
            
                        })
            
                    }
                })

            }else{
                logger.error('Task Alrady Present','TodoSingleUser.addTodoItem',10);
                 let apiResponse = response.generate(true,'Task Already Present',500,null);
                 res.send(apiResponse);
            }

        })
    }
}

let listAll = (req,res) =>{


    if (req.body.userId === "undefined") {
        req.body.userId = req.user.userId

        console.log("Identified as", req.body.userId)
    } //if no user id is provided then return the calling user's list

    if (!req.body.page || req.body.page == 0 || req.body.page < 0) req.body.page = 0
    else req.body.page -= 1
    

   // if(typeof req.body.userId == 'undefined') {req.body.userId = req.user.userId;}

    if (!req.body.timestamp) req.body.timestamp = Date.now();

    let verifyFriendship = () =>{
        return new Promise((resolve,reject)=>{
          
            if(req.body.userId == req.user.userId) resolve()
          
                FriendModel.findOne({userId : req.user.userId,friendId : req.body.userId}).exec((err,result)=>{
                    if (err) {
                        logger.info('Failed to list Todo Items', 'TodoSingleUser.listAll', 10);
                        let apiResponse = response.generate(true, 'Failed to list Todo Items', 500, null);
                        reject(apiResponse);
                    }else if(result){
                        resolve()
                        console.log(result)
                    }else{
                        let apiResponse = response.generate(true,"User is not your friend",403,null);
                        reject(apiResponse);
                    }
                })
            })
    
    }
    let findList = () =>{
        return new Promise((resolve,reject)=>{
    TodoListModel.find({ userId: req.body.userId, delete : false }).exec((err,todoLists)=>{
        if(err){
            logger.info('Failed to list Todo Items','TodoSingleUser.listAll',10);
            let apiResponse = response.generate(true,'Failed to list Todo Items',500,null);
            reject(apiResponse);
        }else if(check.isEmpty(todoLists)){
            logger.info('No Items to show','TodoSingleUser.listAll',10);
            let apiResponse = response.generate(true,'No Items to show',404,null);
            reject(apiResponse);
        }
        else{
            let apiResponse = response.generate(false,'List of Todo Items',200,todoLists);
            resolve(apiResponse);
        }
    })
})

}

verifyFriendship(req,res)
.then(findList).then((resolve)=>{
    console.log(resolve)
    res.send(resolve)
}).catch((err)=>{
    res.send(err)
})

}


let markListComplete = function (req,res) {

    let verifyUserInput = function () {
        return new Promise((resolve, reject) => {
            if (!req.body.listId) {
                let apiResponse = response.generate(true, 'Missing List id.', 403, null)
                reject(apiResponse)
            } else {
                console.log("Input exists")
                resolve()
            }
        })
    }
    let verifyListExists = function () {
        console.log("Entered List exists")
        return new Promise((resolve, reject) => {
            TodoListModel.findOne({ id: req.body.listId })
                .lean()
                .exec((err, result) => {
                    if (err) {
                        console.log(err.message);
                        logger.error(err.message, 'Todo Controller: verifyToDoExists', 5)
                        let apiResponse = response.generate(true, 'Internal server error', 500, null)
                        reject(apiResponse)
                    } else if (result) {
                        console.log("List found")
                        if (result.delete) {
                            let apiResponse = response.generate(true, 'Cannot updated deleted List.', 403, null)
                            reject(apiResponse)
                        } else if (result.Done) {
                            let apiResponse = response.generate(true, 'List already marked as completed.', 403, null)
                            reject(apiResponse)
                        } 
                        else { 
                        console.log("List exists");
                        resolve()
                    }
                    } else {
                        let apiResponse = response.generate(true, 'No such List found.', 404, null)
                        reject(apiResponse)
                    }
                })
        })
    }

    let verifyOpenItems = function () {
        return new Promise((resolve, reject) => {

            TodoItemsModel.aggregate([
                {
                    $sort: {
                        lastModifiedOn: 1
                    }
                },
               {
                    $match: { listId: req.body.listId,delete: false, Done: false } // Get those items which are neither completed or deleted
                }
            ]).exec((err, result) => {
                console.log(result)
                if (err) {
                    logger.error(err.message, 'Todo Controller: verifyOpenItems', 5)
                    let apiResponse = response.generate(true, 'Internal server error.', 500, null)
                    reject(apiResponse)
                }
                else if (result && result.length > 0) {
                        let apiResponse = response.generate(true, `This todo still has ${result.length} open items. Close or delete all items before closing the todo.`, 403, null)
                        reject(apiResponse)
                    } else resolve()
                
            })
        })
    }


    let markList = () =>{
    TodoListModel.updateOne({ id: req.body.listId, Done: false }, { Done: true }).exec((err, result) => {
        if (err) {
            console.log(err)
            let apiResponse = response.generate(true, 'Internal server error.', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
               let apiResponse = response.generate(true, 'List is already marked Done. Failed to update.', 200, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'List marked as Done', 200, { userId: req.user.userId, listId: req.body.listId, Done: true })
                res.send(apiResponse)
            }
        
    })
}

verifyUserInput(req,res)
.then(verifyListExists)
.then(verifyOpenItems)
.then(markList)
.catch((apiResponse)=>{
res.send(apiResponse)
})

}

let markListIncomplete = (req,res)=>{
    let verifyUserInput =  () =>{
        return new Promise((resolve, reject) => {
            if (!req.body.listId) {
                let apiResponse = response.generate(true, 'Missing list id.', 403, null)
                reject(apiResponse)
            } else {
                resolve()
            }
        })
    }

    let markIncomplete = () =>{
        return new Promise ((resolve,reject)=>{
            TodoListModel.updateOne({id: req.body.listId},{Done : false}).exec((err,result)=>{
                if(err){
                    logger.error('Server error','TodoList.markIncomplete',5);
                    let apiResponse = response.generate(true,'Internal Server error',400,null);
                    reject(apiResponse);
                }else if(check.isEmpty(result)){
                    let apiResponse = response.generate(true,'List marked incomplete already or you are not authenticated');
                    reject(apiResponse);
                }else{
                    let apiResponse = response.generate(false,'List marked as incomplete',200,result);
                    resolve(apiResponse);
                }
            })
        })
    }

        verifyUserInput(req,res)
        .then(markIncomplete).then((resolve)=>{
            res.send(resolve)
    }).catch((err)=>{
        res.send(err);
    })
    
}
 


module.exports = {
    addList : addList,
    listAll : listAll,
    markListComplete : markListComplete,
    markListIncomplete : markListIncomplete
}
