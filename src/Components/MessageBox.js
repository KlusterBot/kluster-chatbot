import * as React from "react";
import moment from "moment";
import { useState, useEffect } from "react";
import "./Head.css";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import FileBox from "./FileBox.js";
import ImageBox from "./ImageBox.js";
import MessageButtonBox from "./MessageButtonBox.js";

function MessageBox(props) {
    if (props.message.type == "file") {
        return (
            <FileBox
                messages={props.messages}
                file={props.message}
                id={props.id}
            />
        );
    } else if (props.message.type == "image") {
        return (
            <ImageBox
                messages={props.messages}
                setImage={props.image}
                open={props.open}
                image={props.message}
                id={props.id}
                onLoad={props.onLoad}
            />
        );
    } else if (props.message.type == "textButton") {
        return (
            <MessageButtonBox
                messages={props.messages}
                message={props.message}
                setMessageCount={props.setMessageCount}
                sendToParent={props.sendToParent}
                id={props.id}
                to={props.to}
                from={props.from}
            />
        );
    }

    if (props.message.type !== "text") {
        return "";
    }

    const expression =
        /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
    const regex = new RegExp(expression);

    let borderClass = "";

    try {
        let lastMessageFor = localStorage.getItem("lastMessageFor");
        let currentMessageFor =
            props.id !== props.message.msg_from
                ? "userMessage"
                : "visitorMessage";
        let nextMessageFor =
            props.id !== props.messages[props.index + 1]?.msg_from
                ? "userMessage"
                : "visitorMessage";

        if (props.index == 0) {
            lastMessageFor = "";
        }

        if (!props.messages[props.index + 1]) {
            nextMessageFor = "";
        }

        if (lastMessageFor == currentMessageFor) {
            borderClass = " messageBorder";
        }

        if (currentMessageFor != nextMessageFor) {
            borderClass = " messageBorderUp";
        }

        if (
            lastMessageFor != currentMessageFor &&
            nextMessageFor != currentMessageFor
        ) {
            borderClass = " messageBorder";
        }

        if (
            lastMessageFor == currentMessageFor &&
            nextMessageFor == currentMessageFor
        ) {
            borderClass = " messageBorderFlat";
        }

        localStorage.setItem("lastMessageFor", currentMessageFor);
    } catch (error) {}

    return (
        <>
            <div
                className={
                    props.id !== props.message.msg_from
                        ? "userMessage"
                        : "visitorMessage"
                }
            >
                {/* {props.id !== props.message.msg_from ? <span className="messageTime">{moment(props.message.time).format('llll')}</span> : ""} */}
                {props.id !== props.message.msg_from ? (
                    <span className="messageTime"></span>
                ) : (
                    ""
                )}
                {props.id === props.message.msg_from ? (
                    <Avatar
                        sx={{ width: "30px", height: "30px" }}
                        className="chatAvatar"
                        src={props.message?.picture || ""}
                    ></Avatar>
                ) : (
                    ""
                )}
                <Card className={"message" + borderClass} variant="outlined">
                    {props.message.message
                        .split("\n")
                        .map(function (item, key) {
                            return (
                                <span key={key}>
                                    {item}
                                    <br />
                                </span>
                                //   item.match(regex) !== null ? <a target="_blank" key={key} href={item.match(regex)[0].startsWith("http") === true ? item.match(regex)[0] : "https://" + item.match(regex)[0]}>{item}<br/></a> : <span key={key}>{item}<br/></span>
                                // item.match(regex) !== null ? item : ""
                            );
                        })}
                </Card>
                {/* {props.id === props.message.msg_from ? <span className="messageTime">{moment(props.message.time).format('llll')}</span> : ""} */}
                {props.id === props.message.msg_from ? (
                    <span className="messageTime"></span>
                ) : (
                    ""
                )}
            </div>
        </>
    );
}

export default MessageBox;
