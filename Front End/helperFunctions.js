
var extra;
var waitNotice;
var id;
var tOut;


function configAmount(depositAmount, denomination){
  if (denomination === "ether"){
    var config = {value: web3.utils.toWei(depositAmount, "ether")}
  }
  else if (denomination === "wei"){
    var config = {value: web3.utils.toWei(depositAmount, "wei")}
  }
  else {
    console.log("denomination has an error!");
  }
  return config;
}

function updateContractBalance(){

  $("#contract_balance_eth").text('Contract Balance: ' + (contractBalance / 1000000000000000000).toFixed(3) + ' Eth');

  return;
}

function updateProviderBalance(){

  entitled = ( (entitled_share + userBalance ) / 1000000000000000000);
  // console.log("The entitled amount is: ");
  // console.log(entitled);

  $("#contract_provider_balance").text('Your on-contract account has: ' + entitled.toFixed(3) + ' Eth');

  return;
}

function updateFee(){
  setTimeout(function () {
    $("[data-toggle='popover']").popover('hide');
  }, 3000);
  $("[data-toggle='popover']").popover('show');
}

function resetBar(){

  var elem1 = document.getElementById("color_bar");
  elem1.style.width = 0 + "%";
  var elem2 = document.getElementById("color_bar_yellow");
  elem2.style.width = 0 + "%";
  var elem3 = document.getElementById("color_bar_red");
  elem3.style.width = 0 + "%";
  $("#color_bar_red").hide();
  $("#color_bar_yellow").hide();
  $("#color_bar").hide();
}

function disableButtons(){
  document.getElementById("place_bet").disabled = true;
  document.getElementById("deposit_button").disabled = true;
  document.getElementById("withdraw_button").disabled = true;
  document.getElementById("destroy_button").disabled = true;
  document.getElementById("upgrade_button").disabled = true;
}

function enableButtons(){
  document.getElementById("place_bet").disabled = false;
  document.getElementById("deposit_button").disabled = false;
  document.getElementById("withdraw_button").disabled = false;
  document.getElementById("destroy_button").disabled = false;
  document.getElementById("upgrade_button").disabled = false;
}

function progressBar() {
  var progress = 0;
  $("#color_bar").show();
  var i = 0;
  if (i == 0) {
    i = 1;
    var elem = document.getElementById("color_bar");
    var width = 0;
     	// console.log("1");
    id = setInterval(frame, 100);
    function frame() {
      if (progress >= 700) {
        clearInterval(id);
        $("#color_bar").hide();
        $("#color_bar_yellow").show();
        elem = document.getElementById("color_bar_yellow");
        elem.style.width = 100 + "%";
        progress = 0;
        tOut = setTimeout(function () {
          $("#color_bar_yellow").hide();
          $("#color_bar_red").show();
          elem = document.getElementById("color_bar_red");
          elem.style.width = 100 + "%";
          $("#place_bet").hide();
          $("#refund_bet").show();
        }, 30000);
        // console.log("3");
      } else {
      // console.log("2");
        progress++;
        width = parseInt(100-(progress/7));
        elem.style.width = width + "%";
      }
    }
  }
}

function logTx(hash){
  console.log("--- The following is the hash ---");
  console.log(hash);
  console.log("---  ---");
}

function logReceipt(receipt){
  console.log("--- The following is the reciept ---");
  console.log(receipt);
  console.log("---  ---");
}

function contractInfo(){
  document.getElementById("current_address").innerHTML = "The contract address is <a href='https://ropsten.etherscan.io/address/0x5aaae9eaac0fc01d9fbc5d39a34c3e2c7392d2ce' target='_blank'>here.</a>";
}

