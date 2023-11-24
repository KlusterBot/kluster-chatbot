import * as React from "react";
import "./Dashboard/Dashboard.css";
import "./Popup.css";
import { green, red, blue } from "@mui/material/colors";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import req from "../fetch.js";
import { api } from "../config.js";
import Snackbar from "@mui/material/Snackbar";
import Backdrop from "@mui/material/Backdrop";
import MuiAlert from "@mui/material/Alert";
import Badge from "@mui/material/Badge";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CallIcon from "@mui/icons-material/Call";
import Card from "@mui/material/Card";
import SendIcon from "@mui/icons-material/Send";
import CachedIcon from "@mui/icons-material/Cached";
import MessageBox from "../Components/MessageBox";
import TypingBox from "../Components/TypingBox";
import UploadingFile from "../Components/UploadingFile";
import Image from "mui-image";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import VerifiedIcon from "@mui/icons-material/Verified";

function PopupChat(props) {
    const params = useParams();
    const navigate = useNavigate();
    const messageInput = useRef(null);
    const messageBody = useRef(null);

    const [isLoading, setLoading] = useState(false);
    const [isOpen, setOpen] = useState(false);
    const [modalType, setModalType] = useState("success");
    const [modalMessage, setModalMessage] = useState("");
    const [openBackdrop, setOpenBackdrop] = useState(false);
    const [openImageBackdrop, setOpenImageBackdrop] = useState(false);
    const [openWelcomeBackdrop, setOpenWelcomeBackdrop] = useState(true);
    const [user, setUser] = useState({});
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [typing, setTyping] = useState(false);
    const [messages, setMessages] = useState([]);
    const [messageCount, setMessageCount] = useState("");
    const [message, setMessage] = useState("");
    const [callable, setCallable] = useState(false);
    const [status, setStatus] = useState("offline");
    const [uploadingFile, setUploadingFile] = useState(false);
    const [openedImage, setOpenedImage] = useState("");
    const [fileProgress, setFileProgess] = useState(0);
    const [inputDisabled, setInputDisabled] = useState(false);
    const [messageLimit, setMessageLimit] = useState(40);
    const [showMoreMessageBtn, setShowMoreMessageBtn] = useState(false);
    const [showMoreMessage, setShowMoreMessage] = useState(
        <>
            <CachedIcon sx={{ marginRight: "5px" }} />{" "}
            {"Show Previous Messages"}
        </>
    );
    const [skipScroll, setSkipScroll] = useState(false);
    const [authToken, setAuthToken] = useState("");

    useEffect(() => {
        if (params.id) {
            (async () => {
                if (skipScroll) {
                    setShowMoreMessage(
                        <>
                            <CircularProgress
                                style={{
                                    height: "20px",
                                    width: "20px",
                                    marginRight: "10px",
                                }}
                            />{" "}
                            Loading
                        </>
                    );
                }

                try {
                    const response = await req(
                        api +
                            "/api/message/get/" +
                            params.user +
                            "/" +
                            params.id +
                            "?limit=" +
                            messageLimit
                    );
                    const result = await response.json();

                    if (result.success) {
                        if (result.data.length !== 0) {
                            setOpenWelcomeBackdrop(false);
                        }
                        if (
                            messageBody.current &&
                            JSON.stringify(messages) !==
                                JSON.stringify(result.data)
                        ) {
                            scrollToBottom();
                        }
                        if (
                            messageBody.current &&
                            !messageCount.toString().endsWith("updated")
                        ) {
                            scrollToBottom();
                        }

                        if (
                            result.data.length !== 0 &&
                            result.data[result.data.length - 1].type ===
                                "textButton"
                        ) {
                            setInputDisabled(true);
                        } else {
                            setInputDisabled(false);
                        }

                        setMessages(result.data);
                        setShowMoreMessage(
                            <>
                                <CachedIcon sx={{ marginRight: "5px" }} />{" "}
                                {"Show Previous Messages"}
                            </>
                        );

                        if (result.data.length >= 40) {
                            setShowMoreMessageBtn(true);
                        } else {
                            setShowMoreMessageBtn(false);
                        }

                        if (result.data.length < messageLimit) {
                            setShowMoreMessageBtn(false);
                        }
                    } else {
                        setModalMessage(result.message);
                        setModalType("error");
                        setOpen(true);
                    }
                } catch (error) {
                    console.log(error);
                    setModalMessage("Error Loading Messages!");
                    setModalType("error");
                    setOpen(true);

                    setShowMoreMessage(
                        <>
                            <CachedIcon sx={{ marginRight: "5px" }} />{" "}
                            {"Show Previous Messages"}
                        </>
                    );
                }
            })();
        }
    }, [messageCount, params.id, params.user]);

    useEffect(() => {
        const updatedInfo = localStorage.getItem("updatedInfo");

        if (updatedInfo) {
            setOpenWelcomeBackdrop(false);
        }

        // is Ready
        sendToParent({ type: "klusterEvent", action: "ready" });
    }, []);

    useEffect(() => {
        if (params.id) {
            (async () => {
                try {
                    const response = await req(
                        api + "/api/user/" + params.user
                    );
                    const result = await response.json();

                    if (result.success) {
                        setStatus(result.data.status);
                        setUser(result.data);

                        // Set Theme color
                        document.documentElement.style.setProperty(
                            "--theme",
                            result.data.theme
                        );
                        console.log(result.data);
                    } else {
                        setModalMessage(result.message);
                        setModalType("error");
                        setOpen(true);
                    }
                } catch (e) {
                    setModalMessage("Error Loading User");
                    setModalType("error");
                    setOpen(true);
                }
            })();
        }
    }, [params.id, params.user]);

    useEffect(() => {
        //Update Messages
        setMessageCount(Math.random());

        // Gets Message From Parent Window
        window.addEventListener(
            "message",
            (event) => {
                const parent = document.location.ancestorOrigins[0];

                if (event.origin !== parent) {
                    return;
                }

                const data = event.data;

                if (data.action === "newMessage") {
                    setMessageCount(Math.random());
                    scrollToBottom();
                    playSound("/notify.mp3");
                } else if (data.action === "popupOpened") {
                    setMessageCount(Math.random());
                    scrollToBottom();
                } else if (data.action === "popupClosed") {
                    setMessageCount(Math.random());
                } else if (data.action === "status") {
                    setStatus(data.type);
                } else if (data.action === "typing") {
                    setTyping(true);
                    scrollToBottom();
                } else if (data.action === "typingEnd") {
                    setTyping(false);
                } else if (data.action === "setToken") {
                    setAuthToken(data.token);
                }
            },
            false
        );

        setInterval(() => {
            if (params.id) {
                setMessageCount(Math.random() + "-updated");
            }
        }, 5000);
    }, []);

    const ColorButton = styled(Button)(({ theme }) => ({
        color: "white",
        backgroundColor: user.theme,
        "&:hover": {
            backgroundColor: user.theme,
        },
    }));

    const ColorTextField = styled(TextField)({
        "& label.Mui-focused": {
            color: user.theme,
        },
        "& .MuiInput-underline:after": {
            borderBottomColor: user.theme,
        },
        "& .MuiOutlinedInput-root": {
            "& fieldset": {
                borderColor: user.theme,
            },
            "&:hover fieldset": {
                borderColor: user.theme,
            },
            "&.Mui-focused fieldset": {
                borderColor: user.theme,
            },
        },
    });

    const scrollToBottom = () => {
        if (messageBody?.current && !skipScroll) {
            setTimeout(() => {
                messageBody.current.scrollTop =
                    messageBody.current.scrollHeight;
            }, 500);
        }
        setSkipScroll(false);
    };

    useEffect(() => {
        sendToParent({ type: "klusterEvent", action: "typing", message });
    }, [message]);

    const handleClose = (
        event?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === "clickaway") {
            return;
        }

        setOpen(false);
    };

    const handleBackdropClose = () => {
        setOpenBackdrop(false);
    };

    const handleBackdropOpen = () => {
        setOpenBackdrop(true);
    };

    const handleImageBackdropClose = () => {
        setOpenImageBackdrop(false);
    };

    const handleImageBackdropOpen = () => {
        setOpenImageBackdrop(true);
    };

    const handleWelcomeBackdropClose = () => {
        setOpenWelcomeBackdrop(false);
    };

    const handleWelcomeBackdropOpen = () => {
        setOpenWelcomeBackdrop(true);
    };

    const keyPress = (event) => {
        if (
            (event.keyCode == 13 ||
                event.charCode == 13 ||
                event.code == "Enter") &&
            !event.shiftKey
        ) {
            event.preventDefault();
            sendMessage();
        }
    };

    const sendMessage = () => {
        if (message.trim() === "") {
            return;
        }

        setMessage("");
        messageInput.current.value = "";
        messageInput.current.focus();

        if (params.id) {
            (async () => {
                try {
                    const response = await req(
                        api +
                            "/api/message/send/" +
                            params.user +
                            "/" +
                            params.id,
                        {
                            method: "POST",
                            body: JSON.stringify({
                                message,
                            }),
                        }
                    );
                    const result = await response.json();

                    if (result.success) {
                        setMessageCount(Math.random());
                        sendToParent({
                            type: "klusterEvent",
                            action: "newMessage",
                            message,
                        });
                    } else {
                        setModalMessage(result.message);
                        setModalType("error");
                        setOpen(true);
                    }
                } catch (error) {
                    setModalMessage("Error Sending Message!");
                    setModalType("error");
                    setOpen(true);
                }
            })();
        }
    };

    const attachFile = () => {
        let file = document.createElement("input");
        file.type = "file";
        file.onchange = async () => {
            if (file.files[0]) {
                let photo = file.files[0];
                let formData = new FormData();

                formData.append("file", photo);
                formData.append("type", "file");
                sendToParent({
                    type: "klusterEvent",
                    action: "typing",
                    message: photo.name,
                    isFile: true,
                });

                setUploadingFile(true);
                scrollToBottom();

                try {
                    let xhr = new XMLHttpRequest();
                    xhr.file = file; // not necessary if you create scopes like this
                    xhr.addEventListener(
                        "progress",
                        function (e) {
                            let done = e.position || e.loaded,
                                total = e.totalSize || e.total;
                            console.log(
                                "xhr progress: " +
                                    Math.floor((done / total) * 1000) / 10 +
                                    "%"
                            );
                        },
                        false
                    );
                    if (xhr.upload) {
                        xhr.upload.onprogress = function (e) {
                            let done = e.position || e.loaded,
                                total = e.totalSize || e.total;
                            setFileProgess(
                                Math.floor(
                                    Math.floor((done / total) * 1000) / 10
                                )
                            );
                        };
                    }
                    xhr.onreadystatechange = function (e) {
                        if (this.readyState === 4) {
                            if (xhr.status === 200) {
                                setUploadingFile(false);
                                setMessageCount(Math.random());
                                setFileProgess(0);
                            } else {
                                setModalType("error");
                                setModalMessage("Error uploading file");
                                setOpen(true);
                            }
                        }
                    };
                    xhr.open(
                        "POST",
                        api + "/api/upload/" + params.id + "/" + params.user,
                        true
                    );
                    xhr.send(formData);
                } catch (error) {
                    setModalType("error");
                    setModalMessage(error.message);
                    setOpen(true);
                }
            }
        };
        file.click();
    };

    const sendImage = () => {
        let file = document.createElement("input");
        file.type = "file";
        file.accept = "image/*";
        file.onchange = async () => {
            if (file.files[0]) {
                let photo = file.files[0];
                let formData = new FormData();

                formData.append("file", photo);
                formData.append("type", "image");

                setUploadingFile(true);
                scrollToBottom();

                try {
                    let response = await fetch(
                        api + "/api/upload/" + params.id + "/" + params.user,
                        { method: "POST", body: formData }
                    );
                    let result = await response.json();

                    setUploadingFile(false);

                    if (result.success) {
                        setMessageCount(Math.random());
                    } else {
                        setModalType("error");
                        setModalMessage(result.message);
                        setOpen(true);
                    }
                } catch (error) {
                    setModalType("error");
                    setModalMessage(error.message);
                    setOpen(true);
                }
            }
        };
        file.click();
    };

    const [actionButton, setActionButton] = useState(
        <AttachFileIcon sx={{ fontSize: 30 }} onClick={handleBackdropOpen} />
    );

    useEffect(() => {
        if (message.trim().length == 0) {
            setActionButton(
                <AttachFileIcon
                    sx={{ fontSize: 30 }}
                    onClick={handleBackdropOpen}
                />
            );
        } else {
            setActionButton(
                <SendIcon sx={{ fontSize: 30 }} onClick={sendMessage} />
            );
        }
    }, [message]);

    const initCall = () => {
        if (status === "offline" || user.callable === "false") {
            return false;
        }
        console.log("Calling User...");
        sendToParent({ type: "klusterEvent", action: "initCall", user });
    };

    const closePopup = () => {
        sendToParent({ type: "klusterEvent", action: "popupClosed" });
        setMessageCount(Math.random());
    };

    const inIframe = () => {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    };

    const sendToParent = (data) => {
        if (inIframe() && window.parent) {
            const parent = document.location.ancestorOrigins[0];
            window.parent.top.postMessage(data, parent);
            return true;
        }
        return false;
    };

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const submitUserInfo = () => {
        if (userName.length < 3) {
            setModalMessage("Name can not be less than 3 characters!");
            setModalType("info");
            setOpen(true);
            return;
        }

        if (!validateEmail(userEmail)) {
            setModalMessage("Invalid email address!");
            setModalType("info");
            setOpen(true);
            return;
        }

        (async () => {
            try {
                const response = await req(
                    api + "/api/visitor/info/" + params.id,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            name: userName,
                            email: userEmail,
                        }),
                    }
                );

                const result = await response.json();

                setModalMessage(result.message);
                setModalType("success");
                setOpen(true);

                handleWelcomeBackdropClose();
                localStorage.setItem("updatedInfo", "true");
            } catch (error) {
                console.log(error);
                setModalMessage("An error occurred!");
                setModalType("error");
                setOpen(true);
            }
        })();
    };

    const playSound = (url) => {
        const sound = new Audio(url);
        sound.play();
    };

    const noMessage = () => {
        return (
            <center>
                {/* <div className="no_messages">No Messages Yet!</div> */}
                <br />
                <Card
                    sx={{ width: "fit-content", padding: "15px 30px" }}
                    variant="outlined"
                >
                    <Avatar
                        src={api + "/logo/" + user.logo}
                        sx={{
                            width: 100,
                            height: 100,
                            backgroundColor: "transparent",
                        }}
                        alt={user.company}
                    />
                    <h3 className={"same-line"}>
                        {user.company}{" "}
                        {user.legit == "true" ? (
                            <VerifiedIcon
                                sx={{ color: blue[500], ml: "5px" }}
                            />
                        ) : (
                            ""
                        )}
                    </h3>
                    <br />
                    <span>{user.about}</span>
                </Card>
            </center>
        );
    };

    const singleChat = (id) => {
        return (
            <div className="page">
                <div className="chatHead">
                    <Avatar
                        className="visitor-img"
                        alt={user.company}
                        src={api + "/logo/" + user.logo}
                        sx={{
                            width: 50,
                            height: 50,
                            backgroundColor: "whitesmoke",
                        }}
                    />
                    <div id="activeStatusChat">
                        <h3 className={"same-line-head"}>
                            {user.company}{" "}
                            {user.legit == "true" ? (
                                <VerifiedIcon
                                    sx={{ color: blue[500], ml: "5px" }}
                                />
                            ) : (
                                ""
                            )}
                        </h3>
                        <font
                            style={{}}
                            color={status === "offline" ? "red" : "green"}
                        >
                            {status}
                        </font>
                    </div>
                    <CallIcon
                        style={{ marginRight: "10px", cursor: "pointer" }}
                        sx={{
                            color:
                                status === "offline" ||
                                user.callable === "false"
                                    ? red[500]
                                    : green[500],
                            display:
                                user.callable === "false" ? "none" : "unset",
                        }}
                        onClick={() => {
                            initCall();
                        }}
                    />
                    <KeyboardArrowDownIcon
                        fontSize={"large"}
                        style={{ marginRight: "10px", cursor: "pointer" }}
                        onClick={() => {
                            closePopup();
                        }}
                    />
                </div>
                <div id="helpInfo">
                    <div
                        color={status === "offline" ? "error" : "success"}
                        className={"activeStatus"}
                    ></div>
                    We reply instantly!
                </div>
                <div id="chatBody" ref={messageBody}>
                    {showMoreMessageBtn === true ? (
                        <span
                            id="showMoreMessages"
                            onClick={() => {
                                setMessageLimit(messageLimit + 20);
                                setMessageCount(Math.random());
                                setSkipScroll(true);
                            }}
                        >
                            {showMoreMessage}
                        </span>
                    ) : (
                        ""
                    )}
                    {messages.length === 0 ? noMessage() : ""}

                    {messages.map((obj, index) => (
                        <MessageBox
                            messages={messages}
                            image={setOpenedImage}
                            setMessageCount={setMessageCount}
                            sendToParent={sendToParent}
                            from={params.id}
                            to={params.user}
                            open={setOpenImageBackdrop}
                            key={index}
                            message={obj}
                            index={index}
                            max={messages.length}
                            id={params.user}
                        />
                    ))}
                    <TypingBox message={typing} visitor={true} />
                    <UploadingFile
                        id={params.id}
                        progess={fileProgress}
                        uploading={uploadingFile}
                    />
                </div>
                <Card elevation={0} id="coverTextBox">
                    <Card
                        elevation={0}
                        style={{ display: "flex" }}
                        className="p-1"
                        id="textbox"
                    >
                        <textarea
                            id="messageBox"
                            disabled={inputDisabled}
                            ref={messageInput}
                            onKeyPress={keyPress}
                            onInput={(event) => {
                                setMessage(event.target.value);
                            }}
                            autoComplete="off"
                            placeholder="Enter your message here ..."
                        ></textarea>
                        <Avatar
                            id="sendBtn"
                            className="m-1"
                            sx={{
                                bgcolor: green[500],
                                height: "50px",
                                width: "50px",
                            }}
                            style={{
                                marginRight: "0px",
                                marginTop: "7px",
                                cursor: "pointer",
                            }}
                        >
                            {actionButton}
                        </Avatar>
                    </Card>
                    <b id="poweredBy">
                        Powered by <img id="logo-small" src="/logo.png" />
                        <a href="#" target="_blank">
                            Kluster
                        </a>
                    </b>
                </Card>
                <Backdrop
                    sx={{
                        color: "#fff",
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                    }}
                    open={openBackdrop}
                    onClick={handleBackdropClose}
                >
                    <Card
                        elevation={0}
                        sx={{ padding: "20px" }}
                        className="actionButtons"
                    >
                        <center className="actionButton">
                            <Avatar
                                className="m-1"
                                sx={{ bgcolor: green[500] }}
                                style={{ height: "50px", width: "50px" }}
                            >
                                <AttachFileIcon
                                    sx={{ fontSize: 30 }}
                                    onClick={attachFile}
                                />
                            </Avatar>
                            <b>File</b>
                        </center>
                        <center className="actionButton">
                            <Avatar
                                className="m-1"
                                sx={{ bgcolor: green[500] }}
                                style={{ height: "50px", width: "50px" }}
                            >
                                <InsertPhotoIcon
                                    sx={{ fontSize: 30 }}
                                    onClick={sendImage}
                                />
                            </Avatar>
                            <b>Image</b>
                        </center>
                    </Card>
                </Backdrop>
                <Backdrop
                    sx={{
                        color: "#fff",
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                    }}
                    open={openImageBackdrop}
                    onClick={handleImageBackdropClose}
                >
                    <Image
                        className="openedImage"
                        showLoading={<CircularProgress color="success" />}
                        src={openedImage}
                        duration={325}
                        shift="top"
                        distance="2rem"
                        shiftDuration={320}
                    />
                </Backdrop>
                <Backdrop
                    sx={{
                        color: "#fff",
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        backgroundColor: "white",
                    }}
                    open={openWelcomeBackdrop}
                >
                    <Stack>
                        <TextField
                            onInput={(event) => {
                                setUserName(event.target.value);
                            }}
                            id="user-name"
                            label="Enter your Name"
                            variant="standard"
                        />
                        <br />
                        <TextField
                            onInput={(event) => {
                                setUserEmail(event.target.value);
                            }}
                            id="user-email"
                            label="Enter your Email"
                            variant="standard"
                        />
                        <br />
                        <ColorButton
                            variant="contained"
                            onClick={submitUserInfo}
                        >
                            Submit
                        </ColorButton>
                    </Stack>
                </Backdrop>
                <Snackbar
                    onClose={handleClose}
                    open={isOpen}
                    autoHideDuration={6000}
                >
                    <MuiAlert
                        onClose={handleClose}
                        elevation={6}
                        variant="filled"
                        severity={modalType}
                        sx={{ width: "100%" }}
                    >
                        {modalMessage}
                    </MuiAlert>
                </Snackbar>
            </div>
        );
    };

    const errorPage = () => {
        navigate("/404");
    };

    if (params.id) {
        return singleChat(params.id);
    } else {
        return errorPage();
    }
}

export default PopupChat;
