import log from '../utils/logger'
import { TypingText } from '../objects/typingtext'
import { Enum } from '../utils/enum'
import { Examples, Examples2 } from '../objects/examples'
import trials from '../../assets/trials.json'
import shuffleArray from '../utils/shuffle'
import merge_data from '../utils/merge'

// see https://github.com/aforren1/online-color-habit/blob/ae750f096842438af6307978de176d0453032404/src/scripts/scenes/freeRT.js
// as a pretty close relation

const states = Enum([
  'INSTRUCT', // show text instructions
  'COUNTDOWN', // 3-2-1-go
  'MAIN_LOOP', // show stim and barrier, if requested
  'TAKE_A_BREAK',
  'END_SECTION',
])

const basic_txt =
  'Press the [color=yellow][b]🠞 (right)[/b][/color] arrow key if the letter (R or F) is [color=yellow][b]NORMAL[/b][/color], and press the [color=violet][b]🠜 (left)[/b][/color] arrow key if the letter is [color=violet][b]MIRRORED[/b][/color] (Я or ꟻ). To make the game more challenging, the letters will often also be rotated.'

const main_txt =
  'Now, there will be a [color=red]barrier[/color] in the center of the screen. Please ignore this barrier, and continue to press the [color=yellow][b]🠞 (right)[/b][/color] arrow key if the letter is [color=yellow]NORMAL[/color], and press the [color=violet][b]🠜 (left)[/b][/color] arrow key if the letter is [color=violet]MIRRORED[/color].'

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
    this._state = states.INSTRUCT
    this.entering = true
  }
  create(source) {
    this.trial_counter = 0
    this.entering = true
    let height = this.game.config.height
    let center = height / 2
    this.center = center
    this.is_intro = source === 'title'
    if (this.is_intro) {
      // shuffle arrays once
      shuffleArray(trials.warmup)
      this.trial_table = trials.warmup
    } else {
      shuffleArray(trials.real)
      this.trial_table = trials.real
    }
    this.instructions = TypingText(this, center, 50, '', {
      fontFamily: 'Verdana',
      fontSize: 30,
      wrap: {
        mode: 'word',
        width: 650,
      },
    }).setOrigin(0.5, 0)
    this.instructions.visible = false

    this.any_start = this.add
      .text(center, height - 150, 'Press 🠜 to continue.', {
        fontFamily: 'Verdana',
        fontSize: 40,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
    this.any_start.visible = false

    this.barrier = this.add.polygon(center + 50, center + 50, [50, 50, -50, 50, 0, -50], 0x777777).setOrigin(0.5, 0.5)
    this.barrier.visible = false
    this.stims = { f: this.add.image(0, 0, 'f'), r: this.add.image(0, 0, 'r') }
    this.stims.f.visible = false
    this.stims.r.visible = false
    // debug center location
    //this.add.circle(center, center, 10, 0xff0000)

    if (this.is_intro) {
      this.example = new Examples(this, center, center + 40, 1)
    } else {
      this.example = new Examples2(this, center, center + 40, 1)
    }
    this.countdown = this.add
      .text(center, center - 150, '', {
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fontSize: 140,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
    this.countdown.scale = 0.5
    this.check = this.add
      .image(center, center - 200, 'check')
      .setVisible(false)
      .setScale(1.5, 1.5)
    this.x = this.add
      .image(center, center - 200, 'x')
      .setVisible(false)
      .setScale(1.5, 1.5)

    this.brief_instruct = this.add
      .rexBBCodeText(
        center,
        center + 300,
        '[color=yellow][b]🠞 = NORMAL[/b][/color]   [color=violet][b]🠜 = MIRRORED[/b][/color]',
        {
          fontFamily: 'Verdana',
          fontSize: 30,
          align: 'center',
        }
      )
      .setOrigin(0.5, 0.5)
      .setVisible(false)
    this.txt_counter = this.add.text(10, 10, `1 / ${this.trial_table.length}`, { fontFamily: 'Arial', fontSize: 15 })
  }

  update() {
    switch (this.state) {
      case states.INSTRUCT:
        if (this.entering) {
          this.entering = false
          this.instructions.visible = true
          let tmp = this.is_intro ? basic_txt : main_txt
          this.instructions.start(tmp, 50)
          this.instructions.typing.once('complete', () => {
            this.any_start.visible = true
            this.input.keyboard.once('keydown-LEFT', (evt) => {
              this.tweens.add({
                targets: [this.instructions, this.any_start, this.example],
                alpha: { from: 1, to: 0 },
                duration: 2000,
                onComplete: () => {
                  this.state = states.COUNTDOWN
                },
              })
            })
          })
        }
      case states.COUNTDOWN:
        if (this.entering) {
          this.entering = false
          if (!this.is_intro) {
            this.barrier.visible = true
          }
          this.brief_instruct.visible = true
          let tl = this.tweens.createTimeline()
          this.countdown.scale = 0.5
          this.countdown.visible = true
          tl.add({
            targets: this.countdown,
            onStart: () => {
              this.countdown.text = '3'
              this.countdown.setColor('#ff007d')
            },
            scale: 1,
            yoyo: true,
            duration: 500,
            ease: 'Back',
          })
          tl.add({
            targets: this.countdown,
            onStart: () => {
              this.countdown.text = '2'
              this.countdown.setColor('#bd5e00')
            },
            scale: 1,
            yoyo: true,
            duration: 500,
            ease: 'Back',
          })
          tl.add({
            targets: this.countdown,
            onStart: () => {
              this.countdown.text = '1'
              this.countdown.setColor('#009800')
            },
            scale: 1,
            yoyo: true,
            duration: 500,
            ease: 'Back',
          })
          tl.add({
            targets: this.countdown,
            onStart: () => {
              this.countdown.text = '!'
              this.countdown.setColor('#00a0ff')
            },
            scale: 1,
            yoyo: true,
            duration: 500,
            ease: 'Back',
            onComplete: () => {
              this.countdown.visible = false
              this.state = states.MAIN_LOOP
            },
          })
          tl.play()
        }
      case states.MAIN_LOOP:
        if (this.entering) {
          this.entering = false

          this.trial_start = this.game.loop.now
          // set up stimulus
          let trial_data = this.trial_table[this.trial_counter]
          let stim = this.stims[trial_data.letter]
          stim.visible = true
          stim.setFlipX(trial_data.flip)
          // rotate the stim in-place
          stim.setAngle(trial_data.letter_angle)
          // now move onto circle with given radius & angle
          let rad = trial_data.radius
          let ang = Phaser.Math.DegToRad(trial_data.circle_angle)
          let x = rad * Math.cos(ang) + this.center
          let y = rad * Math.sin(ang) + this.center
          stim.x = x
          stim.y = y
          this.stim = stim

          for (let key of ['LEFT', 'RIGHT']) {
            this.input.keyboard.addKey(key).once('down', (evt) => {
              // disable subsequent input
              console.log(evt)
              // check response correctness
              let trial_data = this.trial_table[this.trial_counter]
              let dat = {
                key: evt.originalEvent.key,
                event_time: evt.originalEvent.timeStamp,
                trial: this.trial_counter,
                trial_start_time: this.trial_start,
              }
              dat.rt = dat.event_time - dat.trial_start_time
              dat.choice = dat.key === 'ArrowLeft' ? 1 : 0
              this.input.keyboard.removeAllKeys(true)

              this.trial_data = merge_data(dat, trial_data)
              // feedback
              let delay = 500
              if (dat.choice === trial_data.flip) {
                this.trial_data.correct = true
                this.check.visible = true
              } else {
                this.trial_data.correct = false
                this.x.visible = true
                delay += 1000
              }
              console.log(this.trial_data)
              this.time.delayedCall(delay, () => {
                this.check.visible = false
                this.x.visible = false
                this.stim.visible = false
                this.trial_counter += 1
                this.txt_counter.text = `${this.trial_counter + 1} / ${this.trial_table.length}`
                this.time.delayedCall(500, () => {
                  this.entering = true
                  // check if we should transition/pause?
                  if (this.trial_counter >= this.trial_table.length) {
                    this.txt_counter.visible = false
                    this.state = states.END_SECTION
                  } else if (
                    this.trial_table.length >= 80 &&
                    this.trial_counter % Math.round(this.trial_table.length / 3) == 0
                  ) {
                    this.state = states.TAKE_A_BREAK
                  }
                  console.log(this.state)
                })
              })
            })
          }
        }
    }
  }

  get state() {
    return this._state
  }

  set state(newState) {
    if (this.state != newState) {
      this.entering = true
      this._state = newState
    }
  }
}
