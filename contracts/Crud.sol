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
        uint256 price;
    }
    uint public nextId = 1;
    Pet[] public pets;
    uint256 transferPrice = 1000 wei;
    address[25] public purchasers;

    function createPetListing(
        string memory name,
        string memory picture,
        string memory breed,
        string memory location,
        uint256 price
    ) public {
        address seller = msg.sender;
        address owner = msg.sender;
        pets.push(Pet(nextId, name, picture, breed, location,seller, owner, price));
        nextId ++;
    }

    function getPet(uint id) public view returns(uint, string memory, string memory, string memory, string memory, address, address, uint256) {
        for(uint i = 0; i < pets.length; i++) {
            if(id == pets[i].Id){
                return (pets[i].Id, pets[i].name, pets[i].picture, pets[i].breed, pets[i].location, pets[i].seller, pets[i].owner, pets[i].price);
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
                purchasers[pets[i].Id] = 0x0000000000000000000000000000000000000000;
                delete(pets[i]);
                return ("Pet has been delisted");
            }
        }
        revert("Error");
    }

    function updatePet(uint id, string memory name, string memory picture, string memory breed, string memory location, address owner, uint256 price) public returns(uint, string memory) {

        for(uint i = 0; i < pets.length; i++) {
            if(id == pets[i].Id && owner == pets[i].owner){
                pets[i].name = name;
                pets[i].picture = picture;
                pets[i].breed = breed;
                pets[i].location = location;
                pets[i].price = price;
                return (pets[i].Id, pets[i].name);
            }
        }


        revert("No pet found");
    }

    function TransferPet(uint id, address owner, address newOwner) public payable returns(uint, string memory) {
        require(msg.value == transferPrice, "Price must be equal to transfer price");
        for(uint i = 0; i < pets.length; i++) {
            if(id == pets[i].Id && owner == pets[i].owner){
                pets[i].owner = newOwner;
                purchasers[pets[i].Id] = newOwner;
                return (pets[i].Id, pets[i].name);
            }
        }


        revert("No pet found");
    }


    function purchase(uint petId) public payable returns (uint) {
        require(petId >= 0 && petId <= 25);
        uint256 transactionPrice;
        for(uint i = 0; i < pets.length; i++) {
            if(petId == pets[i].Id){
                address owner = msg.sender;
                pets[i].owner = owner;
                transactionPrice = pets[i].price;
            }
        }

        purchasers[petId] = msg.sender;

        require(msg.value == transactionPrice, "Transfer only the required ammount");
        return petId;
    }

    function getPurchasers() public view returns (address[25] memory) {
        return purchasers;
    }

}