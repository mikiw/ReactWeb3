import Web3 from "web3";
import React, { forwardRef } from "react";

export const EthereumTransactions = forwardRef((props, ref) => {

    const {ethTransactions} = props;

    return (!ethTransactions? (false):(
        <section className='transactions-list'>
            <h2>EthereumTransactions List ({ethTransactions?.length})</h2>
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
