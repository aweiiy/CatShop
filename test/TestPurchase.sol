pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Purchase.sol";

contract TestAdoption {
  // The address of the adoption contract to be tested
  Purchase buy = Purchase(DeployedAddresses.Purchase());

  // The id of the pet that will be used for testing
  uint expectedPetId = 8;

  //The expected owner of purchased pet is this contract
  address expectedPurchaser = address(this);

    // Testing the purchase() function
    function testUserCanPurchasePet() public {
        uint returnedId = buy.purchase(expectedPetId);
        Assert.equal(returnedId, expectedPetId, "Purchase of the expected pet should match what is returned.");
    }

    // Testing retrieval of a single pet's owner
    function testGetPurchaserAddressByPetId() public {
        address purchaser = buy.getPurchasers()[expectedPetId];
        Assert.equal(purchaser, expectedPurchaser, "Owner of the expected pet should be this contract");
    }

    // Testing retrieval of all pet owners 
    function testGetPurchaserAddressByPetIdInArray() public {
        // Store adopters in memory rather than contract's storage
        address[16] memory purchasers = buy.getPurchasers();
        Assert.equal(purchasers[expectedPetId], expectedPurchaser, "Owner of the expected pet should be this contract");
    }
}