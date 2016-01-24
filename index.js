var VM = require('ethereumjs-vm');
var Block = require('ethereumjs-block');
var Web3 = require('web3');
var async = require('async');

var vm = new VM();
// connects to the my server - works always
var web3 = new Web3(new Web3.providers.HttpProvider("http://188.226.178.57:8545")); 


const DESIRED_BLOCK_HEIGHT = 2; // how many blocks to sync


vm.stateManager.generateCanonicalGenesis( function(){
  
  var runs = [];
  
  for( var index=1; index<=DESIRED_BLOCK_HEIGHT; index++ ) {
    
    // TODO: refactor - FUCKING UGLY AND SLOW
    runs.push( ((i) => { return function( cb ) {
      web3.eth.getBlock( i, function( e, block ) {
        if(e) cb(e);
        
        vm.runBlock( {
          block: decodeBlock(block),
          generate: false
        }, cb );
        
      });
      
    }})(index));
  } 
  
  async.series( runs, function(e,r) {
    console.log(e,r);
  } );
  
});

// JSON_RPC to intern block syntax
function decodeBlock( json ) {
  return new Block({
    "number": "0x"+json.number.toString('16'),
    "header":{
      "parentHash": json.parentHash,
      "nonce": json.nonce,
      "uncleHash": json.sha3Uncles,
      "bloom": json.logsBloom,
      "transactionsTrie": json.transactionsRoot,
      "stateRoot": json.stateRoot,
      "receiptTrie": json.receiptRoot,
      "coinbase": json.miner,
      "difficulty": "0x"+json.difficulty.toString('16'),
      "extraData": json.extraData,
      "gasLimit": "0x"+json.gasLimit.toString('16'),
      "gasUsed": "0x"+json.gasUsed.toString('16'),
      "timestamp": "0x"+json.timestamp.toString('16')
    },
    "transactions": json.transactions,
    "uncleHeaders": json.uncles
  });
}
