import React, { useState, useRef } from "react";
import { Form, Card, Button } from "react-bootstrap";
import { EthereumTransactions } from "./EthereumTransactions.jsx";

function EthereumCard() {

    // Consts.
    const apiKey = "";
    const etherscanApi = "https://api.etherscan.io/api";

    // Usetstate for storing state.
    const [ethAddress, setEthAddress] = useState("0xc55dbe3cd4afa41e8c24283c5be8d2481e2b79c1");
    const [blockHeight, setBlockHeight] = useState("9000000");  
    const [ethTransactions, setEthTransactions] = useState(null);  
    const [ethBalance, setEthBalance] = useState(null);

    // Get all transactions from etherscan with startblock constrain.
    const getTransactions = async() => {
        try {
            const url = `${etherscanApi}?module=account&action=txlist&sort=desc&address=${ethAddress}&apikey=${apiKey}&startblock=${blockHeight}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "1"){
                return data.result;
            }
        } catch (err) {
            console.log(err)
        }
    };
        
    // Get tokens transactions from etherscan with startblock constrain.
    const getTokensTransactions = async() => {
        try {
            const url = `${etherscanApi}?module=account&action=tokentx&address=${ethAddress}&sort=desc&apikey=${apiKey}&startblock=${blockHeight}`;
            const response = await fetch(url);
            const data = await response.json();

              if (data.status === "1"){
                return data.result;
            }
        } catch (err) {
            console.log(err)
        }
    };

    // Union operation with transactions and token contract interactions based on hash id as a key.
    // Arrays can have different sizes and non-matching elements.
    // This is why in the end we need to sort them by blockNumber.
    const transactionsUnionByHash = (...arrays) => {
        let zip = Object.values(arrays.reduce((txIndex, array) => {
            array.forEach((tx) => {
                if(txIndex[tx.hash])
                    txIndex[tx.hash] = Object.assign(txIndex[tx.hash], tx)
                else
                    txIndex[tx.hash] = tx
            })

            return txIndex
        }, {}));

        // Sort by blockNumber after zip.
        zip.sort((a, b) => b.blockNumber - a.blockNumber); 

        return zip;
    };
    
    // Button for handling transactions query and current balance.
    const buttonHandlerTransactions = async() => {
        let [transactions, tokens] = await Promise.all([getTransactions(), getTokensTransactions()]);

        // Case scenario for token contract interactions. 
        if(transactions != undefined && tokens != undefined)
            transactions = transactionsUnionByHash(transactions, tokens);

        console.log(transactions); // TODO: remove later

        if(transactions != undefined) {
            setEthTransactions(transactions);
            setEthBalance("TODO"); // Add Eth value
        }
    };

    return (
        <Card className="text-center row">
            <Card.Header>
                <strong>Ethereum Transactions</strong>
            </Card.Header>
            <Card.Body>
                <Form className="col col-6 mx-auto" >

                    <Form.Group className="mb-3" >
                        <Form.Label>Ethereum Address:</Form.Label>
                        <Form.Control type="text" placeholder="" value={ethAddress} onChange={(e) => setEthAddress(e.target.value)}  />
                    </Form.Group>

                    <Form.Group className="mb-3" >
                        <Form.Label>Block Height:</Form.Label>
                        <Form.Control type="text" placeholder="" value={blockHeight} onChange={(e) => setBlockHeight(e.target.value)}  />
                    </Form.Group>

                    <Form.Group className="mb-3" >
                        <Form.Label>Current balance of {ethAddress}: {ethBalance} {ethBalance ? ("ETH") : ("")}</Form.Label>
                        <Button data-testid="transactions-button" onClick={async () => {await buttonHandlerTransactions();} } variant="primary" className="me-2">
                            Get Transactions
                        </Button>
                    </Form.Group>

                    <EthereumTransactions 
                        ethTransactions={ethTransactions}
                        />

                </Form>
            </Card.Body>
        </Card>
    )
}

export default EthereumCard
