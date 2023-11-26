import * as React from "react";
import "./App.css";
import { green } from "@mui/material/colors";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LockIcon from "@material-ui/icons/Lock";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import req from "../fetch.js";
import { api } from "../config.js";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

function Login(props) {
  const navigate = useNavigate();
  const setUpSocket = props.setUpSocket;

  const LockIconStyle = {
    color: "grey",
    marginRight: "10px",
  };
  const linkStyles = {
    textDecoration: "none",
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const onLogin = async () => {
    setLoading(true);
    try {
      const response = await req(api + "/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const result = await response.json();

      if (result.success) {
        setLoading(false);
        setModalType("success");
        setModalMessage(result.message);
        setOpen(true);

        // Store Token to localstorage
        localStorage.setItem("token", result.data.accessToken);
        window.cookieStore.set("token", result.data.accessToken);
        // Store User data
        localStorage.setItem("user", JSON.stringify(result.data));

        if (!result.data.verified) {
          localStorage.setItem("email", result.data.email);
          navigate("/email");
        } else {
          document.location.href = "/dashboard";
          // navigate("/dashboard");
        }
      } else {
        setLoading(false);
        setModalType("error");
        setModalMessage(result.message);
        setOpen(true);
      }
    } catch (error) {
      setLoading(false);
      setModalType("error");
      setModalMessage("An Error Occurred!");
      setOpen(true);
      console.log(error);
    }
  };

  return (
    <div className="page">
      <img className="login-illu" alt="Logo" src="illus/login.png" />
      <section>
        <h1 className="header">Login</h1>
        <br />
        <div className="inputCover">
          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <AccountCircle sx={{ color: "action.active", mr: 1, my: 0.5 }} />
            <TextField
              className="textInput"
              onInput={(event) => {
                setEmail(event.target.value);
              }}
              label="Email"
              variant="standard"
            />
          </Box>
          <br />
          <Box sx={{ display: "flex", alignItems: "flex-end" }}>
            <LockIcon
              style={LockIconStyle}
              sx={{ color: "action.active", mr: 1, my: 0.5 }}
            />
            <TextField
              type="password"
              onInput={(event) => {
                setPassword(event.target.value);
              }}
              className="textInput"
              id=""
              label="Password"
              variant="standard"
            />
          </Box>
          <br />
          <LoadingButton
            loading={isLoading}
            onClick={onLogin}
            className="largeBtn loginBtn"
            variant="contained"
            color="success"
            disableElevation
          >
            Login
          </LoadingButton>
        </div>
      </section>
      <p id="infoText" style={{ textAlign: "center" }}>
        Don't have an account?{" "}
        <Link style={linkStyles} to="/register" className="green">
          Sign up
        </Link>
      </p>
      <footer>
        By clicking "Login" you agree to Kluster's{" "}
        <font className="green">Terms and Condition</font>.
      </footer>
      <Snackbar onClose={handleClose} open={isOpen} autoHideDuration={6000}>
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
}

export default Login;
