var Purchase = artifacts.require("./Purchase.sol");
var Crud = artifacts.require("./crud.sol");

module.exports = function(deployer) {
  deployer.deploy(Purchase);
  deployer.deploy(Crud);
};