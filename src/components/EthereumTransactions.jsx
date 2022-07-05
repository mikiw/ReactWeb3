import React, { useState, forwardRef } from "react";
import { Card } from "react-bootstrap";

export const EthereumTransactions = forwardRef((props, ref) => {

    return (
        <>
            <Card className="text-center row">
                <Card.Header>
                    <strong>EthereumTransactionsList</strong>
                </Card.Header>
            </Card>
        </>
    )
})
