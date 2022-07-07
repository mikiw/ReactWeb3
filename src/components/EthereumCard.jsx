import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { BN } from "web3-utils";
import moment from "moment";
import { EthereumTransactions } from "./EthereumTransactions.jsx";
import { EthereumBalance } from "./EthereumBalance.jsx";

function EthereumCard() {
    
    // TODO: Add token balances.
    // TODO: Unification of etherscanApi calls with predicates.
    // TODO: Better commnets for code and functions.
    // TODO: Update transactionsUnionByHash, can it be O(n)?
    // TODO: Any change in inputs should clear results.
    // TODO: Add tests.
    // TODO: Readme with screens.

    // Consts.
    const apiKey = "TNYDY6U8QC6CGHP6YX49Y2N22FVQTNU4MX";
    const etherscanApi = "https://api.etherscan.io/api";

    // Usetstate for storing state.
    const [ethAddress, setEthAddress] = useState("0xe6a238ac126b00439e7b84045d339d142205d2c8");
    const [startBlock, setStartBlock] = useState("11000000");  
    const [endBlock, setEndBlock] = useState("0");
    const [endBlockDate, setEndBlockDate] = useState(moment(Date.now()).format("YYYY-MM-DD"));   
    const [ethTransactions, setEthTransactions] = useState(null);  
    const [ethBalance, setEthBalance] = useState(null);

    const [tokensBalance, setTokensBalance] = useState(null);

    useEffect(() => {
        // Update block height after component mount.
        const fetchData = async () => {
            const lastEthblock = await getBlockHeight(Date.now());
            setEndBlock(lastEthblock);
        }
        
        // Call the async function.
        fetchData()
            .catch(console.error);;
    }, []);

    /**
     * Returns current block height from etherscan.
     *
     * @param {number} dateInMilliseconds Date in milliseconds.
     * @return {number} TODO: The result.
     */
    const getBlockHeight = async(dateInMilliseconds) => {
        try {
            const url = `${etherscanApi}?module=block&action=getblocknobytime&timestamp=${parseInt(dateInMilliseconds/1000)}&closest=before&apikey=${apiKey}`;
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
                txIndex[tx.hash] ? txIndex[tx.hash] = Object.assign(txIndex[tx.hash], tx) : txIndex[tx.hash] = tx
            })
            
            return txIndex
        }, {}));

        // Sort by blockNumber after zip.
        zip.sort((a, b) => b.blockNumber - a.blockNumber); 

        return zip;
    };

    const calculateEthBalance = (txList, txListInternal) => {
        const address = ethAddress.toLowerCase();

        let inputTxListEth = new BN(0);
        let outputTxListEth = new BN(0);
        let outputTxListGas = new BN(0);

        let inputTxListInternalEth = new BN(0);
        let outputTxListInternalEth = new BN(0);
        let outputTxListInternalGas = new BN(0);

        // Input transactions.
        txList.filter(tx => tx.to == address).forEach(tx => {
            // When a transaction is marked "Fail" on Etherscan.io, the funds the sender 
            // intended to send are not deducted but remain in the sender's wallet.
            // However, the "Gas Fee" will still be deducted.
            inputTxListEth = tx.isError == "0" ? inputTxListEth.add(new BN(tx.value)) : inputTxListEth;
        });

        // Output transactions and gas fees.
        txList.filter(tx => tx.from == address).forEach(tx => {
            // Same story here.
            outputTxListEth = tx.isError == "0" ? outputTxListEth.add(new BN(tx.value)) : outputTxListEth;
            outputTxListGas = outputTxListGas.add(new BN(tx.gasUsed).mul(new BN(tx.gasPrice)));
        });

        // Input internal transactions.
        txListInternal.filter(tx => tx.to == address).forEach(tx => {
            inputTxListInternalEth = inputTxListInternalEth.add(new BN(tx.value));
        });

        // Output internal transactions and gas fees.
        txListInternal.filter(tx => tx.from == address).forEach(tx => {
            outputTxListInternalEth = outputTxListInternalEth.add(new BN(tx.value));
            outputTxListInternalGas = outputTxListInternalGas.add(new BN(tx.gasUsed).mul(new BN(tx.value)));
        });

        // Calculate balance.
        const balance = inputTxListEth
            .sub(outputTxListEth)
            .sub(outputTxListGas)
            .add(inputTxListInternalEth)
            .sub(outputTxListInternalEth) // If addres is a contract address.
            .sub(outputTxListInternalGas);

        setEthBalance(Web3.utils.fromWei(balance, "ether"));
    };

    const groupBy = (key, array) => array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);

        return objectsByKeyValue;
    }, {});

    // Code based on fromWei() function from ethjs-unit library
    // otherwise, we will lose decimal points for tokens with BN.
    const tokenValueAsString = (balance, decimal) => {
        const base = decimal;
        const baseLength = decimal.length - 1 || 1;
        let fraction = balance.mod(base).toString(10);

        while (fraction.length < baseLength) {
            fraction = `0${fraction}`;
        }

        return `${balance.div(base).toString(10)}${fraction == '0' ? '' : `.${fraction}`}`;
    };

    const calculateTokenBalance = (txListTokens) => {
        let tokensBalances = [];
        const address = ethAddress.toLowerCase();
        const groupByContractAddress = groupBy("contractAddress", txListTokens);

        Object.values(groupByContractAddress).forEach((contract) => {
            let inputTokenValue = new BN(0);
            let outputTokenValue = new BN(0);

            // Input transactions.
            contract.filter(tx => tx.to == address).forEach(tx => {
                inputTokenValue = inputTokenValue.add(new BN(tx.value));
            });
            
            // Output transactions and gas fees.
            contract.filter(tx => tx.from == address).forEach(tx => {
                outputTokenValue = outputTokenValue.add(new BN(tx.value));
            });

            const balance = inputTokenValue.sub(outputTokenValue);
            const decimal = new BN(10).pow(new BN(contract[0].tokenDecimal));

            tokensBalances.push({ 
                "id": contract[0].contractAddress,
                "name": contract[0].tokenName,
                "symbol": contract[0].tokenSymbol,
                "value": tokenValueAsString(balance, decimal)
            });
        });

        console.log("tokensBalances", tokensBalances);
        setTokensBalance(tokensBalances);

        return tokensBalances;
    };

    // Button for handling transactions query and balance.
    const buttonHandlerTransactions = async(e) => {
        e.preventDefault(); // TODO: do I need this?

        let [txList, txListInternal, txListTokens] = await Promise.all([
            getTransactions("txList"),
            getTransactions("txlistinternal"),
            getTransactions("tokentx")
        ]);

        if(txList !== null && txListInternal !== null && txListTokens !== null){
            calculateEthBalance(txList, txListInternal);
            calculateTokenBalance(txListTokens);
            
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

    // Button for handling block update by date.
    const buttonHandlerUpdateBlock = async(e) => {
        e.preventDefault(); // TODO: do I need this?
        
        const block = await getBlockHeight(moment(endBlockDate).valueOf());
        
        setStartBlock(0);
        setEndBlock(block);
        setEthBalance(null);
        setEthTransactions(null);
    };

    return (
        <main className="ethereum-card row">
            <h1>Ethereum Transactions Crawler</h1>
            <div>
                <form className='col col-lg-9'>
                
                    <div>
                        <label htmlFor="ethereumAdress" className="form-label col-sm-3">Ethereum Address:</label>
                        <input 
                            type="text" 
                            placeholder="" 
                            value={ethAddress} 
                            onChange={(e) => setEthAddress(e.target.value)} 
                            className="form-control" 
                            id="ethereumAdress" />
                    </div>

                    <div>
                        <label htmlFor="startBlock" className="form-label col-sm-3">Start block:</label>
                        <input 
                            type="text" 
                            placeholder="" 
                            value={startBlock} 
                            onChange={(e) => setStartBlock(e.target.value)}
                            className="form-control" 
                            id="startBlock" />
                    </div>

                    <div>
                        <label htmlFor="endBlock" className="form-label col-sm-3">End block:</label>
                        <input 
                            type="text" 
                            placeholder="" 
                            value={endBlock} 
                            onChange={(e) => setEndBlock(e.target.value)}
                            className="form-control" 
                            id="endBlock" />
                    </div>

                    <div>
                        <label htmlFor="endBlockDate" className="form-label col-sm-3">End block date:</label>
                        <input 
                            type="text" 
                            placeholder="" 
                            value={endBlockDate} 
                            onChange={(e) => setEndBlockDate(e.target.value)}
                            className="form-control" 
                            id="endBlockDate" />
                    </div>

                    <div>
                        <button data-testid="date-button" onClick={async (e) => {await buttonHandlerUpdateBlock(e)}} className="btn btn-light">
                            Update blocks by date
                        </button>
                    </div>

                    <div>
                        <EthereumBalance
                            startBlock={startBlock}
                            endBlock={endBlock}
                            ethAddress={ethAddress}
                            ethBalance={ethBalance}
                            tokensBalance={tokensBalance}
                            />
                        <button data-testid="transactions-button" onClick={async (e) => {await buttonHandlerTransactions(e)}} className="btn btn-light">
                            Get balances
                        </button>
                    </div>

                </form>

                <EthereumTransactions
                    ethTransactions={ethTransactions}
                    />
            </div>
        </main>
    )
}

export default EthereumCard
