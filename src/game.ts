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


    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude',
            'assets/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        );
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
        })
    }

    hitBomb(player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, bomb: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
        this.physics.pause();

        this.player.setTint(0xff0000);

        this.player.anims.play('turn');

        this.gameOver = true;
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

        const xPosition = Phaser.Math.FloatBetween(12, 70 * 11);
        const yPosition = Phaser.Math.FloatBetween(0, 500);
        const star = this.physics.add.sprite(xPosition, yPosition, 'star');

        (star.body as Phaser.Physics.Arcade.Body).setBounceY(Phaser.Math.FloatBetween(0.4, 0.6));
        this.physics.add.collider(star, this.platforms);
        this.physics.add.overlap(this.player, star, this.collectStar, null, this);
    }

    update() {
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
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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
