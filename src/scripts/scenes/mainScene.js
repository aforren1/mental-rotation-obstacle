import log from '../utils/logger'
import { TypingText } from '../objects/typingtext'
import { Enum } from '../utils/enum'
import Examples from '../objects/examples'

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
  'Press the [color=yellow][b]RIGHT[/b][/color] arrow key if the letter (R or F) is [color=yellow][b]NORMAL[/b][/color], and press the [color=violet][b]LEFT[/b][/color] arrow key if the letter is [color=violet][b]MIRRORED[/b][/color] (Я or ꟻ). To make the game more challenging, the letters will often also be rotated.'

const main_txt =
  'Now, there will be a [color=red]barrier[/color] in the middle. Please ignore this barrier, and continue to press the [color=yellow][b]RIGHT[/b][/color] arrow key if the letter is [color=yellow]NORMAL[/color], and press the [color=purple][b]LEFT[/b][/color] arrow key if the letter is [color=purple]MIRRORED[/color].'

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
    this._state = states.INSTRUCT
    this.entering = true
  }
  create(data) {
    this.entering = true
    let height = this.game.config.height
    let center = height / 2
    this.block_type = data.source === 'title'
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
      .text(center, height - 150, 'Press any key to start.', {
        fontFamily: 'Verdana',
        fontSize: 40,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)
    this.any_start.visible = false

    this.example = new Examples(this, center, center + 40, 1)
  }

  update() {
    switch (this.state) {
      case states.INSTRUCT:
        if (this.entering) {
          this.entering = false
          this.instructions.visible = true
          let tmp = this.block_type ? basic_txt : main_txt
          this.instructions.start(tmp, 50)
          this.instructions.typing.once('complete', () => {
            this.any_start.visible = true
            this.input.keyboard.once('keydown', (evt) => {
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
