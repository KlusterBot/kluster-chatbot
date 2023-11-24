import*as React from 'react';
import './Dashboard.css';
import {green} from '@mui/material/colors';
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
import {useState, useEffect} from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import {useParams} from 'react-router-dom';
import req from '../../fetch.js';
import {api} from '../../config.js';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, {AlertProps} from '@mui/material/Alert';
import PersistentDrawerLeft from '../../Components/Menu';
import Paper from '@mui/material/Paper';
import Badge from '@mui/material/Badge';

function Edit(props) {
    const params = useParams();
    const socket = props.socket;

    const [visitor, setVisitor] = useState({});
    const [isLoading, setLoading] = useState(false);
    const [isOpen, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [note, setNote] = useState("");
    const [modalType, setModalType] = useState("success");
    const [modalMessage, setModalMessage] = useState("");

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setOpen(false);
    };

    useEffect(()=>{
        const token = localStorage.getItem("token");
        if (token) {
            if (params.id) {
                (async () => {
                  try {
                      const response = await req(api + "/api/visitor/" + params.id);
                      const result = await response.json();
                      
                      if(result.success){
                        if(Object.entries(result.data).length == 0){
                            document.location.href = "/visitors";
                        }
                        setVisitor(result.data);
                        setName(result.data.name)
                        setNote(result.data.note)
                        console.log(result.data);
                      }
                  }catch(e){
                      
                  }
                })();
            } else {
                document.location.href = "/login";
            }
        } else {
            document.location.href = "/login";
        }
    },[]);

    const onSave = async () => {
      setLoading(true);
      try {
        const response = await req(api + "/api/visitor/update/" + params.id, {
          method: "POST",
          body: JSON.stringify({
              name,
              note
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
        <center className="m-3">
            <Badge badgeContent=" " color={visitor.status == "offline" ? "error" : "success"} anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}>
                 <Avatar className="visitor-img"
                  alt={visitor.name}
                  src={visitor.name == undefined ? "" : "https://api.dicebear.com/7.x/initials/svg?seed=" + visitor.name}
                  sx={{ width: 150, height: 150, bgcolor: green[100] }}
                />
            </Badge>
            <section>
                <div className="inputCover">
                  <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                    <TextField value={name} className="textInput" onChange={(event) => {setName(event.target.value)}} label="Name" variant="standard" />
                  </Box>
                  <br/>
                    <TextField
                      id="outlined-multiline-static"
                      label="Note"
                      multiline
                      rows={4}
                      onChange={(event) => {setNote(event.target.value)}}
                      value={note}
                    />
                  <br/>
                  <LoadingButton loading={isLoading} onClick={onSave} className="largeBtn loginBtn" variant="contained" color="success" disableElevation>
                    Save
                  </LoadingButton>
                </div>
            </section>
            <Snackbar onClose={handleClose} open={isOpen} autoHideDuration={6000}>
                <MuiAlert onClose={handleClose} elevation={6} variant="filled" severity={modalType} sx={{ width: '100%' }}>
                  {modalMessage}
                </MuiAlert>
            </Snackbar>
        </center>
    )
}

export default Edit;
