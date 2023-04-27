import logo from "./logo.svg";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Form, Templates } from "./pages/index";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/templates" element={<Templates />} />
      </Routes>
    </div>
  );
}

export default App;
