pragma solidity ^0.5.16;

contract Purchase {

address[16] public purchasers;

function purchase(uint petId) public returns (uint) {
  require(petId >= 0 && petId <= 15);

  purchasers[petId] = msg.sender;

  return petId;
}

function getPurchasers() public view returns (address[16] memory) {
  return purchasers;
}

}