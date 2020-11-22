/* Wecome to the front end interface to a Coin Flip betting Dapp from CrazyCanadia.
// The contract address is: 0x0B311F2C3Aa1c851A32F81c61d80e3d8C0DF9883
// This Dapp is an educational project to complete IvanOnTech's Smart Contract Programming 201 course.
// The source for these files on Github is here --> https://github.com/CrazyCanadia/Coin-Flip-Dapp---IvanOnTech-SC201
// Please report any bugs... Thanks. Enjoy.
*/
var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var ownerAddress;     //creator of the contract
var fromAddress;      //the current user of the contract
var contractBalance = 0;  //denominated in wei
var lp_balance = 0; //for Liquidity Providers
var entitled_share = 0;
var userBalance = 0;
var totalLPpool = 0;
var userGenNum = 0;
var contractGen = 0;
var entitled;
var processingFee;
var denomination;
var betAmount;
var headsOrTails;
var ticketNum;
var betsAllowed;
var self_destruct_timer = 0;
var activeBets;
var lastQuery;
var currentBEAddress;  //This it the address of the functional contract on the backend of the proxy
var tempBEAddress;


$(document).ready(function() {
    window.ethereum.enable().then(function(accounts){
      contractInstance = new web3.eth.Contract(abi, "0x5AAae9EaAc0fc01d9FBC5d39a34C3E2c7392D2Ce", {from: accounts[0]}); //The proxy address stays the same.
      //Verify that there is an existing contract - that it hasn't been destroyed.
      contractInstance.methods.owner().call().then(function(result){
        ownerAddress = result;
        fromAddress = contractInstance.options.from;
      }).catch(function(error){
          notify("destroy");
      });
      getDataForFrontEnd().then(function(){
        contractInfo();
        //Playing to see what happens when avoiding the proxy with the below address of the back end
        contractInstanceBE = new web3.eth.Contract(abi, currentBEAddress, {from: accounts[0]}); //The backend address changes
        // console.log("The backend address is: ");
        // console.log(currentBEAddress);
        updateContractBalance();
        if(!betsAllowed){
          notify("clearMsg");
          $("#betting_section").hide();
          $("#adding_section").hide();
          $("#withdraw_section").hide();
          $("#deletedMessage").show();
          notify("destroy");
          entitled_share = parseFloat( (lp_balance * contractBalance) / totalLPpool );
          if (entitled_share == isNaN){entitled_share = 0;}
          if (ownerAddress == fromAddress){
            $("#owner_section").show();
            notify("owner");
            if (entitled_share == 0 || userBalance == 0){
              $("#deletedMessage").hide();
              $("#closingMessage").show();
            }
          }
          if (entitled_share > 0  || userBalance > 0){
            if(ownerAddress != fromAddress){
              notify("clear");
              notify("provider");
            }
            $("#withdraw_section").show();
            $("#deletedMessage").hide();
            $("#closingMessage").show();
          }
          updateProviderBalance();

          // notify("destroy");
        }
        else {
          if (betAmount != 0){
            // console.log("The current betAmount is: ");
            // console.log(betAmount);
            disableButtons();
            notify("clear");
            notify("animateGo");
            notify("waiting");
            $("#betMessage").hide();
            $("#place_bet").show();
            lastQuery = sessionStorage.lastQuerySS;
            progressBar();
          } else if(ownerAddress == fromAddress){
            notify("owner");
            if(lp_balance != 0 || userBalance != 0){
              entitled_share = parseFloat((lp_balance * contractBalance) / totalLPpool );
              $("#withdraw_section").show();
              $("#owner_section").show();
              updateProviderBalance();
            }
          } else
          if((userGenNum == contractGen && userGenNum != 0 && lp_balance != 0) ){//The Non-owner user has some current Gen LP tokens
            entitled_share = parseFloat((lp_balance * contractBalance) / totalLPpool );
            updateProviderBalance();
            notify("clear");
            notify("provider");
          } else if(lp_balance != 0 && lp_balance != isNaN && userGenNum != contractGen){//The Non-onwer user has some old LP Tokens
            lp_balance = 0;
            userGenNum = 0;
            notify("clear");
            notify("hello");
          } else if (userBalance != 0){
            updateProviderBalance();
            notify("provider");
            notify("clear");
            notify("hello");
          } else {
            notify("hello");
          }
        }


        contractInstance.getPastEvents('LogNewProvableQuery', {
            filter: {}, // Using an array means OR: e.g. 20 or 23
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ /*console.log(events);*/ })
        .then(function(events){
          for (i = 0; i < events.length; i++){
            // console.log(events[i].blockNumber);
          }
          // console.log("<---------The Open Tickets--------->");
            // console.log(events) // same results as the optional callback above
            contractInstance.getPastEvents('winningResult', {
              filter: {}, // Using an array means OR: e.g. 20 or 23
              fromBlock: 0,
              toBlock: 'latest'
            }, function(error, events){ /*console.log(events);*/ })
            .then(function(events){
              // console.log("<---------The Winning Tickets--------->");
              // console.log(events) // same results as the optional callback above
              contractInstance.getPastEvents('losingResult', {
                filter: {}, // Using an array means OR: e.g. 20 or 23
                fromBlock: 0,
                toBlock: 'latest'
              }, function(error, events){ /*console.log(events);*/ })
              .then(function(events){
                // console.log("<---------The Losing Tickets--------->");
                // console.log(events) // same results as the optional callback above
                contractInstance.getPastEvents('deadTicket', {
                  filter: {}, // Using an array means OR: e.g. 20 or 23
                  fromBlock: 0,
                  toBlock: 'latest'
                }, function(error, events){ /*console.log(events);*/ })
                .then(function(events){
                  // console.log("<---------The Dead Tickets--------->");
                  // console.log(events) // same results as the optional callback above
                });
              });
            });
        });

        //----------------Listening for bet events------------------//

        contractInstance.events.LogNewProvableQuery(function(error, result){
          if(!error){
            lastQuery = result.returnValues[1];
            sessionStorage.lastQuerySS = lastQuery;
            // storeLogData(result);
          } else {
            console.log(error);
          }
        });
        contractInstance.events.winningResult(function(error, result){
          if(!error){
            if( (lastQuery == result.returnValues[1]) && (fromAddress == result.returnValues[2]) ){
              listenForWin(result);
            }
          } else {
            console.log(error);
          }
        });
        contractInstance.events.losingResult(function(error, result){
          if(!error){
            if( (lastQuery == result.returnValues[1]) && (fromAddress == result.returnValues[2]) ){
              listenForLoss(result);
            }
          } else {
            console.log(error);
          }
        });

        //---------------Listening for destroy events--------------//

        contractInstance.events.contractDestroyed(function(error, result){
          if(!error){
            officiallyDestroyed(result);
          } else {
            console.log(error);
          }
        });
        contractInstance.events.contractClosingDown(function(error, result){
          if(!error){
            closingDown(result);
          } else {
            console.log(error);
          }
        });
        contractInstance.events.waitingForProviders(function(error, result){
          if(!error){
            waitingToClose(result);
          } else {
            console.log(error);
          }
        });
        });

  });


    $("#place_bet").click(placeBet);
    $("#deposit_button").click(addLiquidity);
    $("#withdraw_button").click(withdrawFromContract);
    $("#destroy_button").click(destroyContract);
    $("#bet_amount").click(updateFee);
    $("#upgrade_button").click(updateContract);
    $("#refund_bet").click(refundBet);

});