function notify(noteType, data){
  /* Here we have the following notice types for the function notify

  html tag id   -->   "notice label"
  ----------------------------------------
  winner_notice   -->   "winner"
  loser_notice    -->   "loser"
  destroy_notice  -->   "destroy"
  deposit_notice  -->   "deposit"
  withdraw_notice -->   "withdraw"
  error_notice    -->   "error"
  owner_notice    -->   "owner"
  provider_notice -->   "provider"
  clear_notice    -->   "clear"  //only used to clear previous html notifications
  */

  switch (noteType){

    /* --- Notices at the top of the card --- */
    case "winner":
      notify("clear");
      temp = parseFloat(data);
      extra = (" " + temp.toFixed(3) + " Eth");
      document.getElementById("winner_notice").innerHTML = "Congratulations! You won!<br>" + extra;
      $("#winner_notice").fadeIn();
      setTimeout(function () {
        $("#winner_notice").fadeOut();
      }, 5000);
    break;

    case "loser":
      notify("clear");
      document.getElementById("loser_notice").innerHTML = "Sorry, you lost. Please, try again.";
      $("#loser_notice").fadeIn();
      setTimeout(function () {
        $("#loser_notice").fadeOut();
      }, 5000);
    break;

    case "destroy":
      $("#betting_section").hide();
      $("#adding_section").hide();
      $("#withdraw_section").hide();
      $("#owner_section").hide();

      $("#place_bet").hide();
      $("#input_heads_tails").hide();
      $("#bet_amount").hide();
      $("#input_denomination").hide();
      $("#game_title").hide();
      $("#contract_balance_eth").hide();

      $("#betMessage").hide();
      $("#deletedMessage").show();

      document.getElementById("destroy_notice").innerHTML = "The contract no longer exists. Goodbye!";
      $("#destroy_notice").fadeIn();
      setTimeout(function () {
        $("#destroy_notice").fadeOut();
      }, 5000);
    break;

    case "deposit":
      temp = parseFloat(data);
      extra = (" " + temp.toFixed(3) + " Eth");
      document.getElementById("deposit_notice").innerHTML = "You successfully provided liquidity!<br>" + extra;
      $("#deposit_notice").fadeIn();
      setTimeout(function () {
        $("#deposit_notice").fadeOut();
      }, 5000);
    break;

    case "withdraw":
      notify("clear");
      temp = parseFloat(data);
      extra = (" " + temp.toFixed(3) + " Eth");
      document.getElementById("withdraw_notice").innerHTML = "You successfully withdrew funds!<br>" + extra;
      $("#withdraw_notice").fadeIn();
      setTimeout(function () {
        $("#withdraw_notice").fadeOut();
      }, 5000);
    break;

    case "refund":
      temp = parseFloat(data);
      extra = (" " + temp.toFixed(3) + " Eth");
      document.getElementById("refund_notice").innerHTML = "Please try again.<br>Your bet was refunded.<br>" + extra;
      $("#refund_notice").fadeIn();
      setTimeout(function () {
        $("#refund_notice").fadeOut();
      }, 5000);
    break;

    case "error":
      document.getElementById("error_notice").innerHTML = "There was an error... no transaction happened.<br> Please try again.";
      $("#error_notice").fadeIn();
      setTimeout(function () {
        $("#error_notice").fadeOut();
      }, 5000);
    break;

    case "upgrade":
      document.getElementById("upgrade_notice").innerHTML = "You have successfully upgraded this contract.";
      $("#upgrade_notice").fadeIn();
      setTimeout(function () {
        $("#upgrade_notice").fadeOut();
      }, 5000);
    break;

    case "owner":
      document.getElementById("owner_notice").innerHTML = "Owner, welcome!";
      $("#owner_notice").fadeIn();
      $("#owner_section").show();
      setTimeout(function () {
        $("#owner_notice").fadeOut();
      }, 3000);
    break;

    case "provider":
      document.getElementById("provider_notice").innerHTML = "Provider, welcome!";
      $("#provider_notice").fadeIn();
      $("#withdraw_section").show();
      setTimeout(function () {
        $("#provider_notice").fadeOut();
      }, 3000);
    break;

    case "hello":
      document.getElementById("hello_notice").innerHTML = "Welcome. Click the coin.";
      $("#hello_notice").fadeIn();
      setTimeout(function () {
        $("#hello_notice").fadeOut();
      }, 5000);
    break;

    case "waiting":
    document.getElementById("waiting_notice").innerHTML = "Waiting for a response...";
    $("#waiting_notice").fadeIn();
    waitNotice = setInterval(function () {
      $("#waiting_notice").animate({opacity: "1"}, "slow");
      setTimeout(function () {
        $("#waiting_notice").animate({opacity: ".1"}, "slow");
      }, 3000);
    }, 4000);
    break;

    case "closingDown":
      document.getElementById("closingDown_notice").innerHTML = "We are closing but it is still too early.";
      $("#closingDown_notice").fadeIn();
      setTimeout(function () {
        $("#closingDown_notice").fadeOut();
      }, 3000);
    break;

    case "waitingForProviders":
      document.getElementById("waitingForProviders_notice").innerHTML = "We are still waiting on other providers.";
      $("#waitingForProviders_notice").fadeIn();
      setTimeout(function () {
        $("#waitingForProviders_notice").fadeOut();
      }, 3000);
    break;


    /* --- Animation of the coin and coms area updating --- */
    case "animateGo":
      $("#coinAnimate").show();
      $("#coinImage").hide();
      notify("clearMsg");
      $("#spinner").show();
      $("#sendingMessage").show();
    break;

    case "animateStop":
    $("#coinImage").show();
      $("#coinAnimate").hide();
      notify("clearMsg");
      $("#betMessage").show();
    break;

    case "updateComs":
    setTimeout(function () {
      $("#sendingMessage").hide();
      $("#sentMessage").show();
    }, 1000);
    setTimeout(function () {
      $("#sentMessage").hide();
      $("#waitingMessage").show();
      progressBar();
      $("#betMessage").hide();
      // $("#place_bet").hide();
      // $("#refund_bet").show();
    }, 3000);
    break;

    case "rulesOn":
      $("#myModal").modal();
    break;

    case "rulesOff":
    document.getElementById("rulesMessage").style.display = "none";
    break;

    case "clear":
      $("#winner_notice").fadeOut();
      $("#loser_notice").fadeOut();
      $("#destroy_notice").fadeOut();
      $("#deposit_notice").fadeOut();
      $("#withdraw_notice").fadeOut();
      $("#error_notice").fadeOut();
      $("#owner_notice").fadeOut();
      $("#provider_notice").fadeOut();
      $("#waiting_notice").fadeOut();
      $("#upgrade_notice").fadeOut();
    break;

    case "clearMsg":
      $("#sendingMessage").hide();
      $("#sentMessage").hide();
      $("#waitingMessage").hide();
      $("#closingMessage").hide();
      $("#deletedMessage").hide();
      $("#spinner").hide();
      $("#betMessage").hide();
    break;
  }
}

