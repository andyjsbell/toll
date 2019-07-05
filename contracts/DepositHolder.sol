pragma solidity ^0.5.0;

import {DepositHolderI} from "./interfaces/DepositHolderI.sol";
import {Owned} from "./Owned.sol";
/*
* You need to create:
*
* - a contract named `DepositHolder` that:
*     - is `OwnedI`, and `DepositHolderI`.
*     - has a constructor that takes:
*         - one `uint` parameter, the initial deposit wei value, which cannot be 0.
*/

contract DepositHolder is Owned, DepositHolderI {

    uint currentDepositWeis;
    /**
     * Event emitted when the deposit value has been set.
     * @param sender The account that ran the action.
     * @param depositWeis The value of the deposit measured in weis.
     */
    event LogDepositSet(address indexed sender, uint depositWeis);

    constructor(uint deposit) public {
        require(deposit > 0, 'Deposit cannot be 0');
        currentDepositWeis = deposit;
    }
    /**
     * Called by the owner of the DepositHolder.
     *     It should roll back if the caller is not the owner of the contract.
     *     It should roll back if the argument passed is 0.
     *     It should roll back if the argument is no different from the current deposit.
     * @param depositWeis The value of the deposit being set, measured in weis.
     * @return Whether the action was successful.
     * Emits LogDepositSet with:
     *     The sender of the action.
     *     The new value that was set.
     */
    function setDeposit(uint depositWeis)
        public
        fromOwner
        returns(bool success) {
            require(depositWeis > 0, 'Deposit cannot be 0');
            require(currentDepositWeis != depositWeis, 'Deposit needs to be different to current');

            emit LogDepositSet(msg.sender, depositWeis);
            currentDepositWeis = depositWeis;

            return true;
        }

    /**
     * @return The base price, then to be multiplied by the multiplier, a given vehicle
     * needs to deposit to enter the road system.
     */
    function getDeposit()
        public
        view
        returns(uint weis) {

            return currentDepositWeis;

        }

 
}