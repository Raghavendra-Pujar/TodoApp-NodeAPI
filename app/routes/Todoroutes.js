const express = require('express');
const appConfig = require('../../Config/appConfig');
const TodoList = require('../controllers/TodoList');
const TodoItems = require('../controllers/TodoItems');
const routeMiddleware = require('../middlewares/routeMiddleware');
const friendController = require('../controllers/friendController');

const setRouter = (app)=>{
    TodoList
    let baseUrl = `${appConfig.apiVersion}/todo`;

    app.post(`${baseUrl}/createList`,routeMiddleware.isAuthorized,TodoList.addList);
    /**
     * @apiGroup create
     * @apiVersion  1.0.0
     * @api {post} /api/v1/todo/createList api for user login.
     *
     * @apiParam {string} authToken Auth token provided when the user logs in {required}
     * @apiParam {string} title Title of the List (body params) (required)
     * @apiParam {string} description Descrption of the List (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            {
            "error": false,
            "message": "Todo created successfully",
            "status": 200,
            "data": {
                "completed": false,
                "id": "ee68d1",
                "description": "A todo application task list",
                "title": "Make application"
        },
            "timestamp": 1538403502923
            }   

        }
    */

    app.post(`${baseUrl}/listAll`,routeMiddleware.isAuthorized,TodoList.listAll);
    app.post(`${baseUrl}/createItem`,routeMiddleware.isAuthorized,TodoItems.addTodoItemToTheList);
    app.post(`${baseUrl}/listItems`,routeMiddleware.isAuthorized,TodoItems.listTodoItemsByList);
    app.post(`${baseUrl}/markListDone`,routeMiddleware.isAuthorized,TodoList.markListComplete)
    app.post(`${baseUrl}/markListNotDone`,routeMiddleware.isAuthorized,TodoList.markListIncomplete)
   // app.post(`${baseUrl} + /friend/sendRequest`, routeMiddleware.isAuthorized, friendController.sendRequest)
    app.post(`${baseUrl}/listToDoItem`,routeMiddleware.isAuthorized,TodoItems.listTodoItemsByList)
    app.post(`${baseUrl}/closeItem`,routeMiddleware.isAuthorized,TodoItems.markItemAsDone);
    app.post(`${baseUrl}/openItem`,routeMiddleware.isAuthorized,TodoItems.markItemInComplete);
    app.post(`${baseUrl}/markItemDeleted`,routeMiddleware.isAuthorized,TodoItems.markItemDeleted)
}

module.exports = {
    setRouter : setRouter
}