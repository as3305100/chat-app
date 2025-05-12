
import { WebSocketServer, WebSocket } from "ws";


const wss = new WebSocketServer({ port: 8000 });

interface User {
    ownId: string;
    socket: WebSocket;
}

let allSockets: User[] = [];

wss.on("connection", (socket : WebSocket) => { 
      console.log("New client connected");

       socket.on("message", (message) => { 
           const parsedMessage = JSON.parse(message.toString());

           if(parsedMessage.type === "join"){
              allSockets.push({
                    ownId: parsedMessage.payload.ownId,
                    socket: socket
              })
           }

           if(parsedMessage.type === "chat"){
               const talkingUser = allSockets.find(user => user.ownId === parsedMessage.payload.talkToId);

               if(talkingUser){
                      talkingUser.socket.send(parsedMessage.payload.message);
               }else{
                     socket.send(JSON.stringify({
                          type: "error",
                          payload: {
                            message: "User not found"
                          }
                     }))
               }
           }
       })
 })  