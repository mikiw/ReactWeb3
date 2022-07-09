import React, { forwardRef } from "react";
import Web3 from "web3";
import { BN } from "web3-utils";

export const EthereumBalance = forwardRef((props, ref) => {

    const {startBlock, endBlock, ethAddress, txList, txListInternals, txListTokens } = props;
    
    /**
     * Group array by key.
     * 
     * @param {string} key Property name.
     * @param {array} array Array to groupby.
     * @return {array} Array of grouped arrays.
     */
    const groupBy = (key, array) => array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);

        return objectsByKeyValue;
    }, {});

    /**
     * Code based on fromWei() function from ethjs-unit library.
     * Otherwise, we will lose decimal points for some tokens with BN library.
     * Is there a bug in BN or what?
     * 
     * @param {BN} balance Balance as BN.
     * @param {BN} decimal Decimal as BN, like 10e18.
     * @return {string} Formatted result.
     */
    const tokenValueAsString = (balance, decimal) => {
        const base = decimal;
        const baseLength = decimal.length - 1 || 1;
        let fraction = balance.mod(base).toString(10);

        while (fraction.length < baseLength) {
            fraction = `0${fraction}`;
        }

        return `${balance.div(base).toString(10)}${fraction == '0' ? '' : `.${fraction}`}`;
    };

    /**
     * Function to calculate ETH balance based on the transactions.
     * 
     * @param {array} txList Transactions.
     * @param {array} txListInternals Ethereum Internal Transactions.
     * @return {string} Balance as string calculated with fromWei() function.
     */
    const calculateEthBalance = (txList, txListInternals) => {
        const address = ethAddress.toLowerCase();

        let inputTxListEth = new BN(0);
        let outputTxListEth = new BN(0);
        let outputTxListGas = new BN(0);
        let inputTxListInternalEth = new BN(0);
        let outputTxListInternalEth = new BN(0);
        let outputTxListInternalGas = new BN(0);

        // Input transactions.
        txList.filter(tx => tx.to === address).forEach(tx => {
            // When a transaction is marked "Fail" on Etherscan.io, the funds the sender 
            // intended to send are not deducted but remain in the sender's wallet.
            // However, the "Gas Fee" will still be deducted.
            inputTxListEth = tx.isError === "0" ? inputTxListEth.add(new BN(tx.value)) : inputTxListEth;
        });

        // Output transactions and gas fees.
        txList.filter(tx => tx.from === address).forEach(tx => {
            // Same story here.
            outputTxListEth = tx.isError === "0" ? outputTxListEth.add(new BN(tx.value)) : outputTxListEth;
            outputTxListGas = outputTxListGas.add(new BN(tx.gasUsed).mul(new BN(tx.gasPrice)));
        });

        // Input internal transactions.
        txListInternals.filter(tx => tx.to === address).forEach(tx => {
            inputTxListInternalEth = inputTxListInternalEth.add(new BN(tx.value));
        });

        // Output internal transactions and gas fees.
        txListInternals.filter(tx => tx.from === address).forEach(tx => {
            outputTxListInternalEth = outputTxListInternalEth.add(new BN(tx.value));
            outputTxListInternalGas = outputTxListInternalGas.add(new BN(tx.gasUsed).mul(new BN(tx.value)));
        });

        // Calculate balance.
        const balance = inputTxListEth
            .sub(outputTxListEth)
            .sub(outputTxListGas)
            .add(inputTxListInternalEth)
            .sub(outputTxListInternalEth) // If address is a contract address.
            .sub(outputTxListInternalGas);

        return Web3.utils.fromWei(balance, "ether");
    };

    /**
     * Function to calculate tokens balances based on the tokens transactions.
     * 
     * @param {array} txListTokens Tokens transactions.
     * @return {array} Balance as array with Objects.
     */
    const calculateTokensBalances = (txListTokens) => {
        const address = ethAddress.toLowerCase();
        const groupByContractAddress = groupBy("contractAddress", txListTokens);
        let tokensBalances = [];

        Object.values(groupByContractAddress).forEach((contract) => {
            let inputTokenValue = new BN(0);
            let outputTokenValue = new BN(0);

            // Input transactions.
            contract.filter(tx => tx.to === address).forEach(tx => {
                inputTokenValue = inputTokenValue.add(new BN(tx.value));
            });
            
            // Output transactions.
            contract.filter(tx => tx.from === address).forEach(tx => {
                outputTokenValue = outputTokenValue.add(new BN(tx.value));
            });

            const balance = inputTokenValue.sub(outputTokenValue);
            const decimal = new BN(10).pow(new BN(contract[0].tokenDecimal));

            tokensBalances.push({ 
                "id": contract[0].contractAddress,
                "name": contract[0].tokenName,
                "symbol": contract[0].tokenSymbol,
                "value": tokenValueAsString(balance, decimal) // BN is broken for tokens balance.div(decimal).toString(10) why?
            });
        });

        return tokensBalances;
    };

    const ethBalance = calculateEthBalance(txList, txListInternals);
    const tokensBalances = calculateTokensBalances(txListTokens);

    return (
        <section className='balance'>
            <h2 className='my-5'>Balances</h2>
            <h6>Balance from block {startBlock} to {endBlock} of {ethAddress}: <span>{ethBalance} {ethBalance ? ("Ether") : ("")}</span></h6>
            <h6>Tokens</h6>
            <select>
                {tokensBalances?.map((token) =>
                    <option key={token.id} value="{color.id}">{token.name} {token.value} ({token.symbol})</option>
                )}
            </select>
        </section>
    )
})
