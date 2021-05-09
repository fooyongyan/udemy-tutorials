const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];

/**
 * Constructor implementation 
 */
function Blockchain ( ) {
    
    //Where the blockchain will be stored 
    this.chain = []; 

    //This is where new transactions is created, and put in the block
    //This is not recorded in the blockchain, only when a new Block is created
    //Effectively, this will only be committed only when a new Block is created
    this.pendingTransactions = [];

    ///Determine the Node Url 
    this.currentNodeUrl = currentNodeUrl;
    ///Network Nodes  
    this.networkNodes = [];

    //Creating a Genesis Block 
    this.createNewBlock(100, '0', '0');

}

/** Create new Block into a Blockchain.
 * Typically, this is being invoked when a new Block is mined/created  
 * */
Blockchain.prototype.createNewBlock = function ( nonce, previousBlockHash, hash )  {
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(), 
        transactions: this.pendingTransactions, 
        nonce: nonce, 
        hash: hash, /** Data from our new Block */ 
        previousBlockHash: previousBlockHash
    }
    /** All of the new Transactions should be cleared out for the new Block */
    this.pendingTransactions = [];
    this.chain.push( newBlock );
    return newBlock;
}

/** Return the last block transaction in the block chain */
Blockchain.prototype.getLastBlock = function () {
    return this.chain.length == 0 ? {} : this.chain[this.chain.length-1];
}

/** 
 * Create a new Blockchain Transaction in the process 
 * @returns the New Transaction Details
 * */
Blockchain.prototype.createNewTransaction = function ( amount, sender, recipient) {
    const newTransaction = {
        amount: amount, 
        sender: sender, 
        recipient: recipient
    }
    //Put the new Transaction into the pending Array
    this.pendingTransactions.push(newTransaction);
    //Return the index, with an increment of 1 
    return this.getLastBlock()['index'] +  1;
}

/**
 * Hash the block Data 
 * @param {*} previousBlockhash 
 * @param {*} currentBlockdata 
 * @param {number} nonce 
 */
Blockchain.prototype.hashBlock = function ( previousBlockhash, currentBlockdata, nonce) {
    const dataAsString = previousBlockhash + nonce.toString() + JSON.stringify(currentBlockdata);
    //Hash the string into a Sha String
    const hash = sha256(dataAsString); 
    return hash;
}

/**
 * What is a proof of work?
 * When every block is created, it would be added into the chain, and it is to check if the transaction is correct. 
 * What are the concerns:
 *  - Ensure that every chain would be true. 
 *  - To prevent fraud, so that we would be able to ensure that it is properly mined. 
 * @param {string} previousBlockHash 
 * @param {*} currentBlockData 
 */
Blockchain.prototype.proofOfWork = function ( previousBlockHash, currentBlockData ) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    //Keep trying until the hash gets 4 0000s
    while ( hash.substring ( 0, 4 ) !== '0000') {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
        console.log( hash );
    }
    return nonce;
}

module.exports = Blockchain;
