class Card {
    constructor(id, type, pairId, content) {
        this.id = id;
        this.type = type;
        this.pairId = pairId;
        this.content = content;
        this.state = 'BACK';
    }
}

class Game {
    constructor() {
        this.board = [];
        this.selectedCards = [];
        this.score = 0;
        this.moves = 20;
        this.isGameActive = true;
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        // 初始化诗句数据
        const verses = [
            { text: "床前明月光", pairId: 1, poet: "李白" },
            { text: "疑是地上霜", pairId: 1, poet: "李白" },
            { text: "举头望明月", pairId: 2, poet: "李白" },
            { text: "低头思故乡", pairId: 2, poet: "李白" },
            { text: "春眠不觉晓", pairId: 3, poet: "孟浩然" },
            { text: "处处闻啼鸟", pairId: 3, poet: "孟浩然" },
            { text: "夜来风雨声", pairId: 4, poet: "孟浩然" },
            { text: "花落知多少", pairId: 4, poet: "孟浩然" },
            { text: "红豆生南国", pairId: 5, poet: "王维" },
            { text: "春来发几枝", pairId: 5, poet: "王维" },
            { text: "白日依山尽", pairId: 6, poet: "王之涣" },
            { text: "黄河入海流", pairId: 6, poet: "王之涣" },
            { text: "海内存知己", pairId: 7, poet: "王勃" },
            { text: "天涯若比邻", pairId: 7, poet: "王勃" },
            { text: "停车坐爱枫林晚", pairId: 8, poet: "杜牧" },
            { text: "霜叶红于二月花", pairId: 8, poet: "杜牧" },
            { text: "商女不知亡国恨", pairId: 9, poet: "杜牧" },
            { text: "隔江犹唱后庭花", pairId: 9, poet: "杜牧" },
            { text: "日暮乡关何处是", pairId: 10, poet: "贾岛" },
            { text: "烟波江上使人愁", pairId: 10, poet: "贾岛" },
            { text: "独坐幽篁里", pairId: 11, poet: "王维" },
            { text: "弹琴复长啸", pairId: 11, poet: "王维" },
            { text: "千山鸟飞绝", pairId: 12, poet: "柳宗元" },
            { text: "万径人踪灭", pairId: 12, poet: "柳宗元" },
        ];

        // 创建6x6的游戏板
        this.board = this.createBoard(verses);
        this.renderBoard();
        this.updateUI();
    }

    createBoard(verses) {
        // 随机排列诗句
        const shuffledVerses = [...verses].sort(() => Math.random() - 0.5);
        
        // 创建4x6网格（改为4列布局）
        const board = [];
        for (let i = 0; i < 6; i++) {
            const row = [];
            for (let j = 0; j < 4; j++) {
                const index = i * 4 + j;
                if (index < shuffledVerses.length) {
                    row.push({
                        ...shuffledVerses[index],
                        id: index,
                        matched: false
                    });
                } else {
                    // 填充空白格子
                    row.push(null);
                }
            }
            board.push(row);
        }
        return board;
    }

    renderBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';

