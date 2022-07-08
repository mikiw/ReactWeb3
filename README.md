# Ethereum Transactions Crawler

I used [etherscan](https://etherscan.io/) which is a blockchain explorer to avoid indexing by each block.
It would be a struggle to write this application only with an Ethereum node.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

To run project we san simply run these 2 commands in the project directory:
```
npm install
npm start
```

Later open [http://localhost:3000](http://localhost:3000) to view it in your browser.
In application is built successfully we should see page like this:
TODO: add screen

Available scripts commands:
`npm start`
`npm test`
`npm run build`

## Getting Started

Application will query etherscan for transactions between 'Start block' and 'End block',
later balances for eth and tokens will be calculated based on that data.
So we can calculate the balances in specific block ranges.

If we want to calculate balance from the beginning we can just simply input '0' as 'Start block'.
When page will load the first API call we will make is to get last block number from etherscan so '0' should change to something near '15101312'.

TODO: Write how button works

## Example usage
TODO: example usage with screen

## TODO

TODO:
- Add tests.
- Any change in inputs should clear results?
- Test BN library, I don't know why but for this wallet 0x9f4a83475ef57f70c1a7754c3b381479626900ea I found that some tokens are not calculated properly. Check tokenValueAsString again.

TODO for future:
- Add paging in while loop for etherscan API call to exceed 10000 row limit.
- Add other Token standards (Erc721 for uniswap v3 and others)
