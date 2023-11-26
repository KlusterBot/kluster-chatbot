import * as React from 'react';
import './Dashboard.css';
import { green, red, grey, blue, orange } from '@mui/material/colors';
import Avatar from '@mui/material/Avatar';
import {useParams, useLocation} from 'react-router-dom';
import {useState, useEffect, useRef} from 'react';
import req from '../../fetch.js';
import {api} from '../../config.js';
import CallEndIcon from '@mui/icons-material/CallEnd';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import PresentToAllIcon from '@mui/icons-material/PresentToAll';
import {useNavigate} from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

function Call(props) {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const videoElem = useRef(null);

    const [visitor, setVisitor] = useState({});

    const [Socket, setSocket] = useState(null);

    const [isOpen, setOpen] = useState(false);
    const [modalType, setModalType] = useState("success");
    const [modalMessage, setModalMessage] = useState("");

    const [callInfo, setCallInfo] = useState("Waiting for microphone permission...");
    const [callInfoColor, setCallInfoColor] = useState(orange[500]);
    const [micColor, setMicColor] = useState(green[500]);
    const [getLocalStream, setLocalStream] = useState(null);
    const [screenShow, setScreenShow] = useState("none");
    const [callShow, setCallShow] = useState("block");
    const [screenShareDisabled, setScreenShareDisabled] = useState(true);
    const [screenShareColor, setScreenShareColor] = useState(grey[500]);


    let localStream;
    let remoteStream;
    let screenStream;
    let peerConnection;

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
    
                      setTimeout(function(){
                        navigate("/error")
                      },3000)
                  }
              })()

              const socket = props.socket;
              setSocket(socket);
              
              // socket.on("connect", function(msg){
              //     console.log("Call Socket Connected!");
              // })

              (async () => {
                // Call Stuff
                let voice2 = new Audio();
                
                // const servers = {
                //     iceServers:[
                //         {
                //             urls:['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
                //         }
                //     ]
                // }

                const servers = {
                    iceServers:[
                        {
                            "urls": "stun:stun.enchat.com.ng",
                            "username": "guest",
                            "credential": "password"
                        },
                        {
                            "urls": "turn:stun.enchat.com.ng",
                            "username": "guest",
                            "credential": "password"
                        }
                    ]
                }

                let constraints = {
                    // video:{
                    //     width:{min:640, ideal:1920, max:1920},
                    //     height:{min:480, ideal:1080, max:1080},
                    // },
                    audio:true,
                    video: false
                }

                let createPeerConnection = async (MemberId) => {
                    peerConnection = new RTCPeerConnection(servers)

                    peerConnection.addEventListener("connectionstatechange", function(){
                        console.log(peerConnection.connectionState);

                        if(peerConnection.connectionState === "connecting"){
                            setCallInfoColor(green[500]);
                            setCallInfo(peerConnection.connectionState);
                        }else if(peerConnection.connectionState === "connected"){
                            setCallInfoColor(green[500]);
                            setCallInfo(peerConnection.connectionState);
                        }else if(peerConnection.connectionState === "disconnected"){
                            setCallInfoColor(red[500]);
                            setCallInfo(peerConnection.connectionState);
                        }else if(peerConnection.connectionState === "failed"){
                            setCallInfoColor(red[500]);
                            setCallInfo(peerConnection.connectionState);
                            endCall();
                        }
                    })

                    // peerConnection.addEventListener("signalingstatechange",function(){
                    //     console.log(peerConnection.signalingState);
                    // });
                
                    remoteStream = new MediaStream()
                    remoteStream.onactive = function(){
                        console.log("Voice Stream is active")
                    }
                    voice2.srcObject = remoteStream

                    screenStream = new MediaStream()
                    screenStream.onactive = function(){
                        console.log("Screen Stream is active")
                        setCallShow("none");
                        setScreenShow("block");
                        setScreenShareColor(red[500]);
                    }

                    screenStream.oninactive = function(){
                        console.log("Screen Stream is inactive")
                        setCallShow("block");
                        setScreenShow("none");
                        setScreenShareColor(blue[500]);
                    }
                
                    if(!localStream){
                        try {
                            localStream = await navigator.mediaDevices.getUserMedia(constraints);
                            setLocalStream(localStream)

                            setCallInfoColor(green[500]);
                            setCallInfo("Calling...");
                        } catch (error) {
                            showModal(true, "Permission denied to access audio.", "error");
                            setCallInfoColor(red[500]);
                            setCallInfo("Permission denied");

                            if(location?.state?.key){
                                socket.emit("callInfo", {
                                    'type': 'declineCall',
                                    'id': params.id,
                                });
                            }
                            
                            setTimeout(function(){
                                endCall();
                            },2000)
                            return;
                        }
                    }

                    let hasAddTrack = (peerConnection.addTrack !== undefined);
                
                    if(hasAddTrack){
                        localStream.getTracks().forEach((track) => {
                            peerConnection.addTrack(track, localStream)
                        })
                    }else{
                        peerConnection.addStream(localStream);
                    }
                
                    peerConnection.ontrack = (event) => {
                        event.streams[0].getTracks().forEach((track) => {
                            if(track.kind == "audio"){
                                remoteStream.addTrack(track);
                            }else{
                                screenStream.addTrack(track);

                                videoElem.current.srcObject = null;
                                videoElem.current.srcObject = screenStream;
                            }
                        })
                    }

                    peerConnection.addEventListener('negotiationneeded', async (event) => {
                        console.log("Needs to negotiate")
        
                        try {
                            let offer = await peerConnection.createOffer({
                                offerToReceiveAudio: true,
                                offerToReceiveVideo: true,
                            })
                            console.log(offer)
                            await peerConnection.setLocalDescription(offer)
                            socket.emit("callInfo", {"type":"callReconnectOffer", offer, id:params.id})
                            setCallInfoColor(green[500]);
                            setCallInfo("Reconnecting...");
                        } catch (error) {
                            
                        }
                    });
                
                    peerConnection.onicecandidate = async (event) => {
                        if(event.candidate){
                            socket.emit("callInfo",{'type':'candidate', 'candidate':event.candidate, id: MemberId})
                        }
                    }

                    peerConnection.oniceconnectionstatechange = function(){
                       console.log('ICE state: ',peerConnection.iceConnectionState);
                    }
                }

                try {
                    localStream = await navigator.mediaDevices.getUserMedia(constraints);
                    setLocalStream(localStream)

                    setCallInfoColor(green[500]);
                    setCallInfo("Calling...");
                } catch (error) {
                    showModal(true, "Permission denied to access audio.", "error");
                    setCallInfoColor(red[500]);
                    setCallInfo("Permission denied");

                    if(location?.state?.key){
                        socket.emit("callInfo", {
                            'type': 'declineCall',
                            'id': params.id,
                        });
                    }
                    
                    setTimeout(function(){
                        endCall();
                    },2000)
                    return;
                }

                await createPeerConnection(params.id);

                let offer = await peerConnection.createOffer({
                    iceRestart: true,
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true
                })
                await peerConnection.setLocalDescription(offer)

                if(location?.state?.key){
                    socket.emit("callInfo", {"type":"callReconnectOffer", "key":location?.state?.key, offer, id:params.id})
                    setCallInfoColor(green[500]);
                    setCallInfo("Connecting...");
                }else{
                    socket.emit("call",{'type':'offer', 'offer':offer, id:params.id});
                }

                socket.on("callInfo2", async function(data){
                    if(data.type == "candidate"){
                        if(peerConnection && peerConnection.signalingState != "closed" && data.candidate && peerConnection.currentRemoteDescription){
                            try {
                                console.log("Adding Candidate")
                                peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
                            } catch (error) {
                                console.log(error);
                            }
                        }else{
                            console.log(data.candidate, " failed!")
                        }
                    }else if(data.type == "reconnectCall"){
                        if(peerConnection){
                            peerConnection.close();
                            peerConnection = null;
                        }
                        // if(peerConnection.connectionState != "connected"){
                        //     let offer = await peerConnection.createOffer();
                        //     await peerConnection.setLocalDescription(offer);
                        //     socket.emit("callInfo", {"type":"callReconnectOffer", offer, id:params.id})
                        //     console.log("New Reconnect Offer", offer)
                        //     setCallInfoColor(green[500]);
                        //     setCallInfo("Reconnecting...");
                        // }else{
                        //     console.log("Still Connected");
                        //     peerConnection.addEventListener("connectionstatechange",async function(){
                        //         if(peerConnection.connectionState != "connected"){
                        //             let offer = await peerConnection.createOffer({iceRestart: true});
                        //             await peerConnection.setLocalDescription(offer)
                        //             socket.emit("callInfo", {"type":"callReconnectOffer", offer, id:params.id})
                        //             console.log("New Reconnect Offer", offer)
                        //             setCallInfoColor(green[500]);
                        //             setCallInfo("Reconnecting...");
                        //         }
                        //     })
                        // }
                        await createPeerConnection(params.id);
        
                        let offer = await peerConnection.createOffer({
                            iceRestart: true,
                            offerToReceiveAudio: true,
                            offerToReceiveVideo: true
                        })
                        await peerConnection.setLocalDescription(offer)
                        socket.emit("callInfo", {"type":"callReconnectOffer", offer, id:params.id})
                        setCallInfoColor(green[500]);
                        setCallInfo("Reconnecting...");
                        
                    }else if(data.type == "answer"){
                        if(!peerConnection.currentRemoteDescription && peerConnection.signalingState != "closed"){
                            console.log("Adding Answer")
                            peerConnection.setRemoteDescription(data.answer);
                        }else{
                            if(peerConnection.signalingState == "have-local-offer"){
                                console.log("Adding Answer")
                                peerConnection.setRemoteDescription(data.answer);
                            }else{
                                console.log(peerConnection.signalingState)
                            }
                            
                            peerConnection.addEventListener("signalingstatechange",function(){
                                console.log(peerConnection.signalingState);
                                if(peerConnection.signalingState == "have-local-offer"){
                                    console.log("Adding Answer")
                                    peerConnection.setRemoteDescription(data.answer);
                                }
                            });
                        }
                    }else if(data.type == "endCall"){
                        if(peerConnection.connectionState != "closed" && data.id == params.id){
                            setCallInfoColor(red[500]);
                            setCallInfo("Call Terminated");
                            setTimeout(function(){
                                endCall();
                            },2000)
                        }
                    }else if(data.type == "noAnswer"){
                        setCallInfoColor(red[500]);
                        setCallInfo("No Answer");
                        setTimeout(function(){
                            endCall();
                        },2000)
                    }else if(data.type == "lowBalance"){
                        setCallInfoColor(red[500]);
                        setCallInfo("Balance is low");
                        setTimeout(function(){
                            endCall();
                        },2000)
                    }else if(data.type == "callErrorPicking"){
                        setCallInfoColor(red[500]);
                        setCallInfo("Error Picking Call");
                        setTimeout(function(){
                            endCall();
                        },2000)
                    }else if(data.type == "ringing"){
                        setCallInfoColor(green[500]);
                        setCallInfo("Ringing...");
                    }else if(data.type == "screenShareCheck"){
                        if(data.canShareScreen){
                            setScreenShareDisabled(false);
                            setScreenShareColor(blue[500]);
                        }else{
                            setScreenShareDisabled(true);
                            setScreenShareColor(grey[500]);
                        }
                    }else if(data.type == "screenShareError"){
                        showModal(true, data.message, "error");
                    }else if(data.type == "screenShareSuccess"){
                        console.log("Screenshare success")
                        setCallShow("none");
                        setScreenShow("block");
                        setScreenShareColor(red[500]);
                    }else if(data.type == "screenShareEnded"){
                        setCallShow("block");
                        setScreenShow("none");
                        setScreenShareColor(blue[500]);
                    }else if(data.type == "negotiate"){
                        await createAnswer(data.description, socket);
                    }
                    console.log(data);
                })
              })()
          }
    },[])

    const createAnswer = async (offer, socket) => {
        await peerConnection.setRemoteDescription(offer)

        let answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)

        socket.emit("callInfo", {
            'type': 'answer',
            'answer': answer,
            'id': params.id,
        });
    }

    const showModal = (open, message, type) => {
        setModalType(type);
        setModalMessage(message);
        setOpen(open);
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setOpen(false);
    };

    const endCall = (force) => {
        try {
            Socket.emit("endCall", params.id);
        } catch (error) {
            
        }

        setCallInfoColor(red[500]);
        setCallInfo("Call Ended");

        if(peerConnection){
            peerConnection.close();
        }

        if(localStream){
            localStream.getTracks().forEach(function(track){
                track.stop();
            })
        }

        setTimeout(function(){
            navigate("/chat/" + params.id);
        }, 3000)
    }

    const removeLocalStream = () => {
        if(localStream){
            localStream.getTracks().forEach(function(track){
                track.stop();
            })
        }
    }

    const toggleMic = () => {
        if(!getLocalStream){
            return;
        }
        let audioTrack = getLocalStream.getTracks().find(track => track.kind === 'audio')
        if(micColor == grey[500]){
            setMicColor(green[500])
            audioTrack.enabled = true;
        }else{
            setMicColor(grey[500])
            audioTrack.enabled = false;
        }
    }

    const requestScreen = () => {
        if(!screenShareDisabled){
            if(screenShareColor == blue[500]){
                Socket.emit("callInfo", {type: "requestScreenShare", id: params.id});
                console.log("Request Screenshare");
            }else{
                Socket.emit("callInfo", {type: "endScreenShare", id: params.id});
                setScreenShareColor(blue[500]);
                setCallShow("block");
                setScreenShow("none");
            }
        }
    }

    const enterFullScreen = () => {
        if (!videoElem.current.fullscreenElement) {
            videoElem.current.requestFullscreen();
        } else if (videoElem.current.exitFullscreen) {
            videoElem.current.exitFullscreen();
        }
    }
    
    return (
        <div>
            <center style={{marginBottom: "10px", overflow: "hidden",  display: callShow}}>
                <Avatar style={{marginTop: "100px"}} className="visitor-img"
                  alt={visitor.name}
                  src={visitor.name == undefined ? "" : "https://api.dicebear.com/7.x/initials/svg?seed=" + visitor.name}
                  sx={{ width: 150, height: 150, bgcolor: green[100] }}
                />
                <h1>{visitor.name}</h1>
                <font id="callInfo" color={callInfoColor}>{callInfo}</font>
            </center>
            <center style={{ margin: "0px", marginBottom: "0px", display: screenShow}}>
                <video id="screenshare" autoPlay={true} playsInline={true} ref={videoElem} onClick={enterFullScreen}></video>
                <font id="callInfo" color={callInfoColor}>{callInfo}</font>
            </center>
            <center id="callButtons">
                <Avatar style={{display: ""}} sx={{ width: 50, height: 50, bgcolor: micColor}}>
                    <KeyboardVoiceIcon onClick={toggleMic}/>
                </Avatar>
                <Avatar sx={{ width: 50, height: 50, bgcolor: red[500]}}>
                    <CallEndIcon onClick={endCall}/>
                </Avatar>
                <Avatar style={{display: ""}} sx={{ width: 50, height: 50, bgcolor: screenShareColor}}>
                    <PresentToAllIcon onClick={requestScreen}/>
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

export default Call;