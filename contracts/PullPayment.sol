pragma solidity ^0.5.0;
import {PullPaymentA} from "./interfaces/PullPaymentA.sol";
import {SafeMath} from "./SafeMath.sol";

/*
* You need to create:
*
* - a contract named `PullPayment` that:
*     - is `PullPaymentA`.
*     - has a constructor that takes no parameter, or you omit it.
*/

contract PullPayment is PullPaymentA {

    using SafeMath for uint;

    mapping(address => uint) balances;
    /**
     * Called by a child contract to pay an address by way of withdraw pattern.
     * @param whom The account that is to receive the amount.
     * @param amount The amount that is to be received.
     */
    function asyncPayTo(address whom, uint amount)
        internal {
            require(whom != address(0x0), 'Invalid address');
            require(amount > 0, 'Invalid amount');
            balances[whom] = balances[whom].add(amount);
        }

    /**
     * Called by anyone that is owed a payment.
     *     It should roll back if the caller has 0 to withdraw.
     *     It should use the `.call.value` syntax and not limit the gas passed.
     *     Tests will use GreedyRecipient.sol to make sure a lot of gas is passed.
     * @return Whether the action was successful.
     * Emits LogPaymentWithdrawn with:
     *     The sender of the action, to which the payment is sent.
     *     The amount that was withdrawn.
     */
    function withdrawPayment()
        public
        returns(bool success) {
            require(balances[msg.sender] > 0, 'No balance available');
            uint amount = balances[msg.sender];
            balances[msg.sender] = 0;
            emit LogPaymentWithdrawn(msg.sender, amount);
            msg.sender.call.value(amount)("");
            return true;
        }

    /**
     * @param whose The account that is owed a payment.
     * @return The payment owed to the address parameter.
     */
    function getPayment(address whose)
        public
        view
        returns(uint weis) {
            require(whose != address(0x0), 'Invalid address');
            return balances[whose];
        }
}