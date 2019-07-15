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
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
// {loading && <CircularProgress size={24} className={classes.buttonProgress} />}

// TODO

// Use call to check calls
// Add progress from material and loading state to components to lock button until transaction
// Can we filter the logs to give latest instead of lists valid for page load?


const Web3 = require('web3');
const { fromWei, padLeft, toBN } = Web3.utils;
const TruffleContract = require('truffle-contract');
const RegulatorArtifact = require('./contracts/Regulator.json');
const TollBoothOperatorArtifact = require('./contracts/TollBoothOperator.json');

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
  },
  input: {
    display: 'none',
  },
  root: {
    width: '100%',
  },
  paper: {
    marginTop: theme.spacing(3),
    width: '100%',
    overflowX: 'auto',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 650,
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
    <FormControl className={classes.formControl} error>
      <InputLabel htmlFor="name">{label}</InputLabel>
        {accounts.length > 0 ?
            <Select
                value={account}
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
    <FormControl className={classes.formControl} error>
      <InputLabel htmlFor="name">Vehicle Type</InputLabel>
        {vehicles ?
            <Select
                value={vehicleType}
                onChange={e => update(e.target.value)}>
                {
                    vehicles.map( (vehicle) => (
                        <MenuItem key={vehicle.id} value={vehicle.value.type}>{vehicle.value.type}</MenuItem>
                    ))
                }
                <MenuItem value="" disabled>
                  Vehicle Type
                </MenuItem>
            </Select>:'No operators!'}
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
    <FormControl className={classes.formControl} error>
      <InputLabel htmlFor="name">Operator</InputLabel>
        {tbos.length > 0 ?
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
                
            </Select>:'No operators!'}
    </FormControl>
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

const TollBoothSelector = ({booths, boothChanged}) => {
  const classes = useStyles();
  const [booth, setBooth] = useState(null);

  const update = (selected) => {
    setBooth(selected);
    boothChanged(selected);
  };

  return (
    <FormControl className={classes.formControl} error>
      <InputLabel htmlFor="name">Toll Booth</InputLabel>
        {booths.length > 0 ?
            <Select
                value={booth}
                onChange={e => update(e.target.value)}
                displayEmpty>
                <MenuItem value="" disabled>
                  Toll Booth
                </MenuItem>
                {
                    booths.map( (booth) => (
                        <MenuItem key={booth.id} value={booth.value.tollBooth}>{booth.value.tollBooth}</MenuItem>
                    ))
                }
                
            </Select>: null}
    </FormControl>
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
    }
    setMessage(msg);
  };

  const createTollBoothOperator = async () => {

    setMessage('');
    let msg = 'Error in creating Toll booth operator';
    try {
      const txObj = await props.regulator.createNewOperator(operatorOwner, depositWeis, { from: props.accounts[0], gas: 5000000 });
      if(txObj.logs.length === 2) {
        const logTollBoothOperatorCreated = txObj.logs[1];
        if (logTollBoothOperatorCreated.event === "LogTollBoothOperatorCreated") {
          msg = 'Toll booth operator created successfully!';
        }  
      }
    } catch(e) {
      console.log(e);
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
          accounts={props.accounts}
          accountChanged={(account)=>setVehicleAddress(account)}/>
        <br/>
      
        <TextField
            id="outlined-name"
            label="0..."
            onChange={e => setVehicleType(e.target.value)}
            margin="normal"
            placeholder="Enter Vehicle Type"
            variant="outlined"
        /><br/>  
        <Button 
            size="small" 
            variant="contained"
            color="primary"
            className={classes.button}
            disabled={vehicleType}
            onClick={() => addVehicleType()}>
            Set Vehicle Type
        </Button>
      </Paper>
      
      <VehicleTypes vehicles={props.vehicles}/>
      <Paper className={classes.paper}>
      <h3>Create Toll Booth Operator:</h3>
        <Accounts 
          label='Owner'
          accounts={props.accounts}
          accountChanged={(account)=>setOperatorOwner(account)}/>
        <br/>
      
        <TextField
            id="outlined-name"
            label="0"
            onChange={e => setDepositWeis(e.target.value)}
            margin="normal"
            placeholder="Set Deposit in Wei"
            variant="outlined"
        /><br/>
        <Button
            size="small" 
            color="primary"
            variant="contained"
            disabled={operatorOwner}
            onClick={() => createTollBoothOperator()}>
            Create Toll Booth Operator
        </Button>
        <br/>
        <TollBoothOperators tbos={props.tbos}/>
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
  const [tollBooths, setTollBooths] = useState([]);

  const [entryBoothAddress, setEntryBoothAddress] = useState('');
  const [exitBoothAddress, setExitBoothAddress] = useState('');
  const [routePrice, setRoutePrice] = useState(0);
  const [baseRoutePrices, setBaseRoutePrices] = useState([]);

  const [multiplier, setMultiplier] = useState(0);
  const [vehicleType, setVehicleType] = useState(0);
  const [multipliers, setMultipliers] = useState([]);
  const [currentInstance, setCurrentInstance] = useState(null);
  
  let a = [];

  const updateTbo = async (tbo) => {
    if (tbo === tollBoothOperator)
      return;
    
    setTollBoothOperator(tbo)
    const TollBoothOperator = TruffleContract(TollBoothOperatorArtifact);      
    TollBoothOperator.setProvider(props.web3.currentProvider);
    const instance = await TollBoothOperator.at(tbo.value.operator);
    setCurrentInstance(instance);
  
    setBooths([]);

    instance.LogTollBoothAdded({}, {fromBlock:0}).watch((err, result) => {
      
      a = [...a, 
        { id: booths.length, 
        value: {  operator: result.args.sender, 
          tollBooth: result.args.tollBooth}}];
      
      setBooths(a);
    });
  };

  const addTollBooth = async () => {

    console.log('Add toll booth');

    let msg = 'There was an error in adding the toll booth';

    try {
    
      console.log('currentInstance:', currentInstance);
    
      if(!currentInstance)
        return;
      
      const txObj = await currentInstance.addTollBooth(tollBoothAddress, {from: tollBoothOperator.value.owner, gas: 500000});
            
      if(txObj.logs.length === 1) {
        const logTollBoothAdded = txObj.logs[0];
        if (logTollBoothAdded.event === "LogTollBoothAdded") {
          msg = 'Created toll booth successfully!';
        }  
      }
    } catch(e) {
      console.log(e);
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
      
      const txObj = await currentInstance.setRoutePrice(entryBoothAddress, 
                                                        exitBoothAddress, 
                                                        routePrice, 
                                                        {from: tollBoothOperator.owner, 
                                                          gas: 500000});
          
      if(txObj.logs.length > 1) {
        const logRoutePriceSet = txObj.logs[0];
        if (logRoutePriceSet.event === "LogRoutePriceSet") {
          msg = 'Created toll booth successfully!';
          setBaseRoutePrices([...baseRoutePrices, 
                              { id: baseRoutePrices.length, 
                                value: {entry: logRoutePriceSet.args.entryBooth,
                                         exit: logRoutePriceSet.args.exitBooth,
                                        price: logRoutePriceSet.args.priceWeis}}]);
        }  
      }
    } catch(e) {
      console.log(e);
    }

    setMessage(msg);
  };

  const setNewMultiplier = async () => {
    console.log('Set New Multiplier');

    let msg = 'There was an error in setting the multiplier';

    try {
      console.log('currentInstance:', currentInstance);

      if(!currentInstance)
        return;
      
      const txObj = await currentInstance.setMultiplier(vehicleType, 
                                                                  multiplier, 
                                                                  {from: tollBoothOperator.owner, 
                                                                    gas: 500000});
            
      if(txObj.logs.length > 1) {
        const logMultiplierSet = txObj.logs[0];
        if (logMultiplierSet.event === "LogMultiplierSet") {
          msg = 'Set multiplier successfully!';
          setMultiplier([...multipliers, 
                        {   id: multipliers.length, 
                          value: {type: logMultiplierSet.args.vehicleType,
                            multiplier: logMultiplierSet.args.multiplier}}]);
        }  
      }
    } catch(e) {
      console.log(e);
    }

    setMessage(msg);
  };

  return (
    <>
      <h1>Toll Booth Operator</h1>

      <h3>Select Operator</h3>      
      {message}<br/>
      
      <TollBoothOperatorsSelector
        tbos={props.tbos}
        tboChanged={(tbo)=>updateTbo(tbo)}/>
      <br/>
      <br/>
      <div>
      <h3>Add Toll Booth</h3>      
      <Accounts 
        label='Toll Booth'
        accounts={props.accounts}
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
        <TollBoothSelector
          booths={booths}
          boothChanged={(account)=>setEntryBoothAddress(account)}/> 
        <br/>
        
        <TollBoothSelector
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
        </Button>
        {baseRoutePrices.length > 0 ?
        <div>
        <h3>Base Route Prices</h3>
        <div>
        <ul>
          {baseRoutePrices.map((rp) =>
            <li key={rp.id}>
              {rp.value.entry} - {rp.value.exit} - {rp.value.price} 
            </li>
          )}
        </ul>
        </div>
        </div> 
      : null}
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
            disabled={!tollBoothOperator}
            onClick={() => setNewMultiplier()}>
            Set Mulitiplier
        </Button>
        {multipliers.length > 0 ?
        <div>
        <h3>Multipliers</h3>
        <div>
        <ul>
          {multipliers.map((mp) =>
            <li key={mp.id}>
              {mp.value.type} - {mp.value.multiplier} 
            </li>
          )}
        </ul>
        </div>
        </div> 
      : null}
      </div>
    </>
  );
};

// * see its basic Ether balance.
// * make an entry deposit.
// * see its history of entry / exit.
// * no need to see its pending payments.

const Vehicle = ({web3, testString}) => {
  const [vehicleAddress, setVehicleAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [clearSecret, setClearSecret] = useState('');

  const getHash = async () => {

  };

  const getVehicleDetails = async () => {
    setBalance(await web3.eth.getBalance(vehicleAddress));
  };

  return (
    <>
      <h1>Vehicle - {testString}</h1>
      <h3>Get Balance</h3>
      <TextField
          id="outlined-name"
          size="small"
          label="0x0"
          onChange={e => setVehicleAddress(e.target.value)}
          margin="normal"
          placeholder="Enter Vehicle Address (0x0)"
          variant="outlined"
      />
      <br/>
      <Button
          size="small" 
          color="primary"
          variant="contained"
          onClick={() => getVehicleDetails()}>
          Get Vehicle Details
      </Button>

      <h3>Balance: {fromWei(balance.toString())} Ether</h3>

      <h3>Enter Road</h3>
      <TextField
          id="outlined-name"
          size="small"
          label="Secret to hash"
          onChange={e => setClearSecret(e.target.value)}
          margin="normal"
          placeholder="secret"
          variant="outlined"
      />
      
      <Button
          size="small" 
          color="primary"
          variant="contained"
          onClick={() => getHash()}>
          Get Hash
      </Button>

      {/* <TextField
          id="outlined-name"
          size="small"
          label="Enter Entry Booth"
          onChange={e => setBoothAddress(e.target.value)}
          margin="normal"
          placeholder="0x0"
          variant="outlined"
      />
      <TextField
          id="outlined-name"
          size="small"
          label="Hashed secret"
          value={hashedSecret}
          disabled="true"
          margin="normal"
          placeholder="0x0"
          variant="outlined"
      />
      <TextField
          id="outlined-name"
          size="small"
          label="Deposit"
          onChange={e => setDeposit(e.target.value)}
          margin="normal"
          placeholder="0"
          variant="outlined"
      />
      <br/>
      <Button
          size="small" 
          color="primary"
          variant="contained"
          onClick={() => enterRoad()}>
          Enter
      </Button> */}
    </>
  );
};

// * report a vehicle exit.
// * be informed on the status of the refund or of the pending payment of the vehicle reported above. 
// * Typically a row in a table stating normal exit or pending payment.
// * no need to see its history of entry / exit.
const TollBooth = ({}) => {
  return (
    <>
      <h1>Toll Booth</h1>
    </>
  );
};

class App extends Component {

  state = {web3: null, regulator: null, tbos: [], vehicles: [], booths: [], accounts: []};
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
        <Regulator {...this.state}/>
        <TollBoothOperator {...this.state}/>
        {/* <Vehicle
          web3={this.state.web3}
          tollBoothOperatorInstance={this.state.tollBoothOperatorInstance}
        />
        <TollBooth
          web3={this.state.web3}
          tollBoothOperatorInstance={this.state.tollBoothOperatorInstance}/> */}
      </div>
    );
  }
}

export default App;
