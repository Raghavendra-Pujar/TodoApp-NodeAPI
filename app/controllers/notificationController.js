const mongoose = require('mongoose')
const logger = require('./../libs/loggerLib')
const response = require('./../libs/responseLib')
const config = require('./../../Config/appConfig')
const EventEmitter = require('events').EventEmitter
const eventEmitter = new EventEmitter()

const NotificationModel = mongoose.model("Notification")
const FriendModel = mongoose.model('Friend')

let listNotifications =  (req, res) =>{

    if (!req.body.page || req.body.page == 0 || req.body.page < 0) req.body.page = 0
    else req.body.page -= 1

    NotificationModel.find({ userId: req.user.userId })
       
        .sort("-sentOn")
        .select("-_id -__v -sentOn")
        .skip(req.body.page * config.pageSize)
        .limit(config.pageSize)
        .exec((err, result) => {
            if (err) {
                logger.error(err.message, 'Notification Controller: listNotification', 5)
                let apiResponse = response.generate(true, 'Internarl server error', 500, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'Listing Notifications', 200, result)
                res.send(apiResponse)
            }
            //update all notifications to read when you query for notification list
            NotificationModel.updateMany({ userId: req.user.userId, read: false }, { read: true }).exec((err, result)=>{

            })


        })
}

let getNotificationCount =  (req, res) => {
    NotificationModel.countDocuments({ userId: req.user.userId, read: false })
        .exec((err, result) => {
            if (err) {
                logger.error(err.message, 'Notification Controller: count', 5)
                let apiResponse = response.generate(true, 'Internal server error', 500, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'Listing Notification Count', 200, result)
                res.send(apiResponse)
            }

        })
}

let saveNotification =  (notificationArray) => {

    NotificationModel.insertMany(notificationArray, (err, result) => {

        if (err) {
            logger.error(err.message, 'Notification Controller: saveNotification', 5)
        } else {
        }
    })

}

let sendNotification =  (obj) =>{
    FriendModel.find({ userId: obj.userId, friendId: { $ne: obj.senderId } }).select("-_id friendId").lean().exec((err, result) => {
        if (err) {
            logger.error(err.message, 'Todo Controller: sending notifications', 5)
        } else {

            if (obj.senderId != obj.userId) result.push({ friendId: obj.userId }) // if the notification creator is not the owner of todo then add the owner to list of notified users

            let notifications = result.map((friend) => {
                return {
                    type: obj.notificationType,
                    targetId: obj.targetId,
                    message: obj.message,
                    title: obj.title,
                    read: false,
                    userId: friend.friendId
                }
            })


            saveNotification(notifications)

        }
    })

  
    eventEmitter.emit(obj.eventName, {
        type: obj.notificationType,
        userId: obj.senderId, 
        roomId: obj.userId, 
        message: obj.message,
        title: obj.title,
        todo: obj.todo 
    })



}



module.exports = {
    listNotification: listNotifications,
    saveNotification: saveNotification,
    sendNotification: sendNotification,
    getNotificationCount:getNotificationCount
}