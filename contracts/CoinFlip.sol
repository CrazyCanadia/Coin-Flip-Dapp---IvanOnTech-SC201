import "./Ownable.sol";
import "./Destroyable.sol";
import "./provableAPI.sol";
import "./UsesLiquidityProviders.sol";
import "./SafeMath.sol";


/* --- This is an educational project by @CrazyCanadia. It is a Coin Flip betting Dapp 15/11/2020 --- */
pragma solidity 0.5.12;

contract CoinFlip is Ownable, UsesLiquidityProviders, Destroyable, usingProvable {

  using SafeMath for uint256; //Uses SafeMath from OpenZeppelin to help avoid errrors.

  uint256 public totalLiabilities; //total potential payouts needing to be accounted for
  uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1; //This is for usingProvable to return a byte of info
  uint256 public currentTxPrice; //This is called and calculated from the provableAPI service
  uint256 public processingFee = 5000000000000000; //This is the overall cost as a fee taken by the contract
  bytes32 public queryId;//For testing only
  bytes32 public blank = 0x0000000000000000000000000000000000000000000000000000000000000000;

  //User details are recorded in a mapping of a struct.
  struct UserData {
    uint256 account_balance; //The account_balance is for an individual players winnings to sit seperate from the community pool.
    uint256 bet_amount; //Recording the user's bet
    bool heads_or_tails; //Recording their choice
    bytes32 ticket_num; //Change theis to ticket_num... where the ticket_num = queryId of active bet        //Allowing determination of a player who is "actively" waiting.
  }

  mapping(bytes32 => address) public userQueryId; //internal is used to limit access to the receipt number
  mapping(address => UserData) public m_userData;

  event LogNewProvableQuery(string description, bytes32 ticket_num, address whoseNumber);
  event winningResult(string description, bytes32 ticket_num, address player);
  event losingResult(string description, bytes32 ticket_num, address player);
  event cancelResult(string description, uint256 blockNumber, address player);
  event deadTicket(string description, bytes32 ticket_num, address player);
  event LiquidityProvided(string description, uint256 result);
  event updateGen(string description);
  event transferOK(string result);


  modifier onlyProvider(){ //a modifier only for those with a liquidity balance or a winning account_balance
      require(m_LP_tokens[msg.sender].LP_token_amount != 0 || m_userData[msg.sender].account_balance != 0);
      _; //Continue Execution
  }


  //Make a bet  Heads = 0(false)  Tails = 1(true)
  function makeBet(bool _headsOrTails) public payable {//Place the bet after fees and requirements.
    currentTxPrice = provable_getPrice("@CrazyCanadia");
    processingFee = currentTxPrice + 1000000000000000;
    require(betsAllowed, "Bets are not allowed.");
    require(_headsOrTails == true || _headsOrTails == false);
    require(msg.value >= MIN_BET, "The bet is too low."); //.01 Eth minimum bet where (.004 eth + gas fees for transaction = .005 as a deducted fee)
    require(msg.value-processingFee <= MAX_BET, "Your bet is too big.");
    require(msg.value-processingFee <= (contractBalance-totalLiabilities), "Your bet is too big!"); //Ensures nobody is betting against money the contract may not have.
    require(m_userData[msg.sender].bet_amount == 0, "You currently have a bet outstanding."); //Ensures that they curently have no bet... meaning only one bet at a time per person.


    m_userData[msg.sender].bet_amount = msg.value.sub(processingFee);
    contractBalance = contractBalance.add(msg.value);
    totalLiabilities = totalLiabilities.add( (m_userData[msg.sender].bet_amount.mul(2)) );

    coinFlip();
  }

  function coinFlip() payable public {//Send the request to a 3rd party oracle for a random byte of info...
    uint256 QUERY_EXECUTION_DELAY = 0;
    uint256 GAS_FOR_CALLBACK = 200000;
    contractBalance = contractBalance - GAS_FOR_CALLBACK - currentTxPrice;
    queryId = provable_newRandomDSQuery(QUERY_EXECUTION_DELAY, NUM_RANDOM_BYTES_REQUESTED, GAS_FOR_CALLBACK);
    userQueryId[queryId] = msg.sender;
    m_userData[msg.sender].ticket_num = queryId;
    emit LogNewProvableQuery("Provable query was sent", queryId, msg.sender);
    // __callback(queryId, "42", bytes("test"));
  }

  function __callback (bytes32 _queryId, string memory _result,  bytes memory _proof) public {//This is how the oracle will callback to deliver the random bytes.
    require(msg.sender == provable_cbAddress());
    address _userAddress = userQueryId[_queryId];
    if (m_userData[_userAddress].ticket_num == _queryId){
      m_userData[_userAddress].ticket_num = blank;
      uint256 _betResult = uint256(keccak256(abi.encodePacked(_result))).mod(2);
      // uint256 _betResult = now.mod(2); //currently here for testing only...
      bool _headsOrTails = m_userData[_userAddress].heads_or_tails;

      //The payout function should not be pushed to the user, rather it should sit to be pulled by them later for Security reasons.
      if( (_betResult == 1 && _headsOrTails == true)||(_betResult == 0 && _headsOrTails == false) ){
        if (m_userData[_userAddress].account_balance == 0){
          activeBets = activeBets.add(1);
        }
        uint256 winningBet = m_userData[_userAddress].bet_amount.mul(2);
        contractBalance = contractBalance.sub(winningBet);
        totalLiabilities = totalLiabilities.sub(winningBet);
        m_userData[_userAddress].bet_amount = 0;
        m_userData[_userAddress].account_balance = m_userData[_userAddress].account_balance.add(winningBet);
        emit winningResult("Congratulations you won the bet!", _queryId, _userAddress);
      }
      else {
        totalLiabilities = totalLiabilities.sub( m_userData[_userAddress].bet_amount.mul(2));
        m_userData[_userAddress].bet_amount = 0;
        emit losingResult("You lost. Try Again!", _queryId, _userAddress);
      }
    } else {
      emit deadTicket("We got back a now dead request.", _queryId, _userAddress);
    }
  }

  // ******** This cancelBet function has been deprecated as sending a cancel request realistically needs to be done
  // ******** almost imidiately after sending the makeBet transaction... This does not provide much value.
  // ******** The only foreseeable problem may be if the oracle provableAPI does not send back a response...

  // function cancelBet () public {//Allows intervention if the callback function  takes longer than the user wishes to wait.
  //   if (m_userData[msg.sender].bet_amount != 0){
  //     m_userData[msg.sender].ticket_num = blank;
  //     //The fees have already been removed from the bet
  //     uint256 returnBet = m_userData[msg.sender].bet_amount;
  //     contractBalance = contractBalance.sub(returnBet);
  //     totalLiabilities = totalLiabilities.sub( returnBet.mul(2) );
  //     m_userData[msg.sender].bet_amount = 0;
  //     m_userData[msg.sender].account_balance = m_userData[msg.sender].account_balance.add(returnBet);
  //     emit cancelResult("You cancelled your bet.", block.number, msg.sender);
  //   }
  // }


  //function to deposit into liquidity pool
  function addLiquidity() public payable {
    require(betsAllowed); // "The contract is no longer accepting funds."
    uint256 _mintAmount = mintAmount(msg.value, contractBalance, msg.sender);
    emit LiquidityProvided("You have successfully provided liquidity. You now have this many LPtokens: ",  _mintAmount);
    contractBalance = contractBalance.add(msg.value);
  }


  //function to withdraw money from the contract
  function withdrawMoney() public onlyProvider {
    if (m_LP_tokens[msg.sender].LP_token_amount == 0){ //If you are not an LP provider...

      if(m_userData[msg.sender].account_balance != 0){//If you are not an LP provider && have a balance...
        uint256 _transferAmount = m_userData[msg.sender].account_balance;
        m_userData[msg.sender].account_balance = 0;
        activeBets = activeBets.sub(1);
        msg.sender.transfer(_transferAmount);
        emit transferOK("We transferred the money to you.");
      }

    } else if (m_LP_tokens[msg.sender].genNum == currentLPGen) {//You are an LP provider of the current Generation...

        if(m_userData[msg.sender].account_balance == 0){ //If you are an LP provider of the current Generation && have no balance...
          uint256 _withdrawAmount = (m_LP_tokens[msg.sender].LP_token_amount.mul(contractBalance)).div(LPTokenPool);
          burnTokens(msg.sender);
          contractBalance = contractBalance.sub(_withdrawAmount);
          msg.sender.transfer(_withdrawAmount);
          emit transferOK("We transferred the money to you.");
        } else {//If you are an LP provider of the current Generation && have a balance...
          uint256 _withdrawAmount = (m_LP_tokens[msg.sender].LP_token_amount.mul(contractBalance)).div(LPTokenPool);
          burnTokens(msg.sender);
          contractBalance = contractBalance.sub(_withdrawAmount);
          _withdrawAmount = _withdrawAmount.add(m_userData[msg.sender].account_balance);
          m_userData[msg.sender].account_balance = 0;
          activeBets = activeBets.sub(1);
          msg.sender.transfer(_withdrawAmount);
          emit transferOK("We transferred the money to you.");
        }

      } else if(m_userData[msg.sender].account_balance == 0){//You are an LP provider from a previous Generation && have no balance...
          burnTokens(msg.sender);
          emit updateGen("You had a previous generation now worth 0.");
        } else {//You are an LP provider from a previous Generation... && have a balance...
          burnTokens(msg.sender);
          uint256 _withdrawAmount = m_userData[msg.sender].account_balance;
          m_userData[msg.sender].account_balance = 0;
          activeBets = activeBets.sub(1);
          msg.sender.transfer(_withdrawAmount);
          emit transferOK("We transferred the money to you.");
        }
  }

  function getUserBalance() public view returns(uint256){
    return m_userData[msg.sender].account_balance;
  }

  function getUserTicket() public view returns(bytes32){
    return m_userData[msg.sender].ticket_num;
  }

  function getUserBet() public view returns(uint256){
    return m_userData[msg.sender].bet_amount;
  }

}
