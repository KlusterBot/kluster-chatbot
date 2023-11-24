import * as React from 'react';
import moment from "moment";
import {useState, useEffect} from 'react';
import {api} from '../config.js';
import Card from '@mui/material/Card';
import Image from 'mui-image';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';


function ImageBox(props) {
    const [classType, setClassType] = useState("visitorMessage");

    useEffect(() => {
        if(props.id !== props.image.msg_from){
            setClassType("userMessage");
        }
    },[props.id,props.image.msg_from])

    let borderClass = ""

    try {
        let lastMessageFor = localStorage.getItem("lastMessageFor");
        let currentMessageFor = props.id !== props.image.msg_from ? "userMessage" : "visitorMessage";
        let nextMessageFor = props.id !== props.messages[props.index + 1]?.msg_from ? "userMessage" : "visitorMessage";

        if(props.index == 0){
            lastMessageFor = "";
        }

        if(!props.messages[props.index + 1]){
            nextMessageFor = "";
        }
        
    
        if(lastMessageFor == currentMessageFor){
            borderClass = " messageBorder";
        }
    
        if(currentMessageFor != nextMessageFor){
            borderClass = " messageBorderUp";
        }
    
        if(lastMessageFor != currentMessageFor && nextMessageFor != currentMessageFor){
            borderClass = " messageBorder";
        }

        if(lastMessageFor == currentMessageFor && nextMessageFor == currentMessageFor){
            borderClass = " messageBorderFlat";
        }
        
        localStorage.setItem("lastMessageFor",currentMessageFor);
    } catch (error) {
    }
    
    return (
        <>
            <div className={classType} onClick={() => { props.setImage(api + "/files/" + props.image.data); props.open(true); }}>
                {props.id === props.image.msg_from ? <Avatar sx={{ width: "30px", height: "30px"}} className="chatAvatar" src={props.image?.picture || ""}></Avatar> : ""}
                <Image className={"message imageSent" + borderClass} /* onLoad={props.onLoad} */ src={api + "/files/" + props.image.data} sx={{background: "white"}} duration={0} />
            </div>
        </>
    );
}


export default ImageBox;