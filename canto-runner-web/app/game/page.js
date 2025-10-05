"use client"; // Required for client-side only code (Phaser)

import { useEffect } from "react";
import Phaser from "phaser";

export default function GamePage() {
  useEffect(() => {
    // Minimal Phaser scene inline
    class GameScene extends Phaser.Scene {
      constructor() {
        super({ key: "GameScene" });
      }
      create() {
        this.add.text(100, 100, "Hello Phaser!", { fontSize: "32px", fill: "#fff" });
      }
    }

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      backgroundColor: "#242424",
      parent: "game-container",
      scene: [GameScene],
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Language Game</h1>
      <div id="game-container"></div>
    </div>
  );
}