        this.board.forEach((row, i) => {
            row.forEach((card, j) => {
                if (card) {
                    const cardElement = document.createElement('div');
                    cardElement.className = 'card';
                    cardElement.dataset.row = i;
                    cardElement.dataset.col = j;
                    
                    cardElement.innerHTML = `
                        <div class="card-content">
                            <div class="card-text">${card.text}</div>
                            <div class="card-poet">${card.poet}</div>
                            <div class="card-decoration"></div>
                        </div>
                    `;

                    cardElement.addEventListener('click', () => this.handleCardClick(i, j));
                    gameBoard.appendChild(cardElement);
                }
            });
        });
    }

    handleCardClick(row, col) {
        if (!this.isGameActive) return;
        
        const card = this.board[row][col];
        if (!card || card.matched) return;

        const cardElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        // 如果已经选中了这张卡，取消选择
        if (this.selectedCards.some(c => c.row === row && c.col === col)) {
            this.deselectCard(cardElement);
            this.selectedCards = this.selectedCards.filter(c => c.row !== row || c.col !== col);
            return;
        }

        // 选中卡牌
        cardElement.classList.add('selected');
        this.selectedCards.push({ row, col, card });

        // 检查是否有两张卡被选中
        if (this.selectedCards.length === 2) {
            this.checkMatch();
        }
    }

    checkMatch() {
        const [card1, card2] = this.selectedCards;
        const element1 = document.querySelector(`[data-row="${card1.row}"][data-col="${card1.col}"]`);
        const element2 = document.querySelector(`[data-row="${card2.row}"][data-col="${card2.col}"]`);

        if (card1.card.pairId === card2.card.pairId) {
            // 匹配成功
            this.handleMatchSuccess(card1, card2, element1, element2);
        } else {
            // 匹配失败
            this.handleMatchFail(element1, element2);
        }

        this.moves--;
        this.updateUI();
        
        // 检查游戏是否结束
        if (this.moves <= 0) {
            this.gameOver();
        }
    }

    handleMatchSuccess(card1, card2, element1, element2) {
        // 标记卡牌为已匹配
        this.board[card1.row][card1.col].matched = true;
        this.board[card2.row][card2.col].matched = true;

        // 添加匹配动画
        element1.classList.add('matched');
        element2.classList.add('matched');

        // 更新分数
        this.score += 100;

        // 清除选中状态
        setTimeout(() => {
            element1.classList.remove('selected');
            element2.classList.remove('selected');
            this.selectedCards = [];
        }, 500);

        // 检查是否完成所有匹配
        if (this.checkWinCondition()) {
            this.gameWin();
        }

        // 添加粒子效果
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        
        this.createParticles(rect1.left + rect1.width / 2, rect1.top + rect1.height / 2);
        this.createParticles(rect2.left + rect2.width / 2, rect2.top + rect2.height / 2);
    }

    handleMatchFail(element1, element2) {
        // 添加晃动动画
        element1.classList.add('shake');
        element2.classList.add('shake');

        // 移除选中和晃动效果
        setTimeout(() => {
            element1.classList.remove('selected', 'shake');
            element2.classList.remove('selected', 'shake');
            this.selectedCards = [];
        }, 1000);
    }

    deselectCard(element) {
        element.classList.remove('selected');
    }

    checkWinCondition() {
        return this.board.every(row => 
            row.every(card => !card || card.matched)
        );
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('moves').textContent = this.moves;
        
        // 更新进度条
        const progress = (1 - this.moves / 20) * 100;
        document.getElementById('levelProgress').style.width = `${progress}%`;
    }

    gameOver() {
        this.isGameActive = false;
        alert(`游戏结束！\n最终得分：${this.score}`);
    }

    gameWin() {
        this.isGameActive = false;
        alert(`恭喜通关！\n最终得分：${this.score}`);
    }

    setupEventListeners() {
        document.getElementById('shuffleBtn').addEventListener('click', () => {
            if (this.moves > 0) {
                this.moves -= 2; // 使用重排需要消耗2步
                this.board = this.createBoard(this.board.flat().filter(card => card && !card.matched));
                this.renderBoard();
                this.updateUI();
            }
        });

        document.getElementById('hintBtn').addEventListener('click', () => {
            if (this.moves > 0) {
                this.moves--; // 使用提示需要消耗1步
                this.showHint();
                this.updateUI();
            }
        });
    }

    showHint() {
        // 找到一对未匹配的卡牌
        const unmatchedCards = [];
        this.board.forEach((row, i) => {
            row.forEach((card, j) => {
                if (card && !card.matched) {
                    unmatchedCards.push({ row: i, col: j, card });
                }
            });
        });

        // 找到一对匹配的卡牌
        for (let i = 0; i < unmatchedCards.length; i++) {
            for (let j = i + 1; j < unmatchedCards.length; j++) {
                if (unmatchedCards[i].card.pairId === unmatchedCards[j].card.pairId) {
                    const elements = [
                        document.querySelector(`[data-row="${unmatchedCards[i].row}"][data-col="${unmatchedCards[i].col}"]`),
                        document.querySelector(`[data-row="${unmatchedCards[j].row}"][data-col="${unmatchedCards[j].col}"]`)
                    ];

                    elements.forEach(el => {
                        el.style.border = '3px solid gold';
                        setTimeout(() => {
                            el.style.border = '';
                        }, 1500);
                    });
                    return;
                }
            }
        }
    }

    createParticles(x, y) {
        const particlesContainer = document.querySelector('.particles-container');
        const particleCount = 30;
        const colors = ['#4a90e2', '#357abd', '#c8e6c9', '#a5d6a7'];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 8 + 4;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const angle = (Math.random() * 360 * Math.PI) / 180;
            const velocity = Math.random() * 100 + 50;
            const lifetime = Math.random() * 1000 + 500;

            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
            `;

            particlesContainer.appendChild(particle);

            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / lifetime;

                if (progress < 1) {
                    const moveX = x + Math.cos(angle) * velocity * progress;
                    const moveY = y + Math.sin(angle) * velocity * progress + (progress * 200);
                    const scale = 1 - progress;
                    const opacity = 1 - progress;

                    particle.style.transform = `translate(${moveX - x}px, ${moveY - y}px) scale(${scale})`;
                    particle.style.opacity = opacity;

                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };

            requestAnimationFrame(animate);
        }
    }
}

// 启动游戏
window.addEventListener('load', () => {
    new Game();
}); 