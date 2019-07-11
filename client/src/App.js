import React, { Component, useState, useEffect } from 'react';

import RegulatorContract from './contracts/Regulator.json'
import OperatorContract from './contracts/TollBoothOperator.json'
import getWeb3 from "./utils/getWeb3";
import TextField from '@material-ui/core/TextField';
// import Button from '@material-ui/core/Button';
// import Select from '@material-ui/core/Select';

import "./App.css";

// * a page for the deployed `Regulator`'s owner, which allows it to:
//   * set vehicle types.
//   * create a new `TollBoothOperator`.

const Regulator = ({regulator}) => {
  
  const [address, setAddress] = useState('');

  const addVehicleType = () => {

  };

  return (
    <>
      <h1>Regulator</h1>
      <h3>{regulator._address}</h3>

      <h3>Add Vehicle Type:</h3>
      <TextField
          id="outlined-name"
          label="0x0"
          onChange={e => setAddress(e.target.value)}
          margin="normal"
          placeholder="Enter Vehicle Address"
          variant="outlined"
      />   
      <TextField
          id="outlined-name"
          label="0..."
          onChange={e => setAddress(e.target.value)}
          margin="normal"
          placeholder="Enter Vehicle Type"
          variant="outlined"
      />  
      {/* <Button 
          size="small" 
          color="primary"
          onClick={() => addVehicleType()}>
          Add Vehicle Type
      </Button> */}
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
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = RegulatorContract.networks[networkId];
      const regulator = new web3.eth.Contract(
        RegulatorContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, regulator: regulator });
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
        <Regulator
          regulator={this.state.regulator}/>
        <TollBoothOperator></TollBoothOperator>
        <Vehicle></Vehicle>
        <TollBooth></TollBooth>
      </div>
    );
  }
}

export default App;
