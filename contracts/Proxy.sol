import "./Storage.sol";

pragma solidity ^0.5.12;

contract Proxy is Storage {

  constructor (address _currentAddress) public {
    currentAddress = _currentAddress;
  }

  function upgrade(address _newAddress) public onlyOwner{
    currentAddress = _newAddress;
  }

  function () payable external {
    address _implementation = currentAddress;
    require(currentAddress != address(0));
    bytes memory data = msg.data;

    assembly {
      let result := delegatecall(gas, _implementation, add(data, 0x20), mload(data), 0, 0 )
      let size := returndatasize
      let ptr := mload(0x40)
      returndatacopy(ptr, 0, size)
      switch result
      case 0 {revert(ptr, size)}
      default {return(ptr, size)}
    }
  }


}