function placeBet(){
  if(betAmount > 0){
    disableButtons();
    notify("clear");
    notify("animateGo");
    notify("waiting");
    $("#betMessage").hide();
    return;
  }
  headsOrTails = $("#input_heads_tails").val();
  temp = $("#bet_amount").val();
  denomination = $("#input_denomination").val();
  betAmount = parseFloat(temp);

  // console.log(betAmount);

  if (denomination === "ether"){
    betAmount = betAmount * 1000000000000000000;
    denomination = "wei";
  }

  //Checking inputs to ensure quality:
  if (isNaN(betAmount)){
    alert("Must input numbers only");
    return;
  }
  if(betAmount==0){
    alert("The bet amount is zero (0)!");
    return;
  }
  if(betAmount < 10000000000000000){
    alert("The bet amount too small!");
    return;
  }
  if ( (betAmount > contractBalance) || (betAmount > (2000000000000000000 + processingFee)) || (betAmount > 2005000000000000000)){
    alert("You bet too much.")
    return;
  }

  //Clear any previous notifications
  disableButtons();
  notify("clear");
  notify("animateGo");
  notify("waiting");

  config = configAmount(betAmount.toString(), denomination);

  scrollUp();

  contractInstance.methods.makeBet(headsOrTails).send(config)
  .on("transactionHash", function(hash){
      logTx(hash);
  })
  .on("receipt", function(receipt){
      logReceipt(receipt);
      notify("updateComs");
      betAmount -= processingFee;
  })
  .on("error", function(error){
    betAmount = 0;
    notify("animateStop");
    notify("clear");
    notify("error");
    enableButtons();
  });
}

