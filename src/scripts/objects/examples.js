// show various orientations of

let sets = {
  fontFamily: 'Verdana',
  fontStyle: 'bold',
  fontSize: 30,
  color: '#dddddd',
  stroke: '#444444',
  strokeThickness: 2,
  align: 'center',
}

export default class Examples extends Phaser.GameObjects.Container {
  constructor(scene, x, y, alpha) {
    // pile of examples
    let a = scene.add.image(100, -40, 'f').setAngle(30)
    let b = scene.add.image(170, 20, 'r').setAngle(-60)
    let c = scene.add.image(240, -40, 'f')
    let d = scene.add.image(270, 50, 'r').setAngle(15)
    //
    let e = scene.add.image(-100, -40, 'f').setAngle(30).setFlipX(true)
    let f = scene.add.image(-170, 20, 'r').setAngle(-60).setFlipX(true)
    let g = scene.add.image(-240, -40, 'f').setFlipX(true)
    let h = scene.add.image(-270, 50, 'r').setAngle(15).setFlipX(true)

    //
    let left = scene.add.rexRoundRectangle(-200, 0, 300, 250, 5, 0, 0).setStrokeStyle(5, 0xee82ee)
    let right = scene.add.rexRoundRectangle(200, 0, 300, 250, 5, 0, 0).setStrokeStyle(5, 0xffff00)

    let larrow = scene.add.text(-200, -150, '🠜 (left)', sets).setOrigin(0.5, 0.5)
    let rarrow = scene.add.text(200, -150, '(right) 🠞', sets).setOrigin(0.5, 0.5)
    super(scene, x, y, [a, b, c, d, e, f, g, h, left, right, larrow, rarrow])
    this.alpha = alpha
    scene.add.existing(this)
  }
}
