pragma solidity ^0.5.0;
import {MultiplierHolderI} from "./interfaces/MultiplierHolderI.sol";
import {Owned} from "./Owned.sol";
/*
* You need to create:
*
* - a contract named `MultiplierHolder` that:
*     - is `OwnedI` and `MultiplierHolderI`.
*     - has a constructor that takes no parameter, or you omit it.
*/

contract MultiplierHolder is Owned, MultiplierHolderI {

    mapping(uint => uint) multipliers;

    constructor() public {
        
    }
    
    /**
     * Event emitted when a new multiplier has been set.
     * @param sender The account that ran the action.
     * @param vehicleType The type of vehicle for which the multiplier was set.
     * @param multiplier The actual multiplier set.
     */
    event LogMultiplierSet(
        address indexed sender,
        uint indexed vehicleType,
        uint multiplier);

    /**
     * Called by the owner of the MultiplierHolder.
     *     Can be used to update a value.
     *     It should roll back if the caller is not the owner of the contract.
     *     It should roll back if the vehicle type is 0.
     *     Setting the multiplier to 0 is equivalent to removing it and is an acceptable action.
     *     It should roll back if the same multiplier is already set to the vehicle type.
     * @param vehicleType The type of the vehicle being set.
     * @param multiplier The multiplier to use.
     * @return Whether the action was successful.
     * Emits LogMultiplierSet with:
     *     The sender of the action.
     *     The vehicle type that was modified.
     *     The new multiplier that was set.
     */
    function setMultiplier(
            uint vehicleType,
            uint multiplier)
        public
        fromOwner
        returns(bool success) {
            require(vehicleType != 0, 'Vehicle type is invalid');
            require(multipliers[vehicleType] != multiplier, 'Vehicle type is invalid');

            emit LogMultiplierSet(msg.sender, vehicleType, multiplier);
            multipliers[vehicleType] = multiplier;

            return true;
        }

    /**
     * @param vehicleType The type of vehicle whose multiplier we want
     *     It should accept a vehicle type equal to 0.
     * @return The multiplier for this vehicle type.
     *     A 0 value indicates a non-existent multiplier.
     */
    function getMultiplier(uint vehicleType)
        public
        view
        returns(uint multiplier) {

            return multipliers[vehicleType];
        }
}