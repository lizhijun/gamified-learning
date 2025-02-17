// 诗人数据
const POETS_DATA = {
    fan: {
        name: "范成大",
        intro: "南宋著名诗人，擅长田园诗。生活中亲身体验农村生活，创作了大量描写农村生活的诗歌。",
        poems: [
            {
                title: "四时田园杂兴",
                content: "昼出耘田夜绩麻，村庄儿女各当家。",
                pinyin: "zhòu chū yún tián yè jì má, cūn zhuāng ér nǚ gè dāng jiā."
            }
        ]
    },
    yang: {
        name: "杨万里",
        intro: "南宋诗人，诗风清新自然。善于捕捉生活中的精妙瞬间，诗作富有灵气。",
        poems: [
            {
                title: "晓出净慈寺送林子方",
                content: "毕竟西湖六月中，风光不与四时同。",
                pinyin: "bì jìng xī hú liù yuè zhōng, fēng guāng bù yǔ sì shí tóng."
            }
        ]
    },
    lei: {
        name: "雷震",
        intro: "唐代诗人，善写田园生活。以朴实的笔触描绘农村的自然风光和生活气息。",
        poems: [
            {
                title: "村居",
                content: "草长莺飞二月天，拂堤杨柳醉春烟。",
                pinyin: "cǎo zhǎng yīng fēi èr yuè tiān, fú dī yáng liǔ zuì chūn yān."
            }
        ]
    }
};

// 当前状态
let currentPoet = null;
let isDialogShowing = false;
let isPoemShowing = false;
let speechSynth = window.speechSynthesis;
let speaking = false;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    if ('speechSynthesis' in window) {
        // 初始化语音合成
        speechSynth = window.speechSynthesis;
    } else {
        console.warn('浏览器不支持语音合成功能');
        // 可以在这里添加降级处理
    }
    initPoets();
    initDialogEvents();
});

// 初始化诗人交互
function initPoets() {
    const poets = document.querySelectorAll('.poet-image');
    poets.forEach(poet => {
        poet.addEventListener('click', (e) => {
            if (isDialogShowing || isPoemShowing) return;
            const poetId = e.target.id;
            showPoetInteraction(poetId);
        });
    });
}

// 初始化对话框事件
function initDialogEvents() {
    const dialog = document.getElementById('dialog');
    dialog.addEventListener('click', () => {
        if (isDialogShowing && !isPoemShowing) {
            if (speaking) {
                speechSynth.cancel();
            }
            showPoem(currentPoet);
        }
    });
}

// 朗读文本
function speak(text, rate = 1) {
    if (speaking) {
        speechSynth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = rate;
    utterance.pitch = 1;
    
    utterance.onstart = () => {
        speaking = true;
    };
    
    utterance.onend = () => {
        speaking = false;
    };
    
    speechSynth.speak(utterance);
}

// 显示诗人交互
function showPoetInteraction(poetId) {
    currentPoet = poetId;
    const poet = POETS_DATA[poetId];
    const dialog = document.getElementById('dialog');
    const dialogContent = dialog.querySelector('.dialog-content');
    
    isDialogShowing = true;
    dialog.style.display = 'block';
    
    // 逐字显示文本
    let index = 0;
    dialogContent.textContent = '';
    const intervalId = setInterval(() => {
        if (index < poet.intro.length) {
            dialogContent.textContent += poet.intro[index];
            index++;
        } else {
            clearInterval(intervalId);
            // 朗读介绍
            speak(poet.intro, 0.8);
        }
    }, 50);
}

// 显示诗句
function showPoem(poetId) {
    const poem = POETS_DATA[poetId].poems[0];
    const poemDisplay = document.getElementById('poem');
    const poemText = poemDisplay.querySelector('.poem-text');
    const poemPinyin = poemDisplay.querySelector('.poem-pinyin');
    
    isDialogShowing = false;
    isPoemShowing = true;
    document.getElementById('dialog').style.display = 'none';
    poemDisplay.style.display = 'block';
    
    // 逐字显示诗句
    let index = 0;
    poemText.textContent = '';
    poemPinyin.textContent = '';
    
    const intervalId = setInterval(() => {
        if (index < poem.content.length) {
            poemText.textContent += poem.content[index];
            if (index === 0 || index === poem.content.length / 2) {
                poemPinyin.textContent += poem.pinyin.split(',')[index === 0 ? 0 : 1] + ' ';
            }
            index++;
        } else {
            clearInterval(intervalId);
            // 朗读诗句
            speak(poem.content, 0.7);
            
            // 诗句朗读完成后自动关闭
            setTimeout(() => {
                poemDisplay.style.display = 'none';
                isPoemShowing = false;
            }, 6000);
        }
    }, 200);
} 