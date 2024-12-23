// Phaser configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#87ceeb",
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
let gameStarted = false; // To prevent race actions before the countdown finishes

function preload() {
  this.load.image("player", "assets/red_car.png"); // Player car
  this.load.image("opponent", "assets/blue_car.png"); // Opponent car
  this.load.image("track", "assets/road.png"); // Road background
}

function create() {
  // Add the top track for the player
  this.add.image(400, 200, "track");

  // Add the player's car
  this.player = this.add.sprite(50, 200, "player");

  // Add the bottom track for the opponent
  this.add.image(400, 400, "track");

  // Add the opponent's car
  this.opponent = this.add.sprite(50, 400, "opponent");

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

  // Add countdown text
  this.countdownText = this.add.text(400, 300, "", {
    font: "50px Arial",
    fill: "#000"
  }).setOrigin(0.5);

  // Opponent speed
  this.opponentSpeed = 0.5;

  // Start the countdown
  startCountdown.call(this);
}

function update() {
  if (gameStarted) {
    // Move the opponent car forward at a fixed speed
    this.opponent.x += this.opponentSpeed;

    // Check if the player or the opponent wins
    if (this.player.x >= 750) {
      this.questionText.setText("You Win! Refresh to play again.");
      this.input.keyboard.off("keydown");
      this.opponentSpeed = 0; // Stop opponent
    } else if (this.opponent.x >= 750) {
      this.questionText.setText("Opponent Wins! Refresh to play again.");
      this.input.keyboard.off("keydown");
      this.opponentSpeed = 0; // Stop opponent
    }
  }
}

// Countdown logic
function startCountdown() {
  let countdown = 3;

  const timer = this.time.addEvent({
    delay: 1000, // 1 second interval
    callback: () => {
      if (countdown > 0) {
        this.countdownText.setText(countdown); // Display the countdown
        countdown--;
      } else if (countdown === 0) {
        this.countdownText.setText("Go!"); // Show "Go!"
        countdown--;
      } else {
        this.countdownText.setText(""); // Clear the countdown
        timer.remove(); // Stop the timer
        gameStarted = true; // Allow the race to start
        generateQuestion.call(this); // Generate the first question
        this.input.keyboard.on("keydown", handleAnswer.bind(this)); // Enable input
      }
    },
    loop: true
  });
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
  if (!gameStarted) return; // Ignore input before the countdown finishes

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