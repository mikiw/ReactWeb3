import React, { useState, useEffect } from "react";
import moment from "moment";
import { EthereumTransactions } from "./EthereumTransactions.jsx";
import { EthereumBalance } from "./EthereumBalance.jsx";

function EthereumCard() {
    
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
    const [txList, setTxList] = useState(null);  
    const [txListInternals, setTxListInternals] = useState(null);  
    const [txListTokens, setTxListTokens] = useState(null);  

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
            console.log(err);
        }
    };

    // Update block height after component mount.
    useEffect(() => {
        const fetchData = async () => {
            const lastEthblock = await getBlockHeight(Date.now());
            setEndBlock(lastEthblock);
        }
        
        fetchData().catch(console.error);
    }, []);

    // Button handler for block update by date.
    const buttonHandlerUpdateBlock = async(e) => {
        e.preventDefault();
        
        const block = await getBlockHeight(moment(endBlockDate).valueOf());
        
        setStartBlock(0);
        setEndBlock(block);
        setTxList(null);
        setTxListInternals(null);
        setTxListTokens(null);
    };

    // Button handler for transactions API calls.
    const buttonHandlerTransactions = async(e) => {
        e.preventDefault();

        let [txList, txListInternals, txListTokens] = await Promise.all([
            getTransactions("txList"),
            getTransactions("txlistinternal"),
            getTransactions("tokentx")
        ]);

        if(txList !== null && txListInternals !== null && txListTokens !== null){
            setTxList(txList);
            setTxListInternals(txListInternals);
            setTxListTokens(txListTokens);
        }
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
                            txList = {txList || []}
                            txListInternals = {txListInternals || []}
                            txListTokens = {txListTokens || []}
                            />
                        <button data-testid="transactions-button" onClick={async (e) => {await buttonHandlerTransactions(e)}} className="btn btn-light">
                            Get balances
                        </button>
                    </div>

                </form>

                <EthereumTransactions
                    txList = {txList || []}
                    txListTokens = {txListTokens || []}
                    />
            </div>
        </main>
    )
}

export default EthereumCard
