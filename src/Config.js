import PlayingScene from './scenes/PlayingScene';
import LoadingScene from './scenes/LoadingScene';

const Config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    // 게임 화면의 크기와 색을 설정하는 부분
    width: 1280,
    height: 720,
    backgroundColor: 0x000000,

    // 사용할 scene은 config의 scene 프로퍼티의 배열에 추가
    scene: [LoadingScene, PlayingScene],

    // 물리엔진
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        },
    },
};

export default Config;
