import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { OtherPage } from "./OtherPage";
import { Fib } from "./Fib";

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <header>
          <h1 className="App-title">Fib Calculator UPDATED!</h1>
          <Link to="/">Home</Link>
          <Link to="/otherpage">Other Page</Link>
        </header>
        <div>
          <Route exact path="/" component={Fib} />
          <Route path="/otherpage" component={OtherPage} />
        </div>
      </div>
    </Router>
  );
};

export default App;
