App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.owner').attr('data-id', data[i].id);
        petTemplate.find('.btn-purchase').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

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
var accountInterval = setInterval(function() {
  if (web3.eth.accounts[0] !== account) {
    account = web3.eth.accounts[0];
    document.getElementById("address").innerHTML = account;
    }
      }, 100);

    return App.initContract();
  },

initContract: function() {
    $.getJSON('Purchase.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var PurchaseArtifact = data;
      App.contracts.Purchase = TruffleContract(PurchaseArtifact);
    
      // Set the provider for our contract
      App.contracts.Purchase.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the purchased pets
      App.markPurchased();
      App.addAccountChangeListener();
      App.displayAccount();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-purchase', App.handlePurchase);
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
      }
    });
  },

markPurchased: function() {
 var purchaseInstance;

App.contracts.Purchase.deployed().then(function(instance) {
  purchaseInstance = instance;


  return purchaseInstance.getPurchasers.call();
}).then(function(purchasers, accounts) {
  var account = web3.eth.accounts[0];
  console.log(account);
  for (i = 0; i < purchasers.length; i++) {
    if (purchasers[i] !== '0x0000000000000000000000000000000000000000') {
      //$('.panel-pet').eq(i).find('button').text(`Owned by: ${purchasers[i]}`).attr('disabled', true).css( "color", "red" );
      $('.panel-pet').eq(i).find('button').replaceWith(`<span class="owner"><strong>Purchased by</strong>: ${purchasers[i]}</span>`);
      //$('.panel-pet').eq(i).find('.owner').html(`<strong>Purchased by</strong>: ${purchasers[i]}`).attr('.d-none', '.d-block')
        if(purchasers[i] == account)
          $('.panel-pet').eq(i).find('.owner').css( "color", "red" );

    }
  }
}).catch(function(err) {
  console.log(err.message);
});
  },

  handlePurchase: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

var adoptionInstance;

web3.eth.getAccounts(function(error, accounts) {
  if (error) {
    console.log(error);
  }

  var account = accounts[0];

  App.contracts.Purchase.deployed().then(function(instance) {
    purchaseInstance = instance;

    // Execute adopt as a transaction by sending account
    return purchaseInstance.purchase(petId, {from: account});
  }).then(function(result) {
    return App.markPurchased();
  }).catch(function(err) {
    console.log(err.message);
  });
});
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
/*window.ethereum.on('accountsChanged', function (accounts) {
  $('.panel-pet').find('.owner').css( "color", "black" );
  App.markAdopted();
})*/

/*
        window.addEventListener('load', function() {


            // Load WEB3
            // Check wether it's already injected by something else (like Metamask or Parity Chrome plugin)
            if(typeof web3 !== 'undefined') {
                web3 = new Web3(web3.currentProvider);  

            // Or connect to a node
            } else {
                web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
            }

            // Check the connection
            if(!web3.isConnected()) {
                console.error("Not connected");

            }

            var account = web3.eth.accounts[0];
            var accountInterval = setInterval(function() {
              if (web3.eth.accounts[0] !== account) {
                account = web3.eth.accounts[0];
                document.getElementById("address").innerHTML = account;
              }
            }, 100);

        });
*/