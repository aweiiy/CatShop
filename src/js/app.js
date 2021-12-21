App = {
  web3Provider: null,
  contracts: {},

  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access");
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
    }
    web3 = new Web3(App.web3Provider);

    var account = web3.eth.getAccounts[0];

    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Crud.json", function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var CrudArtifact = data;
      App.contracts.Crud = TruffleContract(CrudArtifact);

      // Set the provider for our contract
      App.contracts.Crud.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the purchased pets

      App.addAccountChangeListener();
      App.displayAccount();
      App.loadPetsToTable();
      App.markPurchased();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on("click", ".btn-purchase", App.handlePurchase);
  },

  addAccountChangeListener: function () {
    window.ethereum.on("accountsChanged", function (accounts) {
      location.reload(true);
    });
  },

  displayAccount: function () {
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      if (accounts[0]) {
        $("#account").text(accounts[0]);
        $("#address").text(accounts[0]);
      }
    });
  },

  markPurchased: function () {
    var purchaseInstance;

    App.contracts.Crud.deployed()
        .then(function (instance) {
          purchaseInstance = instance;

          return purchaseInstance.getPurchasers.call();
        })
        .then(function (purchasers) {
          for (i = 0; i < purchasers.length; i++) {
            if (purchasers[i] !== "0x0000000000000000000000000000000000000000") {
              $(".panel-pet")
                  .eq(i -1)
                  .find(".btn-purchase")
                  .replaceWith(`<span class="owner"><strong>Owned by</strong>: ${purchasers[i]}</span>`);
              if (purchasers[i] == account)
                $(".panel-pet")
                    .eq(i -1)
                    .find(".owner")
                    .css("color", "red");
            }
          }
        })
        .catch(function (err) {
          console.log(err.message);
        });
  },

  handlePurchase: function (event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data("id"));
    var petPrice = parseInt($(event.target).data("price"));

    var purchaseInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Crud.deployed()
          .then(function (instance) {
            purchaseInstance = instance;
            return purchaseInstance.purchase(petId, { from: account, value: petPrice });
          })
          .then(function (result) {
            return App.markPurchased();
          })
          .catch(function (err) {
            console.log(err.message);
          });
    });
  },


  loadPetsToTable: function () {
    var petsRow = $("#petsRow");
    var petTemplate = $("#petTemplate");
    var LoadInstance;
    var petInfo;

    App.contracts.Crud.deployed().then(function (instance) {
      LoadInstance = instance;

      for (i = 0; i < 20; i++) {
        petInfo = LoadInstance.getPet(i);
        petInfo.then((data) => {
          if (data[1].length != 0) {
            petTemplate.find(".owner").attr("data-id", data[0]);
            petTemplate.find(".btn-purchase").attr("data-id", data[0]);
            petTemplate.find(".panel-title").text("[" + data[0] + "] " + data[1]);
            petTemplate.find("img").attr("src", "images/" + data[2]);
            petTemplate.find(".pet-breed").text(data[3]);
            petTemplate.find(".pet-location").text(data[4]);
            petTemplate.find(".pet-price").text(data[7] + " wei");
            petTemplate.find(".btn-purchase").attr("data-price", data[7]);

            petsRow.append(petTemplate.html());
          }
        });
      }
    });
  },
};

$(function () {
  $(window).load(function () {
    App.initWeb3();
  });
});
