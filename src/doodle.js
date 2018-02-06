var game = new Phaser.Game(
	640,
	480,
	Phaser.CANVAS,
	'game-canvas'
);

var ASSET_PATH = 'assets/';

var PhaserGame = {
	player : null,
	platforms : null,
	sky : null,
	facing : 'left',
	edgeTimer : 0,
	jumpTimer : 0,
	wasStanding : false,
	cursors : null,

	init: function () {
		this.game.renderer.renderSession.roundPixels = true;
		this.world.resize(640, 2000);
		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.physics.arcade.gravity.y = 750;
		this.physics.arcade.skipQuadTree = false;

	},
	preload: function () {
		// We need this because the assets are on Amazon S3
		// Remove the next 2 lines if running locally
		this.load.baseURL = 'http://files.phaser.io.s3.amazonaws.com/codingtips/issue003/';
		this.load.crossOrigin = 'anonymous';

		// load all
		this.load.image('trees', ASSET_PATH + 'trees.png');
		this.load.image('clouds', ASSET_PATH + 'clouds.png');
		this.load.image('platform', ASSET_PATH + 'platform.png');
		this.load.image('ice-platform', ASSET_PATH + 'ice-platform.png');
		this.load.spritesheet('dude', ASSET_PATH + 'dude.png', 32, 48);
	},

	setPlatforms: function () {
		var x = 0; // started x pos
		var y = 64; // started y pos
		for (var i = 0; i < 19; i++) {
			var type = i % 2 === 1 ? 'platform' : 'ice-platform';
			var platform = this.platforms.create(x, y, type);
			platform.body.velocity.x = this.rnd.between(100, 150);
			if (Math.random() > 0.5) {
				platform.body.velocity.x *= -1;
			}
			x += 200;
			y += 104;
			x = (x >= 600) ? 0 : x;
		}
	},

	create: function () {
		this.stage.backgroundColor = '#2f9acc';
		this.sky = this.add.tileSprite(0, 0, 640, 480, 'clouds');
		this.sky.fixedToCamera = true;
		this.add.sprite(0, 1906, 'trees');
		this.platforms = this.add.physicsGroup();
		this.setPlatforms();
		this.platforms.setAll('body.allowGravity', false);
		this.platforms.setAll('body.immovable', true);
		this.player = this.add.sprite(320, 1952, 'dude');
		this.physics.arcade.enable(this.player);
		this.player.body.collideWorldBounds = true;
		this.player.body.setSize(20, 32, 5, 16);
		this.player.animations.add('left', [0, 1, 2, 3], 10, true);
		this.player.animations.add('turn', [4], 20, true);
		this.player.animations.add('right', [5, 6, 7, 8], 10, true);
		this.camera.follow(this.player);
		this.cursors = this.input.keyboard.createCursorKeys();
	},

	update: function () {
		this.sky.tilePosition.y = -(this.camera.y * 0.7);
		this.platforms.forEach(this.wrapPlatform, this);
		this.physics.arcade.collide(this.player, this.platforms, this.setFriction, null, this);
		this.player.body.velocity.x = 0;
		if (this.cursors.left.isDown) {
			this.player.body.velocity.x = -200;
			if (this.facing !== 'left') {
				this.player.play('left');
				this.facing = 'left';
			}
		} else if (this.cursors.right.isDown) {
			this.player.body.velocity.x = 200;

			if (this.facing !== 'right') {
				this.player.play('right');
				this.facing = 'right';
			}
		} else {
			if (this.facing !== 'idle') {
				this.player.animations.stop();

				if (this.facing === 'left') {
					this.player.frame = 0;
				} else {
					this.player.frame = 5;
				}

				this.facing = 'idle';
			}
		}
		this.jump();
	},

	jump: function () {

		var standing = this.player.body.blocked.down || this.player.body.touching.down;
		var jumpingTime = 250; // jumping time per each
		var jumpVelocity = 500;
		if (!standing && this.wasStanding) {
			this.edgeTimer = this.time.time + jumpingTime;
		}
		if ((standing || this.time.time <= this.edgeTimer) &&
			this.cursors.up.isDown &&
			this.time.time > this.jumpTimer) {
			this.player.body.velocity.y = -jumpVelocity;
			this.jumpTimer = this.time.time + jumpVelocity + jumpingTime;
		}
		this.wasStanding = standing;
	},

	wrapPlatform: function (platform) {
		if (platform.body.velocity.x < 0 && platform.x <= -160) {
			platform.x = 640;
		} else if (platform.body.velocity.x > 0 && platform.x >= 640) {
			platform.x = -160;
		}
	},

	setFriction: function (player, platform) {
		if (platform.key === 'ice-platform') {
			player.body.x -= platform.body.x - platform.body.prev.x;
		}
	}
};

game.state.add('Game', PhaserGame, true);