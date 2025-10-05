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
  const [showInstructions, setShowInstructions] = useState(false); // <-- move to top level

  const questions = [
    { question: "What is 'Hello' in Cantonese?", correct: "你好. (néih hóu)", wrong: ["早晨 (jóusàhn)", "再見 (joi gin)"] },
    { question: "How do you say 'Thank you' in Cantonese?", correct: "多謝. (dōjeh)", wrong: ["唔該 (m̀hgōi)", "對唔住 (deui m̀h jyuh)"] },
    { question: "What does '食飯' mean?", correct: "Eat rice. / Have a meal", wrong: ["Sleep", "Drink water"] },
    { question: "How to say 'Good morning' in Cantonese?", correct: "早晨. (jóusàhn)", wrong: ["晚安 (máahn ōn)", "你好 (néih hóu)"] },
    { question: "'再見' means what?", correct: "Goodbye.", wrong: ["Hello", "Thank you"] },
    { question: "How do you say 'I love you' in Cantonese?", correct: "我愛你. (ngóh oi néih)", wrong: ["我餓 (ngóh ngo)", "我走 (ngóh jáu)"] },
    { question: "What is 'Water' in Cantonese?", correct: "水. (séui)", wrong: ["茶 (chàh)", "飯 (faan)"] },
    { question: "'對唔住' translates to?", correct: "Sorry.", wrong: ["Thank you", "Goodbye"] }
  ];

  // Loading dots animation
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => setDots(prev => (prev === "..." ? "." : prev + ".")), 500);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (stage !== "playing") return;
    if (typeof window === "undefined") return; // SSR safety

    setIsLoading(true);

    class GameScene extends Phaser.Scene {
      preload() {
        this.load.image('bridge', '/trail.png');
        this.load.image('kitty1', '/kitty1.png');
        this.load.image('kitty2', '/kitty2.png');
        this.load.image('background', '/background.png');
        this.load.on('complete', () => setTimeout(() => setIsLoading(false), 100));
      }

      create() {
        this.score = 0;
        this.lives = 3;
        this.questionIndex = 0;
        this.timer = 5;

        this.paddingBottom = 150;
        this.playerWidth = 70;
        this.playerHeight = 70;
        this.laneGap = 120;

        const bridgeHeight = 325;
        this.bridge = this.add.image(this.scale.width / 2, this.scale.height - bridgeHeight / 2, 'bridge');
        this.bridge.setDisplaySize(this.scale.width, bridgeHeight);

        this.playerX = 150;
        this.playerY = this.scale.height - this.paddingBottom - this.playerHeight / 2;
        this.currentLane = 1;

        const background = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background');
        background.setDisplaySize(this.scale.width, this.scale.height);
        background.setDepth(-10);

        this.player = this.add.sprite(this.playerX, this.playerY, 'kitty1').setScale(4);
        this.anims.create({
          key: 'run',
          frames: [{ key: 'kitty1' }, { key: 'kitty2' }],
          frameRate: 4,
          repeat: -1
        });
        this.player.play('run');

        this.cursors = this.input.keyboard.createCursorKeys();

        this.timerText = this.add.text(20, 20, `Time: ${Math.ceil(this.timer)}`, { fontSize: '28px', fill: '#fff', stroke: '#000', strokeThickness: 2 }).setDepth(100);
        this.scoreText = this.add.text(this.scale.width - 20, 20, `Score: ${this.score}`, { fontSize: '28px', fill: '#fff' }).setOrigin(1,0).setDepth(100);
        this.livesText = this.add.text(this.scale.width - 20, 60, `Lives: ${this.lives}`, { fontSize: '28px', fill: '#fff' }).setOrigin(1,0).setDepth(100);

        this.questionText = this.add.text(this.scale.width / 2, 100, '', {
          fontSize: '48px', fill: '#fff', align: 'center', wordWrap: { width: this.scale.width - 200 },
          backgroundColor: '#326BD0', padding: { x: 40, y: 30 }
        }).setOrigin(0.5).setDepth(100);

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

        const wrongAnswers = Phaser.Utils.Array.Shuffle(this.currentQuestion.wrong).slice(0,2);
        this.answers = Phaser.Utils.Array.Shuffle([this.currentQuestion.correct, ...wrongAnswers]);

        if (this.blocks) this.blocks.forEach(b => b.destroy());
        this.blocks = [];

        const startX = this.scale.width + 200;
        const endX = this.playerX;
        const laneStartY = this.playerY - this.laneGap;
        const duration = this.timer * 1000;

        this.answers.forEach((ans, i) => {
          const block = this.add.text(startX, laneStartY + i*this.laneGap, ans, {
            fontSize: '28px',
            backgroundColor: '#326BD0',
            padding: { x: 20, y: 20 },
            color: '#fff'
          }).setOrigin(0.5).setDepth(5);

          this.blocks.push(block);

          this.tweens.add({ targets: block, x: endX, duration, ease: 'Linear' });
        });
      }

      update(_, delta) {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
          this.currentLane = Math.max(0, this.currentLane - 1);
          this.player.y = this.playerY - (this.laneGap*(1-this.currentLane));
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
          this.currentLane = Math.min(2, this.currentLane + 1);
          this.player.y = this.playerY - (this.laneGap*(1-this.currentLane));
        }

        this.timerText.setText(`Time: ${Math.ceil(this.timer)}`);
        this.scoreText.setText(`Score: ${this.score}`);
        this.livesText.setText(`Lives: ${this.lives}`);

        if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
          const chosen = this.answers[this.currentLane];
          if (chosen === this.currentQuestion.correct) this.score++; else this.lives--;
          this.questionIndex++;
          this.timer = 5;
          this.blocks.forEach(b=>b.destroy());
          this.showQuestion();
        }

        this.timer -= delta/1000;
        if (this.timer <= 0) {
          this.lives--;
          this.questionIndex++;
          this.timer = 5;
          this.blocks.forEach(b=>b.destroy());
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

  // ---------------- RENDER ----------------
  return (
    <div className="w-screen h-screen bg-white">
      {stage === "home" && (
        <div className="flex flex-col justify-center items-center w-screen h-screen bg-white pt-20">
          <h1 className="text-6xl font-bold mb-10 text-black">Canto Runner</h1>
          <button
            className="w-64 py-5 mb-7 bg-[#326BD0] hover:bg-[#12387D] text-white font-semibold text-2xl transition-colors rounded-lg"
            onClick={() => setStage("playing")}
          >
            START
          </button>
          <button
            className="w-64 py-5 mb-7 bg-[#326BD0] hover:bg-[#12387D] text-white font-semibold text-2xl transition-colors rounded-lg"
            onClick={() => setShowInstructions(true)}
          >
            HOW TO PLAY
          </button>
          {showInstructions && (
            <div className="fixed inset-0 bg-[#326BD0] bg-opacity-40 flex justify-center items-center z-50" onClick={() => setShowInstructions(false)}>
              <div className="bg-white rounded-xl p-10 max-w-3xl w-11/12 relative" onClick={e => e.stopPropagation()}>
                <button className="absolute top-4 right-4 text-2xl font-bold text-black" onClick={() => setShowInstructions(false)}>✕</button>
                <h2 className="text-3xl font-bold mb-6 text-black">HOW TO PLAY</h2>
                <p className="text-xl mb-4 text-black">
                  Welcome to Canto Runner! Test your Cantonese while helping our kitty friend run across the bridge.
                </p>
                <p className="text-xl mb-4 text-black">
                  Blocks with possible answers move toward your kitty on the left. Use UP and DOWN arrow keys to move between lanes.
                </p>
                <p className="text-xl mb-4 text-black">
                  Press RIGHT arrow key to lock in your answer. Wrong answers or letting the timer run out costs a life.
                </p>
                <p className="text-xl mb-4 text-black">
                  Each correct answer gives you a point. Game ends when you run out of lives or complete all questions.
                </p>
              </div>
            </div>
          )}
          <button
          className="w-64 py-5 mb-7 bg-[#326BD0] hover:bg-[#12387D] text-white font-semibold text-2xl transition-colors rounded-lg"
          onClick={() => window.location.href = "/"}
          >
          GO BACK
          </button>
        </div>
      )}

      {stage === "playing" && (
        <>
          {isLoading && (
            <div className="fixed inset-0 flex items-center justify-center bg-[#639BFF] z-50">
              <div className="text-white text-6xl font-bold">LOADING{dots}</div>
            </div>
          )}
          <div id="game-container" className="w-screen h-screen"></div>
        </>
      )}

      {stage === "result" && (
        <div className="flex flex-col justify-center items-center w-screen h-screen bg-white pt-20">
          <h1 className="text-4xl text-black font-bold mb-4">
            {resultType === "win" ? "Congratulations! You won!" : "You ran out of HP!"}
          </h1>
          <p className="text-xl text-black mb-6">Score: {score}</p>
          <button className="w-64 py-5 mb-7 bg-[#326BD0] hover:bg-[#12387D] text-white font-semibold text-2xl transition-colors rounded-lg" onClick={() => { setScore(0); setLives(3); setStage("playing"); }}>
            PLAY AGAIN
          </button>
          <button className="w-64 py-5 mb-7 bg-[#326BD0] hover:bg-[#12387D] text-white font-semibold text-2xl transition-colors rounded-lg" onClick={() => setStage("home")}>
            BACK TO HOME
          </button>
        </div>
      )}
    </div>
  );
}
