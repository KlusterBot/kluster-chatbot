import {io} from 'socket.io-client';
import {api} from './config.js';

let socket = null;

function getSocket() {
    return new Promise(function(resolve, reject){
        const token = localStorage.getItem("token");
        if (token) {
            // Set Up Socket
            if(!socket){
                socket = io(api, {
                    query: {
                        token
                    }
                });
    
                socket.on("connect", function(msg) {
                    console.log("Connected Globally!");
                    resolve(socket);
                })
            }else{
                resolve(socket);
            }
        }
    })
}



export default getSocket;