// Phaser configuration
const config = {
  type: Phaser.AUTO, // Automatically chooses WebGL or Canvas rendering
  width: 800,
  height: 600,
  backgroundColor: "#87ceeb", // Sky blue background
  parent: "game-container",
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// Initialize the game
const game = new Phaser.Game(config);

let currentQuestion, correctAnswer, score = 0, answerBuffer = "";

function preload() {
  // Load assets
  this.load.image("player", "assets/red_car.png"); // Placeholder for player sprite
  this.load.image("track", "assets/road.png"); // Placeholder track
}

function create() {
  // Add a track background
  this.add.image(400, 300, "track");

  // Add the player's sprite
  this.player = this.add.sprite(50, 300, "player");

  // Display a question
  this.questionText = this.add.text(400, 50, "", {
    font: "24px Arial",
    fill: "#000"
  }).setOrigin(0.5);

  // Display the score
  this.scoreText = this.add.text(650, 20, "Score: 0", {
    font: "18px Arial",
    fill: "#000"
  });

  // Display the current input buffer
  this.inputText = this.add.text(400, 100, "Your Answer: ", {
    font: "20px Arial",
    fill: "#000"
  }).setOrigin(0.5);

  // Generate the first question
  generateQuestion.call(this);

  // Set up keyboard input
  this.input.keyboard.on("keydown", handleAnswer.bind(this));
}

function update() {
  // Game logic
  if (this.player.x >= 750) {
    this.questionText.setText("You Win! Refresh to play again.");
    this.input.keyboard.off("keydown");
  }
}

// Generate a random math question
function generateQuestion() {
  const num1 = Phaser.Math.Between(-10, 10);
  const num2 = Phaser.Math.Between(-10, 10);
  const operator = Phaser.Math.RND.pick(["+", "-", "*"]);

  switch (operator) {
    case "+":
      correctAnswer = num1 + num2;
      break;
    case "-":
      correctAnswer = num1 - num2;
      break;
    case "*":
      correctAnswer = num1 * num2;
      break;
  }

  currentQuestion = `What is ${num1} ${operator} ${num2}?`;
  this.questionText.setText(currentQuestion);
  answerBuffer = ""; // Reset the input buffer for a new question
  this.inputText.setText("Your Answer: ");
}

// Handle player's input
function handleAnswer(event) {
  const key = event.key;

  // Allow digits, minus sign (only as the first character), and backspace
  if (!isNaN(key)) {
    answerBuffer += key; // Add the digit to the buffer
    this.inputText.setText(`Your Answer: ${answerBuffer}`);
  } else if (key === "-" && answerBuffer.length === 0) {
    answerBuffer += key; // Add minus sign if buffer is empty
    this.inputText.setText(`Your Answer: ${answerBuffer}`);
  } else if (key === "Backspace") {
    answerBuffer = answerBuffer.slice(0, -1); // Remove the last character
    this.inputText.setText(`Your Answer: ${answerBuffer}`);
  } else if (key === "Enter") {
    // Check the answer on Enter key press
    if (parseInt(answerBuffer) === correctAnswer) {
      // Correct answer: Smoothly move player forward
      this.tweens.add({
        targets: this.player,
        x: this.player.x + 50,
        duration: 500,
        ease: "Power2" // Smooth easing
      });
      score++;
      this.scoreText.setText(`Score: ${score}`);
      generateQuestion.call(this);
    } else {
      // Incorrect answer: Provide feedback, then revert question
      this.questionText.setText("Incorrect! Try again.");
      this.time.delayedCall(1500, () => {
        this.questionText.setText(currentQuestion); // Restore question
      });
    }
    answerBuffer = ""; // Reset the input buffer after checking
    this.inputText.setText("Your Answer: ");
  }
}
