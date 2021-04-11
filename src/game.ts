import 'phaser';

export default class Demo extends Phaser.Scene {
    constructor() {
        super('demo');
    }
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private platforms: Phaser.Physics.Arcade.StaticGroup;
    private bombs: Phaser.Physics.Arcade.Group;
    private score = 0;
    private scoreText;
    private gameOver = false;
    private touchMoving = "";
    private beforeJumpMoving = "";
    private playerName = "";

    preload() {
        console.log(__config.env.BACKEND_URL);
        
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude',
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
        this.load.spritesheet('fullscreen', 'assets/fullscreen.png', { frameWidth: 64, frameHeight: 64 });
        this.load.html('nameform', 'assets/nameform.html');
    }

    create() {
        this.add.image(400, 300, 'sky');
        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

        this.player = this.physics.add.sprite(100, 450, 'dude');

        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.physics.add.collider(this.player, this.platforms);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.createStar();
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', color: '#000' });

        this.bombs = this.physics.add.group();

        this.physics.add.collider(this.bombs, this.platforms);

        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

        const button = this.add.image(800 - 16, 16, 'fullscreen', 0).setOrigin(1, 0).setInteractive();

        button.on('pointerup', function () {

            if (this.scale.isFullscreen) {
                button.setFrame(0);

                this.scale.stopFullscreen();
            }
            else {
                button.setFrame(1);

                this.scale.startFullscreen();
            }

        }, this);


        this.input.on('pointerdown', () => {

            if (this.game.input.activePointer.x > this.player.x) {
                if (this.touchMoving === "right") {
                    this.beforeJumpMoving = "right";
                    this.touchMoving = "jump";
                } else {
                    this.touchMoving = "right";

                }
            }
            else if (this.game.input.activePointer.x < this.player.x) {
                if (this.touchMoving === "left") {
                    this.beforeJumpMoving = "left";
                    this.touchMoving = "jump";
                } else {
                    this.touchMoving = "left";

                }
            }
        });

        if (this.playerName) {
            this.add.text(300, 10, 'Välkommen ' + this.playerName, { color: 'white', fontSize: '20px ' });

        } else {

            const text = this.add.text(300, 10, 'Skriv ditt namn', { color: 'white', fontSize: '20px ' });

            const element = this.add.dom(400, 0).createFromCache('nameform');

            element.addListener('click');
            let that = this;
            element.on('click', function (event) {

                if (event.target.name === 'playButton') {
                    var inputText = this.getChildByName('nameField');

                    //  Have they entered anything?
                    if (inputText.value !== '') {
                        //  Turn off the click events
                        this.removeListener('click');

                        //  Hide the login element
                        this.setVisible(false);

                        //  Populate the text with whatever they typed in
                        text.setText('Välkommen ' + inputText.value);
                        that.playerName = inputText.value;
                    }
                    else {
                        //  Flash the prompt
                        this.scene.tweens.add({
                            targets: text,
                            alpha: 0.2,
                            duration: 250,
                            ease: 'Power3',
                            yoyo: true
                        });
                    }
                }

            });
            this.tweens.add({
                targets: element,
                y: 300,
                duration: 3000,
                ease: 'Power3'
            });
        }

    }

    async hitBomb(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, bomb: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
        this.physics.pause();

        this.player.setTint(0xff0000);

        this.player.anims.play('turn');

        this.gameOver = true;
        // const response = await fetch(process.env.backendurl, {
        //     method: 'POST', // *GET, POST, PUT, DELETE, etc.
        //     mode: 'cors', // no-cors, *cors, same-origin
        //     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //     credentials: 'same-origin', // include, *same-origin, omit
        //     headers: {
        //       'Content-Type': 'application/json'
        //       // 'Content-Type': 'application/x-www-form-urlencoded',
        //     },
        //     redirect: 'follow', // manual, *follow, error
        //     referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        //     body: JSON.stringify({name: this.playerName, score: this.score}) // body data type must match "Content-Type" header
        //   });
    }

    collectStar(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, star: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);



        const xPosition = Phaser.Math.FloatBetween(12, 70 * 11);
        const yPosition = Phaser.Math.FloatBetween(0, 500);

        Phaser.Actions.SetXY([star], xPosition, yPosition);

        const xBomb = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = this.bombs.create(xBomb, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
    }

    createStar() {

        const xPosition = 70 * 9;
        const yPosition = Phaser.Math.FloatBetween(0, 500);
        const star = this.physics.add.sprite(xPosition, yPosition, 'star');

        (star.body as Phaser.Physics.Arcade.Body).setBounceY(Phaser.Math.FloatBetween(0.4, 0.6));
        this.physics.add.collider(star, this.platforms);
        this.physics.add.overlap(this.player, star, this.collectStar, null, this);
    }

    update() {
        if (!this.playerName) {
            return;
        }

        if (this.gameOver) {
            if (this.cursors.shift.isDown) {
                this.gameOver = false;
                this.score = 0;
                this.scene.restart();
            } else {
                return;
            }
        }

        if (this.cursors.left.isDown || this.touchMoving === "left") {
            this.player.setVelocityX(-160);

            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown || this.touchMoving === "right") {
            this.player.setVelocityX(160);

            this.player.anims.play('right', true);
        }
        else {
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }

        if ((this.cursors.up.isDown || this.touchMoving === "jump") && this.player.body.touching.down) {
            this.touchMoving = this.beforeJumpMoving;
            this.player.setVelocityY(-330);
        }

        if (this.cursors.up.isDown || this.cursors.left.isDown || this.cursors.right.isDown) {
            this.touchMoving = "";
        }
    }
}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: Demo
};

const game = new Phaser.Game(config);
