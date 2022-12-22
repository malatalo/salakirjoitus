import { useState } from "react";
import Cypher from "./Cypher";
import quotes from "./Quotes";
import "./style.css";

const App = () => {
  const [selectedQuote, setSelectedQuote] = useState();

  const randomQuote = () => {
    setSelectedQuote(quotes[Math.floor(Math.random() * quotes.length)])
  }

  const getPage = () => {
    if (selectedQuote) {
      window.ratkaisu = selectedQuote.text;
      return <Cypher quote={{...selectedQuote, text: selectedQuote.text.toUpperCase()}} goBack={()=>setSelectedQuote()}/>;
    } else {
      return <div className="container">
        <h1>Valitse teksti</h1>
        <button className="text-selection-random" onClick={randomQuote}>Satunnainen</button>
        <div className="text-selection-flex">
          {quotes.map((quote) => (
            <button key={quote.id} className="text-selection" onClick={()=>setSelectedQuote(quote)}>
              {quote.id}
            </button>
          ))}
        </div>
      </div>
    }
  };

  return (
      <div className="page-container">{getPage()}</div>
  );
};

export default App;
