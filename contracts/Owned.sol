pragma solidity ^0.5.0;
import { OwnedI } from "./interfaces/OwnedI.sol";

contract Owned is OwnedI {

    /*
     * You need to create:
     *
     * - a contract named `Owned` that:
     *     - is a `OwnedI`.
     *     - has a modifier named `fromOwner` that rolls back the transaction if the
     * transaction sender is not the owner.
     *     - has a constructor that takes no parameter, or you omit it.
     */

    address currentOwner;

    constructor() public {
        currentOwner = msg.sender;
    }

    modifier fromOwner {
        require(msg.sender == currentOwner, 'Not the owner');
        _;
    }

    /**
     * Sets the new owner for this contract.
     *     It should roll back if the caller is not the current owner.
     *     It should roll back if the argument is the current owner.
     *     It should roll back if the argument is a 0 address.
     * @param newOwner The new owner of the contract
     * @return Whether the action was successful.
     * Emits LogOwnerSet with:
     *     The sender of the action.
     *     The new owner.
     */
    function setOwner(address newOwner)
        public
        returns(bool success) {
        require(msg.sender == currentOwner, 'Not the owner');
        require(msg.sender != newOwner, 'Current owner');
        require(newOwner != address(0x0), 'Invalid newOwner');

        emit LogOwnerSet(msg.sender, newOwner);
        currentOwner = newOwner;
        return true;
    }

    /**
     * @return The owner of this contract.
     */
    function getOwner()
        public
        view
        returns(address owner) {
        return currentOwner;
    }
}