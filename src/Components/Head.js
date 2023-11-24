import * as React from 'react';
import {useState, useEffect} from 'react';
import moment from "moment";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import './Head.css';
import { green, red, grey, blue, darkgreen } from '../../src/colors.js';
import req from '../../src/fetch.js';
import {api} from '../../src/config.js';
import env from '../../src/env.js';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Badge from '@mui/material/Badge';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import {Link, useNavigate} from 'react-router-dom';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';

function BalanceTab() {
    let [user, setUser] = useState(null);

    useEffect(function(){
        (async () => {
            try {
              const response = await req(api + "/api/me");
              const result = await response.json();

              if(result.success){
                  setUser(result.data);
              }
            }catch(e){
                // console.log(e);
            }
        })();
    },[]);
    return (
        <Card id="BalanceTab" variant="outlined">
            <Stack direction="column" spacing={2}>
                <Stack direction="row" spacing={1}>
                    <Avatar sx={{ bgcolor: darkgreen }} variant="rounded">
                        <AccountBalanceWalletIcon />
                    </Avatar>
                    <Stack direction="row" spacing={0}>
                        <Typography variant="h4" color={darkgreen}></Typography>
                        <Typography variant="h4">{user != null ? ("₦" + (new Intl.NumberFormat().format(user.balance))) : "Loading..."}</Typography>
                    </Stack>
                </Stack>
                <Typography variant="p" color={darkgreen} fontWeight={100}>Use wallet balance to purchase services</Typography>
                <Link to="/fund" style={{width:"fit-content"}}><Button id="fundWallet" color="success" variant="contained">Fund Wallet</Button></Link>
                <br/>
            </Stack>
        </Card>
    );
}

function CallHistory(props) {
    let [calls, setCalls] = useState([]);

    useEffect(function(){
        (async () => {
            try {
              const response = await req(api + "/api/me/calls");
              const result = await response.json();

              if(result.success){
                  setCalls(result.data.calls);
              }
            }catch(e){
                // console.log(e);
            }
        })();
    },[]);

    let callHistory = () => {
        return (
            <Card className="call-item">
                {calls.map((call , index) => (
                    <Card key={index} className="visitor" variant="outlined" sx={{ bgcolor: green[100] }}>
                      <Badge badgeContent={""} color={call.status == "offline" ? "error" : "success"} anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}>
                       <Avatar className="visitor-img"
                        alt={call.name}
                        src={"https://api.dicebear.com/7.x/initials/svg?seed=" + call.name}
                        sx={{ width: 50, height: 50, bgcolor: green[100] }}
                      />
                      </Badge>
                      <div className="flex">
                        <span><b>{call.name}</b></span>
                        <span>{moment(call.time).fromNow()}</span>
                      </div>
                    </Card>
                ))}
            </Card>
        )
    }

    return (
    <Card id="CallHistory">
        <Stack direction="column" spacing={2}>
            <Typography variant="h5">Call History</Typography>

            {calls.length == 0 ? "" : callHistory()}
        </Stack>
    </Card>
    );
}

function FundWidget() {
    const navigate = useNavigate();
    const [amount, setAmount] = useState("1000");

    const [config, setConfig] = useState({});
    const handleFlutterPayment = useFlutterwave(config);

    useEffect(function(){
        (async () => {
            try {
              const response = await req(api + "/api/me");
              const result = await response.json();

              if(result.success){
                  let user = result.data;

                  setConfig({
                    public_key: env["flutterwave_pk_key"],
                    tx_ref: Date.now(),
                    amount: amount,
                    currency: 'NGN',
                    payment_options: 'card,mobilemoney,ussd',
                    customer: {
                        email: user.email,
                        name: user.name,
                    },
                    meta: {
                        id: user.id,
                    },
                    customizations: {
                        title: env["name"],
                        description: 'Account Funding',
                        logo: env["logo"],
                    }
                  })
              }
            }catch(e){
                console.log(e);
            }
        })();
    },[amount]);

    const FundWallet = () => {
        handleFlutterPayment({
            callback: async (response) => {
                console.log(response);
                closePaymentModal() // this will close the modal programmatically

                const request = await req(api + "/api/payment/verify/" + response.transaction_id);
                const result = await request.json();

                if(response.status === "completed"){
                    navigate("/dashboard");
                }
            },
            onClose: () => {},
        })
    }


    return (
        <Card sx={{margin: "5px", padding: "10px"}}>
            <FormControl sx={{ m: 1 }}>
              <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
              <OutlinedInput
                id="outlined-adornment-amount"
                startAdornment={<InputAdornment position="start">₦</InputAdornment>}
                label="Amount"
                sx={{width: "95%"}}
                value={amount}
                type="number"
                onInput={(event) => {setAmount(event.target.value)}}
              />
            </FormControl>
            <FormControl sx={{ m: 1 }}>
                <Button onClick={() => { amount <= 0 ? console.log("Amount too low!") : FundWallet()}} id="fundWallet" color="success" variant="contained">Fund Wallet</Button>
            </FormControl>
        </Card>
    );
}


export {BalanceTab, CallHistory, FundWidget};