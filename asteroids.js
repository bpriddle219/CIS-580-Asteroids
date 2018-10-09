const WIDTH = 600;
const HEIGHT = 600;
const START_LOCATION_X = 250;
const START_LOCATION_Y = 250;
const NUM_LIVES = 3;
const NUM_ASTEROIDS = 3;
const PLAYER_SIZE = 40;
const UFO_SIZE = 32
const BULLET_WIDTH = 5;
const BULLET_HEIGHT = 15;

class UFO {
  constructor(x, y, projX, projY, bullets) {
    this.x = x;
    this.y = y;
    this.projX = projX;
    this.projY = projY;
    this.bullets = bullets;
    this.angle = Math.atan2((p.y-this.y),(p.x-this.x));
  }

  update(deltaTime) {
    for (var i = 0; i < this.bullets.length; i++) {
      this.bullets[i].update(deltaTime);
      if ((this.bullets[i].y < 0 - BULLET_HEIGHT) ||
          (this.bullets[i].y > HEIGHT + BULLET_HEIGHT) ||
          (this.bullets[i].x < 0 - BULLET_HEIGHT) ||
          (this.bullets[i].x > WIDTH + BULLET_HEIGHT)) {
        this.bullets.splice(i, 1);
      }
    }

    this.x -= this.projX;
    this.y -= this.projY;

    if (ufoTrigger % 250 == 0) {
      this.angle = Math.atan2((p.y-this.y),(p.x-this.x)) + Math.PI;
      var center = {x: this.x + UFO_SIZE/2, y: this.y + UFO_SIZE/2};
      var x = center.x + UFO_SIZE/2 * Math.cos(this.angle - Math.PI);
      var y = center.y + UFO_SIZE/2 * Math.sin(this.angle - Math.PI);
      var bullet = new Bullet(x, y, this.angle, 0, 0, 2.25, 'red');
      this.bullets.push(bullet);
    }

    if (ufoTrigger >= 500) {
      this.projX = Math.random() * 3 - .8;
      this.projY = Math.random() * 3 - .8;
      ufoTrigger = 0;
    }

    //check for screen wrapping
    if (this.x > WIDTH) {
      this.x = this.x - WIDTH - UFO_SIZE;
    }
    else if (this.x < -UFO_SIZE) {
      this.x = this.x + WIDTH + UFO_SIZE;
    }
    if (this.y > HEIGHT) {
      this.y = this.y - HEIGHT - UFO_SIZE;
    }
    else if (this.y < -UFO_SIZE) {
      this.y = this.y + HEIGHT + UFO_SIZE;
    }
  }

  render(ctx) {
    ctx.beginPath();

    ufo.bullets.forEach(function(bullet) {
      bullet.render(ctx);
    });

    ctx.drawImage(ufoImage, this.x, this.y);
    ctx.closePath();
  }
}

class Asteroid {
  constructor(x, y, mass, velX, velY) {
    this.x = x;
    this.y = y;
    this.mass = mass;
    this.velX = velX;
    this.velY = velY;
  }

  update(deltaTime) {
    //using vector components instead of angle and one velocity
    this.x -= this.velX;
    this.y -= this.velY;

    if (this.x > WIDTH + 2*this.mass) {
      this.x = this.x - WIDTH - 3*this.mass;
    }
    else if (this.x < -(this.mass * 2)) {
      this.x = this.x + WIDTH + 3*this.mass;
    }
    if (this.y > HEIGHT + 2*this.mass) {
      this.y = this.y - HEIGHT -3*this.mass;
    }
    else if (this.y < -(this.mass * 2)) {
      this.y = this.y + HEIGHT + 3*this.mass;
    }
  }

  render(ctx) {
    ctx.beginPath();
    ctx.fillStyle = '#634400';
    ctx.arc(this.x, this.y, this.mass, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
  }
}

class Player {
  constructor(x, y, angle, bullets, thrust, numLives, velX, velY) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.bullets = bullets;
    this.thrust = thrust;
    this.lives = numLives;
    this.velX = velX;
    this.velY = velY;
  }

