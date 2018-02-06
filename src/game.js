window.onload = function () {

	// basic phaser preload/create/update functions
	var mainState = {
		// variables that will hold objects
		head: null,
		tail: null,
		cursors: null,
		snake: null,
		apple: null,
		gameText: null,
		playerDirection: undefined,
		actualDirection: undefined,
		directions: Object.freeze(
			{
				up: 0,
				down: 1,
				right: 2,
				left: 3
			}
		),

		// configuration variables and starting values
		canvasWidth: 832,
		canvasHeight: 640,
		playerSize: 64,
		x: 128,
		y: 0,
		frameCounter: 0,
		gameSpeed: 20,
		score: 0,
		preload: function () {
			game.load.image('snake', 'cobra_64_64.png');
			game.load.image('apple', 'apple.png');
		},

		create: function () {
			game.stage.backgroundColor = '#000000';
			this.cursors = game.input.keyboard.createCursorKeys();
			this.gameText = game.add.text(canvasWidth, 0, "0",
				{
					font: "28px Arial",
					fill: "#fff"
				}
			);
			this.gameText.anchor.setTo(1, 0);
			this.initSnake();
			this.placeRandomApple();
		},

		update: function () {
			this.gameText.text = this.score;
			this.updateDirection();
			this.frameCounter = this.frameCounter + 1;
			if (this.frameCounter == this.gameSpeed) {
				this.movePlayer();
				if (this.playerCollidesWithSelf()) {
					alert("The game is over! Your score was: " + this.score);
					this.deleteSnake();
					this.initSnake();
					this.score = 0;
					this.gameSpeed = 20;
					this.playerDirection = undefined;
					this.x = 128;
					this.y = 0;
					this.gameText.text = "";
				}
				if (this.appleCollidesWithSnake()) {
					this.score = this.score + 1;
					this.apple.destroy();
					this.placeRandomApple();
					this.gameSpeed = this.gameSpeed - 1;
					if (this.gameSpeed <= 5) {
						this.gameSpeed = 5;
					}
				}
				else if (this.playerDirection != undefined) {
					this.removeTail();
				}
				this.frameCounter = 0;
			}
		},

		// helper functions

		initSnake: function () {
			this.head = new Object();
			this.newHead(0, 0);
			this.tail = this.head;
			this.newHead(64, 0);
			this.newHead(128, 0);

		},

		deleteSnake: function () {
			while (this.tail != null) {
				this.tail.image.destroy();
				this.tail = this.tail.next;
			}
			this.head = null;
		},

		placeRandomApple: function () {
			if (this.apple != undefined) {
				this.apple.destroy();
			}
			this.apple = game.add.image(0, 0, 'apple');
			do {
				this.apple.position.x = Math.floor(Math.random() * 13) * 64;
				this.apple.position.y = Math.floor(Math.random() * 10) * 64;
			} while (this.appleCollidesWithSnake());
		},

		// linked list functions

		newHead: function (x, y) {
			var newHead = new Object();
			newHead.image = game.add.image(x, y, 'snake');
			newHead.next = null;
			this.head.next = newHead;
			this.head = newHead;
		},

		removeTail: function (x, y) {
			this.tail.image.destroy();
			this.tail = this.tail.next;
		},

		// collision functions

		appleCollidesWithSnake: function () {
			// traverse the linked list, starting at the tail
			var needle = this.tail;
			var collides = false;
			var numTimes = 0;
			while (needle != null) {
				numTimes = numTimes + 1;
				if (this.apple.position.x == needle.image.position.x
					&& this.apple.position.y == needle.image.position.y) {
					collides = true;
				}
				needle = needle.next;
			}
			return collides;
		},

		playerCollidesWithSelf: function () {
			// check if the head has collided with any other body part, starting at the tail
			var needle = this.tail;
			var collides = false;
			while (needle.next != this.head) {
				if (needle.image.position.x == this.head.image.position.x
					&& needle.image.position.y == this.head.image.position.y) {
					collides = true;
				}
				needle = needle.next;
			}
			return collides;
		},

		// movement functions
		updateDirection: function () {
			if (this.cursors.right.isDown && this.actualDirection != this.directions.left) {
				this.playerDirection = this.directions.right;
			}
			if (this.cursors.left.isDown && this.actualDirection != this.directions.right) {
				this.playerDirection = this.directions.left;
			}
			if (this.cursors.up.isDown && this.actualDirection != this.directions.down) {
				this.playerDirection = this.directions.up;
			}
			if (this.cursors.down.isDown && this.actualDirection != this.directions.up) {
				this.playerDirection = this.directions.down;
			}
		},

		movePlayer: function () {
			if (this.playerDirection == this.directions.right) {
				this.actualDirection = this.directions.right;
				this.x += this.playerSize;
			}
			else if (this.playerDirection == this.directions.left) {
				this.actualDirection = this.directions.left;
				this.x -= this.playerSize;
			}
			else if (this.playerDirection == this.directions.up) {
				this.actualDirection = this.directions.up;
				this.y -= this.playerSize;
			}
			else if (this.playerDirection == this.directions.down) {
				this.actualDirection = this.directions.down;
				this.y += this.playerSize;
			}
			if (this.x <= 0 - this.playerSize) {
				this.x = this.canvasWidth - this.playerSize;
			}
			else if (this.x >= this.canvasWidth) {
				this.x = 0;
			}
			else if (this.y <= 0 - this.playerSize) {
				this.y = this.canvasHeight - this.playerSize;
			}
			else if (this.y >= this.canvasHeight) {
				this.y = 0;
			}
			if (this.playerDirection != undefined) {
				this.newHead(this.x, this.y);
			}
		},
	}

	var canvasWidth = 832;
	var canvasHeight = 640;
	var game = new Phaser.Game(canvasWidth, canvasHeight);
	game.state.add('main', mainState);
	game.state.start('main');
};