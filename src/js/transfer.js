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
            App.handleTransfer();
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

    handleTransfer: function () {
        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0];


            var CrudInstance;
            App.contracts.Crud.deployed().then(function (instance) {

                const $transfer = document.getElementById("transfer");

                $transfer.addEventListener("submit", (e) => {
                    e.preventDefault();
                    const id = e.target.elements[0].value;
                    const newOwner = e.target.elements[1].value;

                    instance.TransferPet(id, accounts[0], newOwner, {from: account});
                });
            })
        })
    },

};

$(function() {
    $(window).load(function() {
        App.initWeb3();
    });
});

