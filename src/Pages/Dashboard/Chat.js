import * as React from "react";
import moment from "moment";
import "./Dashboard.css";
import { green, red } from "@mui/material/colors";
import Avatar from "@mui/material/Avatar";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import req from "../../fetch.js";
import { api } from "../../config.js";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import PersistentDrawerLeft from "../../Components/Menu";
import BotSwitch from "../../Components/BotSwitch";
import Backdrop from "@mui/material/Backdrop";
import Paper from "@mui/material/Paper";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CallIcon from "@mui/icons-material/Call";
import Card from "@mui/material/Card";
import SendIcon from "@mui/icons-material/Send";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MessageBox from "../../Components/MessageBox";
import TypingBox from "../../Components/TypingBox";
import TriggerBox from "../../Components/TriggerBox";
import SendingFileBox from "../../Components/SendingFileBox";
import UploadingFile from "../../Components/UploadingFile";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DoneIcon from "@mui/icons-material/Done";
import CachedIcon from "@mui/icons-material/Cached";
import Image from "mui-image";
import CircularProgress from "@mui/material/CircularProgress";
import { GrammarlyEditorPlugin } from "@grammarly/editor-sdk-react";
import { FormControlLabel, FormGroup } from "@mui/material";

function Chat(props) {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const messageInput = useRef(null);
    const messageBody = useRef(null);
    const socket = props.socket;

    const grammarlyId = "client_9m1fYK3MPQxwKsib5CxtpB"; // "client_YWZxsRBKwxtWDQCgNhisfM";
    const [grammarlyClientId, setGrammarlyClientId] = useState("");
    const grammarlyConfig = {
        introText:
            "Kluster uses Grammarly to help you write clearly and mistake-free",
        toneDetector: "on",
        autocomplete: "on",
        userFeedback: "off",
    };

    const [isOpen, setOpen] = useState(false);
    const [modalType, setModalType] = useState("success");
    const [modalMessage, setModalMessage] = useState("");
    const [openBackdrop, setOpenBackdrop] = useState(false);
    const [openTriggerBackdrop, setOpenTriggerBackdrop] = useState(false);
    const [openImageBackdrop, setOpenImageBackdrop] = useState(false);
    const [visitors, setVisitors] = useState(0);
    const [visitor, setVisitor] = useState({});
    const [messages, setMessages] = useState(0);
    const [messageCount, setMessageCount] = useState("");
    const [message, setMessage] = useState("");
    const [typing, setTyping] = useState("");
    const [sendingFile, setSendingFile] = useState("");
    const [uploadingFile, setUploadingFile] = useState(false);
    const [id, setId] = useState("");
    const [triggers, setTriggers] = useState([]);
    const [openedImage, setOpenedImage] = useState("");
    const [fileProgress, setFileProgess] = useState(0);
    const [messageLimit, setMessageLimit] = useState(40);
    const [showMoreMessageBtn, setShowMoreMessageBtn] = useState(false);
    const [showMoreMessage, setShowMoreMessage] = useState(
        <>
            <CachedIcon sx={{ marginRight: "5px" }} />{" "}
            {"Show Previous Messages"}
        </>
    );
    const [skipScroll, setSkipScroll] = useState(false);
    const [isBotControlVisibile, setBotControlVisibility] = useState(false);
    const [isLockedFromBot, setLockedFromBot] = useState(false);
    // const [updateMessages, setUpdateMessages] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            if (params.id) {
                setId(params.id);
                localStorage.setItem("id", params.id);
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
                                params.id +
                                "?limit=" +
                                messageLimit
                        );
                        const result = await response.json();

                        if (result.success) {
                            if (
                                messageBody.current &&
                                JSON.stringify(messages) !==
                                    JSON.stringify(result.data)
                            ) {
                                setSendingFile("");
                                scrollToBottom();
                            }
                            setTimeout(() => {
                                setMessages(result.data);
                                setShowMoreMessage(
                                    <>
                                        <CachedIcon
                                            sx={{ marginRight: "5px" }}
                                        />{" "}
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
                            }, 100);
                        } else {
                            setModalMessage(result.message);
                            setModalType("error");
                            setOpen(true);
                        }
                    } catch (error) {
                        setModalMessage("Error Loading Messages!");
                        setModalType("error");
                        setOpen(true);

                        setShowMoreMessage("Show More Messages");
                    }

                    try {
                        const response = await req(api + "/api/me/triggers");
                        const result = await response.json();

                        if (result.success) {
                            setTriggers(result.data);
                        }
                    } catch (error) {}
                })();
            } else {
                setId(params.id);
                localStorage.setItem("id", params.id);
            }
        }
    }, [messageCount, params.id]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            if (params.id) {
                (async () => {
                    try {
                        const response = await req(
                            api + "/api/visitor/" + params.id
                        );
                        const result = await response.json();

                        if (result.success) {
                            setVisitor(result.data);
                        }
                    } catch (e) {
                        setModalMessage("Error Loading User");
                        setModalType("error");
                        setOpen(true);
                    }

                    try {
                        const response = await req(api + "/api/visitor/all");
                        const result = await response.json();

                        if (result.success) {
                            setVisitors(result.data);
                        } else {
                            setModalMessage(result.message);
                            setModalType("error");
                            setOpen(true);
                        }
                    } catch (error) {
                        setModalMessage(error.message);
                        setModalType("error");
                        setOpen(true);
                    }
                })();
            } else {
                (async () => {
                    try {
                        const response = await req(api + "/api/visitor/all");
                        const result = await response.json();

                        if (result.success) {
                            setVisitors(result.data);
                        } else {
                            setModalMessage(result.message);
                            setModalType("error");
                            setOpen(true);
                        }
                    } catch (error) {
                        setModalMessage(error.message);
                        setModalType("error");
                        setOpen(true);
                    }
                })();
            }
        } else {
            navigate("/login");
        }
    }, [params.id, messageCount]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            socket.on("newUser", async function () {
                try {
                    if (params.id) {
                        const response = await req(
                            api + "/api/visitor/" + params.id
                        );
                        const result = await response.json();

                        if (result.success) {
                            setVisitor(result.data);
                        }
                    } else {
                        const response = await req(api + "/api/visitor/all");
                        const result = await response.json();

                        if (result.success) {
                            setVisitors(result.data);
                        }
                    }
                } catch (error) {}
            });

            socket.on("callInfo2", function (data) {
                if (data.type == "newMessage") {
                    setTyping("");
                    setMessageCount(Math.random());
                }
            });

            socket.on("offline", async function (id) {
                try {
                    if (params.id == id) {
                        let newVisitor = visitor;
                        newVisitor.status = "offline";
                        setVisitor(newVisitor);
                        console.log("Visitor updated");
                    } else {
                        const response = await req(api + "/api/visitor/all");
                        const result = await response.json();

                        if (result.success) {
                            setVisitors(result.data);
                            console.log("Visitors updated");
                        }
                    }
                } catch (error) {}
            });

            socket.on("callInfo2", async function (data) {
                let visitor_id = localStorage.getItem("id");

                if (visitor_id == data.id && data.type == "typing") {
                    // console.log(data);
                    if (data.isFile) {
                        setSendingFile(data.message);

                        if (messageBody?.current && data?.message !== "") {
                            scrollToBottom();
                        }

                        setTimeout(() => {
                            setSendingFile("");
                        }, 5000);
                    } else {
                        setTyping(data.message);
                    }
                    if (
                        messageBody?.current &&
                        (data?.message?.length == 1 ||
                            data?.message.charAt(data?.message.length - 1) ==
                                "\n")
                    ) {
                        scrollToBottom();
                    }
                }
            });

            socket.on("botState", (data) => {
                const { isBot, isUserLocked, id } = data;

                if (params.id == id) {
                    setLockedFromBot(isUserLocked);
                }

                setBotControlVisibility(isBot);
            });

            setInterval(() => {
                if (params.id) {
                    setMessageCount(Math.random() + "-updated");
                }
            }, 5000);
        } else {
            navigate("/login");
        }
    }, []);

    useEffect(() => {
        setTyping("");
        setSendingFile("");

        getBotState();
    }, [params.id]);

    useEffect(() => {
        if (message.trim() === "") {
            socket.emit("callInfo", {
                type: "typingEnd",
                id: params.id,
            });
        } else {
            socket.emit("callInfo", {
                type: "typing",
                id: params.id,
            });
        }
    }, [message]);

    const scrollToBottom = () => {
        if (messageBody?.current && !skipScroll) {
            setTimeout(() => {
                messageBody.current.scrollTop =
                    messageBody.current.scrollHeight;
            }, 500);
        }
        setSkipScroll(false);
    };

    const getBotState = () => {
        // Check Bot State
        if (params.id) {
            socket.emit("botState", { id: params.id });
        }
    };

    const handleClose = (event, reason) => {
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

    const handleTriggerBackdropClose = () => {
        setOpenTriggerBackdrop(false);
    };

    const handleTriggerBackdropOpen = () => {
        setOpenTriggerBackdrop(true);
    };

    const handleImageBackdropClose = () => {
        setOpenImageBackdrop(false);
    };

    const handleImageBackdropOpen = () => {
        setOpenImageBackdrop(true);
    };

    const allChats = () => {
        return (
            <div className="page">
                <div className="chatPageBody">
                    {visitors.length == undefined
                        ? ""
                        : visitors.map((visitor, index) => (
                              <Link
                                  key={index}
                                  className="block"
                                  style={{
                                      bgcolor: "black",
                                  }}
                                  to={"/chat/" + visitor.visitor_id}
                              >
                                  <Paper
                                      className="visitor"
                                      variant="outlined"
                                      //   sx={{
                                      //       bgcolor: visitor?.message?.message
                                      //           ? ""
                                      //           : green[100],
                                      //   }}
                                  >
                                      <Badge
                                          badgeContent={""}
                                          sx={{
                                              "& .MuiBadge-badge": {
                                                  height: 8,
                                                  minWidth: 8,
                                                  paddingX: 0,
                                                  paddingY: 0,
                                                  mr: 0.4,
                                                  bgcolor:
                                                      visitor.status ==
                                                      "offline"
                                                          ? "#EFA20B"
                                                          : "#1B8700",
                                              },
                                          }}
                                          anchorOrigin={{
                                              vertical: "bottom",
                                              horizontal: "right",
                                          }}
                                      >
                                          <Avatar
                                              className="visitor-img"
                                              alt={visitor.name}
                                              src={
                                                  "https://api.dicebear.com/7.x/initials/svg?seed=" +
                                                  visitor.name
                                              }
                                              sx={{
                                                  width: 50,
                                                  height: 50,
                                                  bgcolor: green[100],
                                              }}
                                          />
                                      </Badge>
                                      <div className="flex">
                                          <span>
                                              <b>{visitor.name}</b>
                                          </span>
                                          <span>
                                              {visitor?.message?.message !==
                                              undefined ? (
                                                  visitor?.message?.isMine ==
                                                  true ? (
                                                      <span>
                                                          <b>Me:</b>{" "}
                                                          {visitor?.message?.message?.substring(
                                                              0,
                                                              20
                                                          )}
                                                      </span>
                                                  ) : (
                                                      <span>
                                                          {visitor?.message?.message?.substring(
                                                              0,
                                                              20
                                                          )}
                                                      </span>
                                                  )
                                              ) : (
                                                  <i>No Messages Yet!</i>
                                              )}
                                          </span>
                                      </div>
                                      <div className="flex go-right">
                                          <span className="chatTime">
                                              {visitor?.message?.time ==
                                              undefined
                                                  ? ""
                                                  : moment(
                                                        visitor?.message?.time
                                                    ).format("hh:mm a")}
                                          </span>
                                          {visitor.message && (
                                              <span className="tick">
                                                  {visitor?.message?.seen ==
                                                  "true" ? (
                                                      <DoneAllIcon
                                                          color="success"
                                                          sx={{
                                                              fontSize: "10px",
                                                          }}
                                                      />
                                                  ) : (
                                                      <DoneIcon
                                                          sx={{
                                                              fontSize: "10px",
                                                          }}
                                                      />
                                                  )}
                                              </span>
                                          )}
                                      </div>
                                  </Paper>
                              </Link>
                          ))}
                    {visitors.length == undefined
                        ? loadingVisitors()
                        : visitors.length == 0
                        ? noVisitors()
                        : ""}
                </div>
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

    const noVisitors = () => {
        return (
            <Paper className="visitor" variant="outlined">
                You have no visitors yet!
            </Paper>
        );
    };

    const loadingVisitors = () => {
        return (
            <Paper className="visitor" variant="outlined">
                Loading visitors ...
            </Paper>
        );
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
        if (message.trim() == "") {
            return;
        }

        setMessage("");
        messageInput.current.value = "";
        messageInput.current.focus();

        const token = localStorage.getItem("token");
        if (token) {
            if (params.id) {
                (async () => {
                    try {
                        const response = await req(
                            api + "/api/message/send/" + params.id,
                            {
                                method: "POST",
                                body: JSON.stringify({
                                    message,
                                }),
                            }
                        );
                        const result = await response.json();

                        if (result.success) {
                            setLockedFromBot(true);
                            setMessageCount(Math.random());

                            socket.emit("callInfo", {
                                type: "newMessage",
                                id: params.id,
                                message: message,
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
                const token = localStorage.getItem("token") || "";

                setUploadingFile(true);
                if (messageBody.current) {
                    scrollToBottom();
                }

                try {
                    // let response = await fetch(api + '/api/upload/' + params.id, { method: "POST", body: formData, headers: {"Authorization": "Bearer " + token} });
                    // let result = await response.json();

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
                    xhr.open("POST", api + "/api/upload/" + params.id, true);
                    xhr.setRequestHeader("Authorization", "Bearer " + token);
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
                const token = localStorage.getItem("token") || "";

                setUploadingFile(true);
                scrollToBottom();

                try {
                    let response = await fetch(
                        api + "/api/upload/" + params.id,
                        {
                            method: "POST",
                            body: formData,
                            headers: { Authorization: "Bearer " + token },
                        }
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

    const handleBotSwitch = (event) => {
        setLockedFromBot(event.target.checked);

        socket.emit("lockFromBot", {
            id: params.id,
            status: event.target.checked,
        });
    };

    const SingleChat = (id) => {
        return (
            <div className="responsive">
                <div className="page side">
                    <div className="">
                        {visitors.length == undefined
                            ? ""
                            : visitors.map((visitor, index) => (
                                  <Link
                                      key={index}
                                      className="block"
                                      to={"/chat/" + visitor.visitor_id}
                                  >
                                      <Paper
                                          className="visitor"
                                          variant="outlined"
                                          //   sx={{
                                          //     bgcolor: visitor?.message?.message ? "" : green[100],
                                          //   }}
                                      >
                                          <Badge
                                              badgeContent={""}
                                              sx={{
                                                  "& .MuiBadge-badge": {
                                                      height: 8,
                                                      minWidth: 8,
                                                      paddingX: 0,
                                                      paddingY: 0,
                                                      mr: 0.4,
                                                      bgcolor:
                                                          visitor.status ==
                                                          "offline"
                                                              ? "#EFA20B"
                                                              : "#1B8700",
                                                  },
                                              }}
                                              anchorOrigin={{
                                                  vertical: "bottom",
                                                  horizontal: "right",
                                              }}
                                          >
                                              <Avatar
                                                  className="visitor-img"
                                                  alt={visitor.name}
                                                  src={
                                                      "https://api.dicebear.com/7.x/initials/svg?seed=" +
                                                      visitor.name
                                                  }
                                                  sx={{
                                                      width: 50,
                                                      height: 50,
                                                      bgcolor: green[100],
                                                  }}
                                              />
                                          </Badge>
                                          <div className="flex">
                                              <span>
                                                  <b>{visitor.name}</b>
                                              </span>
                                              <span>
                                                  {visitor?.message?.message !==
                                                  undefined ? (
                                                      visitor?.message
                                                          ?.isMine == true ? (
                                                          <span>
                                                              <b>Me:</b>{" "}
                                                              {visitor?.message?.message?.substring(
                                                                  0,
                                                                  20
                                                              )}
                                                          </span>
                                                      ) : (
                                                          <span>
                                                              {visitor?.message?.message?.substring(
                                                                  0,
                                                                  20
                                                              )}
                                                          </span>
                                                      )
                                                  ) : (
                                                      <i>No Messages Yet!</i>
                                                  )}
                                              </span>
                                          </div>
                                          {visitor.message && (
                                              <div className="flex go-right">
                                                  <span className="chatTime">
                                                      {visitor?.message?.time ==
                                                      undefined
                                                          ? ""
                                                          : moment(
                                                                visitor?.message
                                                                    ?.time
                                                            ).format("hh:mm a")}
                                                  </span>
                                                  <span className="tick">
                                                      {visitor?.message?.seen ==
                                                      "true" ? (
                                                          <DoneAllIcon
                                                              color="success"
                                                              sx={{
                                                                  fontSize:
                                                                      "10px",
                                                              }}
                                                          />
                                                      ) : (
                                                          <DoneIcon
                                                              sx={{
                                                                  fontSize:
                                                                      "10px",
                                                              }}
                                                          />
                                                      )}
                                                  </span>
                                              </div>
                                          )}
                                      </Paper>
                                  </Link>
                              ))}
                        {visitors.length == undefined
                            ? loadingVisitors()
                            : visitors.length == 0
                            ? noVisitors()
                            : ""}
                    </div>
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
                {/* Ends Here  */}
                <div className="page main">
                    <div className="chatHead">
                        <div
                            style={{
                                display: "flex",
                                paddingTop: "0rem",
                                alignItems: "center",
                            }}
                        >
                            <ArrowBackIcon
                                style={{ marginRight: "10px" }}
                                onClick={() => {
                                    navigate("/chat");
                                }}
                            />
                            <Badge
                                badgeContent=""
                                sx={{
                                    "& .MuiBadge-badge": {
                                        height: 8,
                                        minWidth: 8,
                                        paddingX: 0,
                                        paddingY: 0,
                                        mr: 0.4,
                                        bgcolor:
                                            visitor.status == "offline"
                                                ? "#EFA20B"
                                                : "#1B8700",
                                    },
                                }}
                                overlap="circular"
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                }}
                                className={
                                    visitor.status == "offline"
                                        ? "badgeOffline"
                                        : "badgeOnline"
                                }
                            >
                                <Avatar
                                    className="visitor-img"
                                    alt={visitor.name}
                                    src={
                                        visitor?.name
                                            ? "https://api.dicebear.com/7.x/initials/svg?seed=" +
                                              visitor.name
                                            : ""
                                    }
                                    sx={{
                                        width: 50,
                                        height: 50,
                                        bgcolor: green[100],
                                    }}
                                />
                            </Badge>
                            <div id="activeStatusChat">
                                <h3>
                                    <Link to={"/edit/" + id}>
                                        {visitor.name}
                                    </Link>
                                </h3>
                                <font
                                    style={{}}
                                    color={
                                        visitor?.status
                                            ? visitor.status == "offline"
                                                ? "red"
                                                : "green"
                                            : "yellow"
                                    }
                                >
                                    {visitor?.status
                                        ? visitor.status
                                        : "unknown"}
                                </font>
                            </div>
                            <div
                                className="chat-head-actions"
                                style={{ display: "flex" }}
                            >
                                <MoreVertIcon />
                                <KeyboardArrowDownRoundedIcon />
                            </div>
                        </div>

                        <div
                            className="botControl"
                            style={{
                                display: isBotControlVisibile
                                    ? "block"
                                    : "none",
                                placeSelf: "center",
                            }}
                        >
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <BotSwitch
                                            sx={{ m: 1, marginLeft: "auto" }}
                                            checked={isLockedFromBot}
                                            onChange={handleBotSwitch}
                                        />
                                    }
                                    label={
                                        isLockedFromBot
                                            ? "You have taken over from the Bot"
                                            : "Bot is in control"
                                    }
                                    labelPlacement="start"
                                />
                            </FormGroup>
                        </div>
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
                        {messages.length == undefined ? (
                            <div className="no_messages">
                                Loading Messages ...
                            </div>
                        ) : messages.length == 0 ? (
                            <div className="no_messages">No Messages Yet!</div>
                        ) : (
                            ""
                        )}

                        {messages.length == undefined
                            ? ""
                            : messages.map((obj, index) => (
                                  <MessageBox
                                      messages={messages}
                                      image={setOpenedImage}
                                      open={setOpenImageBackdrop}
                                      onLoad={scrollToBottom}
                                      key={index}
                                      message={obj}
                                      index={index}
                                      max={messages.length}
                                      id={params.id}
                                  />
                              ))}
                        <TypingBox message={typing} />
                        <SendingFileBox file={sendingFile} />
                        <UploadingFile
                            id={id}
                            progess={fileProgress}
                            uploading={uploadingFile}
                        />
                    </div>
                    <div id="coverTextBox">
                        <div
                            style={{ display: "flex" }}
                            className="p-1"
                            id="textbox"
                        >
                            <GrammarlyEditorPlugin
                                clientId={grammarlyClientId}
                                className="grammarly"
                                config={grammarlyConfig}
                            >
                                <textarea
                                    id="messageBox"
                                    ref={messageInput}
                                    onInput={(event) => {
                                        setMessage(event.target.value.trim());
                                    }}
                                    autoComplete="off"
                                    placeholder="Enter your message here ..."
                                    onKeyPress={keyPress}
                                ></textarea>
                            </GrammarlyEditorPlugin>
                            <Avatar
                                id="sendBtn"
                                className="m-1"
                                // sx={{ bgcolor: green[500] }}
                                style={{
                                    marginRight: "0px",
                                    marginTop: "7px",
                                    height: "50px",
                                    width: "50px",
                                }}
                            >
                                {actionButton}
                            </Avatar>
                        </div>
                    </div>
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
                            <center className="actionButton">
                                <Avatar
                                    className="m-1"
                                    sx={{ bgcolor: green[500] }}
                                    style={{ height: "50px", width: "50px" }}
                                >
                                    <TouchAppIcon
                                        sx={{ fontSize: 30 }}
                                        onClick={() => {
                                            setOpenTriggerBackdrop(true);
                                        }}
                                    ></TouchAppIcon>
                                </Avatar>
                                <b>Trigger</b>
                            </center>
                        </Card>
                    </Backdrop>
                    <Backdrop
                        sx={{
                            color: "#fff",
                            zIndex: (theme) => theme.zIndex.drawer + 1,
                        }}
                        open={openTriggerBackdrop}
                    >
                        <Card
                            elevation={0}
                            sx={{ padding: "20px" }}
                            className="triggerActions"
                        >
                            {triggers.map((trigger, index) => (
                                <TriggerBox
                                    id={params.id}
                                    close={handleTriggerBackdropClose}
                                    key={index}
                                    name={trigger.name}
                                    info={trigger.info}
                                    socket={socket}
                                />
                            ))}
                            <Button
                                variant="contained"
                                sx={{ bgcolor: red[500] }}
                                onClick={handleTriggerBackdropClose}
                            >
                                Close
                            </Button>
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
                    <Snackbar
                        onClose={handleClose}
                        open={isOpen}
                        autoHideDuration={5000}
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
            </div>
        );
    };

    if (params.id) {
        return SingleChat(params.id);
    } else {
        return allChats();
    }
}

export default Chat;
