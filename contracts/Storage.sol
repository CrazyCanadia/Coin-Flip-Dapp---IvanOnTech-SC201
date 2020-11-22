pragma solidity 0.5.12;

contract Storage{


    address public owner;
    address public currentAddress; //This is the address of the functional contract in the backend of the proxy
    uint256 public contractBalance;
    uint256 public activeBets;
    uint256 public MIN_BET;
    uint256 public MAX_BET;
    bool public SELF_DESTRUCT_TIMER;
    bool public betsAllowed;

    uint256 public totalLiabilities; //total potential payouts needing to be accounted for
    uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1; //This is for usingProvable to return a byte of info
    uint256 public currentTxPrice; //This is called and calculated from the provableAPI service
    uint256 public processingFee = 5000000000000000; //This is the overall cost as a fee taken by the contract
    bytes32 public queryId;//For testing only
    bytes32 public blank = 0x0000000000000000000000000000000000000000000000000000000000000000;

    uint256 public LPTokenPool;
    uint256 public currentLPGen;
    //uint public totalLPTokens;

    //User details are recorded in a mapping of a struct.
    struct UserData {
      uint256 account_balance; //The account_balance is for an individual players winnings to sit seperate from the community pool.
      uint256 bet_amount; //Recording the user's bet
      bool heads_or_tails; //Recording their choice
      bytes32 ticket_num; //Change theis to ticket_num... where the ticket_num = queryId of active bet        //Allowing determination of a player who is "actively" waiting.
    }

    struct LP_Provider {
      uint256 genNum;
      uint256 LP_token_amount;
    }

    mapping (string => uint256) _uintStorage;
    mapping (string => address) _addressStorage;
    mapping (string => bool) _boolStorage;
    mapping (string => string) _stringStorage;
    mapping (string => bytes4) _bytes4Storage;
    mapping (string => bytes32) _bytes32Storage;

    mapping(bytes32 => address) public userQueryId; //internal is used to limit access to the receipt number
    mapping(address => UserData) public m_userData;
    mapping (address => LP_Provider) public m_LP_tokens;


    modifier onlyProvider(){ //a modifier only for those with a liquidity balance or a winning account_balance
        require(m_LP_tokens[msg.sender].LP_token_amount != 0 || m_userData[msg.sender].account_balance != 0);
        _; //Continue Execution
    }

    modifier onlyOwner(){
        require(msg.sender == owner);
        _; //Continue Execution
    }

    modifier isNotPaused(){
        require(betsAllowed == true);
        _; //Continue Execution
    }

    constructor() public {
        owner = msg.sender;
        activeBets = 0;
        betsAllowed = true;
        MIN_BET = 10000000000000000;
        MAX_BET = 2000000000000000000;
        SELF_DESTRUCT_TIMER = false;
        LPTokenPool = 0;
        currentLPGen = 0;
        //contractBalance = msg.value;
    }


}
