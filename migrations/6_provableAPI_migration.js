const ProvableAPI = artifacts.require("usingProvable");

module.exports = function(deployer) {
  deployer.deploy(ProvableAPI);
};
