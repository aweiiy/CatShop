// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

contract Crud {

  struct Pet {
    uint Id;
    string name;
    string picture;
    string breed;
    string location;
    address seller;
    address owner;
  }
  uint public nextId = 1;
  Pet[] public pets;

  function createPetListing(
      string memory name,
      string memory picture,
      string memory breed,
      string memory location
  ) public {
    address seller = msg.sender;
    address owner = msg.sender;
    pets.push(Pet(nextId, name, picture, breed, location,seller, owner));
    nextId ++;
  }

  function getPet(uint id) public view returns(uint, string memory, string memory, string memory, string memory, address, address) {
    for(uint i = 0; i < pets.length; i++) {
      if(id == pets[i].Id){
        return (pets[i].Id, pets[i].name, pets[i].picture, pets[i].breed, pets[i].location, pets[i].seller, pets[i].owner);
      }
    }
    revert("Pet not found");
  }

  function getPets() public view returns(Pet[] memory) {
    return (pets);
  }

    function getPetsLength() public view returns(uint) {
        return (pets.length);
    }

  function deletePet(uint id, address owner) public returns(string memory) {
    for(uint i = 0; i < pets.length; i++) {
      if(id == pets[i].Id && owner == pets[i].owner){
        delete(pets[i]);
        return ("Pet has been delisted");
      }
    }
    revert("Error");
  }

  function updatePet(uint id, string memory name, string memory picture, string memory breed, string memory location, address owner) public returns(uint, string memory) {

        for(uint i = 0; i < pets.length; i++) {
            if(id == pets[i].Id && owner == pets[i].owner){
                pets[i].name = name;
                pets[i].breed = breed;
                pets[i].location = location;
            
                return (pets[i].Id, pets[i].name);
            }
    }
    

    revert("No pet found");
  }


  address[20] public purchasers;

function purchase(uint petId) public returns (uint) {
  require(petId >= 0 && petId <= 20);

  for(uint i = 0; i < pets.length; i++) {
      if(petId == pets[i].Id){
        address owner = msg.sender;
        pets[i].owner = owner;
      }
      }

  purchasers[petId] = msg.sender;

  return petId;
}

function getPurchasers() public view returns (address[20] memory) {
  return purchasers;
}

}