pragma solidity ^0.5.0;

import { RegulatorI } from "./interfaces/RegulatorI.sol";
import { RegulatedI } from "./interfaces/RegulatedI.sol";

contract Regulated is RegulatedI {

    address currentRegulator;
    /*
     * You need to create:
     *
     * - a contract named `Regulated` that:
     *     - is a `RegulatedI`.
     *     - has a constructor that takes one `address` parameter, the initial regulator, which cannot be 0
     *       and which is assumed to be a `RegulatorI`. It is not necessary to prove it is a `RegulatorI`.
     */

    constructor(address regulator) public {
        require(regulator != address(0x0), 'Invalid regulator');
        currentRegulator = regulator;
    }

    /**
     * Event emitted when a new regulator has been set.
     * @param previousRegulator The previous regulator of the contract.
     * @param newRegulator The new, and current, regulator of the contract.
     */
    event LogRegulatorSet(
        address indexed previousRegulator,
        address indexed newRegulator);

    /**
     * Sets the new regulator for this contract.
     *     It should roll back if any address other than the current regulator of this contract
     *       calls this function.
     *     It should roll back if the new regulator address is 0.
     *     It should roll back if the new regulator is the same as the current regulator.
     * @param newRegulator The new desired regulator of the contract. It is assumed, that this is the
     *     address of a `RegulatorI` contract. It is not necessary to prove it is a `RegulatorI`.
     * @return Whether the action was successful.
     * Emits LogRegulatorSet with:
     *     The sender of the action.
     *     The new regulator.
     */
    function setRegulator(address newRegulator)
        public
        returns(bool success) {

            require(msg.sender != newRegulator, 'Need to be regulator');
            require(newRegulator != address(0x0), 'Invalid address');
            require(newRegulator != currentRegulator, 'Already regulator');

            emit LogRegulatorSet(currentRegulator, newRegulator);

            currentRegulator = newRegulator;
            return true;

        }

    /**
     * @return The current regulator.
     */
    function getRegulator()
        public
        view
        returns(RegulatorI regulator) {

            return RegulatorI(currentRegulator);

        }

}