function scrollUp(){
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function getDataForFrontEnd(){
  /*
  This function gets the follow data from the smart contract:
  contractBalance / totalLPpool / userBalance / lp_balance / userGenNum / _contractGenNum
  It then sets the front end variables equal to those values for front end manipulation.
  */
  await contractInstance.methods.contractBalance().call().then(async function(balanceAmount){//Getting contract balance
    contractBalance = parseFloat(balanceAmount);
    // console.log("contractBalance : " + contractBalance);
    await contractInstance.methods.LPTokenPool().call().then(async function(_LPPool){//Getting the total Liquidity Pool amount
      totalLPpool = parseFloat(_LPPool);
      // console.log("totalLPpool : " + totalLPpool);
      await contractInstance.methods.getUserBalance().call().then(async function(_userBalance){//Getting user balance
        userBalance = parseFloat(_userBalance);
        // console.log(userBalance);
        await contractInstance.methods.getLiquidityProviderBalance(contractInstance.options.from).call().then(async function(_lp_balance){//Getting LP balance
          lp_balance = parseFloat(_lp_balance);
          // console.log("lp_balance : " + lp_balance);
          await contractInstance.methods.getLiquidityProviderGen(contractInstance.options.from).call().then(async function(_userGenNum){//Get User's Gen
            userGenNum = parseFloat(_userGenNum);
            // console.log("userGenNum : " + userGenNum);
            await contractInstance.methods.currentLPGen().call().then(async function(_contractGenNum){//Get the contract's Generation number
              contractGen = parseFloat(_contractGenNum);
              // console.log("contractGen : " + contractGen);
              await contractInstance.methods.processingFee().call().then(async function(_processingFee){//Get the contract's Generation number
                processingFee = parseFloat(_processingFee);
                // console.log("processingFee : " + processingFee);
                await contractInstance.methods.betsAllowed().call().then(async function(_betsAllowed){//Get the contract's Generation number
                  betsAllowed = _betsAllowed;
                  // console.log("betsAllowed : " + betsAllowed);
                  await contractInstance.methods.SELF_DESTRUCT_TIMER().call().then(async function(_sdt){//Get the contract's Generation number
                    self_destruct_timer = parseFloat(_sdt);
                    // console.log("self_destruct_timer : " + self_destruct_timer);
                    await contractInstance.methods.activeBets().call().then(async function(_activeBets){//Get the contract's Generation number
                      activeBets = _activeBets;
                      // console.log("activeBets : " + activeBets);
                      await contractInstance.methods.getUserBet().call().then(async function(_betAmount){//Get the contract's Generation number
                        betAmount = parseFloat(_betAmount);
                        // console.log("betAmount : " + betAmount);
                        await contractInstance.methods.currentAddress().call().then(async function(_currentAddress){//Get the contract's Generation number
                          currentBEAddress = _currentAddress;
                          // console.log("betAmount : " + betAmount);
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}
