import Web3 from "web3";
import React, { useState, forwardRef } from "react";
import { Card, ListGroup } from "react-bootstrap";

export const EthereumTransactions = forwardRef((props, ref) => {

    const {ethTransactions} = props;

    return (
        <>
            <Card className="text-center row">
                <Card.Header>
                    <strong>EthereumTransactionsList</strong>
                </Card.Header>
                <Card.Body>
                    {ethTransactions?.map((transaction) =>
                        <Card style={{ width: "18rem" }} key={transaction.hash}>
                            <Card.Header>Transaction {transaction.hash}</Card.Header>
                            <ListGroup variant="flush">
                            <ListGroup.Item>
                                    <Card.Title>From: </Card.Title>
                                    <Card.Text>{transaction.from}</Card.Text>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Card.Title>To: </Card.Title>
                                    <Card.Text>{transaction.to}</Card.Text>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Card.Title>Date: </Card.Title>
                                    <Card.Text>{(new Date(transaction.timeStamp * 1000)).toUTCString()} </Card.Text>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Card.Title>Block: </Card.Title>
                                    <Card.Text>{transaction.blockNumber}</Card.Text>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Card.Title>Gas paid: </Card.Title>
                                    <Card.Text>{Web3.utils.fromWei((transaction.gasUsed * transaction.gasPrice).toString(), "ether")} Eth</Card.Text>
                                </ListGroup.Item>
                                {transaction.tokenName ? (
                                    <>
                                        <ListGroup.Item>
                                            <Card.Title>Token: </Card.Title>
                                            <Card.Text>{transaction.tokenName}</Card.Text>
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <Card.Title>Value: </Card.Title>
                                            <Card.Text>{transaction.value/Math.pow(10, parseInt(transaction.tokenDecimal))} {transaction.tokenSymbol} </Card.Text>
                                        </ListGroup.Item>
                                    </>
                                ) : (
                                    <ListGroup.Item>
                                        <Card.Title>Value: </Card.Title>
                                        <Card.Text>{Web3.utils.fromWei((transaction.value).toString(), "ether")} Eth</Card.Text>
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card>
                    )}
                </Card.Body>
            </Card>
        </>
    )
})
