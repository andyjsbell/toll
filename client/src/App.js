import React, { Component, useState, useEffect } from 'react';
import getWeb3 from "./utils/getWeb3";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import "./App.css";

const Web3 = require('web3');
const TruffleContract = require('truffle-contract');
const RegulatorArtifact = require('./contracts/Regulator.json');


// * a page for the deployed `Regulator`'s owner, which allows it to:
//   * set vehicle types.
//   * create a new `TollBoothOperator`.
const Accounts = ({accounts}) => {
  const listItems = accounts.map((account) =>
    <li key={account}>
      {account}
    </li>
  );
  return (
    <>
      <ul>
        {listItems}
      </ul>
    </>
  );
};

const Regulator = ({owner, regulator}) => {
  
  // Vehicle address in type
  const [vehicleAddress, setVehicleAddress] = useState('');
  const [vehicleType, setVehicleType] = useState(0);
  const [depositWeis, setDepositWeis] = useState(0);
  const [message, setMessage] = useState('');

  const addVehicleType = async () => {
    
    setMessage('');
    let msg = 'Error in creating vehicle type';
    
    const txObj = await regulator.setVehicleType(vehicleAddress, vehicleType, { from: owner });
    
    if(txObj.logs.length === 1) {
      const logVehicleTypeSet = txObj.logs[0];
      if (logVehicleTypeSet.event === "LogVehicleTypeSet") {
        msg = 'Vehicle type created!';
      }  
    }

    setMessage(msg);
  };

  const createTollBoothOperator = async () => {
    //bool paused, uint depositWeis, address regulator
    const txObj = await regulator.createNewOperator(false, depositWeis, regulator, { from: owner });
  };

  console.log(regulator);
  return (

    <>
      <h1>Regulator: {regulator.address}</h1>
      <h3>Owner: {owner}</h3>

      <h3>Add Vehicle Type:</h3>
      <TextField
          id="outlined-name"
          label="0x0"
          onChange={e => setVehicleAddress(e.target.value)}
          margin="normal"
          placeholder="Enter Vehicle Address"
          variant="outlined"
      />
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
          color="primary"
          onClick={() => addVehicleType()}>
          Add Vehicle Type
      </Button>

      <h3>Create Toll Booth Operator</h3>
      <TextField
          id="outlined-name"
          label="0"
          onChange={e => setDepositWeis(e.target.value)}
          margin="normal"
          placeholder="Set Deposit { from: owner }in Wei"
          variant="outlined"
      /><br/>
      <Button
          size="small" 
          color="primary"
          onClick={() => createTollBoothOperator()}>
          Create Toll Booth Operator
      </Button>
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

const TollBoothOperator = ({}) => {
  return (
    <>
      <h1>TollBoothOperator</h1>
    </>
  );
};

// * see its basic Ether balance.
// * make an entry deposit.
// * see its history of entry / exit.
// * no need to see its pending payments.

const Vehicle = ({}) => {
  return (
    <>
      <h1>Vehicle</h1>
    </>
  );
};

// * report a vehicle exit.
// * be informed on the status of the refund or of the pending payment of the vehicle reported above. Typically a row in a table stating normal exit or pending payment.
// * no need to see its history of entry / exit.
const TollBooth = ({}) => {
  return (
    <>
      <h1>TollBooth</h1>
    </>
  );
};


class App extends Component {
  state = { web3: null, accounts: null, regulator: null };

  componentDidMount = async () => {
    try {
      // Workaround for compatibility between web3 and truffle-contract
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;	
	    const web3 = await getWeb3();
	    const accounts = await web3.eth.getAccounts();
	    const Regulator = TruffleContract(RegulatorArtifact);
    	Regulator.setProvider(web3.currentProvider);
	    console.log('accounts --> ' + accounts);
    	const instance = await Regulator.deployed();
    	console.log('regulator.address --> ' + instance.address);
      
      this.setState({ web3, accounts, regulator:instance });

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
        <Accounts
          accounts={this.state.accounts}/>
        <Regulator
          regulator={this.state.regulator}
          owner={this.state.accounts[0]}/>
        <TollBoothOperator></TollBoothOperator>
        <Vehicle></Vehicle>
        <TollBooth></TollBooth>
      </div>
    );
  }
}

export default App;
