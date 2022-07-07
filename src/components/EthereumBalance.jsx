import React, { forwardRef } from "react";

export const EthereumBalance = forwardRef((props, ref) => {

    const {startBlock, endBlock, ethAddress, ethBalance, tokensBalance } = props;

    return (
        <section className='balance'>
            <h2 className='my-5'>Balance</h2>
            <h6>Balance from block {startBlock} to {endBlock} of {ethAddress}: <span>{ethBalance} {ethBalance ? ("Ether") : ("")}</span></h6>
            <h6>Tokens</h6>
            <select>
                {tokensBalance?.map((token) =>
                    <option key={token.id} value="{color.id}">{token.name} {token.value} ({token.symbol})</option>
                )}
            </select>
        </section>
    )
})
