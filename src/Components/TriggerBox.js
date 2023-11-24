import * as React from 'react';
import { green,red } from '@mui/material/colors';
import {useState, useEffect} from 'react';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import TouchAppIcon from '@mui/icons-material/TouchApp';


function TriggerBox(props) {
    let {id, name, info, socket, close} = props;

    const [text, setText] = useState("");

    const sendTrigger = () => {
        if(text.trim() === ""){
            return;
        }

        socket.emit("callInfo", {
            'type': 'trigger',
            'id': id,
            'text': text,
            'name': name,
        });

        close()
    }

    return (
        <div className="triggerCard">
            <TextField onInput={(event) => {setText(event.target.value)}} autoComplete="off" color="success" label={name} placeholder={info} variant="outlined" />
            <Avatar className="m-1" sx={{ bgcolor: green[500] }} style={{height: "50px", width: "50px"}}>
                <TouchAppIcon onClick={sendTrigger} sx={{ fontSize: 30 }}></TouchAppIcon>
            </Avatar>
        </div>
    )
}

export default TriggerBox;