  update(deltaTime) {
    for (var i = 0; i < this.bullets.length; i++) {
      this.bullets[i].update(deltaTime);
      if ((this.bullets[i].y < 0 - BULLET_HEIGHT) ||
          (this.bullets[i].y > HEIGHT + BULLET_HEIGHT) ||
          (this.bullets[i].x < 0 - BULLET_HEIGHT) ||
          (this.bullets[i].x > WIDTH + BULLET_HEIGHT)) {
        this.bullets.splice(i, 1);
      }
    }

    if (currentInput.space && !pastInput.space) {
      var center = {x: this.x + PLAYER_SIZE/2, y: this.y + PLAYER_SIZE/2};
      var x = center.x + PLAYER_SIZE/2 * Math.cos(this.angle - Math.PI);
      var y = center.y + PLAYER_SIZE/2 * Math.sin(this.angle - Math.PI);
      var bullet = new Bullet(x, y, this.angle, 0, 0, 10, '#61ff00');
      this.bullets.push(bullet);
      laserShoot.play();
    }
    if (currentInput.warp && !pastInput.warp) {
      var randX = Math.random() * 600;
      var randY = Math.random() * 600;
      this.x = randX;
      this.y = randY;
    }
    if (currentInput.right) {
      this.angle += Math.PI/100;
    }
    else if (currentInput.left) {
      this.angle -= Math.PI/100;
    }
    if (currentInput.forward) {
      this.velX += Math.cos(this.angle) * this.thrust;
      this.velY += Math.sin(this.angle) * this.thrust;
    }
    //apply friction
    this.velX *= 0.98;
    this.velY *= 0.98;

    //apply velocities
    this.x -= this.velX;
    this.y -= this.velY;

    //check for screen wrapping
    if (this.x > WIDTH) {
      this.x = this.x - WIDTH - PLAYER_SIZE;
    }
    else if (this.x < -PLAYER_SIZE) {
      this.x = this.x + WIDTH + PLAYER_SIZE;
    }
    if (this.y > HEIGHT) {
      this.y = this.y - HEIGHT - PLAYER_SIZE;
    }
    else if (this.y < -PLAYER_SIZE) {
      this.y = this.y + HEIGHT + PLAYER_SIZE;
    }
  }

  render(ctx) {
    ctx.beginPath();
    ctx.save();
    ctx.translate(this.x + PLAYER_SIZE/2, this.y + PLAYER_SIZE/2);
    ctx.rotate(this.angle - Math.PI/2);
    ctx.drawImage(playerImage, -PLAYER_SIZE/2, -PLAYER_SIZE/2);
    ctx.restore();
    ctx.closePath();
  }
}

class Bullet {
  constructor(x, y, angle, projX, projY, speed, color) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.projX = projX;
    this.projY = projY;
    this.speed = speed;
    this.color = color;
  }

  update(deltaTime) {
    this.projX = Math.cos(this.angle) * this.speed;
    this.projY = Math.sin(this.angle) * this.speed;

    this.x -= this.projX;
    this.y -= this.projY;
  }

  render(ctx) {
    ctx.beginPath();
    ctx.save();
    ctx.translate(this.x+BULLET_WIDTH/2, this.y+BULLET_HEIGHT/2);
    ctx.rotate(this.angle - Math.PI/2);
    ctx.fillStyle = this.color;
    ctx.fillRect(-BULLET_WIDTH/2, -BULLET_HEIGHT/2, BULLET_WIDTH, BULLET_HEIGHT);
    ctx.restore();
    ctx.closePath();
  }
}

//initialize canvas element
var screen = document.createElement('canvas');
var screenCtx = screen.getContext('2d');
screen.width = WIDTH;
screen.height = HEIGHT;
document.body.appendChild(screen);

var b = []; //player bullet array
var p = null;
var score = 0;

var ufoB = []; //ufo bullet array
var ufo = null;
var ufoTrigger = 0;

var numAsteroids = 0;
var asteroids = [];

var start = null;
var lose = 0;
var level = 0;
var invincibleBuffer = 0;

var asteroidHit = new Audio();
asteroidHit.src = "Hit_Hurt.wav";

var laserShoot = new Audio();
laserShoot.src = 'Laser_Shoot4.wav';

var playerExplode = new Audio();
playerExplode.src = 'Explosion2.wav';

