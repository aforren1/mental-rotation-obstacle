// all done, send the data
import log from '../utils/logger'
import postData from '../utils/postdata'
import { onBeforeUnload } from '../game'

export default class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' })
  }
  create(today_data) {
    let height = this.game.config.height
    let center = height / 2

    window.removeEventListener('beforeunload', onBeforeUnload)
    this.add
      .text(center, center, 'Thank you for participating!\nAutomatically redirecting\nin 10 seconds...', {
        fontFamily: 'Verdana',
        fontSize: 30,
        align: 'center',
      })
      .setOrigin(0.5, 0.5)

    let mostly = 'https://app.prolific.co/submissions/complete?cc='
    this.time.delayedCall(10000, () => {
      window.location.href = mostly + '4EC98559'
    })

    console.log('Data today:')
    let alldata = { config: this.game.user_config, data: today_data }
    console.log(alldata)

    Promise.all(postData(alldata)).then((values) => {
      if (values[0] !== 500 || values[1] !== 500) {
      } else {
        log.error('Forwarding failed HARD')
      }
    })
  }
}
