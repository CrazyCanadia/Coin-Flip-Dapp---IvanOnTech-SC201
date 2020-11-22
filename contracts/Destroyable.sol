import "./Storage.sol";
import "./UsesLiquidityProviders.sol";
import "./SafeMath.sol";

pragma solidity 0.5.12;

contract Destroyable is Storage, UsesLiquidityProviders {

  using SafeMath for uint256;

  event contractDestroyed(string result);
  event contractClosingDown(string result);
  event waitingForProviders(string description);

    function destroy() public onlyOwner {

      if (!SELF_DESTRUCT_TIMER){//Establishing a 3 block timmer... just for fun... not needed.
        betsAllowed = false;
        SELF_DESTRUCT_TIMER = true;
        emit contractClosingDown("The contract is shutting down... No more bets. Withdraw your funds.");
      } else if (contractBalance == 0 && activeBets == 0) {//Otherwise, if the contract is empty it can be deleted.
        address payable receiver = msg.sender;
        selfdestruct(receiver);
        emit contractDestroyed("The contract was DESTROYED!");
      } else  if ( (m_LP_tokens[msg.sender].genNum == currentLPGen && m_LP_tokens[msg.sender].LP_token_amount == LPTokenPool) && activeBets == 0) {
        //This allows the owner to avoid an extra step of withdraw if they are the only liquidity provider.
        address payable receiver = msg.sender;
        selfdestruct(receiver);
        emit contractDestroyed("The contract was DESTROYED!");
      } else {
        emit waitingForProviders("There are still providers with money in the contract.");
      }
    }


}
