pragma solidity ^0.5.0;

contract Queue {
    mapping(uint => bytes32) queue;
    uint first = 1;
    uint last = 0;

    function enqueue(bytes32 data) public {
        last += 1;
        queue[last] = data;
    }

    function dequeue() public returns (bytes32 data) {
        require(last >= first, 'Non-empty queue');  // non-empty queue

        data = queue[first];

        delete queue[first];
        first += 1;
    }
}
