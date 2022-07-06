import React, { useState, useEffect } from "react";
import { Form, Card, Button } from "react-bootstrap";
import Web3 from "web3";
import { EthereumTransactions } from "./EthereumTransactions.jsx";

function EthereumCard() {

    // Consts.
    const apiKey = "";
    const etherscanApi = "https://api.etherscan.io/api";

    // Usetstate for storing state.
    const [ethAddress, setEthAddress] = useState("0xc55dbe3cd4afa41e8c24283c5be8d2481e2b79c1");
    const [startBlock, setStartBlock] = useState("9000000");  
    const [endBlock, setEndBlock] = useState("0");  
    const [ethTransactions, setEthTransactions] = useState(null);  
    const [ethBalanceBlock, setEthBalanceBlock] = useState(null);

    useEffect(() => {
        // Update block height after mount 
        const fetchData = async () => {
            const block = await getBlockHeight();
            setEndBlock(block);
        }
        
        // Call the async function
        fetchData()
            .catch(console.error);;
    }, []);

    // TODO: unification of etherscanApi calls with predicates.
    
    // Get current block height from etherscan.
    const getBlockHeight = async() => {
        try {
            const url = `${etherscanApi}?module=block&action=getblocknobytime&timestamp=${parseInt(Date.now()/1000)}&closest=before&apikey=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
        
            if (data.status === "1"){
                return data.result;
            }
        } catch (err) {
            console.log(err)
        }
    };

    // Get all transactions from etherscan with startBlock/endBlock constrain.
    const getTransactions = async(action) => {
        try {
            const url = `${etherscanApi}?module=account&action=${action}&sort=desc&address=${ethAddress}&apikey=${apiKey}&startblock=${startBlock}&endblock=${endBlock}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "1")
                return data.result;
            else if (data.status === "0" && data.message !== "NOTOK")
                return [];
            else 
                return null; 
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
        // TODO: try to do it later without sort
        zip.sort((a, b) => b.blockNumber - a.blockNumber); 

        return zip;
    };

    const calculateBalance = (txList, txListInternal) => {
        const address = ethAddress.toLowerCase();

        let inputTxListEth = new Web3.utils.BN(0);
        let outputTxListEth = new Web3.utils.BN(0);
        let outputTxListGas = new Web3.utils.BN(0);

        let inputTxListInternalEth = new Web3.utils.BN(0);
        let outputTxListInternalEth = new Web3.utils.BN(0);
        let outputTxListInternalGas = new Web3.utils.BN(0);

        // Input transactions.
        txList.filter(tx => tx.to == address).forEach(tx => {
            // When a transaction is marked "Fail" on Etherscan.io, the funds the sender 
            // intended to send are not deducted but remain in the sender's wallet.
            // However, the "Gas Fee" will still be deducted.
            inputTxListEth = tx.isError == "0" ? inputTxListEth.add(new Web3.utils.BN(tx.value)) : inputTxListEth;
        });

        // Output transactions and gas fees.
        txList.filter(tx => tx.from == address).forEach(tx => {
            // Same story here.
            outputTxListEth = tx.isError == "0" ? outputTxListEth.add(new Web3.utils.BN(tx.value)) : outputTxListEth;
            outputTxListGas = outputTxListGas.add(new Web3.utils.BN(tx.gasUsed).mul(new Web3.utils.BN(tx.gasPrice)));
        });

        // Input internal transactions.
        txListInternal.filter(tx => tx.to == address).forEach(tx => {
            inputTxListInternalEth = inputTxListInternalEth.add(new Web3.utils.BN(tx.value));
        });

        // Output internal transactions and gas fees.
        txListInternal.filter(tx => tx.from == address).forEach(tx => {
            outputTxListInternalEth = outputTxListInternalEth.add(new Web3.utils.BN(tx.value));
            outputTxListInternalGas = outputTxListInternalGas.add(new Web3.utils.BN(tx.gasUsed).mul(new Web3.utils.BN(tx.value)));
        });

        // Finish.
        console.log("inputTxListEth", inputTxListEth.toString());
        console.log("outputTxListEth", outputTxListEth.toString());
        console.log("outputTxListGas", outputTxListGas.toString());
        console.log("inputTxListInternalEth", inputTxListInternalEth.toString());
        console.log("outputTxListInternalEth", outputTxListInternalEth.toString()); // if addres is a contract address
        console.log("outputTxListInternalGas", outputTxListInternalGas.toString());

        const balanceBigNumber = inputTxListEth
            .sub(outputTxListEth)
            .sub(outputTxListGas)
            .add(inputTxListInternalEth)
            .sub(outputTxListInternalEth)
            .sub(outputTxListInternalGas);

        const balance = Web3.utils.fromWei(balanceBigNumber, "ether");
        console.log(balance);
        setEthBalanceBlock(balance);
    };

    // Button for handling transactions query and current balance.
    const buttonHandlerTransactions = async() => {
        let [txList, txListInternal, txListTokens] = await Promise.all([
            getTransactions("txList"),
            getTransactions("txlistinternal"),
            getTransactions("tokentx")
        ]);

        if(txList !== null && txListInternal !== null && txListTokens !== null){
            console.log("txList", txList);
            console.log("txListInternal", txListInternal);
            console.log("txListTokens", txListTokens);

            calculateBalance(txList, txListInternal);

            let txListUnion = [];

            // Case scenario for token contract interactions. 
            if(txList !== null && txListTokens !== null)
                txListUnion = transactionsUnionByHash(txList, txListTokens);
    
            console.log("txListUnion", txListUnion);        
    
            if(txList !== null) {
                setEthTransactions(txListUnion);
            }
        }
        else {
            setEthTransactions(null);
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
                        <Form.Label>Start block:</Form.Label>
                        <Form.Control type="text" placeholder="" value={startBlock} onChange={(e) => setStartBlock(e.target.value)}  />
                    </Form.Group>

                    <Form.Group className="mb-3" >
                        <Form.Label>End block:</Form.Label>
                        <Form.Control type="text" placeholder="" value={endBlock} onChange={(e) => setEndBlock(e.target.value)}  />
                    </Form.Group>

                    <Form.Group className="mb-3" >
                        <Form.Label>Balance from block {startBlock} to {endBlock} of {ethAddress}: {ethBalanceBlock} {ethBalanceBlock ? ("Ether") : ("")}</Form.Label>
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
