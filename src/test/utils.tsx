import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

function customRender(ui: React.ReactElement, options = {}) {
  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
}

export * from "@testing-library/react";
export { customRender as render };
