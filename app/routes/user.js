const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const friendController = require('../controllers/friendController');
const appConfig = require("./../../Config/appConfig");
const routeMiddleware = require('../middlewares/routeMiddleware');
const notificationController = require('../controllers/notificationController')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}`;

    // defining routes.


    // params: firstName, lastName, email, mobileNumber, password
    app.post(`${baseUrl}/users/signup`, userController.signUpFunction);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login api for user login.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Login Successful",
            "status": 200,
            "data": {
                "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
                "userDetails": {
                "mobileNumber": 2234435524,
                "email": "someone@mail.com",
                "lastName": "Sengar",
                "firstName": "Rishabh",
                "userId": "-E9zxTYA8"
            }

        }
    */

    // params: email, password.
    app.post(`${baseUrl}/users/login`, userController.loginFunction);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/logout to logout user.
     *
     * @apiParam {string} userId userId of the user. (auth headers) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Logged Out Successfully",
            "status": 200,
            "data": null

          }
    
    */

    // auth token params: userId.
    app.post(`${baseUrl}/users/logout`, routeMiddleware.isAuthorized,userController.logout);

    


    app.post(baseUrl + '/friend/sendRequest', routeMiddleware.isAuthorized, friendController.sendRequest)
    app.post(baseUrl + '/friend/listFriendRequests', routeMiddleware.isAuthorized, friendController.listFriendRequests)
    app.post(baseUrl + '/friend/acceptRequest', routeMiddleware.isAuthorized, friendController.acceptRequest)
    app.post(baseUrl + '/friend/listFriends', routeMiddleware.isAuthorized, friendController.listFriends)
    app.post(baseUrl + '/friend/getRequestCount', routeMiddleware.isAuthorized, friendController.getRequestCount)
    app.post(baseUrl + '/notification/list', routeMiddleware.isAuthorized, notificationController.listNotification)
    app.post(baseUrl + '/notification/getCount', routeMiddleware.isAuthorized, notificationController.getNotificationCount)

}