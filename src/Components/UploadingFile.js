import * as React from 'react';
import moment from "moment";
import {useState, useEffect} from 'react';
import './Head.css';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';


function UploadingFile(props) {
    const [classType, setClassType] = useState("visitorMessage");

    useEffect(() => {
        if(props.id){
            setClassType("userMessage");
        }
    },[props])

    if(props.uploading){
        return (
            <div className={classType}>
                <Card className="message" variant="outlined">
                    <Typography variant="caption" component="div" color="text.secondary" style={{color: "white"}}>
                      {props.progess ? Math.round(props.progess) + "% " : ""} {"Uploading file"}
                    </Typography>
                </Card>
            </div>
        );
    }else{
        return "";
    }
}


export default UploadingFile;