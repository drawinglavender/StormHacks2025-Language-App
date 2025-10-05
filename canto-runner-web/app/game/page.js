"use client";

import { useEffect, useState } from "react";
import * as Phaser from "phaser";

export default function GamePage() {
  const [stage, setStage] = useState("home");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [resultType, setResultType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dots, setDots] = useState(".");

  const questions = [
    { question: "Capital of France?", correct: "Paris", wrong: ["London", "Berlin", "Rome"] },
    { question: "2 + 2 = ?", correct: "4", wrong: ["3", "5", "22"] },
    { question: "Color of the sky?", correct: "Blue", wrong: ["Red", "Green", "Yellow"] },
    { question: "Who is a guy?", correct: "Colton", wrong: ["Han", "Mara", "Felicia"] },
    { question: "Favorite color?", correct: "Blue", wrong: ["Red", "Green", "Yellow"] }
  ];

  // Animated dots effect for loading screen
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return ".";
        return prev + ".";
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (stage !== "playing") return;

    setIsLoading(true);

    class GameScene extends Phaser.Scene {

      preload() {
        // Load bridge background and kitty sprites
        this.load.image('bridge', '/trail.png');
        this.load.image('kitty1', '/kitty1.png');
        this.load.image('kitty2', '/kitty2.png');
        this.load.image('background', '/background.png');
        
        // Set loading flag to false when all assets are loaded
        this.load.on('complete', () => {
          setTimeout(() => setIsLoading(false), 100);
        });
      }

      create() {
        this.score = 0;
        this.lives = 3;
        this.questionIndex = 0;
        this.timer = 5;

        // ------------------ Layout ------------------
        this.paddingBottom = 150;
        this.playerWidth = 70;
        this.playerHeight = 70;
        this.laneGap = 120;
        this.blockWidth = 250;
        this.blockHeight = 70;

        // Add bridge background at the bottom
        const bridgeHeight = 325;
        this.bridge = this.add.image(this.scale.width / 2, this.scale.height - bridgeHeight / 2, 'bridge');
        this.bridge.setDisplaySize(this.scale.width, bridgeHeight);

        this.playerX = 150;
        this.playerY = this.scale.height - this.paddingBottom - this.playerHeight / 2;
        this.currentLane = 1;
        
         // Add background at the very back, covering entire screen
         const background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background');
         background.setDisplaySize(this.scale.width, this.scale.height);
         background.setDepth(-10);

        // Create player sprite
        this.player = this.add.sprite(this.playerX, this.playerY, 'kitty1');
        this.player.setScale(4);
        
        // Create animation
        this.anims.create({
          key: 'run',
          frames: [
            { key: 'kitty1' },
            { key: 'kitty2' }
          ],
          frameRate: 4,
          repeat: -1
        });
        
        this.player.play('run');

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();

        // ------------------ HUD ------------------
       this.timerText = this.add.text(20, 20, `Time: ${Math.ceil(this.timer)}`, {
        fontSize: '28px', fill: '#fff', stroke: '#000', strokeThickness: 2
      });
      this.timerText.setDepth(100);
      
      this.scoreText = this.add.text(this.scale.width - 20, 20, `Score: ${this.score}`, {
        fontSize: '28px', fill: '#fff'
      }).setOrigin(1, 0);
      this.scoreText.setDepth(100);
      
      this.livesText = this.add.text(this.scale.width - 20, 60, `Lives: ${this.lives}`, {
        fontSize: '28px', fill: '#fff'
      }).setOrigin(1, 0);
      this.livesText.setDepth(100);

      this.questionText = this.add.text(this.scale.width / 2, 100, '', {
        fontSize: '48px', fill: '#fff', align: 'center', wordWrap: { width: this.scale.width - 200 },
        backgroundColor: '#326BD0', padding: { x: 40, y: 30 }
      }).setOrigin(0.5);
      this.questionText.setDepth(100);

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

        if (this.blocks) this.blocks.forEach(b => b.destroy());
        this.blocks = [];

        const startX = this.scale.width + 200;
        const endX = this.playerX;
        const laneStartY = this.playerY - this.laneGap;
        const duration = this.timer * 1000;

        this.answers.forEach((ans, i) => {
          const block = this.add.text(startX, laneStartY + i * this.laneGap, ans, {
            fontSize: '28px',
            backgroundColor: '#326BD0',
            padding: { x: 20, y: 20 },
            color: '#fff'
          }).setOrigin(0.5);
          
          block.setDepth(5);

          this.blocks.push(block);

          this.tweens.add({
            targets: block,
            x: endX,
            duration: duration,
            ease: 'Linear'
          });
        });
      }

      update(time, delta) {
        // Move player up/down between lanes
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
          this.currentLane = Math.max(0, this.currentLane - 1);
          this.player.y = this.playerY - (this.laneGap * (1 - this.currentLane));
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
          this.currentLane = Math.min(2, this.currentLane + 1);
          this.player.y = this.playerY - (this.laneGap * (1 - this.currentLane));
        }

        this.timerText.setText(`Time: ${Math.ceil(this.timer)}`);
        this.scoreText.setText(`Score: ${this.score}`);
        this.livesText.setText(`Lives: ${this.lives}`);

        // Right arrow to select
        if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
          const chosen = this.answers[this.currentLane];
          if (chosen === this.currentQuestion.correct) this.score++;
          else this.lives--;

          this.questionIndex++;
          this.timer = 5;
          this.blocks.forEach(b => b.destroy());
          this.showQuestion();
        }

        // Timer runs out
        this.timer -= delta / 1000;
        if (this.timer <= 0) {
          this.lives--;
          this.questionIndex++;
          this.timer = 5;
          this.blocks.forEach(b => b.destroy());
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
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
    };

    const game = new Phaser.Game(config);
    return () => game.destroy(true);

  }, [stage]);

  if (stage === "home") {
    return (
      <div className="flex flex-col justify-center items-center w-screen h-screen bg-white pt-20">
        <h1 className="text-6xl font-bold mb-10 text-black">Kitty Quiz Runner</h1>
        <button
          className="w-64 py-5 mb-7 bg-[#326BD0] cursor-pointer hover:bg-[#12387D] text-white font-semibold text-2xl transition-colors"
          onClick={() => setStage("playing")}
        >
          START
        </button>
        <button
          className="w-64 py-5 mb-7 bg-[#326BD0] cursor-pointer hover:bg-[#12387D] text-white font-semibold text-2xl transition-colors"
          onClick={() => alert("Use ↑↓ to move and → to select the answer")}
        >
          HOW TO PLAY
        </button>
      </div>
    );
  }

  if (stage === "playing") {
    return (
      <>
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center bg-[#639BFF] z-50">
            <div className="text-white text-6xl font-bold">
              LOADING{dots}
            </div>
          </div>
        )}
        <div id="game-container" className="w-screen h-screen"></div>
      </>
    );
  }

  if (stage === "result") {
    return (
      <div className="flex flex-col justify-center items-center w-screen h-screen bg-white pt-20">
        <h1 className="text-4xl text-black font-bold mb-4">
          {resultType === "win" ? "Congratulations! You won!" : "You ran out of HP!"}
        </h1>
        <p className="text-xl text-black mb-6">Score: {score}</p>
        <button
          className="w-64 py-5 mb-7 bg-[#326BD0] cursor-pointer hover:bg-[#12387D] text-white font-semibold text-2xl transition-colors"
          onClick={() => {
            setScore(0);
            setLives(3);
            setStage("playing");
          }}
        >
          PLAY AGAIN
        </button>
        <button
          className="w-64 py-5 mb-7 bg-[#326BD0] cursor-pointer hover:bg-[#12387D] text-white font-semibold text-2xl  transition-colors"
          onClick={() => setStage("home")}
        >
          BACK TO HOME
        </button>
      </div>
    );
  }

  return null;
}