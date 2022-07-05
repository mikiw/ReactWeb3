import React, { useState, useRef } from "react";
import Web3 from 'web3'
import { Form, Card, Button } from "react-bootstrap";
import { EthereumTransactions } from "./EthereumTransactions.jsx";

function EthereumCard() {

    // Usetstate for storing state.
    const [ethAddress, setEthAddress] = useState("0xc55dbe3cd4afa41e8c24283c5be8d2481e2b79c1");
    const [blockHeight, setBlockHeight] = useState("9000000");  
    const [ethTransactions, setEthTransactions] = useState(null);  
    const [ethBalance, setEthBalance] = useState(null);

    // const [chainId, setChainId] = useState("mainnet");
    // const [ip, setIp] = useState("test");

    // const defaultVariantValues = {
    //     "mainnet": { ip: "test"},
    //     "rinkeby": { ip: "test"}
    // };

    // // Handler for chain change.
    // const handleSelect = (e) => {

    //     // Handle change of selection in ComboBox.
    //     setChainId(e.currentTarget.value);
        
    //     if(!!defaultVariantValues[e.currentTarget.value]){

    //         // Set new values.
    //         console.log(e.currentTarget.value);
    //     }
    // };

    // Get transactions from etherscan with startblock constrain.
    const getTransactions = async() => {
        try {
            const apiKey = '';
            const etherscanApiUrl = `http://api.etherscan.io/api?module=account&action=txlist&s123123ort=desc&address=${ethAddress}&apikey=${apiKey}&startblock=${blockHeight}`;
            const response = await fetch(etherscanApiUrl);
            const data = await response.json();

            if (data.status === "1"){
                return data.result;
            }
        } catch (err) {
            console.log(err)
        }
    };
    
    // Button for handling transactions query and current balance.
    const buttonHandlerTransactions = async() => {
        var transactions = await getTransactions();
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

                    {/* <Form.Group className="mb-3" >
                        <Form.Label>Select node:</Form.Label>
                        <Form.Select onChange={(e) => {handleSelect(e)}} >
                            <option value={"mainnet"}>Mainnet</option>
                            <option value={"rinkeby"}>Rinkeby</option>
                        </Form.Select>
                    </Form.Group> */}
                    
                    <Form.Group className="mb-3" >
                        <Form.Label>Balance of {ethAddress}: {ethBalance} {ethBalance ? ("ETH") : ("")}</Form.Label>
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