var playerImage = new Image();
playerImage.src = "player-spaceship.png";

var ufoImage = new Image();
ufoImage.src = "ufo.png";

//player input variables
var currentInput = {
  space: false,
  forward: false,
  left: false,
  right: false,
  warp: false
}
var pastInput = {
  space: false,
  forward: false,
  left: false,
  right: false,
  warp: false
}

/** @function handleKeyDown
  * Handles when keys are pressed
  * @param {KeyEvent} event the keydown event
  */
function handleKeyDown(event) {
  switch (event.key) {
    case ' ':
      currentInput.space = true;
      break;
    case 'ArrowUp':
    case 'w':
      currentInput.forward = true;
      break;
    case 'ArrowLeft':
    case 'a':
      currentInput.left = true;
      break;
    case 'ArrowRight':
    case 'd':
      currentInput.right = true;
      break;
    case 'Enter':
      currentInput.warp = true;
      break;
  }
}
window.addEventListener('keydown', handleKeyDown);

/** @function handleKeyUp
  * Handles when keys are released
  * @param {KeyEvent} event the keyup event
  */
function handleKeyUp(event) {
  switch (event.key) {
    case ' ':
      currentInput.space = false;
      break;
    case 'ArrowUp':
    case 'w':
      currentInput.forward = false;
      break;
    case 'ArrowLeft':
    case 'a':
      currentInput.left = false;
      break;
    case 'ArrowRight':
    case 'd':
      currentInput.right = false;
      break;
    case 'Enter':
      currentInput.warp = false;
      break;
  }
}
window.addEventListener('keyup', handleKeyUp);

/** @function copyInput
  * Transfers the current input into the last input
  */
function copyInput() {
  pastInput = JSON.parse(JSON.stringify(currentInput));
}


/** @function checkCollisions
  * Checks for collisions among objects and handles things when
  * collisions happen
  */
function checkCollisions() {
  var toDelete = [];
  for (var i = 0; i < numAsteroids; i++) {
    var rx = Math.min(Math.max(asteroids[i].x, p.x), p.x + PLAYER_SIZE);
    var ry = Math.min(Math.max(asteroids[i].y, p.y), p.y + PLAYER_SIZE);
    var distSquared = Math.pow(rx - asteroids[i].x, 2) + Math.pow(ry - asteroids[i].y, 2);
    if (distSquared < Math.pow(asteroids[i].mass, 2)) {
      if (!invincibleBuffer) {
        p.lives--;
        playerExplode.play();
        invincibleBuffer++;
      }
    }
    if (invincibleBuffer == 100) {
      invincibleBuffer = 0;
    }
    p.bullets.forEach(function(bullet, index) {
      rx = Math.min(Math.max(asteroids[i].x, bullet.x), bullet.x + BULLET_WIDTH);
      ry = Math.min(Math.max(asteroids[i].y, bullet.y), bullet.y + BULLET_HEIGHT);
      distSquared = Math.pow(rx - asteroids[i].x, 2) + Math.pow(ry - asteroids[i].y, 2);
      if (distSquared < Math.pow(asteroids[i].mass, 2)) {
        p.bullets.splice(index, 1);
        if (asteroids[i].mass > 25) {
          var mass = asteroids[i].mass/2;
          var randVelX =  Math.random() * 2 - .8;
          var randVelY =  Math.random() * 2 - .8;
          var x = asteroids[i].x;
          var y = asteroids[i].y;
          var asteroid = new Asteroid(x, y, mass, randVelX, randVelY);
          asteroids.push(asteroid);
          asteroid = new Asteroid(x + mass*3/2, y - mass*3/2,
                                  mass, -randVelX, -randVelY);
          asteroids.push(asteroid);
        }
        toDelete.push(i);
      }
      if (ufo) {
        if(!(bullet.x < ufo.x ||
          bullet.x + BULLET_WIDTH > ufo.x + PLAYER_SIZE ||
          bullet.y < ufo.y ||
          bullet.y + BULLET_HEIGHT > ufo.y + PLAYER_SIZE)) {
            p.bullets.splice(index, 1);
            ufo = null;
          }
        }
    });
    if (i == numAsteroids -1) break;
    for (var j = i + 1; j < numAsteroids; j++) {
      var distanceSquared =
      Math.pow(asteroids[i].x - asteroids[j].x, 2) +
      Math.pow(asteroids[i].y - asteroids[j].y, 2);
      if(distanceSquared < Math.pow(asteroids[i].mass + asteroids[j].mass, 2)) {
        bounce(asteroids[i], asteroids[j]);
        asteroidHit.play();
      }
    }
  }
  if (ufo) {
    ufo.bullets.forEach(function(bullet, index) {
      if(!(bullet.x < p.x ||
        bullet.x + BULLET_WIDTH > p.x + PLAYER_SIZE ||
        bullet.y < p.y ||
        bullet.y + BULLET_HEIGHT > p.y + PLAYER_SIZE)) {
          if (!invincibleBuffer) {
            p.lives--;
            playerExplode.play();
            invincibleBuffer++;
          }
          ufo.bullets.splice(index, 1);
      }
    });
  }
  for (i = 0; i < toDelete.length; i++) {
    asteroids.splice(toDelete[i], 1);
    score += 10;
  }
  numAsteroids = asteroids.length;
}

