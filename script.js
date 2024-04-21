const cards = {
  data: [],
  unusedIdxs: [],

  init: async function() {
    const response = await fetch("./cards.json");
    const data = await response.json();
    this.data = data;
    this.resetUnused();
  },

  random: function() {
    if (this.unusedIdxs.length === 0) {
      this.resetUnused();
    }
    const idx = this.unusedIdxs.splice(Math.floor(Math.random() * this.unusedIdxs.length), 1);
    return this.data[idx];
  },

  resetUnused: function() {
    this.unusedIdxs = [];
    for (let i = 0; i < this.data.length; i++) {
      this.unusedIdxs.push(i);
    }
  },
};

const board = {
  // HTML elements
  answerElem: document.querySelector("#answer"),
  notesElem: document.querySelector("#notes"),
  nextHintButton: document.querySelector("#next-hint"),
  revealAnswerButton: document.querySelector("#reveal-answer"),
  newCardButton: document.querySelector("#new-card"),
  hintListElem: document.querySelector("#hint-list"),
  guessForm: document.querySelector("#guess-form"),
  guessInput: document.querySelector("#guess-input"),
  guessSubmit: document.querySelector("#guess-form input[type=submit]"),
  guessListElem: document.querySelector("#guess-list"),

  // Current card data
  currentCard: undefined,
  currentHint: 0,
  checkForHint() {
    return this.currentHint < this.currentCard.hints.length;
  },

  // Main actions
  getNewCard() {
    // Clear the answer, hints, notes, and submit box
    this.answerElem.textContent = "?";
    this.notesElem.textContent = "";
    this.hintListElem.replaceChildren();
    this.guessListElem.replaceChildren();
    this.currentHint = 0;
    this.guessInput.value = "";
    // Enable any potentially disabled buttons
    this.nextHintButton.disabled = false;
    this.revealAnswerButton.disabled = false;
    this.guessInput.disabled = false;
    this.guessSubmit.disabled = false;
    // Get a random card
    this.currentCard = cards.random();
    // Add the first hint
    this.getNextHint();
  },

  getNextHint() {
    // If the current hint index is within range, add the hint
    if (this.checkForHint()) {
      const li = document.createElement("li");
      let hint = this.currentCard.hints[this.currentHint]
      li.textContent = hint;
      this.hintListElem.append(li);
      this.currentHint++;
    }
    // If there are no more hints, disable the button
    if (!this.checkForHint()) {
      this.nextHintButton.disabled = true;
    }
  },

  revealAnswer(showHints = true) {
    // Disable the reveal answer button
    this.revealAnswerButton.disabled = true;
    // Disable the guess input form elements
    this.guessInput.disabled = true;
    this.guessSubmit.disabled = true;
    // Reveal all the hints if desired
    while (showHints && this.checkForHint()) {
      this.getNextHint();
    }
    // Reveal the answer
    this.answerElem.textContent = this.currentCard.name;
    // If there are notes, reveal them
    let notes = this.currentCard.note;
    if (notes) {
      this.notesElem.textContent = notes;
    }
  },

  checkGuess(e) {
    e.preventDefault();
    let guess = this.guessInput.value;
    let correct = guess.toLowerCase().trim() === this.currentCard.name.toLowerCase().trim();
    if (correct) {
      this.revealAnswer(false);
    }
    else {
      const li = document.createElement("li");
      li.textContent = guess;
      this.guessListElem.append(li);
      this.guessInput.value = "";
    }
  }

}

// Once the card data is read, get a random card for the board
cards.init().then(() => {
  board.getNewCard();
})
// Bind event listeners to board elements
board.nextHintButton.addEventListener("click", board.getNextHint.bind(board));
board.revealAnswerButton.addEventListener("click", () => { board.revealAnswer() });
board.newCardButton.addEventListener("click", board.getNewCard.bind(board));
board.guessForm.addEventListener("submit", board.checkGuess.bind(board));
