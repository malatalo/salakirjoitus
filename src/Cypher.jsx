import React, { useEffect, useState } from "react";
import CypherWord from "./CypherWord";
import { alphabet, nonLetters } from "./helpers";

const Cypher = ({ quote, goBack }) => {
  const [mix, setMix] = useState();
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    const shuffledAlphabet = [...alphabet].sort((a, b) => 0.5 - Math.random());

    const newMix = [];

    alphabet
      .filter((a) => quote.text.includes(a))
      .forEach((letter, i) => {
        newMix.push({
          real: letter,
          fake: shuffledAlphabet[i],
          guess: "",
          isRevealed: false,
          highlight: false,
        });
      });

    setMix(newMix);

    document.onkeydown = handleKeyControls;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote]);


  //TODO
  const doUndo = () => {};

  const doRedo = () => {};

  const handleKeyControls = (evt) => {
    const event = window.event ? window.event : evt;
    const key = event.key.toUpperCase();

    if (event.ctrlKey) {
      if (event.shiftKey) {
        if (key === "Z") doRedo();
      }

      if (key === "Z") doUndo();
      if (key === "Y") doRedo();
    }

    if(key === "TAB") {
      selectNextEmptyInput({id: event.target.id, forward: !event.shiftKey});
    }

    if (event.keyCode >= 37 && event.keyCode <= 40) {
      handleArrowKeys(event);
      return;
    }
  };

  const handleArrowKeys = (event) => {
    switch (event.key) {
      case "ArrowLeft":
        selectNextPrevInput(-1);
        break;
      case "ArrowRight":
        selectNextPrevInput(1);
        break;
      case "ArrowUp":
        selectNextPrevRowInput(-1);
        break;
      case "ArrowDown":
        selectNextPrevRowInput(1);
        break;
      default:
        break;
    }
  };

  const updateMix = (input) => {
    setMix((sMix) =>
      sMix.map((m) => {
        if (m.real === input.real) return { ...m, ...input };
        else if (m.guess === input.guess) return { ...m, guess: "" };
        return m;
      })
    );
  };

  const revealLetter = () => {
    const notRevealed = mix.filter((letter) => !letter.isRevealed);
    if (notRevealed.length === 0) return;
    const toReveal = notRevealed[Math.floor(Math.random() * notRevealed.length)];
    const newMix = mix.map((m) => {
      if (m.real === toReveal.real) {
        return { ...m, isRevealed: true };
      }
      return m;
    });
    setMix(newMix);
  };

  //memoize?
  const getInputs = () => Array.from(document.querySelectorAll("input"));
  const getRows = (inputs) =>
    inputs
      .map((el) => el.getBoundingClientRect().y)
      .filter((val, i, all) => all.indexOf(val) === i);

  const selectNextPrevInput = (dir = 1) => {
    const inputs = getInputs();

    const actEl = document.activeElement;
    if (!actEl.tagName === "INPUT") return;
    let nextElId = parseInt(actEl.id) + dir;

    if (nextElId < 0) nextElId = inputs.length - 1;
    else if (nextElId >= inputs.length) nextElId = 0;

    document.getElementById(nextElId).focus();
  };

  const resetGuesses = () => {
    setMix((sMix) =>
      sMix.map((m) => {
        if (m.isRevealed) return m;
        return { ...m, guess: "" };
      })
    );
  };

  const selectNextPrevRowInput = (dir) => {
    const inputs = getInputs();
    const rows = getRows(inputs);

    const actEl = document.activeElement;
    if (!actEl.tagName === "INPUT") return;

    const { x: curX, y: curY } = actEl.getBoundingClientRect();
    let curRowIndex = rows.indexOf(curY) + dir;

    if (curRowIndex < 0) curRowIndex = rows.length - 1;
    else if (curRowIndex >= rows.length) curRowIndex = 0;

    const els = inputs.filter((input) => input.getBoundingClientRect().y === rows[curRowIndex]);

    const closest = els.reduce((prev, curr) => {
      const cX = curr.getBoundingClientRect().x;
      const pX = prev.getBoundingClientRect().x;
      return Math.abs(cX - curX) < Math.abs(pX - curX) ? curr : prev;
    });

    closest.focus();
  };

  const selectNextEmptyInput = ({ id: curId, forward = true }) => {
    const inputs = getInputs();
    const index = inputs.findIndex((input) => input.id === curId);
    const firstPart = inputs.slice(0, index);
    const secondPart = inputs.slice(index + 1);

    let inputsToSelect;
    if (forward) {
      inputsToSelect = [...secondPart, ...firstPart];
    } else {
      inputsToSelect = [...firstPart.reverse(), ...secondPart.reverse()];
    }

    inputsToSelect = inputsToSelect.filter((input) => input.value === "");

    if (inputsToSelect.length === 0) return;

    inputsToSelect[0].focus();
  };

  const generateCypher = () => {
    const words = [];
    let currentWord = "";
    let lastWasNonLetter = false;
    let idSeq = 0;

    quote.text.split("").forEach((letter, i) => {
      if (nonLetters.includes(letter)) {
        if (!lastWasNonLetter) {
          words.push(
            <CypherWord
              word={currentWord}
              ids={[...Array(currentWord.length)].map((_) => idSeq++)}
              mix={mix}
              updateMix={updateMix}
              key={"w" + i}
              handleArrowKeys={handleArrowKeys}
              selectNextEmptyInput={selectNextEmptyInput}
            />
          );
        }

        const spaceClass = letter === " " ? "space" : "";

        words.push(
          <div className={`cypher-letter non-letter ${spaceClass}`} key={"l" + i}>
            {letter}
          </div>
        );

        currentWord = "";
        lastWasNonLetter = true;
      } else {
        currentWord += letter;
        lastWasNonLetter = false;
      }
    });

    return words;
  };

  if (!quote || !mix) return;

  const guessed = mix
    .map((m) => m.guess)
    .filter((x) => x)
    .sort();
  const revealed = mix
    .filter((m) => m.isRevealed)
    .map((m) => m.real)
    .sort();
  return (
    <>
      <div className="header">
        <div>
          <button onClick={goBack}>Takaisin</button>
          <button onClick={resetGuesses}>Tyhjennä arvaukset</button>
          <div>Arvoitus: {quote.id}</div>
          <button onClick={revealLetter}>Paljasta kirjain</button>
          <div>
            <div onClick={() => setShowSource(true)}>
              {showSource ? (
                "Lähde:"
              ) : (
                <span style={{ border: "1px solid black" }}>Näytä lähde</span>
              )}
            </div>
            <div className={`${showSource ? "" : "hidden"}`}>{quote.source}</div>
          </div>
        </div>
      </div>
      <div className="cypher-container">{generateCypher()}</div>
      <div className="footer">
        {alphabet.map((a) => {
          let classes = "";
          if (guessed.some((g) => g === a)) {
            classes += "fade";
          } else if (revealed.some((g) => g === a)) {
            classes += "fade revealed";
          }
          return (
            <div key={a} className={classes}>
              {a}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default React.memo(Cypher);
