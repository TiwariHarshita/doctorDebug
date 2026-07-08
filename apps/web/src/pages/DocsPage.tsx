// pages/DocsPage.tsx

export default function DocsPage() {
  return (
    <div>
      <h1>DebugPilot Docs</h1>

      <h2>1. Install SDK</h2>
      <pre>npm install debugpilot-sdk</pre>

      <h2>2. Initialize DebugPilot</h2>
      <pre>{`import { DebugPilot } from "debugpilot-sdk";

const debugPilot = new DebugPilot({
  apiKey: "YOUR_API_KEY",
});`}</pre>

      <h2>3. Capture errors</h2>
      <pre>{`try {
  // your code
} catch (error) {
  debugPilot.captureException(error);
}`}</pre>
    </div>
  );
}