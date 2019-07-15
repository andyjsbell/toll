import React, { Component, useState, useEffect } from 'react';
import getWeb3 from "./utils/getWeb3";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import "./App.css";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

// TODO

// Use call to check calls
// Add progress from material and loading state to components to lock button until transaction
// Can we filter the logs to give latest instead of lists valid for page load?


const Web3 = require('web3');
const { fromWei, padLeft, toBN } = Web3.utils;
const TruffleContract = require('truffle-contract');
const RegulatorArtifact = require('./contracts/Regulator.json');
const TollBoothOperatorArtifact = require('./contracts/TollBoothOperator.json');

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

// TabContainer.propTypes = {
//   children: PropTypes.node.isRequired,
// };

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
  },
  input: {
    display: 'none',
  },
  root: {
    width: '100%',
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  paper: {
    marginTop: theme.spacing(3),
    width: '100%',
    alignItems: "center",
    justify: "center",
    overflowX: 'auto',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 650,
    maxWidth: 1000
  },
}));

const Accounts = ({accounts, accountChanged, label}) => {
  const [account, setAccount] = useState('');
  const classes = useStyles();

  const update = (selected) => {
    setAccount(selected);
    accountChanged(selected);
  };

  return (
    <FormControl className={classes.formControl} style={{minWidth: 300}}>
      <InputLabel htmlFor="name">{label}</InputLabel>
        {accounts.length > 0 ?
            <Select
                value={account}
                autoWidth={true}
                onChange={e => update(e.target.value)}>
                {
                    accounts.map( (account) => (
                        <MenuItem key={account} value={account}>{account}</MenuItem>
                    ))
                }
            </Select>:'No accounts!'}
    </FormControl>
  );
};

