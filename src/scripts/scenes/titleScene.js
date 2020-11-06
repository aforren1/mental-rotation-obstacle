import log from '../utils/logger'
//import scheds from '../../scheds/sched.json'
import trials from '../../assets/trials.json'
import shuffleArray from '../utils/shuffle'

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' })
  }
  preload() {
    // load feedback images (check? x? sparks?)
    this.load.image('f', 'assets/f_white.png')
    this.load.image('r', 'assets/r_white.png')
    this.load.image('check', 'assets/check_small.png')
    this.load.image('x', 'assets/x_small.png')
  }
  create() {
    let height = this.game.config.height
    let center = height / 2

    this.add.particles('f').createEmitter({
      x: { min: 0, max: 800, random: true },
      y: { min: -80, max: -50 },
      gravityY: 800,
      frequency: 300,
      alpha: { start: 0.15, end: 0 },
      bounce: 1,
      bounds: { x: 0, y: 0, width: 800, height: 800 },
      collideTop: false,
      lifespan: 2000,
      rotate: { min: 0, max: 360 },
    })

    this.add.particles('r').createEmitter({
      x: { min: 0, max: 800, random: true },
      y: { min: -80, max: -50 },
      gravityY: 700,
      frequency: 300,
      alpha: { start: 0.15, end: 0 },
      delay: 400,
      lifespan: 2000,
      rotate: { min: 0, max: 360 },
      bounce: 1,
      bounds: { x: 0, y: 0, width: 800, height: 800 },
      collideTop: false,
    })

    this.add
      .text(center, center - 200, 'MIRЯOR', {
        fontSize: 160,
        fontFamily: 'Arial',
        fontStyle: 'bold',
        padding: 20,
      })
      .setOrigin(0.5, 0.5)

    let start_txt = this.add
      .text(center, center + 250, 'Click the 🠜 (left)\nkey to start.', {
        fontFamily: 'Verdana',
        fontStyle: 'bold',
        fontSize: 60,
        color: '#dddddd',
        stroke: '#444444',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    this.tweens.add({
      targets: start_txt,
      alpha: { from: 0.3, to: 1 },
      ease: 'Linear',
      duration: 1000,
      repeat: -1,
      yoyo: true,
    })

    this.input.keyboard.once('keydown-LEFT', (evt) => {
      // https://supernapie.com/blog/hiding-the-mouse-in-a-ux-friendly-way/
      // we don't need the cursor, but we also don't need pointer lock or the like
      let canvas = this.sys.canvas
      canvas.style.cursor = 'none'
      canvas.addEventListener('mousemove', () => {
        canvas.style.cursor = 'default'
        clearTimeout(mouseHideTO)
        let mouseHideTO = setTimeout(() => {
          canvas.style.cursor = 'none'
        }, 1000)
      })
      // fade out
      this.tweens.addCounter({
        from: 255,
        to: 0,
        duration: 2000,
        onUpdate: (t) => {
          let v = Math.floor(t.getValue())
          this.cameras.main.setAlpha(v / 255)
        },
        onComplete: () => {
          // randomize warmup, real trials
          shuffleArray(trials.warmup)
          shuffleArray(trials.real)
          console.log(trials)
          this.scene.start('MainScene', { source: 'title', trials: trials })
        },
      })
    })
  }
}
