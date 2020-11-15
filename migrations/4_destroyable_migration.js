const Destroyable = artifacts.require("Destroyable");
const SafeMath = artifacts.require("SafeMath");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, Destroyable);
  deployer.deploy(Destroyable);
};