/** @function bounce
  * Bounces the asteroids off of each other with proper
  * stupid Newtonian physics
  * @param {Object} a1 the first asteroid
  * @param {Object} a2 the second asteroid
  */
function bounce(a1, a2) {
  var n = {x: a2.x-a1.x, y: a2.y-a1.y}; //create normal vector
  var sq = Math.sqrt(n.x*n.x+n.y*n.y);
  var un_x = n.x/sq;
  var un_y = n.y/sq;
  var un = {x: un_x, y: un_y}; //create unit normal vector
  var ut = {x: -un.y, y: un.x}; //create unit tangent vector

  //current vectors of asteroids
  var v1 = {x: a1.velX, y: a1.velY};
  var v2 = {x: a2.velX, y: a2.velY};

  //find projections of current vectors on the normal and tangent vectors
  var v1n = un.x * v1.x + un.y * v1.y;
  var v2n = un.x * v2.x + un.y * v2.y;
  var v1t = ut.x * v1.x + ut.y * v1.y;
  var v2t = ut.x * v2.x + ut.y * v2.y;

  //do the actual math for a collision
  var v1nf = (v1n * (a1.mass - a2.mass) + 2 * a2.mass * v2n)/(a1.mass + a2.mass);
  var v2nf = (v2n * (a2.mass - a1.mass) + 2 * a1.mass * v1n)/(a1.mass + a2.mass);

  //adjust normals and tangents based off of that collision math
  var i = v1nf * un.x;
  var j = v1nf * un.y;
  var v_1nf = {x: i, y: j};
  i = v2nf * un.x;
  j = v2nf * un.y;
  var v_2nf = {x: i, y: j};
  i = v1t * ut.x;
  j = v1t * ut.y;
  var v_1tf = {x: i, y: j};
  i = v2t * ut.x;
  j = v2t * ut.y;
  var v_2tf = {x: i, y: j};

  //add that all together for the final new velocities
  a1.velX = v_1nf.x + v_1tf.x;
  a1.velY = v_1nf.y + v_1tf.y;
  a2.velX = v_2nf.x + v_2tf.x;
  a2.velY = v_2nf.y + v_2tf.y;

}


/** @function checkForLose
  * Checks to see if there is a situation that would result
  * in the loss of the game for the player
  */
function checkForLose() {
  if (p.lives <= 0) {
    lose = 1;
    document.getElementById('game_over').innerHTML = "Game over! Press Start</br>to play again!"
  }
}

/** @function createAsteroids
  * Creates a number of asteroids at random locations with
  * random velocities and masses
  */
function createAsteroids() {
  for (var i = 0; i < NUM_ASTEROIDS + level*2; i++) {
    var randX = Math.floor(Math.random() * 550);
    var randY = Math.floor(Math.random() * 550);
    var randMass = Math.floor(Math.random() * 35) + 15;
    while (checkForConflicts(randX, randY, randMass)) {
      randX = Math.floor(Math.random() * 550);
      randY = Math.floor(Math.random() * 550);
      randMass = Math.floor(Math.random() * 35) + 15;
    }
    var randVelX =  Math.random() * 2 - .8;
    var randVelY =  Math.random() * 2 - .8;
    var asteroid = new Asteroid(randX, randY, randMass, randVelX, randVelY);
    asteroids.push(asteroid);
    numAsteroids++;
  }
}

