import Phaser from 'phaser';
import Config from '../Config';
import Player from '../charactors/player';
import { setBackground } from '../utils/backgroundManager';
import io from 'socket.io-client';

export default class PlayingScene extends Phaser.Scene {
    constructor() {
        super('playGame');
        this.otherPlayers = {};
        this.lastPosition = { id: '', x: 0, y: 0 };
        this.userName = '';
    }

    create() {
        this.m_player = new Player(this);

        this.cameras.main.startFollow(this.m_player);

        // PlayingScene의 background를 설정
        setBackground(this, 'background1');

        this.m_cursorKeys = this.input.keyboard.createCursorKeys();

        this.add.text(150, 10, '해뻐치 대화방에 오신 것을 환영합니다.', {
            font: '25px Fira Code',
            fill: '#f5e99f',
        });

        this.socket = io('http://localhost:3003');

        // 캐릭터 머리 위 이름
        const nameTextStyle = {
            font: 'Fira Code',
            fill: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: {
                x: 8,
                y: 4,
            },
        };

        this.socket.on('moveC', (positions) => {
            console.log('플레이어', positions.id);
            // console.log(Object.values(positions));
            if (positions.id === this.socket.id) {
                console.log('본인');
                return;
            }
            if (this.otherPlayers[positions.id]) {
                // 위치 업데이트
                this.otherPlayers[positions.id].sprite.x = positions.x;
                this.otherPlayers[positions.id].sprite.y = positions.y;
            } else {
                // 새 플레이어 생성
                const newPlayer = this.add.sprite(
                    positions.x,
                    positions.y,
                    'player'
                );
                newPlayer.play('player_anim');
                this.otherPlayers[positions.id] = {
                    sprite: newPlayer,
                };
            }
        });

        this.setupChat();
    }

    movePlayerManager() {
        if (
            this.m_cursorKeys.left.isDown ||
            this.m_cursorKeys.right.isDown ||
            this.m_cursorKeys.up.isDown ||
            this.m_cursorKeys.down.isDown
        ) {
            if (!this.m_player.m_moving) {
                this.m_player.play('player_anim');
            }
            this.m_player.m_moving = true;
        } else {
            if (this.m_player.m_moving) {
                this.m_player.play('player_idle');
            }
            this.m_player.m_moving = false;
        }

        // vector를 사용해 움직임을 관리할 것입니다.
        // vector = [x좌표 방향, y좌표 방향]입니다.
        // 왼쪽 키가 눌려있을 때는 vector[0] += -1, 오른쪽 키가 눌려있을 때는 vector[0] += 1을 해줍니다.
        // 위/아래 또한 같은 방법으로 벡터를 수정해줍니다.
        let vector = [0, 0];
        if (this.m_cursorKeys.left.isDown) {
            // player.x -= PLAYER_SPEED // 공개영상에서 진행했던 것
            vector[0] += -1;
        } else if (this.m_cursorKeys.right.isDown) {
            vector[0] += 1;
        }

        if (this.m_cursorKeys.up.isDown) {
            vector[1] += -1;
        } else if (this.m_cursorKeys.down.isDown) {
            vector[1] += 1;
        }

        this.m_player.move(vector);

        if (this.m_player.m_moving) {
            if (
                this.m_player.x !== this.lastPosition.x ||
                this.m_player.y !== this.lastPosition.y
            ) {
                this.socket.emit('move', {
                    id: this.socket.id,
                    x: this.m_player.x,
                    y: this.m_player.y,
                });
                this.lastPosition = {
                    id: this.socket.id,
                    x: this.m_player.x,
                    y: this.m_player.y,
                };
                // this.updatePlayerName()
            }
        }
    }

    setupChat() {
        const chatDiv = document.createElement('div');
        chatDiv.id = 'chat';
        chatDiv.innerHTML = `
        <div id="messages" style="height: 200px; overflow-y: scroll;"></div>
        <form id="form">
        <input type="text" id="chat-input" placeholder="메시지 입력" />
        <button id="send-button">보내기</button>
        </form>

        `;

        document.body.appendChild(chatDiv);

        const form = document.getElementById('form');
        const input = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');
        const messagesDiv = document.getElementById('messages');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (input.value) {
                const output = {
                    sender: this.socket.id,
                    recepient: 'ALL',
                    data: input.value,
                };
                console.log(`서버로 가는 데이터 ${JSON.stringify(output)}`);

                if (this.socket == undefined) {
                    alert('서버에 연결되지 않았습니다.');
                    return;
                }
                this.socket.emit('messageS', output);
            }
        });

        this.socket.on('messageC', (message) => {
            const messageElement = document.createElement('div');
            messageElement.textContent = `${message.sender}: ${message.data}`;
            messagesDiv.appendChild(messageElement);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });
    }

    update() {
        this.movePlayerManager();

        this.m_background.setX(this.m_player.x - Config.width / 2);
        this.m_background.setY(this.m_player.y - Config.height / 2);

        this.m_background.tilePositionX = this.m_player.x - Config.width / 2;
        this.m_background.tilePositionY = this.m_player.y - Config.width / 2;

        const closest = this.physics.closest(this.m_player);
        this.m_closest = closest;
    }
}
