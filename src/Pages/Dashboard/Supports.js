import * as React from 'react';
import './Dashboard.css';
import { green,red,blue,purple,orange } from '@mui/material/colors';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import Box from '@mui/material/Box';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockIcon from '@material-ui/icons/Lock';
import BatteryFullIcon from '@material-ui/icons/BatteryFull';
import DevicesIcon from '@material-ui/icons/Devices';
import LanguageIcon from '@material-ui/icons/Language';
import NetworkCellIcon from '@material-ui/icons/NetworkCell';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import EditIcon from '@material-ui/icons/Edit';
import {Link} from 'react-router-dom';
import {useState, useEffect} from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import {useParams, useLocation, useNavigate} from 'react-router-dom';
import req from '../../fetch.js';
import {api} from '../../config.js';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import PersistentDrawerLeft from '../../Components/Menu';
import Paper from '@mui/material/Paper';
import Badge from '@mui/material/Badge';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';
import {io} from 'socket.io-client';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

function Support(props) {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const socket = props.socket;
  
  const LockIconStyle = {
    color: 'grey',
    marginRight: '10px'
  }
  const linkStyles = {
    textDecoration: "none"
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const [supports, setSupports] = useState([]);
  const [visitor, setVisitor] = useState({});
  const [battery, setBattery] = useState(null);
  const [device, setDevice] = useState(null);
  const [browser, setBrowser] = useState(null);
  const [network, setNetwork] = useState(null);
  const [url, setUrl] = useState("");
  const [country, setCountry] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  let isConnected = false;

  useEffect(() => {
      const token = localStorage.getItem("token");
      if(token){
          if(params.id){
              // Clear All States
              setUrl(null);
              setBattery(null);
              setNetwork(null);
              setDevice(null);
              setBrowser(null);
              setVisitor({});
              (async () => {
                  try {
                  const response = await req(api + "/api/support/" + params.id);
                  const result = await response.json();
                  
                  if(result.success){
                    if(Object.entries(result.data).length == 0){
                        document.location.href = "/supports";
                    }
                    setVisitor(result.data);
                  }else{
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
          }else{
              (async () => {
                  try {
                  const response = await req(api + "/api/support/all");
                  const result = await response.json();
                  
                  if(result.success){
                    setSupports(result.data);
                    console.log(result.data);
                  }else{
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
      }
  },[params.id]);

  useEffect(() => {
      
  },[]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const allSupports = () => {
      return (
      <div className="page">
        <PersistentDrawerLeft title="Supports"/>
        <div className="pagebody">
          <div>
            {supports.map((visitor,index) => (
                <Paper variant="outlined" className="visitor" key={index}>
                    <Link to={"/supports/" + visitor.id}>
                      <Badge badgeContent=" " color={visitor.status == "offline" ? "error" : "success"} anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}>
                       <Avatar className="visitor-img"
                        alt={visitor.name}
                        src={api + "/logo/" + visitor.picture}
                        sx={{ width: 50, height: 50, bgcolor: green[100] }}
                      />
                      </Badge>
                      <div className="flex">
                        <span><b>{visitor.name}</b></span>
                        <span>{visitor.email}</span>
                      </div>
                    </Link>
                </Paper>
            ))}
            {supports.length == 0 ? noSupports() : ""}
            <Fab sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                color: 'common.white',
                bgcolor: green[500],
                '&:hover': {
                  bgcolor: green[600],
                },
              }} aria-label={"Add"} color={"inherit"}>
              <AddIcon/>
            </Fab>
          </div>
        </div>
        <Snackbar onClose={handleClose} open={isOpen} autoHideDuration={6000}>
          <MuiAlert onClose={handleClose} elevation={6} variant="filled" severity={modalType} sx={{ width: '100%' }}>
            {modalMessage}
          </MuiAlert>
        </Snackbar>
      </div>
    );
  }
  
  const editVisitor = (id) => {
      console.log("Editing " + id);
  }
  
  const noSupports = () => {
      return (
          <Paper className="visitor" variant="outlined">
            You have no support agents yet!
          </Paper>
      )
  }
  
  const trackUser = (id) => {
      return (
      <div className="page">
        {Object.entries(visitor).length !== 0 ? (<Paper className="visitor" variant="outlined">
            <Badge badgeContent=" " color={visitor.status == "offline" ? "error" : "success"} anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}>
             <Avatar className="visitor-img"
              alt={visitor.name}
              src={api + "/logo/" + visitor.picture}
              sx={{ width: 50, height: 50, bgcolor: green[100] }}
            />
            </Badge>
            <div className="flex">
              <span><b>{visitor.name}</b> <span className={country !== null ? ("fi fi-" + country) : ""}></span></span>
              <span>{url}</span>
            </div>
        </Paper>) : 
        (<Paper className="visitor" variant="outlined">
            <Skeleton variant="circular" width={50} height={50} />
            <div className="flex">
                <Skeleton variant="text" sx={{ fontSize: '1.5rem' }} width={200} />
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} width={100} />
            </div>
        </Paper>) }
        
        <Snackbar onClose={handleClose} open={isOpen} autoHideDuration={6000}>
          <MuiAlert onClose={handleClose} elevation={6} variant="filled" severity={modalType} sx={{ width: '100%' }}>
            {modalMessage}
          </MuiAlert>
        </Snackbar>
      </div>
    );
  }
  
  if(params.id){
      return trackUser(params.id);
  }else{
      return allSupports();
  }
  
}



export default Support;
