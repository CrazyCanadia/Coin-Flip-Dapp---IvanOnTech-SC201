import "./Ownable.sol";
import "./SafeMath.sol";

pragma solidity 0.5.12;

contract UsesLiquidityProviders is Ownable {

  using SafeMath for uint256;

  uint256 public LPTokenPool;
  uint256 public currentLPGen;
  //uint public totalLPTokens;

  struct LP_Provider {
    uint256 genNum;
    uint256 LP_token_amount;
  }

  mapping (address => LP_Provider) public m_LP_tokens;


  event mintedLPTokens(string description);


  constructor () public {
    LPTokenPool = 0;
    currentLPGen = 0;
    //totalLPTokens = 0;
  }


  function mintAmount(uint256 _deposit, uint256 _contractBalance, address _provider) internal returns(uint256 _mintAmount){
    if (_contractBalance <= MIN_BET){//If the contract has almost no money start a new Gen
      _mintAmount = 1000000;
      LPTokenPool = 0;
      currentLPGen = currentLPGen.add(1);
      m_LP_tokens[_provider].genNum = currentLPGen;
    } else {//otherwise mint as normal
      _mintAmount = (LPTokenPool.mul(_deposit)).div(_contractBalance);
    }
    if (m_LP_tokens[_provider].genNum == currentLPGen){//Are they with the current gen?
      m_LP_tokens[_provider].LP_token_amount = m_LP_tokens[_provider].LP_token_amount.add(_mintAmount);
      LPTokenPool = LPTokenPool.add(_mintAmount);
      emit mintedLPTokens("Congrats on minting tokens.");
      return _mintAmount;
    } else {//They are with an outdated gen
      m_LP_tokens[_provider].LP_token_amount = 0;
      m_LP_tokens[_provider].genNum = currentLPGen;
      m_LP_tokens[_provider].LP_token_amount = m_LP_tokens[_provider].LP_token_amount.add(_mintAmount);
      LPTokenPool = LPTokenPool.add(_mintAmount);
      emit mintedLPTokens("Congrats on minting tokens.");
      return _mintAmount;
    }

  }


  function burnTokens(address _provider) internal {
    LPTokenPool = LPTokenPool.sub(m_LP_tokens[_provider].LP_token_amount);
    m_LP_tokens[_provider].LP_token_amount = 0;
    m_LP_tokens[msg.sender].genNum = 0;
  }

  function getLiquidityProviderGen(address _userAddress) public view returns(uint256){
    return m_LP_tokens[_userAddress].genNum;
  }

  function getLiquidityProviderBalance(address _userAddress) public view returns(uint256 _tokenBalance){
    _tokenBalance = m_LP_tokens[_userAddress].LP_token_amount;
    return _tokenBalance;
  }


}
