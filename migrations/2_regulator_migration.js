const Regulator = artifacts.require("./Regulator.sol");
const TollBoothOperator = artifacts.require("./TollBoothOperator.sol");

// * deploy a regulator,
// * then call `createNewOperator` on it.
// * then resume the newly created operator, which should be paused before the resume step.

module.exports = function(deployer, network, accounts) {

    deployer.deploy(Regulator)
        .then(() => Regulator.deployed())
        .then(instance => instance.createNewOperator( accounts[1], 10, {from:accounts[0], gas: 5000000}))
        .then(txObj => TollBoothOperator.at(txObj.logs[1].args.newOperator))
        .then(tbo => tbo.setPaused(false, {from: accounts[1], gas:5000000}));
}