function addLiquidity(){
  var depositAmount = $("#deposit_amount").val();
  var denomination = $("#deposit_denomination").val();

  //Checking inputs to ensure quality:
  if (isNaN(depositAmount)){
    alert("Must input numbers only");
    return;
  }
  if(depositAmount==0){
    alert("The deposit amount is zero (0)!");
    return;
  }
  //Metamask seems to check other error cases

  disableButtons();
  notify("clear");
  notify("animateGo");
  notify("waiting");

  config = configAmount(depositAmount, denomination);

  scrollUp();

  contractInstance.methods.addLiquidity().send(config)
  .on("transactionHash", function(hash){
      logTx(hash);
  })
  .on("receipt", function(receipt){
      clearInterval(waitNotice);
      logReceipt(receipt);
      notify("animateStop");
      notify("clear");
      notify("deposit", depositAmount);

      getDataForFrontEnd().then(function(){
        entitled_share = parseFloat((lp_balance * contractBalance) / totalLPpool);
        updateContractBalance();
        updateProviderBalance();
        $("#withdraw_section").show();
        enableButtons();
      });
  })

  .on("error", function(error){
    clearInterval(waitNotice);
    notify("animateStop");
    notify("clear");
    notify("error");
    enableButtons();
  });
}

function withdrawFromContract(){
  disableButtons();
  notify("clearMsg");
  notify("clear");
  notify("animateGo");
  notify("waiting");

  scrollUp();

  contractInstance.methods.withdrawMoney().send()
  .on("transactionHash", function(hash){
      logTx(hash);
  })
  .on("receipt", function(receipt){
      logReceipt(receipt);
      if(receipt.events.transferOK){
        var tmp = receipt.events.transferOK.returnValues[1];
        tmp = tmp / 1000000000000000000;
        clearInterval(waitNotice);
        notify("animateStop");
        contractBalance -= temp;
        totalLPpool = totalLPpool - lp_balance;
        userBalance = 0;
        entitled_share = 0;
        lp_balance = 0;
        if(!betsAllowed){
          $("#betMessage").hide();
          $("#closingMessage").show();
        }
        notify("clear");
        notify("withdraw", tmp);
      }
      if(receipt.events.updateGen){
        //This would be to display the Gen at this time... (not needed really)
        clearInterval(waitNotice);
        notify("animateStop");
        notify("clear");
        notify("error");
      }
      enableButtons();
  })
  .on("error", function(error){
    clearInterval(waitNotice);
    notify("clear");
    notify("animateStop");
    notify("error");
    enableButtons();
  })
  .then(function(){
      updateContractBalance();
      $("#withdraw_section").hide();
  });
}

function refundBet(){
  document.getElementById("refund_bet").disabled = true;
  $("#sendingMessage").hide();
  $("#refundMessage").show();

  contractInstance.methods.refundBet().send()
  .on("transactionHash", function(hash){
      logTx(hash);
  })
  .on("receipt", function(receipt){
      logReceipt(receipt);
      if(receipt.events.refundedBet){
        var tmp = receipt.events.refundedBet.returnValues[1];
        tmp = tmp / 1000000000000000000;
        clearInterval(waitNotice);
        notify("clearMsg");
        notify("animateStop");
        notify("clear");
        notify("refund", tmp);
        if(!betsAllowed){
          $("#betMessage").hide();
          $("#closingMessage").show();
        }
      }
  })
  .on("error", function(error){
    clearInterval(waitNotice);
    notify("clear");
    notify("animateStop");
    notify("error");
    enableButtons();
  })
  .then(function(){
    document.getElementById("refund_bet").disabled = false;
    $("#refund_bet").hide();
    $("#place_bet").show();
    resetBar();
    enableButtons();
    updateContractBalance();
    updateProviderBalance();
    $("#withdraw_section").show();
  });


}

