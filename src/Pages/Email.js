import * as React from 'react';
import './App.css';
import { green } from '@mui/material/colors';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockIcon from '@material-ui/icons/Lock';
import {Link} from 'react-router-dom';
import {useState} from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import req from '../fetch.js';
import {api} from '../config.js';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';


function Email() {
  
  const LockIconStyle = {
    color: 'grey',
    marginRight: '10px'
  }
  const linkStyles = {
    textDecoration: "none"
  }

  const email = localStorage.getItem("email");
  if(!email){
      document.location.href = "/";
  }

  const [isLoading, setLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const onResend = async () => {
      setLoading(true);
      try {
        const response = await req(api + "/api/auth/email", {
          method: "POST",
          body: JSON.stringify({
            email
          })
        })
        const result = await response.json();

        if(result.success){
          setLoading(false);
          setModalType("success");
          setModalMessage(result.message);
          setOpen(true);

        }else{
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
      }
  }
  
  return (
    <div className="page">
      <img className="email-illu"
        alt="Logo"
        src="illus/email.png"
      />
      <p id="infoEmail">An Email has been sent to your email address <font className="green">{email}.</font> Click on the link in the email to verify your email.</p>
      <footer>
          <LoadingButton loading={isLoading} onClick={onResend} className="largeBtn loginBtn" variant="contained" color="success" disableElevation>
            Resend Email
          </LoadingButton>
      </footer>
      <Snackbar onClose={handleClose} open={isOpen} autoHideDuration={6000}>
        <MuiAlert onClose={handleClose} elevation={6} variant="filled" severity={modalType} sx={{ width: '100%' }}>
          {modalMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}


export default Email;
