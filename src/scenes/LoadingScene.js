import Phaser from 'phaser';
import bgImg1 from '../assets/background.png';
import playerImg from '../assets/player.png';

export default class LoadingScene extends Phaser.Scene {
    constructor() {
        super('bootGame');
    }

    preload() {
        this.load.image('background1', bgImg1);
        this.load.spritesheet('player', playerImg, {
            frameWidth: 48,
            frameHeight: 64,
        });
    }

    create() {
        this.add.text(20, 20, 'Loading page...');
        this.scene.start('playGame');

        this.anims.create({
            key: 'player_anim',
            frames: this.anims.generateFrameNumbers('player', {
                start: 5,
                end: 9,
            }),
            frameRate: 12,
            repeat: -1,
        });
        this.anims.create({
            key: 'player_idle',
            frames: this.anims.generateFrameNumbers('player', {
                start: 0,
                end: 0,
            }),
            frameRate: 1,
            repeat: 0,
        });
    }
}
