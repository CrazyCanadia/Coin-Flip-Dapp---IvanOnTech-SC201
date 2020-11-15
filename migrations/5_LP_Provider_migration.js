const UsesLiquidityProviders = artifacts.require("UsesLiquidityProviders");
const SafeMath = artifacts.require("SafeMath");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, UsesLiquidityProviders);
  deployer.deploy(UsesLiquidityProviders);
};
