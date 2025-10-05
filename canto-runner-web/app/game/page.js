"use client";

import { useEffect, useState } from "react";
import * as Phaser from "phaser";
import "./game.css"; // optional CSS for extra styling

export default function GamePage() {
  const [stage, setStage] = useState("home"); // home, playing, result
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [resultType, setResultType] = useState(""); // "win" or "lose"

  // Sample questions
  const questions = [
    { question: "Capital of France?", correct: "Paris", wrong: ["London", "Berlin", "Rome"] },
    { question: "2 + 2 = ?", correct: "4", wrong: ["3", "5", "22"] },
    { question: "Color of the sky?", correct: "Blue", wrong: ["Red", "Green", "Yellow"] },
    { question: "Who is a guy?", correct: "Colton", wrong: ["Han", "Mara", "Felicia"] },
    { question: "Favorite color?", correct: "Blue", wrong: ["Red", "Green", "Yellow"] }
  ];

  useEffect(() => {
    if (stage !== "playing") return;

    class GameScene extends Phaser.Scene {
      create() {
        this.score = 0;
        this.lives = 3;
        this.questionIndex = 0;
        this.timer = 5;

        this.lanesY = [200, 300, 400];
        this.currentLane = 1;

        this.player = this.add.rectangle(400, this.lanesY[this.currentLane], 50, 50, 0x00ff00);
        this.cursors = this.input.keyboard.createCursorKeys();

        // Top-right Score and Lives
        this.scoreText = this.add.text(window.innerWidth - 20, 20, `Score: ${this.score}`, {
          fontSize: '24px',
          fill: '#000000'
        }).setOrigin(1, 0);

        this.livesText = this.add.text(window.innerWidth - 20, 50, `Lives: ${this.lives}`, {
          fontSize: '24px',
          fill: '#000000'
        }).setOrigin(1, 0);

        // Question and Timer
        this.questionText = this.add.text(400, 100, '', { fontSize: '28px', fill: '#000000' }).setOrigin(0.5);
        this.timerText = this.add.text(400, 150, `Time: ${Math.ceil(this.timer)}`, { fontSize: '24px', fill: '#000000' }).setOrigin(0.5);

        this.answerTexts = [];
        this.showQuestion();
      }

      showQuestion() {
        if (this.questionIndex >= questions.length || this.lives <= 0) {
          setScore(this.score);
          setLives(this.lives);
          setResultType(this.lives <= 0 ? "lose" : "win");
          setStage("result");
          return;
        }

        this.currentQuestion = questions[this.questionIndex];
        this.questionText.setText(this.currentQuestion.question);

        const wrongAnswers = Phaser.Utils.Array.Shuffle(this.currentQuestion.wrong).slice(0, 2);
        this.answers = Phaser.Utils.Array.Shuffle([this.currentQuestion.correct, ...wrongAnswers]);

        this.answerTexts.forEach(t => t.destroy());
        this.answerTexts = this.answers.map((ans, i) =>
          this.add.text(400, this.lanesY[i], ans, { fontSize: '24px', fill: '#000000' }).setOrigin(0.5)
        );

        this.timer = 5;
      }

      update(time, delta) {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
          this.currentLane = Math.max(0, this.currentLane - 1);
          this.player.y = this.lanesY[this.currentLane];
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
          this.currentLane = Math.min(2, this.currentLane + 1);
          this.player.y = this.lanesY[this.currentLane];
        }

        this.timer -= delta / 1000;

        // Update HUD
        this.timerText.setText(`Time: ${Math.ceil(this.timer)}`);
        this.scoreText.setText(`Score: ${this.score}`);
        this.livesText.setText(`Lives: ${this.lives}`);

        if (this.timer <= 0 || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
          const chosen = this.answers[this.currentLane];
          if (chosen === this.currentQuestion.correct) this.score++;
          else this.lives--;

          this.questionIndex++;
          this.showQuestion();
        }
      }
    }

    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: "game-container",
      backgroundColor: 0xffffff,
      scene: [GameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);
    return () => game.destroy(true);
  }, [stage]);

  // ---------------- HOME SCREEN ----------------
  if (stage === "home") {
    return (
      <div className="flex flex-col justify-center items-center w-screen h-screen bg-white pt-20">
        <h1 className="text-5xl font-bold mb-10 text-black">Language Game</h1>

        <button
          className="w-48 py-3 mb-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
          onClick={() => setStage("playing")}
        >
          Start
        </button>

        <button
          className="w-48 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
          onClick={() => alert("Use ↑↓ to move and → to select the answer")}
        >
          How to Play
        </button>
      </div>
    );
  }

  // ---------------- GAME SCREEN ----------------
  if (stage === "playing") {
    return <div id="game-container" className="w-screen h-screen"></div>;
  }

  // ---------------- RESULT SCREEN ----------------
  if (stage === "result") {
    return (
      <div className="flex flex-col justify-center items-center w-screen h-screen bg-white pt-20">
        <h1 className="text-4xl text-black font-bold mb-4">
          {resultType === "win" ? "Congratulations! You won!" : "You ran out of HP!"}
        </h1>
        <p className="text-xl text-black mb-6">Score: {score}</p>

        <button
          className="w-48 py-3 mb-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
          onClick={() => {
            setScore(0);
            setLives(3);
            setStage("playing");
          }}
        >
          Play Again
        </button>

        <button
          className="w-48 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
          onClick={() => setStage("home")}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return null;
}
