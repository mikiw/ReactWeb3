import { render, screen } from "@testing-library/react";
import App from "./App";

it("renders ETH Balance", () => {
  render(<App />);
  expect(screen.getByText("ETH Balance")).toBeInTheDocument();
});
