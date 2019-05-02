// connecting with sockets.
const socket = io('http://localhost:3000');

const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6Il8xbDVxMlhwayIsImlhdCI6MTU1NjAyNDk3ODI1MywiZXhwIjoxNTU2MTExMzc4LCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJ0b2RvLWFwcCIsImRhdGEiOnsidXNlcklkIjoiWXhKMW9meWlsIiwiZmlyc3ROYW1lIjoiUmFnaGF2ZW5kcmEiLCJsYXN0TmFtZSI6IlB1amFyIiwiZW1haWwiOiJyYWdodUBlZHdpc29yLmNvbSIsIm1vYmlsZU51bWJlciI6ODE5NzE4OTczMH19.rHvpluxGSHrgmIGpeksNaReAheG4pIyzyvij7ChgLOU"
const userId = "YxJ1ofyil";
/*let chatMessage = {
  createdOn: Date.now(),
  receiverId: 'SJ-iectqM',//putting user2's id here 
  receiverName: "Aditya Kumar",
  senderId: userId,
  senderName: "Mr Xyz"
}*/

let chatSocket = () => {

  socket.on('verifyUser', (data) => {

    console.log("socket trying to verify user");

    socket.emit('set-user',authToken);

  });

  socket.on(userId, (data) => {

    console.log("you received a message from "+ data.sentBy)
    console.log(data.message)

  });

}// end chat socket function

chatSocket();
