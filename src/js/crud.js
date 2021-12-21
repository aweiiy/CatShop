App = {
    web3Provider: null,
    contracts: {},

    initWeb3: async function() {
// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
// Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
// If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);

        var account = web3.eth.getAccounts[0];

        return App.initContract();
    },

    initContract: function() {
        $.getJSON('Crud.json', function(data) {
            // Get the necessary contract artifact file and instantiate it with @truffle/contract
            var PurchaseArtifact = data;
            App.contracts.Crud = TruffleContract(PurchaseArtifact);

            // Set the provider for our contract
            App.contracts.Crud.setProvider(App.web3Provider);

            // Use our contract to retrieve and mark the purchased pets
            App.addAccountChangeListener();
            App.displayAccount();
            App.handleCrud();
        });
    },
    addAccountChangeListener: function() {
        window.ethereum.on('accountsChanged', function(accounts) {
            location.reload(true);
        });
    },

    displayAccount: function() {
        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }
            if (accounts[0]) {
                $('#account').text(accounts[0]);
                $('#address').text(accounts[0]);
            }
        });
    },

    handleCrud: function () {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0];

            var CrudInstance;
            App.contracts.Crud.deployed().then(function (instance) {
                CrudInstance = instance;

                const $create = document.getElementById("create");
                const $createResult = document.getElementById("create-result");
                const $read = document.getElementById("read");
                const $readResult = document.getElementById("read-result");
                const $edit = document.getElementById("edit");
                const $editResult = document.getElementById("edit-result");
                const $delete = document.getElementById("delete");
                const $deleteResult = document.getElementById("delete-result");

                $create.addEventListener("submit", (e) => {
                    e.preventDefault();
                    const name = e.target.elements[0].value;
                    const picture = e.target.elements[1].value;
                    const breed = e.target.elements[2].value;
                    const location = e.target.elements[3].value;
                    const price = e.target.elements[4].value;

                    const pet = CrudInstance.createPetListing(name, picture, breed, location, price, { from: account });
                    document.getElementById("loader").style.display = "block";
                    pet.then((result) => {
                        document.getElementById("loader").style.display = "none";
                        $createResult.innerHTML = `New pet was added:<br/> Name: ${name}`;
                    });
                });

                $read.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    const id = e.target.elements[0].value;
                    const petInfo = CrudInstance.getPet(id);
                    petInfo
                        .then((result) => {
                            $readResult.innerHTML = `Id: ${result[0]} Name: ${result[1]}, Breed: ${result[3]}, Location: ${result[4]},Owner: ${result[6]}`;
                        })
                        .catch((_e) => {
                            $readResult.innerHTML = `There was an error while trying to read pet ${id}`;
                        });
                });

                $edit.addEventListener("submit", (e) => {
                    e.preventDefault();
                    const id = e.target.elements[0].value;
                    const name = e.target.elements[1].value;
                    const picture = e.target.elements[2].value;
                    const breed = e.target.elements[3].value;
                    const location = e.target.elements[4].value;
                    const price = e.target.elements[5].value;

                    const updatePet = CrudInstance.updatePet(id, name, picture, breed, location, accounts[0], price, { from: account });
                    updatePet
                        .then((result) => {
                            $editResult.innerHTML = `User details are Updated: <br/> ${id}- ${name}-`;
                        })
                        .catch((_e) => {
                            $editResult.innerHTML = `There was an error while trying to update pet info`;
                        });
                });

                $delete.addEventListener("submit", (e) => {
                    e.preventDefault();
                    const id = e.target.elements[0].value;
                    const deletion = CrudInstance.deletePet(id, accounts[0], { from: account });
                    deletion
                        .then((result) => {
                            $deleteResult.innerHTML = `Deleted pet ${id}`;
                        })
                        .catch((_e) => {
                            $deleteResult.innerHTML = `There was an error while trying to delete pet ${id}`;
                        });
                });
            });
        });
    }

};

$(function() {
    $(window).load(function() {
        App.initWeb3();
    });
});

