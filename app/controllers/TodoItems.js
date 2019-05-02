const mongoose = require('mongoose');
const TodoItemsModel = mongoose.model('TodoItemsModel')
const TodoListModel = mongoose.model('TodoListModel')
const shortid = require('shortid');
const notificationController = require('../controllers/notificationController');
const FriendModel = mongoose.model('Friend')

const logger = require('../libs/loggerLib');
const response = require('../libs/responseLib');
const check = require('../libs/checkLib');
const time = require('../libs/timeLib');

let addTodoItemToTheList = (req,res) =>{

    let verifyListExists = () =>{
        return new Promise((resolve,reject)=>{
        if(req.body.listId){
            TodoListModel.findOne({id : req.body.listId}).exec((err,result) =>{
                if(err){
                    let apiResponse = response.generate(true,'Internal Server error',500,null);
                    reject(apiResponse);
                }else if(check.isEmpty(result)){
                    let apiResponse = response.generate(true,'List does not exist',404,null);
                    reject(apiResponse);
                }else if(result.Done){
                    let apiResponse = response.generate(true,'List is already Done',400,null);
                    reject(apiResponse);
                }else if(result.delete){
                    let apiResponse = response.generate(true,'List doesnot exists or deleted already',404,null);
                    reject(apiResponse)
                }else{
                    resolve(req);
                }
            })
        
        }
    })

}


    let parentExists = () =>{
        return new Promise((resolve,reject)=>{
            console.log(req.body.parentTodoId)
            if(req.body.parentTodoId === "undefined") {resolve(req)}
            if(req.body.parentTodoId){
                TodoItemsModel.findOne({todoId : req.body.parentTodoId}).exec((err,result)=>{
                    if(err){
                        let apiResponse = response.generate(true,'Internal server error',500,null);
                        reject(apiResponse);
                    }else if(check.isEmpty(result)){
                        let apiResponse = response.generate(true,'Specified parent item is missing',404,null);
                        reject(apiResponse);
                    }else if(result.Done){
                        let apiResponse = response.generate(true,'Parent Item is already Done',400,null);
                        reject(apiResponse);
                    }else if(result.delete){
                        let apiResponse = response.generate(true,'Specified Parent Item doesnot exists or deleted already',404,null);
                        reject(apiResponse)
                    }else{
                        resolve(req)
                    }
                })
            }else{
                resolve(req)
            }
        })
    }


    let verifyItemAlreadyExists = () =>{
        return new Promise ((resolve,reject)=>{
            TodoItemsModel.findOne({listId : req.body.listId,parentTodoId : req.body.parentToDoId,title : req.body.title}).exec((err,result)=>{
                if(err){
                    let apiResponse = response.generate(true,'Internal Server error',500,null);
                    reject(apiResponse);
                }else if(check.isEmpty(result)){
                    resolve(req);
                }else{
                    console.log('Item exists')
                    let apiResponse = response.generate(true,'Item with this title already exists in this List',500,null)
                    reject(apiResponse);
                }
            })
        })
    }
  
    let verifyPermission = () =>{
        return new Promise((resolve,reject)=>{
            TodoListModel.findOne({id : req.body.listId}).exec((err,result)=>{
                if(err){
                    let apiResponse = response.generate(true,'Internal Server error',500,null);
                    reject(apiResponse);
                }
                else{
                    if(req.userId !== result.userId){
                        let apiResponse = response.generate(true,'You are not allowed to add items  others list',500,null);
                    reject(apiResponse);
                    }
                    else{
                       resolve()
                    }
                }
            })
        })
    }



    verifyListExists(req,res)
    .then(parentExists)
    .then(verifyItemAlreadyExists)
    .then(verifyPermission)
    .then((resolve)=>{
        let TodoItems = new TodoItemsModel({
            userId : req.user.userId,
            todoId : shortid.generate(),
            listId : req.body.listId,
            parentTodoId : req.body.parentTodoId,
            title : req.body.title,
            description : req.body.description

        })
        TodoItems.save((err,result)=>{
            if(err){
                let apiResponse = response.generate(true,'Internal Server error',500,null);
                    res.send(apiResponse);
            }else{
                let apiResponse = response.generate(false,'Item added successfully',200,result)
                res.send(apiResponse);
            }
        })
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
}


let listTodoItemsByList = (req,res) =>{
    console.log("enter API")
    console.log(req.body.listId)
  

    let verifyListExists = () =>{
        return new Promise((resolve,reject)=>{
        if(req.body.listId){
            TodoListModel.findOne({id : req.body.listId}).exec((err,result) =>{
                if(err){
                    let apiResponse = response.generate(true,'Internal Server error',500,null);
                    reject(apiResponse);
                }else if(check.isEmpty(result)){
                    let apiResponse = response.generate(true,'List does not exist',404,null);
                    reject(apiResponse);
                }else if(result.Done){
                    let apiResponse = response.generate(true,'List is already Done',400,null);
                    reject(apiResponse);
                }else if(result.delete){
                    let apiResponse = response.generate(true,'List doesnot exists or deleted already',404,null);
                    reject(apiResponse)
                }else{
                    console.log("List exists")
                    req.listTitle = result.title;
                    req.body.userId = result.userId;
                    console.log(req.listTitle)
                    resolve(req);
                }
            })
        
        }
    })
}


let listByParent = () =>{
    console.log(req.body.parentTodoId)
    if (req.body.parentTodoId === '') {
        return new Promise((resolve, reject) => {
            TodoListModel.findOne({ id: req.body.listId })
                .select('-_id -__v -lastModifiedOn')
                .lean()
                .exec((err, result) => {
                    if (err) {
                        logger.error(err.message, 'Todo Controller: verifyToDoExists', 5)
                        let apiResponse = response.generate(true, 'Internarl server error', 500, null)
                        reject(apiResponse)
                    } else if (result) {
                        _todo = result
                        resolve(result)
                    }
                })
        })

    } else {
        return new Promise((resolve, reject) => {
            ToDoItemsModel.findOne({ listId: req.body.listId, id: req.body.parentTodoId })
                .sort('-updatedOn')
                .select('-_id -__v -lastModifiedOn -changeMessage')
                .lean()
                .exec((err, result) => {
                    if (err) {
                        logger.error(err.message, 'Todo Controller: verifyToDoExists', 5)
                        let apiResponse = response.generate(true, 'Internarl server error', 500, null)
                        reject(apiResponse)
                    } else if (result) {
                        if (result.deleted) {
                            let apiResponse = response.generate(true, 'Cannot query deleted items.', 403, null)
                            reject(apiResponse)
                        } else {
                            _todo = result
                            resolve(result)
                        }
                    } else {
                        let apiResponse = response.generate(true, 'No such todo item found.', 404, null)
                        reject(apiResponse)
                    }
                })
        })

    }
}

let listById = () =>{
    return new Promise((resolve,reject) =>{
        TodoItemsModel.find({listId : req.body.listId}).exec((err,result)=>{
            if(err){
                let apiResponse = response.generate(true,'Internal Server error',500,null);
                reject(apiResponse);
            }else if(check.isEmpty(result)){
                let apiResponse = response.generate(true,'No items added to the List',404,null);
                reject(apiResponse);
            }else{
                console.log(result);
                result.listTitle = req.listTitle;
                console.log(result)
                resolve(result)
            }
        })
    })
}

let verifyPermission = function (result) {
    return new Promise((resolve, reject) => {
        console.log(req.user.userId);
        console.log(req.body.userId)
        if (req.user.userId === req.body.userId) resolve()
        FriendModel.findOne({ userId: req.user.userId, friendId: req.body.userId }).lean().exec((err, result) => {
            if (err) {
                logger.error(err.message, 'Todo Controller: verifyPermission', 5)
                let apiResponse = response.generate(true, 'Internarl server error', 500, null)
                reject(apiResponse)
            } else if (result) {
                resolve()
            } else {
                let apiResponse = response.generate(true, 'You are not friend of the owner of this todo.', 403, null)
                reject(apiResponse)
            }
        })
    })
}
verifyListExists(req,res)
//.then(listByParent)
.then(verifyPermission)
.then(listById)
.then((resolve)=>{
    let apiResponse = response .generate(false,'Items of the List',200,resolve);
    res.send(apiResponse);
}).catch((err)=>{
    res.send(err);
})

}

let markItemAsDone =(req,res) =>{

    let verifyUserInput = function () {
        return new Promise((resolve, reject) => {
            if (!req.body.listId) {
                let apiResponse = response.generate(true, ' Missing List id.', 403, null)
                reject(apiResponse)
            } else if (!req.body.todoId) {
                let apiResponse = response.generate(true, 'Missing todoItem id.', 403, null)
                reject(apiResponse)
            }
            else {
                resolve()
            }
        })
    }


    let verifyToDoItemExists = function () {
        return new Promise((resolve, reject) => {
            TodoItemsModel.findOne({ listId: req.body.listId, todoId: req.body.todoId })
                .select('-_id -__v -lastModifiedOn')
                .sort('-lastModifiedOn')
                .lean()
                .exec((err, result) => {
                    if (err) {
                        logger.error(err.message, 'Todo Controller: verifyToDoExists', 5)
                        let apiResponse = response.generate(true, 'Internarl server error', 500, null)
                        reject(apiResponse)
                    } else if (result) {
                        if (result.delete) {
                            let apiResponse = response.generate(true, 'Cannot updated deleted todo item.', 403, null)
                            reject(apiResponse)
                        } else if (result.Done) {
                            let apiResponse = response.generate(true, 'Item is already marked Done.', 403, null)
                            reject(apiResponse)
                        } else resolve(result)
                    } else {
                        let apiResponse = response.generate(true, 'No such item found.', 404, null)
                        reject(apiResponse)
                    }
                })
        })
    }

    let verifyPermission = function (todo) {
        return new Promise((resolve, reject) => {
            console.log('verify permission')
            console.log(todo.userId)
            console.log(req.user.userId)
            if (req.user.userId == todo.userId) resolve(todo)
            FriendModel.findOne({ userId: req.user.userId, friendId: todo.userId }).lean().exec((err, result) => {
                if (err) {
                    logger.error(err.message, 'Todo Controller: verifyPermission', 5)
                    let apiResponse = response.generate(true, 'Internarl server error', 500, null)
                    reject(apiResponse)
                } else if (result) {
                    console.log("permission granted")
                    resolve(todo)
                } else {
                    console.log("Not friend")
                    let apiResponse = response.generate(true, 'You are not friend of the owner of this todo.', 403, null)
                    reject(apiResponse)
                }
            })
        })
    }

    let verifyOpenItems = function (todo) {
        return new Promise((resolve, reject) => {
            console.log('verify open items')
            TodoItemsModel.aggregate([
                {
                    $sort: {
                        lastModifiedOn: 1
                    }
                },
               {
                    $match: { parentTodoId: req.body.todoId, listId: req.body.listId, delete: false, Done: false } // Get those items which are neither Done or deleted
                }
            ]).exec((err, result) => {
                if (err) {
                    logger.error(err.message, 'Todo Controller: verifyOpenItems', 5)
                    let apiResponse = response.generate(true, 'Internal server error.', 500, null)
                    reject(apiResponse)
                }
                else {

                    if (result && result.length > 0) {
                        let apiResponse = response.generate(true, `This todo still has ${result.length} open items. Close or delete all items before closing the todo.`, 403, null)
                        reject(apiResponse)
                    } else resolve(todo)
                }
            })
        })
    }

    let markComplete = function (todo) {
        console.log("entered mark complete")


        //todo.Done = true
        //let Message = `${req.user.firstName} has marked the todo item ${req.todo.todoId} from todo ${req.todo.listId} as complete.`
        //let todoItem = new TodoItemsModel(todo)

        console.log("entered mark complete")

        TodoItemsModel.updateOne({todoId : req.body.todoId,Done: false },{Done : true}).exec((err,result)=>{
            if (err) {
                console.log(err)
                let apiResponse = response.generate(true, 'Internal server error.', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                   let apiResponse = response.generate(true, 'Item is already marked Done. Failed to update.', 200, null)
                    res.send(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'Item marked as Done', 200, result)
                    console.log(apiResponse)
                    res.send(apiResponse)
                }
    





                //send notification to all users

                notificationController.sendNotification({
                    userId: todo.userId,
                    senderId: req.user.userId,
                    title: "Todo item updated",
                    message: `${req.user.firstName} has marked the todo item ${req.body.todoId} from todo ${req.body.listId} as complete.`,
                    notificationType: 'todo-update-item',
                    targetId: result.listId,
                    todo: result,
                    eventName: 'todo-notification'

                })
            })

            }

    
    

    verifyUserInput().then(verifyToDoItemExists).then(verifyPermission).then(verifyOpenItems).then(markComplete).catch(apiResponse => { res.send(apiResponse) })
    
}


let markItemInComplete = function (req, res) {

    let verifyUserInput = function () {
        return new Promise((resolve, reject) => {
            if (!req.body.listId) {
                let apiResponse = response.generate(true, 'Invalid input to api. Missing todo id.', 403, null)
                reject(apiResponse)
            } else if (!req.body.todoId) {
                let apiResponse = response.generate(true, 'Invalid input to api. Missing todo item id.', 403, null)
                reject(apiResponse)
            }
            else {
                resolve()
            }
        })
    }


    let verifyToDoItemExists = function () {
        return new Promise((resolve, reject) => {
            TodoItemsModel.findOne({ listId: req.body.listId, todoId: req.body.todoId })
                .select('-_id -__v -lastModifiedOn')
                .sort('-lastModifiedOn')
                .lean()
                .exec((err, result) => {
                    if (err) {
                        logger.error(err.message, 'Todo Controller: verifyToDoExists', 5)
                        let apiResponse = response.generate(true, 'Internarl server error', 500, null)
                        reject(apiResponse)
                    } else if (result) {
                        if (result.delete) {
                            let apiResponse = response.generate(true, 'Cannot updated deleted todo item.', 403, null)
                            reject(apiResponse)
                        } else if (!result.Done) {
                            let apiResponse = response.generate(true, 'Item is already marked  not Done.', 403, null)
                            reject(apiResponse)
                        } else resolve(result)
                    } else {
                        let apiResponse = response.generate(true, 'No such todo item found.', 404, null)
                        reject(apiResponse)
                    }
                })
        })
    }

    let verifyPermission = function (todo) {
        return new Promise((resolve, reject) => {
            console.log('verify permission')
            if (req.user.userId == todo.userId) resolve(todo)
            FriendModel.findOne({ userId: req.user.userId, friendId: todo.userId }).lean().exec((err, result) => {
                if (err) {
                    logger.error(err.message, 'Todo Controller: verifyPermission', 5)
                    let apiResponse = response.generate(true, 'Internarl server error', 500, null)
                    reject(apiResponse)
                } else if (result) {
                    resolve(todo)
                } else {
                    let apiResponse = response.generate(true, 'You are not friend of the owner of this todo.', 403, null)
                    reject(apiResponse)
                }
            })
        })
    }


    let markInComplete = function (todo) {

       



                TodoItemsModel.updateOne({todoId : req.body.todoId,Done: true },{Done : false}).exec((err,result)=>{
                    if (err) {
                        console.log(err)
                        let apiResponse = response.generate(true, 'Internal server error.', 500, null)
                        res.send(apiResponse)
                    } else if (check.isEmpty(result)) {
                           let apiResponse = response.generate(true, 'Item is already marked not Done. Failed to update.', 200, null)
                            res.send(apiResponse)
                        } else {
                            let apiResponse = response.generate(false, 'Item marked as Not Done', 200, result)
                            console.log(apiResponse)
                            res.send(apiResponse)
                        

                notificationController.sendNotification({
                    userId: todo.userId,
                    senderId: req.user.userId,
                    title: "Todo item updated",
                    message: `${req.user.firstName} marked the todo item ${req.body.todoId} from todo ${req.body.listId} as incomplete.`,
                    notificationType: 'todo-update-item',
                    targetId: result.listId,
                    todo: result,
                    eventName: 'todo-notification'

                })
            }

            })
        }
    

    verifyUserInput().then(verifyToDoItemExists).then(verifyPermission).then(markInComplete).catch(apiResponse => { res.send(apiResponse) })
}

let renameItem = function (req, res) {

    let verifyUserInput = function () {
        return new Promise((resolve, reject) => {
            if (!req.body.listId) {
                let apiResponse = response.generate(true, 'Invalid input to api. Missing todo id.', 403, null)
                reject(apiResponse)
            } else if (!req.body.todoId) {
                let apiResponse = response.generate(true, 'Invalid input to api. Missing todo item id.', 403, null)
                reject(apiResponse)
            } else if (!req.body.title || req.body.title.trim() == '') {
                let apiResponse = response.generate(true, 'Invalid input to api. Missing new item title.', 403, null)
                reject(apiResponse)
            }
            else {
                resolve()
            }
        })
    }


    let verifyToDoItemExists = function () {
        return new Promise((resolve, reject) => {
            TodoItemsModel.findOne({ listId: req.body.listId, id: req.body.todoId })
                .select('-_id -__v -lastModifiedOn')
                .sort('-lastModifiedOn')
                .lean()
                .exec((err, result) => {
                    if (err) {
                        logger.error(err.message, 'Todo Controller: verifyToDoExists', 5)
                        let apiResponse = response.generate(true, 'Internarl server error', 500, null)
                        reject(apiResponse)
                    } else if (result) {
                        if (result.delete) {
                            let apiResponse = response.generate(true, 'Cannot updated deleted todo item.', 403, null)
                            reject(apiResponse)
                        } else resolve(result)
                    } else {
                        let apiResponse = response.generate(true, 'No such todo item found.', 404, null)
                        reject(apiResponse)
                    }
                })
        })
    }

    let verifyPermission = function (todo) {
        return new Promise((resolve, reject) => {
            console.log('verify permission')
            if (req.user.userId == todo.userId) resolve(todo)
            FriendModel.findOne({ userId: req.user.userId, friendId: todo.userId }).lean().exec((err, result) => {
                if (err) {
                    logger.error(err.message, 'Todo Controller: verifyPermission', 5)
                    let apiResponse = response.generate(true, 'Internarl server error', 500, null)
                    reject(apiResponse)
                } else if (result) {
                    resolve(todo)
                } else {
                    let apiResponse = response.generate(true, 'You are not friend of the owner of this todo.', 403, null)
                    reject(apiResponse)
                }
            })
        })
    }


    let rename = function (todo) {
        todo.title = req.body.title
        todo.changeMessage = `${req.user.firstName} renamed the todo item ${req.body.todoId} from todo ${req.body.todoId} to ${todo.title}.`
        let todoItem = new TodoItemsModel(todo)

        todoItem.save((err, result) => {

            if (err) {
                let apiResponse
                logger.error(err.message, 'Todo Controller: saveItem', 5)
                if (err.name = "ValidationError") {
                    apiResponse = response.generate(true, err.message, 403, null)
                } else {
                    apiResponse = response.generate(true, "Internal server error.", 500, null)
                }
                res.send(apiResponse)
            } else {
                result = result.toObject()
                delete result._id
                delete result.__v
                delete result.lastModifiedOn
                delete result.userId
                delete result.changeMessage
                let apiResponse = response.generate(false, 'Todo item updated successfully', 200, result)
                res.send(apiResponse)

                //send notification to all users

                notificationController.sendNotification({
                    userId: todo.userId,
                    senderId: req.user.userId,
                    title: "Todo item updated",
                    message: todo.changeMessage,
                    notificationType: 'todo-update-item',
                    targetId: result.listId,
                    todo: result,
                    eventName: 'todo-notification'

                })

            }

        })
    }

    verifyUserInput().then(verifyToDoItemExists).then(verifyPermission).then(rename).catch(apiResponse => { res.send(apiResponse) })
}



let markItemDeleted = function (req, res) {

    let verifyUserInput = function () {
        return new Promise((resolve, reject) => {
            if (!req.body.listId && !req.body.todoId) {
                let apiResponse = response.generate(true, 'Invalid input to api. Missing todo id or target item id.', 403, null)
                reject(apiResponse)
            } else {
                resolve()
            }
        })
    }

    let verifyToDoItemExists = function () {
        return new Promise((resolve, reject) => {
            ToDoItemsModel.findOne({ todoId: req.body.todoId, listId: req.body.listId }).lean().sort('-updatedOn').select('-_id -__v -updatedOn').exec((err, result) => {
                if (err) {
                    let apiResponse = response.generate(true, 'Internal server error.', 500, null)
                    reject(apiResponse)
                } else if (result) {
                    if (result.deleted) {
                        let apiResponse = response.generate(true, 'Item already deleted.', 403, null)
                        reject(apiResponse)
                    } else resolve(result)
                } else {
                    let apiResponse = response.generate(true, 'No such todo item exists.', 404, null)
                    reject(apiResponse)
                }

            })
        })
    }

    let verifyPermission = function (todo) {

        return new Promise((resolve, reject) => {
            if (todo.userId == req.user.userId) resolve(todo)

            FriendModel.findOne({ userId: todo.userId, friendId: req.user.userId })
                .lean()
                .exec((err, result) => {
                    if (err) {
                        let apiResponse = response.generate(true, 'Internal server error.', 500, null)
                        reject(apiResponse)
                    } else if (result) {
                        resolve(todo)
                    } else {
                        let apiResponse = response.generate(true, 'Only the owner and his friends can update todo items.', 403, null)
                        reject(apiResponse)
                    }
                })
        })
    }

    let saveItem = function (todo) {

        todo.deleted = true
        todo.changeMessage = `${req.user.firstName} deleted the todo item ${req.body.itemId} from todo ${req.body.todoId}`
        let todoItem = new ToDoItemModel(todo)

        todoItem.save((err, result) => {

            if (err) {
                let apiResponse
                logger.error(err.message, 'Todo Controller: saveItem', 5)
                if (err.name = "ValidationError") {
                    apiResponse = response.generate(true, err.message, 403, null)
                } else {
                    apiResponse = response.generate(true, "Internal server error.", 500, null)
                }
                res.send(apiResponse)
            } else {
                result = result.toObject()
                delete result._id
                delete result.__v
                delete result.updatedOn
                delete result.userId
                delete result.changeMessage
                let apiResponse = response.generate(false, 'Todo item updated successfully', 200, result)
                res.send(apiResponse)


                notificationController.sendNotification({
                    userId: todo.userId,
                    senderId: req.user.userId,
                    title: "Todo item updated",
                    message: todo.changeMessage,
                    notificationType: 'todo-update-item',
                    targetId: result.todoId,
                    todo: result,
                    eventName: 'todo-notification'

                })
            }

        })

    }

    verifyUserInput()
        .then(verifyToDoItemExists)
        .then(verifyPermission)
        .then(saveItem)
        .catch((apiResponse) => {
            res.send(apiResponse)
        })


}



module.exports = {
    addTodoItemToTheList : addTodoItemToTheList,
    listTodoItemsByList : listTodoItemsByList,
    markItemAsDone : markItemAsDone,
    markItemInComplete : markItemInComplete,
    markItemDeleted : markItemDeleted

}