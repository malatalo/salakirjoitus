import { alphabet } from "./helpers";

const CypherWord = ({ word, ids, mix, updateMix, selectNextEmptyInput, won }) => {

  const handleKeyDown = (real) => (event) => {
    event.preventDefault();
    const key = event.key.toUpperCase();

    if(event.ctrlKey) return;

    if (alphabet.some((a) => a === key)) {
      updateMix({ real: real, guess: key });
    } else if (key === "DELETE" || key === "BACKSPACE") {
      updateMix({ real: real, guess: "" });
    }
  };

  const handleFocus = (mixObj) => () => {
    updateMix(mixObj);
  }

  const handleKeyUp = (event) => {
    if(event.ctrlKey) return;
    const key = event.key.toUpperCase();
    if (alphabet.some((a) => a === key)) {
      selectNextEmptyInput({id:event.target.id})
    }
  }

  return (
    <div className="cypher-word">
      {word.split("").map((letter, i) => {
        const current = mix.find((m) => m.real === letter);
        const id = ids[i];
        return (
          <div className="cypher-letter" key={letter + i}>
            <div className="top">
              <input
                className= {`${current.highlight && won === false ? "highlight" :""}`}
                id={id}
                key={letter}
                type="text"
                maxLength={1}
                onFocus={handleFocus({real: letter, highlight: true})}
                onBlur={handleFocus({real: letter, highlight: false})}
                defaultValue={current.isRevealed ? current.real:current.guess}
                onKeyDown={handleKeyDown(letter)}
                onKeyUp={handleKeyUp}
                disabled={won}
              ></input>
            </div>
            <label htmlFor={id} className="bottom">
              {current.isRevealed ? '\u00A0':current.fake}
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default CypherWord;
