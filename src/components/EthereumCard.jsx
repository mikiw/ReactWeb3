import React, { useState, useRef } from "react";
import Web3 from 'web3'
import { Form, Card, Button } from "react-bootstrap";
import { EthereumTransactions } from "./EthereumTransactions.jsx";

function EthereumCard() {

    // Usetstate for storing state.
    const [chainId, setChainId] = useState("mainnet");
    const [ethAddress, setEthAddress] = useState("0xc55dbe3cd4afa41e8c24283c5be8d2481e2b79c1");
    const [ethBalance, setEthBalance] = useState(null);
    const [blockHeight, setBlockHeight] = useState("9000000");  
    const [ip, setIp] = useState("test");

    const defaultVariantValues = {
        "mainnet": { ip: "test"},
        "rinkeby": { ip: "test"}
    };

    // Handler for chain change.
    const handleSelect = (e) => {

        // Handle change of selection in ComboBox.
        setChainId(e.currentTarget.value);
        
        if(!!defaultVariantValues[e.currentTarget.value]){

            // Set new values.
            console.log(e.currentTarget.value);
        }
    };

    // Test for web3 lib.
    const loadBlockchainData = async() => {

        console.log("web3");

        try {
            const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
            const balance = await web3.eth.getBalance(ethAddress);
            console.log(balance);
            } catch (error) {
            console.log(error);
            }
    };

    // Button for handling transactions.
    const buttonHandlerTransactions = () => {

        console.log("buttonHandlerTransactions");
        var results = loadBlockchainData();
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
                        <Form.Label>Select node:</Form.Label>
                        <Form.Select onChange={(e) => {handleSelect(e)}} >
                            <option value={"mainnet"}>Mainnet</option>
                            <option value={"rinkeby"}>Rinkeby</option>
                        </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3" >
                        <Form.Label>Balance of {ethAddress}: {ethBalance} {ethBalance ? ("ETH") : ("")}</Form.Label>
                        <Button data-testid="transactions-button" onClick={buttonHandlerTransactions} variant="primary" className="me-2">
                            Get Transactions
                        </Button>
                    </Form.Group>

                    <EthereumTransactions 
                        chainId={chainId}
                        />

                </Form>
            </Card.Body>
        </Card>
    )
}

export default EthereumCard
