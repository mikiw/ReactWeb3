import { render, screen } from "@testing-library/react";
import App from "./App";

test("Check 'Update blocks by date' button from EthereumCard.", ()=> {
  const { getByTestId } = render(<App />);
  const button = getByTestId("date-button");
  expect(button).toBeInTheDocument();
});

test("Check 'Get balances and transactions' button from EthereumCard.", ()=> {
  const { getByTestId } = render(<App />);
  const button = getByTestId("transactions-button");
  expect(button).toBeInTheDocument();
});

it("Renders '0 Ether' Balance from EthereumBalance.", () => {
  render(<App />);
  expect(screen.getByText("0 Ether")).toBeInTheDocument();
});

it("Renders 'Ethereum transactions' from EthereumTransactions.", () => {
  render(<App />);
  expect(screen.getByText("0 Ether")).toBeInTheDocument();
});