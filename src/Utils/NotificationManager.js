// import {useNavigate} from 'react-router-dom';

import req from '../fetch.js';
import {api} from '../config.js';


const getNotificationPermission = async () =>{
    let isPageHidden = document.hidden || document.mozHidden || document.msHidden || document.webkitHidden || true;

    return new Promise((resolve,reject)=>{
        if(isPageHidden){
            // return reject(new Error("Page is active"));
        }
        
        if (!("Notification" in window)) {
            // Check if the browser supports notifications
            reject(new Error("This browser does not support desktop notification"));
        } else if (Notification.permission === "granted") {
            resolve();
        } else if (Notification.permission !== "denied") {
            // We need to ask the user for permission
            Notification.requestPermission().then((permission)=>{
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    resolve();
                }else{
                    reject(new Error("Permission denied!"));
                }
            });
        }else{
            reject(new Error("Permission denied!"));
        }
    })
}

const NotificationSocketManager = async (socket, navigate)=>{
    const token = localStorage.getItem("token");
    
    let worker;

    navigator.serviceWorker.register("/worker.js").then(webworker => {
        worker = webworker
    })
    
    try {

        socket.on("callInfo2", async (data) => {
            // console.log(data);
            if(data.type == "newMessage" && !data?.fromMe){
                if(document.location.pathname == "/chat/" + data.id){
                    return;
                }
                try {
                    // Get Permission first
                    await getNotificationPermission();

                    const response = await req(api + "/api/visitor/" + data.id);
                    const user = (await response.json()).data;

                    let actions = [
                        {
                          action: 'reply',
                          type: 'text',
                          title: 'Reply',
                          placeholder: 'Replying ' + user.name,
                        },
                    ]

                    try {
                        let notify = new Notification(user.name,{
                            body: data.message,
                            icon: "https://api.dicebear.com/7.x/initials/svg?seed=" + user.name,
                            badge: 'logo.png',
                            tag: data.id,
                            persistent: true,
                            renotify: true,
                            requireInteraction: true,
                            actions,
                        });
                        
                        notify.onclick = () => {
                            console.log("Clicked!!!")
                            navigate("/chat/" + data.id);
                        }
                    } catch (error) {
                        // console.log(error);
                        data.url = document.location.origin;
                        data.token = token;
                        worker.showNotification(user.name,{
                            body: data.message,
                            icon: "https://api.dicebear.com/7.x/initials/svg?seed=" + user.name,
                            badge: 'logo.png',
                            tag: data.id,
                            persistent: true,
                            renotify: true,
                            requireInteraction: true,
                            data,
                            actions,
                        })
                    }
                    
                } catch (error) {
                    console.log(error);
                    alert(error);
                }
            }
        })
    } catch (error) {
        console.log(error);
    }
}

export {NotificationSocketManager};