function destroyContract(){
  disableButtons();
  notify("clearMsg");
  notify("clear");
  notify("animateGo");
  notify("waiting");

  scrollUp();

  contractInstance.methods.destroy().send()
  .on("transactionHash", function(hash){
      logTx(hash);
  })
  .on("receipt", function(receipt){
    logReceipt(receipt);
    clearInterval(waitNotice);
    notify("animateStop");
    notify("clearMsg");
    notify("clear");
      // if(receipt.events.contractClosingDown){
      //   console.log("closing down...");
      //   closingDown();
      //   updateContractBalance();
      //   notify("clearMsg");
      //   notify("clear");
      // } else if (receipt.events.waitingForProviders){
      //   console.log("waiting...");
      //   waitingToClose();
      //   updateContractBalance();
      //   notify("clearMsg");
      //   notify("clear");
      // }else if (receipt.events.contractDestroyed){
      //   console.log("deleted...");
      //   officiallyDestroyed();
      // }
      // console.log("Did it do nothing?");
    enableButtons();
  })
  .on("error", function(error){
    clearInterval(waitNotice);
    notify("animateStop");
    notify("clear");
    notify("error");
    enableButtons();
  })
}

function listenForWin(result){
  console.log("----------- ------You Won!------- ------------");
      if (betAmount != 0){ // It is 0 if they cancelled the bet.
        clearTimeout(tOut);
        clearInterval(id);
        clearInterval(waitNotice);
        var winAmount = (betAmount * 2);
        contractBalance -= betAmount;
        entitled_share = parseFloat((lp_balance * contractBalance) / totalLPpool );
        userBalance = userBalance + betAmount * 2;
        var tmp = parseFloat(betAmount*2/1000000000000000000);
        betAmount = 0;
        notify("animateStop");
        notify("clear");
        notify("clearMsg");
        $("#betMessage").show();
        resetBar();
        // console.log("The tmp win amount is: ");
        // console.log(tmp);
        notify("winner", tmp);
        if (userBalance != 0){
          $("#withdraw_section").show();
        }
        enableButtons();
        updateProviderBalance();
        updateContractBalance();
        return;
      }
  console.log("This is the end of the listenForWin function.");
  return;

}

function listenForLoss(result){
    console.log("----------- -----You Lost!------- ------------");
      if (betAmount != 0){ // It is 0 if they cancelled the bet.
        clearTimeout(tOut);
        clearInterval(id);
        clearInterval(waitNotice);
        contractBalance += betAmount;
        entitled_share = parseFloat((lp_balance * contractBalance) / totalLPpool );
        betAmount = 0;
        notify("animateStop");
        notify("clear");
        notify("clearMsg");
        $("#betMessage").show();
        resetBar();
        notify("loser");
        enableButtons();
        updateProviderBalance();
        updateContractBalance();
        return;
      }
  console.log("This is the end of the listenForLoss function.");
  return;
}

function officiallyDestroyed() {
  clearInterval(waitNotice);
  notify("animateStop");
  contractBalance = 0;
  notify("clear");
  notify("clearMsg");
  $("#deletedMessage").show();
  $("#withdraw_section").hide();
  $("#owner_section").hide();
  notify("destroy");
}

function closingDown() {
  notify("clear");
  notify("clearMsg");
  $("#betting_section").hide();
  $("#adding_section").hide();
  $("#closingMessage").show();
  notify("closingDown");
  if (ownerAddress == fromAddress){
    $("#owner_section").show();
  }
}

function waitingToClose() {
  notify("clear");
  notify("clearMsg");
  notify("waitingForProviders");
  $("#closingMessage").show();
}


function updateContract() {
  disableButtons();
  notify("clearMsg");
  notify("clear");
  notify("animateGo");
  notify("waiting");

  scrollUp();
  tempBEAddress = $("#Update_backend").val();
  console.log("The UpdateBE function was called.");
  contractInstance.methods.upgrade(tempBEAddress).send()
  .on("transactionHash", function(hash){
      console.log("This is the Txhash");
      console.log(hash);
  })
  .on("receipt", function(receipt){
    console.log("This is the receipt");
    console.log(receipt);
  })
  .on("error", function(error){
    console.log("This is the error");
    console.log(error);
    clearInterval(waitNotice);
    notify("clear");
    notify("animateStop");
    notify("error");
    enableButtons();
  })
  .then(function(){
    contractInstanceBE.methods.selfDestruct().send()
    .on("transactionHash", function(hash){
        console.log("This is the Txhash");
        console.log(hash);
    })
    .on("receipt", function(receipt){
      console.log("This is the receipt");
      console.log(receipt);
      clearInterval(waitNotice);
      notify("clear");
      notify("animateStop");
    })
    .on("error", function(error){
      console.log("This is the error");
      console.log(error);
      clearInterval(waitNotice);
      notify("clear");
      notify("animateStop");
      notify("error");
      enableButtons();
    })
    .then(function(){
      currentBeAddress = tempBEAddress;
      enableButtons();
      notify("upgrade");
    });
  });
}
