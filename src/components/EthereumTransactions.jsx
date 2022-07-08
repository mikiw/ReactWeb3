import Web3 from "web3";
import React, { forwardRef } from "react";

export const EthereumTransactions = forwardRef((props, ref) => {

    const {txList, txListTokens} = props;

    /**
     * Union operation with transactions and token contract interactions based on hash id as a key.
     * Arrays can have different sizes, non-matching elements and can be unsorted.
     * This is why in the end we need to sort them by blockNumber.
     *
     * @param {...arrays} arrays Arrays of transactions that contain blockNumber.
     * @return {array} Zipped data as sorted array by blockNumber.
    */
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

    const ethTransactions = transactionsUnionByHash(txList, txListTokens);

    return (!ethTransactions? (false):(
        <section className='transactions-list'>
            <h2>Ethereum transactions ({ethTransactions?.length})</h2>
            <div className='wrapper'>
                {ethTransactions?.map((transaction) =>
                    <div key={transaction.hash}>
                        <dl className="row">
                            <dt className="col-sm-3">Transaction hash: </dt>
                            <dd className="col-sm-9" title={transaction.hash}>{transaction.hash}</dd>

                            <dt className="col-sm-3">From: </dt>
                            <dd className="col-sm-9" title={transaction.from}>{transaction.from}</dd>

                            <dt className="col-sm-3">To: </dt>
                            <dd className="col-sm-9" title={transaction.to}>{transaction.to}</dd>

                            <dt className="col-sm-3">Block number: </dt>
                            <dd className="col-sm-9">{transaction.blockNumber}</dd>

                            <dt className="col-sm-3">Date: </dt>
                            <dd className="col-sm-9">{(new Date(transaction.timeStamp * 1000)).toUTCString()}</dd>

                            {transaction.tokenName ? (
                                <>
                                    <dt className="col-sm-3">Token: </dt>
                                    <dd className="col-sm-9">{transaction.tokenName}</dd>

                                    <dt className="col-sm-3">Value: </dt>
                                    <dd className="col-sm-9">{transaction.value/Math.pow(10, parseInt(transaction.tokenDecimal))} {transaction.tokenSymbol}</dd>
                                </>
                            ) : (
                                <>
                                    <dt className="col-sm-3">Value: </dt>
                                    <dd className="col-sm-9">{Web3.utils.fromWei((transaction.value).toString(), "ether")} Eth</dd>
                                </>
                            )}

                            <dt className="col-sm-3">Gas paid: </dt>
                            <dd className="col-sm-9">{Web3.utils.fromWei((transaction.gasUsed * transaction.gasPrice).toString(), "ether")} Eth</dd>

                            <dt className="col-sm-3">Error: </dt>
                            <dd className="col-sm-9">{transaction.isError === "1" ? ("Fail") : ("None") }</dd>
                        </dl>
                    </div>
                )}
            </div>
        </section>
        )
    )
})
