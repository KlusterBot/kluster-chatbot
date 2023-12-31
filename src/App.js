import * as React from "react";
import "./App.css";
import Index from "./Pages/App.js";

// Visitor Popup Chat
import PopupChat from "./Pages/PopupChat";

// Import Sub Pages Under Dashboard
import Chat from "./Pages/Dashboard/Chat";
import Visitors from "./Pages/Dashboard/Visitors";

import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { api } from "./config.js";
import { io } from "socket.io-client";

import { ProtectedRoute, AuthenticatedRoute } from "./Utils/RouteManager";

function App() {
    let socket;
    const navigate = useNavigate();

    const setUpSocket = async () => {
        const token = localStorage.getItem("token");
        if (
            token &&
            !socket &&
            !document.location.pathname.startsWith("/support/")
        ) {
            // Set Up WebWorker
            const worker = new Worker("/worker.js");

            worker.onerror = (error) => {
                console.log(error);
            };

            // Set Up Socket
            socket = io(api, {
                query: {
                    token,
                },
            });

            window.socket = socket;

            socket.on("connect", function (msg) {
                console.log("Connected Globally as " + socket.id);
            });

            socket.on("callInfo2", async function (data) {
                if (data.type == "call") {
                    if (
                        document.location.pathname.startsWith("/answer/") ||
                        document.location.pathname.startsWith("/call/") ||
                        document.location.pathname.startsWith("/support/")
                    ) {
                        return socket.emit("callInfo", {
                            type: "callOngoing",
                            id: data.id,
                        });
                    }
                    // document.location.href = "/answer/" + data.id;
                    navigate("/answer/" + data.id, {
                        state: {
                            key: data.key,
                        },
                    });
                }
                // console.log(data);
            });
        }
    };

    // useEffect(() => {
    if (!socket) {
        if (window?.socket) {
            socket = window?.socket;
        } else {
            setUpSocket();
        }
    }
    // }, []);

    return (
        <Routes>
            <Route path="/" element={<Index />} />
            <Route
                path="/chat"
                element={
                    <ProtectedRoute>
                        {" "}
                        <Chat socket={socket} />{" "}
                    </ProtectedRoute>
                }
            />
            <Route
                path="/chat/:id"
                element={
                    <ProtectedRoute>
                        {" "}
                        <Chat socket={socket} />{" "}
                    </ProtectedRoute>
                }
            />
            <Route
                path="/visitors"
                element={
                    <ProtectedRoute>
                        {" "}
                        <Visitors socket={socket} />{" "}
                    </ProtectedRoute>
                }
            />
            <Route
                path="/visitors/:id"
                element={
                    <ProtectedRoute>
                        {" "}
                        <Visitors socket={socket} />{" "}
                    </ProtectedRoute>
                }
            />
            <Route path="/support/:user/:id" element={<PopupChat />} />
        </Routes>
    );
}

export default App;
