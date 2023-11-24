import * as React from 'react';
import './Dashboard.css';
import { green, red, grey, blue, orange } from '@mui/material/colors';
import Avatar from '@mui/material/Avatar';
import {useParams, useLocation} from 'react-router-dom';
import {useState, useEffect, useRef} from 'react';
import req from '../../fetch.js';
import {api} from '../../config.js';
import CallEndIcon from '@mui/icons-material/CallEnd';
import CallIcon from '@mui/icons-material/Call';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import {useNavigate} from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

function Answer(props) {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const socket = props.socket;

    const videoElem = useRef(null);

    const [visitor, setVisitor] = useState({});

    const [Socket, setSocket] = useState(null);

    const [isOpen, setOpen] = useState(false);
    const [modalType, setModalType] = useState("success");
    const [modalMessage, setModalMessage] = useState("");

    const [callInfo, setCallInfo] = useState("Incoming Call");
    const [callInfoColor, setCallInfoColor] = useState(green[500]);

    const [sound, setSound] = useState(new Audio("/ringing.mp3"));

    useEffect(function(){
        const token = localStorage.getItem("token");
        if(token){
            (async () => {
                  try {
                      const response = await req(api + "/api/visitor/" + params.id);
                      const result = await response.json();
                      
                      if(result.success){
                          setVisitor(result.data);
                      }
                  }catch(e){
                      setModalMessage("Error Loading User Info!");
                      setModalType("error");
                      setOpen(true);
                  }
            })()

            socket.emit("callInfo", {
                'type': 'ringing',
                'id': params.id,
            });

            socket.on("callInfo2", (data) => {
                if(data.type == "endCall"){
                    try {
                        sound.pause();
                    } catch (error) {
                        
                    }
                    if(location.pathname == ("/answer/" + params.id)){
                        setCallInfo("Call Terminated");
        
                        setTimeout(() => {
                            navigate(-1);
                        },2000)
                    }
                }
            })

            sound.loop = true;
            // sound.autoplay = true;
        
            try {
                sound.currentTime = 0
                // sound.play();
            } catch (error) {
                
            }
        }
    }, [])

    const showModal = (open, message, type) => {
        setModalType(type);
        setModalMessage(message);
        setOpen(open);
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
    
        setOpen(false);
    };

    const declineCall = () => {
        socket.emit("callInfo", {
            'type': 'declineCall',
            'id': params.id,
        });
        setCallInfo("Call Ended");
        
        setTimeout(() => {
            navigate(-1);
        },2000)

        try {
            sound.pause();
        } catch (error) {
            console.log(error);
        }
    }

    const acceptCall = () => {
        let key = location?.state?.key || "";
        navigate("/call/" + params.id, {
            state: {
                key,
            }
        })
    }

    return (
        <div>
            <center style={{overflow: "hidden", marginBottom: "10px"}}>
                <Avatar style={{marginTop: "100px"}} className="visitor-img"
                  alt={visitor.name}
                  src={visitor.name == undefined ? "" : "https://api.dicebear.com/7.x/initials/svg?seed=" + visitor.name}
                  sx={{ width: 150, height: 150, bgcolor: green[100] }}
                />
                <h1>{visitor.name}</h1>
                <font id="callInfo" color={callInfoColor}>{callInfo}</font>
            </center>
            <center id="callButtons">
                <Avatar sx={{ width: 50, height: 50, bgcolor: red[500]}} onClick={declineCall}>
                    <CallEndIcon/>
                </Avatar>
                <Avatar style={{display: ""}} sx={{ width: 70, height: 70, bgcolor: green[500]}} onClick={acceptCall}>
                    <CallIcon sx={{ fontSize: 30 }}/>
                </Avatar>
                <Avatar style={{visibility: "hidden"}} sx={{ width: 50, height: 50, bgcolor: ""}}>
                    <PresentToAllIcon/>
                </Avatar>
            </center>
            <Snackbar onClose={handleClose} open={isOpen} autoHideDuration={6000}>
                <MuiAlert onClose={handleClose} elevation={6} variant="filled" severity={modalType} sx={{ width: '100%' }}>
                  {modalMessage}
                </MuiAlert>
            </Snackbar>
        </div>
    )
}

export default Answer;