const VehicleTypes = ({vehicles}) => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
        <h3>Vehicle Types</h3>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">Vehicle Address</TableCell>
              <TableCell align="left">Vehicle Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map(row => (
              <TableRow key={row.id}>
                <TableCell align="left">{row.value.address}</TableCell>
                <TableCell align="left">{row.value.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </Paper>
  );
};

const VehicleTypesSelector = ({vehicles, vehicleTypeChanged}) => {
  const classes = useStyles();
  const [vehicleType, setVehicleType] = useState(0);
  
  const update = (selected) => {
    setVehicleType(selected);
    vehicleTypeChanged(selected);
  };

  return (
    <FormControl className={classes.formControl} style={{minWidth: 300}}>
      <InputLabel htmlFor="name">Vehicle Type</InputLabel>
        {vehicles ?
            <Select
                value={vehicleType}
                onChange={e => update(e.target.value)}>
                <MenuItem value="" disabled>
                  Vehicle Type
                </MenuItem>
                {
                    vehicles.map( (vehicle) => (
                        <MenuItem key={vehicle.id} value={vehicle.value.type}>{vehicle.value.type}</MenuItem>
                    ))
                }

            </Select>:'No vehicles'}
    </FormControl>
  );
};

const TollBoothOperators = ({tbos}) => {
  const classes = useStyles();
  return (
    <>
    {tbos ?
    <Paper className={classes.paper}>
        <h3>Toll Booth Operators</h3>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">Operator</TableCell>
              <TableCell align="left">Owner</TableCell>
              <TableCell align="left">Deposit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tbos.map(row => (
              <TableRow key={row.id}>
                <TableCell align="left">{row.value.operator}</TableCell>
                <TableCell align="left">{row.value.owner}</TableCell>
                <TableCell align="left">{row.value.deposit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </Paper>
    : null}
    </>
  );
};

const TollBoothOperatorsSelector = ({tbos, tboChanged}) => {
  const classes = useStyles();
  const [tbo, setTbo] = useState(null);

  const update = (selected) => {
    setTbo(selected);
    tboChanged(selected);
  };

  return (
    <>
    {tbos.length > 0 ?
    <FormControl className={classes.formControl} style={{minWidth: 300}}>
      <InputLabel htmlFor="name">Operator</InputLabel>
        
            <Select
                value={tbo}
                onChange={e => update(e.target.value)}
                displayEmpty>
                <MenuItem value="" disabled>
                  Toll Booth Operator
                </MenuItem>
                {
                    tbos.map( (tbo) => (
                        <MenuItem key={tbo.id} value={tbo}>{tbo.value.operator}</MenuItem>
                    ))
                }
                
            </Select>
    </FormControl>
    :'No Toll Booth Operators'}
    </>
  );
};

const TollBooths = ({booths}) => {
  const classes = useStyles();
  return (
    <>
    {booths && booths.length > 0 ?
    <Paper className={classes.paper}>
      <h3>Toll Booths</h3>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">Operator</TableCell>
              <TableCell align="left">Booth</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {booths.map(row => (
              <TableRow key={row.id}>
                <TableCell align="left">{row.value.operator}</TableCell>
                <TableCell align="left">{row.value.tollBooth}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </Paper>
    : null}
    </>
  );
};

const TollBoothSelector = ({booths, boothChanged, label}) => {
  const classes = useStyles();
  const [booth, setBooth] = useState(null);

  const update = (selected) => {
    setBooth(selected);
    boothChanged(selected);
  };

  return (
    <>
    {booths && booths.length > 0 ?
    <FormControl className={classes.formControl} style={{minWidth: 300}}>
      <InputLabel htmlFor="name">{label} Toll Booth</InputLabel>
        
            <Select
                value={booth}
                onChange={e => update(e.target.value)}
                displayEmpty>
                <MenuItem value="" disabled>
                  {label} Toll Booth
                </MenuItem>
                {
                    booths.map( (booth) => (
                        <MenuItem key={booth.id} value={booth.value.tollBooth}>{booth.value.tollBooth}</MenuItem>
                    ))
                }
                
            </Select>
    </FormControl>: 'No toll booths!'}</>
  );
};

const RoutePrices = ({routePrices}) => {
  const classes = useStyles();
  return (
    <>
    {routePrices && routePrices.length > 0 ?
    <Paper className={classes.paper}>
      <h3>Route Prices</h3>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">Sender</TableCell>
              <TableCell align="left">Entry Booth</TableCell>
              <TableCell align="left">Exit Booth</TableCell>
              <TableCell align="left">Price Weis</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routePrices.map(row => (
              <TableRow key={row.id}>
                <TableCell align="left">{row.value.sender}</TableCell>
                <TableCell align="left">{row.value.entryBooth}</TableCell>
                <TableCell align="left">{row.value.exitBooth}</TableCell>
                <TableCell align="left">{row.value.priceWeis}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </Paper>
    : null}
    </>
  );
};

const Multipliers = ({multipliers}) => {
  const classes = useStyles();
  return (
    <>
    {multipliers && multipliers.length > 0 ?
    <Paper className={classes.paper}>
      <h3>Multipliers</h3>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">Sender</TableCell>
              <TableCell align="left">Vehicle Type</TableCell>
              <TableCell align="left">Multiplier</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {multipliers.map(row => (
              <TableRow key={row.id}>
                <TableCell align="left">{row.value.sender}</TableCell>
                <TableCell align="left">{row.value.vehicleType}</TableCell>
                <TableCell align="left">{row.value.multiplier}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </Paper>
    : null}
    </>
  );
};   

const VehicleSelector = ({vehicles, vehicleChanged}) => {
  const classes = useStyles();
  const [vehicle, setVehicle] = useState('');
  
  const update = (selected) => {
    setVehicle(selected);
    vehicleChanged(selected);
  };

  return (
    <FormControl className={classes.formControl} style={{minWidth: 300}}>
      <InputLabel htmlFor="name">Vehicle</InputLabel>
        {vehicles ?
            <Select
                value={vehicle}
                onChange={e => update(e.target.value)}>
                <MenuItem value="" disabled>
                  Vehicle
                </MenuItem>
                {
                    vehicles.map( (vehicle) => (
                        <MenuItem key={vehicle.id} value={vehicle.value.address}>{vehicle.value.address}</MenuItem>
                    ))
                }

            </Select>:'No vehicles!'}
    </FormControl>
  );
};

const VehicleEntries = ({entries}) => {
  const classes = useStyles();
  return (
    <>
    {entries && entries.length > 0 ?
    <Paper className={classes.paper}>
      <h3>Entries</h3>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">Vehicle</TableCell>
              <TableCell align="left">Entry Booth</TableCell>
              <TableCell align="left">Exit Secret Hashed</TableCell>
              <TableCell align="left">Multiplier</TableCell>
              <TableCell align="left">Deposited Weis</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map(row => (
              <TableRow key={row.id}>
                <TableCell align="left">{row.value.vehicle}</TableCell>
                <TableCell align="left">{row.value.entryBooth}</TableCell>
                <TableCell align="left">{row.value.exitSecretHashed}</TableCell>
                <TableCell align="left">{row.value.multiplier}</TableCell>
                <TableCell align="left">{row.value.depositedWeis}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </Paper>
    : null}
    </>
  );
}; 

const VehicleExits = ({exits}) => {
  const classes = useStyles();
  return (
    <>
    {exits && exits.length > 0 ?
    <Paper className={classes.paper}>
      <h3>Normal Exits</h3>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">Exit Booth</TableCell>
              <TableCell align="left">Exit Secret Hashed</TableCell>
              <TableCell align="left">Final Fee</TableCell>
              <TableCell align="left">Refund Weis</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exits.map(row => (
              <TableRow key={row.id}>
                <TableCell align="left">{row.value.exitBooth}</TableCell>
                <TableCell align="left">{row.value.exitSecretHashed}</TableCell>
                <TableCell align="left">{row.value.finalFee}</TableCell>
                <TableCell align="left">{row.value.refundWeis}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </Paper>
    : null}
    </>
  );
}; 

const VehiclePendings = ({pendings}) => {
  const classes = useStyles();
  return (
    <>
    {pendings && pendings.length > 0 ?
    <Paper className={classes.paper}>
      <h3>Pendings</h3>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">Exit Secret Hashed</TableCell>
              <TableCell align="left">Entry Booth</TableCell>
              <TableCell align="left">Exit Booth</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendings.map(row => (
              <TableRow key={row.id}>
                <TableCell align="left">{row.value.exitSecretHashed}</TableCell>
                <TableCell align="left">{row.value.entryBooth}</TableCell>
                <TableCell align="left">{row.value.exitBooth}</TableCell>                
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </Paper>
    : null}
    </>
  );
};
// * a page for the deployed `Regulator`'s owner, which allows it to:
//   * set vehicle types.
//   * create a new `TollBoothOperator`.
const Regulator = (props) => {
  
  const classes = useStyles();
  // Vehicle address in type
  const [vehicleAddress, setVehicleAddress] = useState('');
  const [vehicleType, setVehicleType] = useState(0);
  
  // New Toll Booth Operator
  const [depositWeis, setDepositWeis] = useState(0);
  const [operatorOwner, setOperatorOwner] = useState('');

  // UX status
  const [message, setMessage] = useState('');

  const addVehicleType = async () => {
    
    setMessage('');
    let msg = 'Error in creating vehicle type';
    
    try {
      const txObj = await props.regulator.setVehicleType(vehicleAddress, vehicleType, { from: props.accounts[0] });
    
      if(txObj.logs.length === 1) {
        const logVehicleTypeSet = txObj.logs[0];
        if (logVehicleTypeSet.event === "LogVehicleTypeSet") {
          msg = 'Vehicle type set successfully!';
        }  
      }  
    } catch(e) {
      console.log(e);
      msg = e.message;
    }
    setMessage(msg);
  };

  const createTollBoothOperator = async () => {

    setMessage('');
    let msg = 'Error in creating Toll booth operator';
    try {
      console.log(operatorOwner, depositWeis, props.accounts[0]);
      const txObj = await props.regulator.createNewOperator(operatorOwner, depositWeis, { from: props.accounts[0], gas: 5000000 });
      if(txObj.logs.length === 2) {
        const logTollBoothOperatorCreated = txObj.logs[1];
        if (logTollBoothOperatorCreated.event === "LogTollBoothOperatorCreated") {
          msg = 'Toll booth operator created successfully!';        
        }  
      }
    } catch(e) {
      console.log(e);
      msg = e.message;
    }
    setMessage(msg);
  };

  return (

    <>
      <h1>Regulator</h1>
      Owner: {props.accounts[0]}
      <h3>{message}</h3>
      <Paper className={classes.paper}>
        <h3>Set Vehicle Type:</h3>

        <Accounts
          label='Account' 
          accounts={props.accounts.slice(1)}
          accountChanged={(account)=>setVehicleAddress(account)}/>
        <br/>
      
        <TextField
            id="outlined-name"
            label="Enter Vehicle Type"
            onChange={e => setVehicleType(e.target.value)}
            margin="normal"
            placeholder="1"
            variant="outlined"
        /><br/>  
        <Button 
            size="small" 
            variant="contained"
            color="primary"
            className={classes.button}
            disabled={!vehicleType}
            onClick={() => addVehicleType()}>
            Set Vehicle Type
        </Button>
      </Paper>
      {props.vehicles.length > 0 ? 
        <VehicleTypes vehicles={props.vehicles}/>
      : null}
      <Paper className={classes.paper}>
      <h3>Create Toll Booth Operator:</h3>
        <Accounts 
          label='Owner'
          accounts={props.accounts.slice(1)}
          accountChanged={(account)=>setOperatorOwner(account)}/>
        <br/>
      
        <TextField
            id="outlined-name"
            label="Set Deposit in Wei"
            onChange={e => setDepositWeis(e.target.value)}
            margin="normal"
            placeholder="1"
            variant="outlined"
        /><br/>
        <Button
            size="small" 
            color="primary"
            variant="contained"
            disabled={!operatorOwner}
            onClick={() => createTollBoothOperator()}>
            Create Toll Booth Operator
        </Button>
        <br/>
        {props.tbos.length > 0  ?
        <TollBoothOperators tbos={props.tbos}/> : null }
        </Paper>
    </>
    );
};

// * add toll booths.
// * add base route prices.
// * set multipliers.
// * no need to make it possible to change owners of the contract.
// * no need to make it possible to pause the contract.
// * no need to make it possible to remove toll booths.
// * no need to make it possible to change the required deposit.
// * no need to make it possible to clear one pending payment.

const TollBoothOperator = (props) => {

  const [tollBoothOperator, setTollBoothOperator] = useState(null);
  const [booths, setBooths] = useState([]);
  const [tollBoothAddress, setTollBoothAddress] = useState('');
  const [message, setMessage] = useState('');
  
  const [entryBoothAddress, setEntryBoothAddress] = useState('');
  const [exitBoothAddress, setExitBoothAddress] = useState('');
  const [routePrice, setRoutePrice] = useState(0);
  const [routePrices, setRoutePrices] = useState([]);

  const [multiplier, setMultiplier] = useState(0);
  const [vehicleType, setVehicleType] = useState(0);
  const [multipliers, setMultipliers] = useState([]);
  const [currentInstance, setCurrentInstance] = useState(null);
  const [isRunning, setRunning] = useState(false);

  const [isLoading, setLoading] = useState(false);

  let tmpTollBooths = [];
  let tmpRoutePrices = [];
  let tmpMultipliers = [];
  
  const updateTbo = async (tbo) => {
    if (tbo === tollBoothOperator)
      return;
    
    setLoading(true);
    setTollBoothOperator(tbo)
    const TollBoothOperator = TruffleContract(TollBoothOperatorArtifact);      
    TollBoothOperator.setProvider(props.web3.currentProvider);
    const instance = await TollBoothOperator.at(tbo.value.operator);
    setCurrentInstance(instance);
    
    setRunning(!(await instance.isPaused()));

    setBooths([]);

    instance.LogTollBoothAdded({}, {fromBlock:0}).watch((err, result) => {
      
      tmpTollBooths = [...tmpTollBooths, 
        { id: tmpTollBooths.length, 
        value: {  operator: result.args.sender, 
          tollBooth: result.args.tollBooth}}];
      
      setBooths(tmpTollBooths);
    });

    instance.LogRoutePriceSet({}, {fromBlock:0}).watch((err, result) => {

      tmpRoutePrices = [...tmpRoutePrices, 
        { id: tmpRoutePrices.length, 
        value: {  sender:result.args.sender, 
                  entryBooth: result.args.entryBooth, 
                  exitBooth: result.args.exitBooth,
                  priceWeis: result.args.priceWeis.toNumber() }}];
      
      setRoutePrices(tmpRoutePrices);
    });

    instance.LogMultiplierSet({}, {fromBlock:0}).watch((err, result) => {

      console.log(result);
      tmpMultipliers = [...tmpMultipliers, 
        { id: tmpMultipliers.length, 
        value: {  sender:result.args.sender, 
                  vehicleType: result.args.vehicleType.toNumber(), 
                  multiplier: result.args.multiplier.toNumber()}}];
      
      setMultipliers(tmpMultipliers);
    });

    setLoading(false);
  };

  const addTollBooth = async () => {

    console.log('Add toll booth');

    let msg = 'There was an error in adding the toll booth';

    try {
    
      console.log('currentInstance:', currentInstance);
    
      if(!currentInstance)
        return;
      
      const txObj = await currentInstance.addTollBooth(tollBoothAddress, 
                                                        {from: tollBoothOperator.value.owner, 
                                                          gas: 5000000});
            
      if(txObj.logs.length === 1) {
        const logTollBoothAdded = txObj.logs[0];
        if (logTollBoothAdded.event === "LogTollBoothAdded") {
          msg = 'Created toll booth successfully!';
        }  
      }
    } catch(e) {
      console.log(e);
      msg = e.message;
    }

    setMessage(msg);
  };

  const addBaseRoutePrice = async () => {

    console.log('Add Base Route Price');

    let msg = 'There was an error in adding the base route price';

    try {
      console.log('currentInstance:', currentInstance);

      if(!currentInstance)
        return;

      console.log(entryBoothAddress, exitBoothAddress, routePrice, tollBoothOperator.value.owner);
      const txObj = await currentInstance.setRoutePrice(entryBoothAddress, 
                                                        exitBoothAddress, 
                                                        routePrice, 
                                                        {from: tollBoothOperator.value.owner, 
                                                          gas: 5000000});
          
      if(txObj.logs.length > 1) {
        const logRoutePriceSet = txObj.logs[0];
        if (logRoutePriceSet.event === "LogRoutePriceSet") {
          msg = 'Created toll booth successfully!';
        }  
      }
    } catch(e) {
      console.log(e);
      msg = e.message;
    }

    setMessage(msg);
  };

  const setNewMultiplier = async () => {
    let msg = 'There was an error in setting the multiplier';

    try {
      console.log('currentInstance:', currentInstance);

      if(!currentInstance)
        return;
      
      const txObj = await currentInstance.setMultiplier(vehicleType, 
                                                                  multiplier, 
                                                                  {from: tollBoothOperator.value.owner, 
                                                                    gas: 5000000});
            
      if(txObj.logs.length > 0) {
        const logMultiplierSet = txObj.logs[0];
        if (logMultiplierSet.event === "LogMultiplierSet") {
          msg = 'Set multiplier successfully!';
        }  
      }
    } catch(e) {
      console.log(e);
      msg = e.message;
    }

    setMessage(msg);
  };

  const start = async () => {
    
    let msg = 'Failed to start';

    if(currentInstance) {
      const txObj = await currentInstance.setPaused(false, {from: tollBoothOperator.value.owner});

      if(txObj.logs.length > 0) {
        const logPausedSet = txObj.logs[0];
        if (logPausedSet.event === "LogPausedSet") {
          msg = 'Started successfully!';
          setRunning(true);
        }  
      }
    }
    
    setMessage(msg);
  };

  const stop = async () => {
    
    let msg = 'Failed to stop';
    
    if(currentInstance) {
      const txObj = await currentInstance.setPaused(true, {from: tollBoothOperator.value.owner});

      if(txObj.logs.length > 0) {
        const logPausedSet = txObj.logs[0];
        if (logPausedSet.event === "LogPausedSet") {
          msg = 'Stopped successfully!';
          setRunning(false);
        }  
      }
    }

    setMessage(msg);
  };

  return (
    <>
      <h1>Toll Booth Operator</h1>      
      {props.tbos.length > 0 ? 
      <>  
        {message}<br/>
        {isLoading && <CircularProgress size={68}/>}
        <br/>
        <TollBoothOperatorsSelector
          tbos={props.tbos}
          tboChanged={(tbo)=>updateTbo(tbo)}/>
        <br/>
        <br/>
        {currentInstance ?
        <>

        <div>
        {isRunning ? 
          <Button
            size="small" 
            color="secondary"
            variant="contained"
            onClick={() => stop()}>Stop</Button> : 
          <Button
            size="small" 
            color="secondary"
            variant="contained"
            onClick={() => start()}>Start</Button>}

        <h3>Add Toll Booth</h3>      
        <Accounts 
          label='Toll Booth'
          accounts={props.accounts.slice(1)}
          accountChanged={(account)=>setTollBoothAddress(account)}/> 
        <br/><br/>
        
        <Button
            size="small" 
            color="primary"
            variant="contained"
            disabled={!tollBoothOperator}
            onClick={() => addTollBooth()}>
            Add Toll Booth
        </Button>
        <TollBooths
          booths={booths}/>

        </div>
        <div>
        <h3>Add Base Route Price</h3>
          {booths.length > 1 ?
          <>
          <TollBoothSelector
            label="Entry"
            booths={booths}
            boothChanged={(account)=>setEntryBoothAddress(account)}/> 
          <br/>
          
          <TollBoothSelector
            label="Exit"
            booths={booths}
            boothChanged={(account)=>setExitBoothAddress(account)}/> 
          <br/>
          
          <TextField
              id="outlined-name"
              label="Price Wei"
              onChange={e => setRoutePrice(e.target.value)}
              margin="normal"
              placeholder="0"
              variant="outlined"
          /><br/>
          <Button
              size="small" 
              color="primary"
              variant="contained"
              disabled={!tollBoothOperator || (booths && booths.length < 2)}
              onClick={() => addBaseRoutePrice()}>
              Add Base Route Price
          </Button></> : "We need at least two booths"}
          <RoutePrices
            routePrices={routePrices}/>
        </div>
        <div>
        <h3>Set Mulitiplier</h3>
          <VehicleTypesSelector
              vehicles={props.vehicles}
              vehicleTypeChanged={(type)=>setVehicleType(type)}
              />
          <br/>
          <TextField
              id="outlined-name"
              label="Multiplier"
              onChange={e => setMultiplier(e.target.value)}
              margin="normal"
              placeholder="0"
              variant="outlined"
          /><br/>
          
          <Button
              size="small" 
              color="primary"
              variant="contained"
              disabled={!tollBoothOperator || !vehicleType || !multiplier}
              onClick={() => setNewMultiplier()}>
              Set Mulitiplier
          </Button>
          <Multipliers
            multipliers={multipliers}/>
        </div>
        </>: null}
      </> : "No Toll Booth Operators"}
    </>
  );
};

// * see its basic Ether balance.
// * make an entry deposit.
// * see its history of entry / exit.
// * no need to see its pending payments.

const Vehicle = (props) => {
  
  const [message, setMessage] = useState('');
  
  const [vehicleAddress, setVehicleAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [history, setHistory] = useState([]);
  const [clearSecret, setClearSecret] = useState('');
  const [tollBoothOperator, setTollBoothOperator] = useState(null);
  const [booths, setBooths] = useState([]);
  const [entries, setEntries] = useState([]);
  const [exits, setExits] = useState([]);
  const [entryBooth, setEntryBooth] = useState('');

  const [currentInstance, setCurrentInstance] = useState(null);
  const [isLoading, setLoading] = useState(false);

  let tmpTollBooths = [];
  let tmpEntries = [];
  let tmpExits = [];

  const update = async (tbo, vehicle) => {
    if (!tbo)
      return;
    
    setLoading(true);
    const TollBoothOperator = TruffleContract(TollBoothOperatorArtifact);      
    TollBoothOperator.setProvider(props.web3.currentProvider);
    const instance = await TollBoothOperator.at(tbo.value.operator);
    setCurrentInstance(instance);
  
    setBooths([]);
    setEntries([]);
    setExits([]);

    instance.LogTollBoothAdded({}, {fromBlock:0}).watch((err, result) => {
      
      tmpTollBooths = [...tmpTollBooths, 
        { id: tmpTollBooths.length, 
        value: {  operator: result.args.sender, 
          tollBooth: result.args.tollBooth}}];
      
      setBooths(tmpTollBooths);
    });

    instance.LogRoadEntered({vehicle: vehicleAddress}, {fromBlock:0}).watch((err, result) => {
      
      tmpEntries = [...tmpEntries, 
        { id: tmpEntries.length, 
        value: {  vehicle: result.args.vehicle, 
                  entryBooth: result.args.entryBooth,
                  exitSecretHashed: result.args.exitSecretHashed,
                  multiplier: result.args.multiplier.toNumber(),
                  depositedWeis: result.args.depositedWeis.toNumber()}}];
      
      setEntries(tmpEntries);
      
      instance.LogRoadExited({exitSecretHashed: result.args.exitSecretHashed}, {fromBlock:0}).watch((err, result) => {
      
        tmpExits = [...tmpExits, 
          { id: tmpExits.length, 
          value: {  exitBooth: result.args.exitBooth, 
            exitSecretHashed: result.args.exitSecretHashed,
                    finalFee: result.args.finalFee.toNumber(),
                  refundWeis: result.args.refundWeis.toNumber()}}];
        
        setExits(tmpExits);
      });
    });

    setLoading(false);
  };

  const updateVehicle = async (vehicle) => {
    setBalance(await props.web3.eth.getBalance(vehicle));
    setVehicleAddress(vehicle);
    update(tollBoothOperator, vehicle);
  };

  const updateTbo = async (tbo) => {
    if (tbo === tollBoothOperator)
      return;
    
    setTollBoothOperator(tbo)
    update(tbo, vehicleAddress);
  };

  const enterRoad = async () => {
    let msg = 'Invalid';

    if(clearSecret && currentInstance) {
      try {
      
        const hashedSecret = await currentInstance.hashSecret.call(clearSecret);
        const txObj = await currentInstance.enterRoad(entryBooth, hashedSecret, {from: vehicleAddress, value: deposit, gas: 5000000});
      
        if(txObj.logs.length > 0) {
          const logRoadEntered = txObj.logs[0];
          if (logRoadEntered.event === "LogRoadEntered") {
            msg = 'Road entered successfully!';
          }  
        }

      } catch(e) {
        console.log(e);
        msg = e.message;
      }
    }

    setMessage(msg);
  };

  return (
    <>
      <h1>Vehicle</h1>            
      {props.vehicles.length > 0 ? 
      <>
      {message}<br/>
      <VehicleSelector
        vehicles={props.vehicles}
        vehicleChanged={(vehicle) => updateVehicle(vehicle)}/>
      <br/>

      {vehicleAddress ? 
      <>
        <h3>Balance: {fromWei(balance.toString())} Ether</h3>
        <h3>Enter Road</h3>
        {isLoading && <CircularProgress size={68}/>}
        <br/>

        
        <TollBoothOperatorsSelector
          tbos={props.tbos}
          tboChanged={(tbo)=>updateTbo(tbo)}/>
        <br/>
        {currentInstance ?
        <>
        <TollBoothSelector
          booths={booths}
          boothChanged={(booth) => setEntryBooth(booth)}/>
        <br/>
        <TextField
            id="outlined-name"
            size="small"
            label="Secret to hash"
            onChange={e => setClearSecret(e.target.value)}
            margin="normal"
            placeholder="secret"
            variant="outlined"
        />
        <br/>
        <TextField
            id="outlined-name"
            size="small"
            label="Deposit"
            onChange={e => setDeposit(e.target.value)}
            margin="normal"
            placeholder="deposit"
            variant="outlined"
        />
        <br/>
        <Button
            size="small" 
            color="primary"
            variant="contained"
            disabled={!currentInstance || !clearSecret || !deposit || !entryBooth}
            onClick={() => enterRoad()}>
            Enter
        </Button>
        <VehicleEntries
          entries={entries}/>
        <VehicleEntries
          exits={exits}/>  
        </> : null }

      </>: null}
    </> : "No Vehicles"}
    </>
  );
};

// * report a vehicle exit.
// * be informed on the status of the refund or of the pending payment of the vehicle reported above. 
// * Typically a row in a table stating normal exit or pending payment.
// * no need to see its history of entry / exit.
const TollBooth = (props) => {
  const [message, setMessage] = useState('');
  
  const [clearSecret, setClearSecret] = useState('');
  const [tollBoothOperator, setTollBoothOperator] = useState(null);
  const [exitBooth, setExitBooth] = useState('');

  const [currentInstance, setCurrentInstance] = useState(null);

  const [exits, setExits] = useState([]);
  const [pendings, setPendings] = useState([]);
  const [booths, setBooths] = useState([]);
  const [isLoading, setLoading] = useState(false);

  let tmpPendings = [];
  let tmpExits = [];
  let tmpTollBooths = [];

  const update = async (tbo) => {
    if (!tbo)
      return;
    
    setLoading(true);
    const TollBoothOperator = TruffleContract(TollBoothOperatorArtifact);      
    TollBoothOperator.setProvider(props.web3.currentProvider);
    const instance = await TollBoothOperator.at(tbo.value.operator);
    setCurrentInstance(instance);
  
    setBooths([]);

    instance.LogTollBoothAdded({}, {fromBlock:0}).watch((err, result) => {
      
      tmpTollBooths = [...tmpTollBooths, 
        { id: tmpTollBooths.length, 
        value: {  operator: result.args.sender, 
          tollBooth: result.args.tollBooth}}];
      
      setBooths(tmpTollBooths);
    });

    setLoading(false);
  };

  const tollBoothChanged = async (booth) => {
    
    setExitBooth(booth);

    setExits([]);
    setPendings([]);
    
    if (!currentInstance)
      return;
    
    currentInstance.LogRoadExited({exitBooth: booth}, {fromBlock:0}).watch((err, result) => {
      
      tmpExits = [...tmpExits, 
        { id: tmpExits.length, 
        value: {  exitBooth: result.args.exitBooth, 
          exitSecretHashed: result.args.exitSecretHashed,
                  finalFee: result.args.finalFee.toNumber(),
                refundWeis: result.args.refundWeis.toNumber()}}];
      
      setExits(tmpExits);
    });

    currentInstance.LogPendingPayment({exitBooth: booth}, {fromBlock:0}).watch((err, result) => {
      
      tmpPendings = [...tmpPendings, 
        { id: tmpPendings.length, 
        value: {  exitSecretHashed: result.args.exitSecretHashed, 
                  entryBooth: result.args.entryBooth,
                  exitBooth: result.args.exitBooth}}];
      
      setPendings(tmpPendings);
    });
  };

  const exitRoad = async () => {
    let msg = 'Unable to exit road';
    
    try {
    if (currentInstance) {
      const txObj = await currentInstance.reportExitRoad(clearSecret, {from: exitBooth, gas: 5000000});
      if(txObj.logs.length > 0) {
        if (txObj.logs[0].event === "LogRoadExited") {
          msg = 'Road exited successfully!';
        } else {
          msg = 'Pending payment';
        }  
      }
    }
    } catch(e) {
      console.log(e);
      msg = e.message;
    }
    setMessage(msg);
  };

  return (
    <>
      <h1>Toll Booth</h1>
      
      {message}<br/>
      {isLoading && <CircularProgress size={68}/>}
      <br/>
      <TollBoothOperatorsSelector
          tbos={props.tbos}
          tboChanged={(tbo)=>update(tbo)}/>
      <br/>
      {currentInstance ?
      <>
      <TollBoothSelector
        booths={booths}
        boothChanged={(booth) => tollBoothChanged(booth)}/>

      <br/>
      <TextField
          id="outlined-name"
          size="small"
          label="Clear secret"
          onChange={e => setClearSecret(e.target.value)}
          margin="normal"
          placeholder="secret"
          variant="outlined"
      />
      <br/>
      <Button
            size="small" 
            color="primary"
            variant="contained"
            disabled={!currentInstance || !clearSecret || !exitBooth}
            onClick={() => exitRoad()}>
            Exit
      </Button>
      <VehicleExits
        exits={exits}/>
      <VehiclePendings
        pendings={pendings}/>
        
      </>: null}
    </>
  );
};

const TabView = (props) => {
  
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  function handleChange(event, newValue) {
    setValue(newValue);
  }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Regulator" />
          <Tab label="Toll Booth Operator" />
          <Tab label="Vehicle" />
          <Tab label="Toll Booth" />
        </Tabs>
      </AppBar>
      {value === 0 && <Regulator {...props}/>}
      {value === 1 && <TollBoothOperator {...props}/>}
      {value === 2 && <Vehicle {...props}/>}
      {value === 3 && <TollBooth {...props}/>}
    </div>
  );
};

class App extends Component {

  state = {web3: null, regulator: null, tbos: [], vehicles: [], booths: [], accounts: []};
  
  handleChange(event, newValue) {
    this.setState({value: newValue});
  }

  componentDidMount = async () => {
    try {
      // Workaround for compatibility between web3 and truffle-contract
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;	
	    const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const Regulator = TruffleContract(RegulatorArtifact);      
      Regulator.setProvider(web3.currentProvider);
      const instance = await Regulator.deployed();
    	
      this.setState({ web3:web3, accounts:accounts, regulator:instance });
      // Listen to Vehicle types
      instance.LogVehicleTypeSet({}, {fromBlock:0}).watch((err, result) => {

        this.setState({vehicles:[...this.state.vehicles, 
                                    { id: this.state.vehicles.length, 
                                      value: {  address: result.args.vehicle, 
                                                  type: result.args.vehicleType.toNumber()}}]});
      });

      instance.LogTollBoothOperatorCreated({}, {fromBlock:0}).watch((err, result) => {

        this.setState({tbos:[...this.state.tbos, 
                                { id: this.state.tbos.length, 
                                  value: {  operator: result.args.newOperator, 
                                              owner: result.args.owner,
                                              deposit: result.args.depositWeis.toNumber()}}]});

        console.log(this.state.tbos);
      });

    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );

      console.error(error);
    }
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    
    return (
      <div className="App">
        <TabView {...this.state}/>
      </div>
    );
  }
}

export default App;
