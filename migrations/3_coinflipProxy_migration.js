const CoinFlip = artifacts.require("CoinFlip");
const SafeMath = artifacts.require("SafeMath");
const Proxy = artifacts.require("Proxy");

module.exports = async function(deployer) {

  await deployer.deploy(SafeMath);
  await deployer.link(SafeMath, CoinFlip);

  var cf, p, pc;

  cf = await CoinFlip.new();
  console.log("The CoinFlip contract is :" + cf.address);
  p = await Proxy.new(cf.address);
  console.log("The Proxy instance is :" + p.address);

  pc = await CoinFlip.at(p.address);

  console.log("The proxyContract has been created!");

}