/** @function checkForConflicts
  * Checks to see if there are any conflicts when
  * it comes to placing asteroids - don't want them on top of other
  * asteroids or the player
  * @param {float} randX random x value for calculations
  * @param {float} randY random y value for calculations
  * @param {float} randMass random mass value for calculations
  */
function checkForConflicts(randX, randY, randMass) {
  for (var i = 0; i < numAsteroids; i++) {
    var distanceSquared =
    Math.pow(asteroids[i].x - randX, 2) +
    Math.pow(asteroids[i].y - randY, 2);
    if(distanceSquared < Math.pow(asteroids[i].mass + randMass, 2)) {
      return true;
    }
  }
  var rx = Math.min(Math.max(randX, p.x), p.x + PLAYER_SIZE);
  var ry = Math.min(Math.max(randY, p.y), p.y + PLAYER_SIZE);
  var distSquared = Math.pow(rx - randX, 2) + Math.pow(ry - randY, 2);
  if (distSquared < Math.pow(randMass, 2)) {
    return true;
  }
  return false;
}

/** @function updateDisplay
  * upates the GUI information in the HTML elements
  */
function updateDisplay() {
  document.getElementById('lives').innerHTML = "Lives: " + p.lives;
  document.getElementById('score').innerHTML = "Score: " + score;
  document.getElementById('level').innerHTML = "Level: " + (level + 1);
}

/** @function spawnUFO
  * gives the ufo random velocities and instantiates it in the level
  */
function spawnUFO() {
  var randVelX =  Math.random() * 3 - .8;
  var randVelY =  Math.random() * 3 - .8;
  ufoB.length = 0;
  ufo = new UFO(-32, -32, randVelX, randVelY, ufoB);
}

/** @function update
  * Handles updating the game logic and state
  * @param {double} deltaTime time between frames
  */
function update(deltaTime) {
  checkForLose();
  checkCollisions();
  p.update(deltaTime);
  if (ufo) ufo.update(deltaTime);
  asteroids.forEach(function(a) {
    a.update(deltaTime);
  });
  if (numAsteroids == 0) {
    level++;
    createAsteroids();
    if ((level + 1) % 3 == 0) {
      spawnUFO();
    }
  }
  if (invincibleBuffer) invincibleBuffer++;
  updateDisplay();
  ufoTrigger++;
}

/** @function render
  * Handles drawing the canvas and everything on it
  * @param {CanvasContext} ctx the context to be rendered with
  */
function render(ctx) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  //ctx.drawImage(background, 0, 0);
  if (invincibleBuffer % 10 == 0) {
    p.render(ctx);
  }
  p.bullets.forEach(function(bullet) {
    bullet.render(ctx);
  });
  asteroids.forEach(function(a) {
    a.render(ctx);
  });
  if (ufo) ufo.render(ctx);
}

/** @function loop
  * the main game loop
  * @param {DomHighResTimestamp} timestamp the current game time in millisecs
  */
function loop(timestamp) {
  if (!start) start = timestamp;
  var deltaTime = timestamp - start;
  start = timestamp;
  update(deltaTime);
  render(screenCtx);
  copyInput();
  if (!lose) {
    window.requestAnimationFrame(loop);
  }
}

/** @function startGame
  * Starts/resets the game
  */
function startGame() {
  lose = 0;
  score = 0;
  level = 0;
  invincibleBuffer = 0;
  b.length = 0;
  asteroids.length = 0;
  numAsteroids = 0;
  ufo = null;
  ufoTrigger = 0;
  ufoB.length = 0;
  document.getElementById('game_over').innerHTML = "";
  p = new Player(START_LOCATION_X, START_LOCATION_Y,
    Math.PI/2, b, .12, NUM_LIVES, 0, 0);
  createAsteroids();
  //start the game loop
  window.requestAnimationFrame(loop);
}

//waits for a click on the appropriate button from the user
document.getElementById('start')
  .addEventListener('click', function(event) {
    event.preventDefault();
    startGame();
});
