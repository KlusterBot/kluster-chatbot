import * as React from 'react';
import moment from "moment";
import {useState, useEffect} from 'react';
import './Head.css';
import Card from '@mui/material/Card';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';


function SendingFileBox(props) {
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

    if(props?.file?.trim() == ""){
        return "";
    }
    
    return (
        <div className="userTyping">
            <Card className="message message_file" variant="outlined">
                {fileIcon[props.file.split(".")[1] || "none"]} {"Sending file ..."}
            </Card>
        </div>
    );
}


export default SendingFileBox;