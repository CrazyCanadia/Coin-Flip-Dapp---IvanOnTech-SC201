const CoinFlip = artifacts.require("CoinFlip");
const SafeMath = artifacts.require("SafeMath");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, CoinFlip);
  deployer.deploy(CoinFlip);
};
