const socketIo = require('socket.io')
const EventEmitter = require('events').EventEmitter
const eventEmitter = new EventEmitter()
const tokenLib = require('./tokenLib')
const config = require('./../../Config/appConfig')
const mongoose = require('mongoose')
const logger = require('./loggerLib')

const FriendModel = mongoose.model('Friend')

let setSocketServer = function (server) {

    socketServer = socketIo.listen(server);

    socketServer.on('connection', (socket) => {


        console.log("A new user tried to connected")

        socket.emit('verifyUser', '')

        socket.on('set-user', (authToken) => {
            tokenLib.verifyWithoutSecret(authToken, (err, decoded) => {
                if (err) {
                    socket.emit('authError', '')
                } else {
                    socket.userId = decoded.data.userId
                    console.log(socket.userId + " connected to socket server")

                    FriendModel.find({ userId: socket.userId }).select("friendId").lean().exec((err, result) => {
                        if (err) {
                            socket.emit('connection-error', '')
                        } else {

                            result.forEach((friend) => {
                                socket.join(friend.friendId)
                            })
                            socket.join(socket.userId)
                        }
                    })

                }
            })
        })


        eventEmitter.on('todo-notification', (notificationObj) => {

            if (socket.userId == notificationObj.userId) {
                socket.to(notificationObj.roomId).broadcast.emit('todo-notification', notificationObj)
            }

        })


        //event for when the room is deleted or deactivated
        eventEmitter.on('friend-notification', (notificationObj) => {
            console.log("Entered friend socket")
            if (socket.userId == notificationObj.userId) {
                socket.emit('friend-notification', notificationObj)
                if (notificationObj.type == 'friend-add') socket.join(notificationObj.friendId)
            }
            if (notificationObj.type == 'friend-add' && socket.userId == notificationObj.friendId) {
                socket.join(notificationObj.userId)
            }

        })


        socket.on("disconnect", () => {
            console.log(`${socket.userId} disconnected`)
            socket.userId = null // this was added to tackle an issue of multiple connections! Apparently the socket io server does not suspend the removed connection and even after disconnection they keep receiving messages from the rooms.
        })

    })


}

module.exports = {
    setSocketServer: setSocketServer
}