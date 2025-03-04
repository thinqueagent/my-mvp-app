import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./index.css";

console.log("React application initializing...");

// Ensure the root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find root element");
}

// Clear any existing content
while (rootElement.firstChild) {
  rootElement.removeChild(rootElement.firstChild);
}

try {
  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  console.log("React application mounted successfully");
} catch (error) {
  console.error("Failed to mount React application:", error);
  // Display error to user if mounting fails
  rootElement.innerHTML = `
    <div style="padding: 20px; color: red;">
      Failed to load application. Please refresh the page or contact support if the issue persists.
    </div>
  `;
}