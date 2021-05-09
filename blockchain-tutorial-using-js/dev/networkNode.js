const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const { v4: uuidv4 } = require('uuid');
const axios = require( 'axios');
const port = process.argv[2];
/**
 * It is important to note that this node address ought to be unique for each individual transactions. 
 * This way, we would ensure the transactions would makes sense
 */
const nodeAddress = uuidv4().split("-").join("");

 //Instance of a Blockchain Instance 
const __bitcoin = new Blockchain();

app.use(bodyParser.json);
app.use(bodyParser.urlencoded ( { extended: false}))

app.get ( '/blockchain', function ( req, res ) {
    res.send ( __bitcoin );
});

app.post ( '/transaction', function ( req, res ) {
    const blockIndex = __bitcoin.createNewTransaction ( req.body.amount, req.body.sender, req.body.recipient);
    res.json ( {
        note: `Transaction will be added in block ${blockIndex}`, 
        status: true
    })
});

app.get ( '/mine', function ( req, res ) {
    
    const lastBlock = __bitcoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    /** Dummy Data */
    const currentBlockData = {
        transactions: __bitcoin.pendingTransactions, 
        index: lastBlock['index'] + 1
    };

    const nonce = __bitcoin.proofOfWork(previousBlockHash, );
    const currentHash = __bitcoin.hashBlock( previousBlockHash, currentBlockData, nonce);
    const newBlock = __bitcoin.createNewBlock ( nonce, previousBlockHash, currentHash);

    //Create a mining reward, which would be managed into the implementation
    __bitcoin.createNewTransaction(12.5, "00", nodeAddress);
    
    res.json ( {
        note: "New block mined successfully.", 
        block: newBlock
    })
});

//Register a node and broadcast it to the network 
app.post ( '/register-and-broadcast-node', function ( req, res ) {
    const newNodeUrl = req.body.newNodeUrl; 
    console.log ( `Registering new node : ${ newNodeUrl}`);

    if ( __bitcoin.networkNodes.indexOf(newNodeUrl) === -1) {

        __bitcoin.networkNodes.push(newNodeUrl);
    } else {
        
        console.log ( `Node already exists in network`);
    }
    const regNodePromises = [];
    __bitcoin.networkNodes.forEach ( nodeUrl => {
        const url = `${nodeUrl}/register-node`;
        const body = {
            newNodeUrl: newNodeUrl
        }
        regNodePromises.push ( axios.post ( url, body ) )
    })
    Promise.all ( regNodePromises ) 
    .then ( data => {
        const url = `${nodeUrl}/register-nodes-bulk`;
        // use the data... 
        const body = {
            allNetworkNodes: [ ...__bitcoin.networkNodes, __bitcoin.currentNodeUrl ]
        }
        axios.post ( url, body )
        .then ( data => {
            res.json ( { note: 'New Nodes registered...'})
        })
    })
    //....
});

//Register a node with the network 
app.post ( '/register-node', function ( req, res ) {
    const newNodeUrl = req.body.newNodeUrl; 
    if ( __bitcoin.nodeAddress !== newNodeUrl && __bitcoin.networkNodes.indexOf(newNodeUrl) === -1) {
        __bitcoin.networkNodes.push(newNodeUrl);
    }
    res.send ( { message: `New node registered successfully with node.`})
} );

//Register multiple nodes at once 
app.post ( '/register-nodes-bulk', function ( req, res ) {
    const allNetworkNodes = req.body.allNetworkNodes;
    allNetworkNodes.forEach ( nodeUrl => {
        ///Only add if it is already in the Node, or if it is itself 
        if ( __bitcoin.nodeAddress !== nodeUrl && __bitcoin.networkNodes.indexOf ( nodeUrl) === -1 )
            __bitcoin.networkNodes.push(nodeUrl);
    })

    res.json ( { message : "Bulk registration succesful. "})
})

app.listen ( port, () => {
    console.log( `Application started at ${port}`);
})

