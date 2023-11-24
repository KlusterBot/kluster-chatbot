import * as React from "react";
import moment from "moment";
import { useState, useEffect } from "react";
import "./Head.css";
import Card from "@mui/material/Card";
import Avatar from "@mui/material/Avatar";
import FileBox from "./FileBox.js";
import ImageBox from "./ImageBox.js";
import req from "../fetch.js";
import { api } from "../config.js";

function MessageButtonBox(props) {
    const [classType, setClassType] = useState("visitorMessage");
    const [show, setShow] = useState("flex");

    const messageButtonClicked = (message) => {
        if (props.from && props.to) {
            setShow("none");
            (async () => {
                try {
                    const response = await req(
                        api +
                            "/api/message/send/" +
                            props.to +
                            "/" +
                            props.from,
                        {
                            method: "POST",
                            body: JSON.stringify({
                                message_id: props.message.id,
                                type: "text",
                                message,
                            }),
                        }
                    );
                    const result = await response.json();

                    console.log(result);

                    if (result.success) {
                        props.setMessageCount(Math.random());
                        setTimeout(() => {
                            props.sendToParent({
                                type: "klusterEvent",
                                action: "newMessage",
                                message,
                            });
                        }, 500);
                    } else {
                        setShow("flex");
                    }
                } catch (error) {}
            })();
        }
    };

    return (
        <div
            className={
                (props.id !== props.message.msg_from
                    ? "userMessage"
                    : "visitorMessage") + " messageBoxButton"
            }
        >
            <div className="flexMe">
                {props.id === props.message.msg_from ? (
                    <Avatar
                        sx={{ width: "30px", height: "30px" }}
                        className="chatAvatar"
                        src={props.message?.picture || ""}
                    ></Avatar>
                ) : (
                    ""
                )}
                <Card className="message messageBorderUp" variant="outlined">
                    {props.message.message
                        .split("\n")
                        .map(function (item, key) {
                            return (
                                <span key={key}>
                                    {item}
                                    <br />
                                </span>
                            );
                        })}
                </Card>
            </div>
            <Card
                className="messageButton"
                variant="outlined"
                style={{ display: show }}
            >
                {props.message.data === ""
                    ? ""
                    : props.message.data.split(",").map(function (item, key) {
                          return (
                              <span
                                  key={key}
                                  onClick={() => {
                                      messageButtonClicked(item);
                                  }}
                              >
                                  {item}
                              </span>
                          );
                      })}
            </Card>
        </div>
    );
}

export default MessageButtonBox;
