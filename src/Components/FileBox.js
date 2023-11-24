import * as React from 'react';
import moment from "moment";
import {useState, useEffect} from 'react';
import {api} from '../config.js';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';


function FileBox(props) {
    const [classType, setClassType] = useState("visitorMessage");
    const[fileType, setFileType] = useState("none");

    const fileIcon = {
        "none": <InsertDriveFileIcon/>,
        "mp3": <AudioFileIcon/>,
        "ogg": <AudioFileIcon/>,
        "wav": <AudioFileIcon/>,
        "mp4": <VideoFileIcon/>,
        "pdf": <PictureAsPdfIcon/>,
        "jpg": <InsertPhotoIcon/>,
        "png": <InsertPhotoIcon/>,
        "svg": <InsertPhotoIcon/>,
        "gif": <InsertPhotoIcon/>,
        "jpeg": <InsertPhotoIcon/>,
        "ico": <InsertPhotoIcon/>,
    }

    useEffect(() => {
        if(props.id !== props.file.msg_from){
            setClassType("userMessage");
        }
    },[props.id,props.file.msg_from])

    useEffect(() => {
        let extention = "none";
        
        try {
            extention = props.file.data.split(".")[1]
        } catch (error) {
            
        }

        setFileType(extention);
    },[])

    let borderClass = ""

    try {
        let lastMessageFor = localStorage.getItem("lastMessageFor");
        let currentMessageFor = props.id !== props.file.msg_from ? "userMessage" : "visitorMessage";
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
        console.log(error);
    }
    
    
    return (
        <div className={classType}>
            {props.id !== props.file.msg_from ? <span className="messageTime">{moment(props.file.time).format('llll')}</span> : ""}
            {props.id === props.file.msg_from ? <Avatar sx={{ width: "30px", height: "30px"}} className="chatAvatar" src={props.file?.picture || ""}></Avatar> : ""}
            <Card className={"message message_file" + borderClass} variant="outlined">
                <a className="downloadLink" href={api + "/files/" + props.file.data} download={props.file.data}>{fileIcon[fileType] || fileIcon["none"]} {props.file.data}</a>
            </Card>
            {props.id === props.file.msg_from ? <span className="messageTime">{moment(props?.file?.time).format('llll')}</span> : ""}
        </div>
    );
}


export default FileBox;