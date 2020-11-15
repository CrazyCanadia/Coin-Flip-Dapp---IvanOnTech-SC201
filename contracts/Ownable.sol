pragma solidity 0.5.12;

contract Ownable{

    address public owner;
    uint256 public contractBalance;
    uint256 public activeBets;
    bool public betsAllowed;
    uint256 public MIN_BET;
    uint256 public MAX_BET;
    uint256 public SELF_DESTRUCT_TIMER;

    modifier onlyOwner(){
        require(msg.sender == owner);
        _; //Continue Execution
    }

    constructor() public {
        owner = msg.sender;
        activeBets = 0;
        betsAllowed = true;
        MIN_BET = 10000000000000000;
        MAX_BET = 2000000000000000000;
        SELF_DESTRUCT_TIMER = 0;
        //contractBalance = msg.value;
    }

}
