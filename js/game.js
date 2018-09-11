// create a new scene named "Game"
let gameScene = new Phaser.Scene('Game')

gameScene.init = function(){
  this.playerSpeed = 3.0
  this.enemyMaxY = 280
  this.enemyMinY = 80
}
// load asset files for our game
gameScene.preload = function() {

  // load images
   this.load.image('background', 'assets/background.png')
   this.load.image('player', 'assets/player.png')
   this.load.image('dragon', 'assets/dragon.png')
   this.load.image('treasure', 'assets/treasure.png')
}

// executed once, after assets were loaded
gameScene.create = function() {

  // background
  let bg = this.add.sprite(0, 0, 'background')

  // change origin to the top-left of the sprite
  // NOTE in Phaser 3.x, it defaults to the center: (0.5, 0.5)
  bg.setOrigin(0,0)

  this.player = this.add.sprite(40, this.sys.game.config.height/2, 'player')
  this.player.setScale(0.5)

  // player is alive
  this.isPlayerAlive = true

  // goal
  this.treasure = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height / 2, 'treasure')
  this.treasure.setScale(0.6)

  // group of enemies
  this.enemies = this.add.group({
    key: 'dragon',
    repeat: 5,
    setXY: {
      x: 110,
      y: 100,
      stepX: 80,
      stepY: 20
    }
  })

  // set speeds
  Phaser.Actions.Call(this.enemies.getChildren(), (enemy)=> {
    enemy.speed = Math.random() * 2 + 1
  })

  // scale enemies
  // const rnd = function(){ return Math.random() - 1.5 }
  const rnd = function(){ return -0.75 }

  // NOTE apply value to all instances
  // Phaser.Actions.ScaleXY(this.enemies.getChildren(), rndScale, rndScale )

  // NOTE apply different value to each instance
  Phaser.Actions.Call(this.enemies.getChildren(), (enemy)=> {
    const rndScale = rnd()
    Phaser.Actions.ScaleXY([enemy], rndScale, rndScale)
  })

  //  Default text with no style settings
  this.victoryMessage = this.add.text(100, 100, 'Get the treasure!')

  WKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
  AKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
  SKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
  DKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)

  this.input.keyboard.on('keydown', (e)=> {
    console.log('keydown e', e)
  })

  // reset camera effects
  this.cameras.main.resetFX()
}

// executed on every frame (60 times per second)
gameScene.update = function() {

  if (!this.isPlayerAlive) return null
  if (this.isVictorious) {
    this.victoryMessage.setText('Victory!')
    return null
  }
  // check for active input
  if (this.input.activePointer.isDown) {
  // if (this.input.keyboard.on('keydown_D', function (event) {
      // player walks
      this.player.x += this.playerSpeed
  }
  if (WKey.isDown) this.player.y -= this.playerSpeed // player walks
  if (AKey.isDown) this.player.x -= this.playerSpeed // player walks
  if (SKey.isDown) this.player.y += this.playerSpeed // player walks
  if (DKey.isDown) this.player.x += this.playerSpeed // player walks

  // treasure collision
  if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.treasure.getBounds())) {
    this.gameVictory()
  }

  // enemy movement
  const enemies = this.enemies.getChildren()
  const numEnemies = enemies.length

  // for (let i = 0; i < numEnemies; i++) {
  enemies.forEach(e =>{
    // move enemies
    e.y += e.speed
    // reverse momvement if reached the edges
    if (e.y >= this.enemyMaxY && e.speed > 0){
      e.speed *= -1
    } else if (e.y <= this.enemyMinY && e.speed < 0) {
      e.speed *= -1
    }

    if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), e.getBounds() )) {
      this.gameOver()
      // break NOTE this would require a for (let i = 0…)
    }
  })

    // move enemies
    // enemies[i].y += enemies[i].speed
    //
    // // reverse movement if reached the edges
    // if (enemies[i].y >= this.enemyMaxY && enemies[i].speed > 0) {
    //   enemies[i].speed *= -1
    // } else if (enemies[i].y <= this.enemyMinY && enemies[i].speed < 0) {
    //   enemies[i].speed *= -1
    // }
  // }
}

// end the game
gameScene.gameOver = function() {

  // flag to set player is dead
  this.isPlayerAlive = false

  // shake the camera
  this.cameras.main.shake(500)

  // fade camera
  this.time.delayedCall(250, ()=> {
    this.cameras.main.fade(250)
  }, [])

  // restart game
  this.time.delayedCall(500, ()=> {
    this.scene.restart()
  }, [])
}

// Victory
gameScene.gameVictory = function() {

  // flag to set player is dead
  this.isVictorious = true

  // shake the camera
  // this.cameras.main.shake(500)

  // fade camera
  // this.time.delayedCall(250, ()=> {
  //   this.cameras.main.fade(250)
  // }, [])



  // restart game
  // this.time.delayedCall(500, function() {
  //   this.scene.restart()
  // }, [], this)
}

// our game's configuration
let config = {
  type: Phaser.AUTO,  //Phaser will decide how to render our game (WebGL or Canvas)
  width: 640, // game width
  height: 360, // game height
  scene: gameScene // our newly created scene
}

// create the game, and pass it the configuration
let game = new Phaser.Game(config)
