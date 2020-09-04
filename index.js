var SteamUser = require('steam-user');
var SteamCommunity = require('steamcommunity');
var SteamTotp = require('steam-totp');
var TradeOfferManager = require('steam-tradeoffer-manager'); 
var fs = require('fs');
var merge = require('lodash.merge');

var firstClient = new SteamUser();
var nr2Client = new SteamUser();
 
// Managers
var firstManager = new TradeOfferManager({
   "steam": firstClient, 
   "domain": "example.com", 
   "language": "en" 
});
 
var nr2Manager = new TradeOfferManager({
   "steam": nr2Client, 
   "domain": "example.com", 
   "language": "en" 
});
 
// Communities
var firstCommunity = new SteamCommunity();
var nr2Community = new SteamCommunity();
 
// Config
var config = JSON.parse(fs.readFileSync('./config.json'));
 
// Security Code
const SECURITY_CODE = Math.floor((Math.random() * 99999) + 1);
 
 
var counter = 0;
// Log On Options
var firstLogonOptions = {
   "accountName": config.bots.firstaccount.username,
   "password": config.bots.firstaccount.password,
   "twoFactorCode": SteamTotp.getAuthCode(config.bots.firstaccount.shared_secret)
};
var nr2LogonOptions = {
   "accountName": config.bots.nr2.username,
   "password": config.bots.nr2.password,
   "twoFactorCode": SteamTotp.getAuthCode(config.bots.nr2.shared_secret)
};
 
// Logging in...
firstClient.logOn(firstLogonOptions);
nr2Client.logOn(nr2LogonOptions);
 
 
firstClient.on('loggedOn', () => {
   console.log('Logged In!');
   firstClient.setPersona(SteamUser.Steam.EPersonaState.Online);
   firstClient.gamesPlayed([440,570]);  //if you want a custom game you use firstClient.gamesPlayed(["CUSTOM GAME",440,570]);
 
});
 
 
firstClient.on('webSession', function(sessionID, cookies) {
   firstManager.setCookies(cookies, function(err) {
      if (err) {
         console.log(err);
         process.exit(1);
         return;
      }
      firstManager.getInventoryContents(440, 2, true, function(err, inv) { // Load Inventory,if you want to trade CS:GO cases use "730" 
         if (err) { 
            console.log('Error, in loading our inventory.')
            return;
         }
         var firstOffer = firstManager.createOffer(config.bots.nr2.tradelink); 
         for (var i = 0; i < inv.length; ++i) { 
            var itemname = inv[i].market_hash_name.toLowerCase();
            if (itemname.includes('case')) {
               console.log('Trade Item ' + itemname)
               firstOffer.addMyItem(inv[i]);
               break;
            } else if (i == inv.length - 1) {
               console.log('We could not find a item.');
            }
         } 
         firstOffer.setMessage(SECURITY_CODE.toString());
         firstOffer.send((err, status) => {
            if (status == 'pending') {
               firstCommunity.acceptConfirmationForObject(config.bots.firstaccount.identity_secret, firstOffer.id, function(err) {
                  if (err) {
                     console.log('Error accepting Trade.');
                     return;
                  } else {
                     console.log('Trade offered. Counter is at : ' + counter);
                  }
               });
            }
         });
      });
   });
   
   firstCommunity.setCookies(cookies);
});
 

firstManager.on('newOffer', function(offer) {
   if (offer.message.toString() == SECURITY_CODE.toString() && offer.itemsToGive.length == 0) {
      console.log('Found our trade. #' + ++counter);
      offer.accept(function(err) {
         var identity_secret = config.accounts.first.identity_secret;
         console.log('First Account, has accepted trade. Now sending it back.');
         var newOffer = firstManager.createOffer(config.bots.nrt2.tradelink);
         firstManager.getInventoryContents(440, 2, true, (err, inv) => {
            if (err) {
               console.log('Error getting our inventory.');
               return;
            } else {
               newOffer.addMyItem(inv[0]);
               newOffer.setMessage(SECURITY_CODE.toString());
               newOffer.send((err, status) => {
                  if (err) {
                    console.log(err);
                     console.log('Error, sending send back trade.');
                     return;
                  } else {
                     firstCommunity.acceptConfirmationForObject(config.bots.firstaccount.identity_secret, newOffer.id, () => {
                        console.log('Trade sent back!');
                     })
                  }
               })
            }
         });
      });
   } else {
      console.log('Ignorning trade.');
   }
});
 



nr2Client.on('loggedOn', () => {
   console.log('Nr2 Logged In!');
   nr2Client.setPersona(SteamUser.Steam.EPersonaState.Online);
   nr2Client.gamesPlayed([440,570]); //If you want a custom game you use firstClient.gamesPlayed(["CUSTOM GAME",440,570]);
});

 
nr2Client.on('webSession', function(sessionID, cookies) {
   nr2Manager.setCookies(cookies, function(err) {
      if (err) {
         return;
      }
   });
   nr2Community.setCookies(cookies);
});
 
nr2Manager.on('newOffer', function(offer) {
   console.log('Trade #' + ++counter)
   console.log('Second Account found an Offer!');
   if (offer.message.toString() == SECURITY_CODE.toString() && offer.itemsToGive.length == 0) {
      offer.accept(function(err) {
         var identity_secret = config.bots.nr2.identity_secret;
         console.log('nr2 Account, has accepted trade. Now sending it back.');
         var newOffer = nr2Manager.createOffer(config.bots.firstaccount.tradelink);
         nr2Manager.getInventoryContents(440, 2, true, (err, inv) => {
            if (err) {
               console.log('Error getting our inventory.');
               return;
            } else {
               newOffer.addMyItem(inv[0]);
               newOffer.setMessage(SECURITY_CODE.toString());
               newOffer.send((err, status) => {
                  if (err) {
                    console.log(err);
                     console.log('Error, sending send back trade.');
                     return;
                  } else {
                     nr2Community.acceptConfirmationForObject(config.bots.nr2.identity_secret, newOffer.id, (err) => {
                        if (err) {
                           console.log('Could not accept trade.');
                           return;
                        } else {
                           console.log('Trade sent back, nr2 account should recieve it in a few seconds.');
                        }
                     });
                  }
               });
            }
         });
      });
   } else {
      console.log('We found a trade, that has not been made by bot.');
   }
});
 
