import * as React from 'react';
import moment from "moment";
import {useState, useEffect} from 'react';
import './Head.css';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import SendingFileBox from './SendingFileBox.js';


function TypingBox(props) {
    let {visitor,message,isFile} = props;

    if(visitor === true){
        if(message === true){
            return (
                <div className="visitorMessage">
                    <Avatar sx={{ width: "30px", height: "30px"}} className="chatAvatar"></Avatar>
                    <Card className="message typingIndicator messageBorderUp" variant="outlined">
                        <div className="typing__dot"></div>
                        <div className="typing__dot"></div>
                        <div className="typing__dot"></div>
                    </Card>
                </div>
            )
        }
    }else{
        if(message.trim() === ""){
            return "";
        }
        
        return (
            <div className="userTyping flexMe">
                <Avatar sx={{ width: "30px", height: "30px"}} className="chatAvatar"></Avatar>
                <Card className="message typingIndicator messageBorderUp" variant="outlined">
                    {props.message.split('\n').map(function(item, key) {
                          return (
                            <span key={key}>
                              {item} {props.message.split("\n").length == key + 1 ? <i style={{color: "grey"}}> ...</i> : ""}
                              <br/>
                            </span>
                          )
                    })}
    {/*                 <span className="messageTime">Typing...</span> */}
                </Card>
            </div>
        );
    }

    if(isFile){
        return <SendingFileBox file={props.message} />;
    }

    return "";
}


export default TypingBox;