import { useState } from "react";
import Cypher from "./Cypher";
import quotes from "./Quotes";
import "./style.css";

const App = () => {
  const [selectedQuote, setSelectedQuote] = useState();

  const getPage = () => {
    if (selectedQuote) {
      window.ratkaisu = selectedQuote.text;
      return <Cypher quote={{...selectedQuote, text: selectedQuote.text.toUpperCase()}} goBack={()=>setSelectedQuote()}/>;
    } else {
      return <div className="container">
        <h1>Valitse teksti</h1>
        <div className="select-container">
          <div className="text-selection">Satunnainen</div>
          {quotes.map((quote) => (
            <div key={quote.id} className="text-selection" onClick={()=>setSelectedQuote(quote)}>
              {quote.id}
            </div>
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
