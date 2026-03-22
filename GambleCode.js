/**
 * @author 와우
 * @description 심플 도박 시스템 (v1.0)
 * @environment MessengerBotR / v0.7.40+ GraalJS (API2)
 */

const bot = BotManager.getCurrentBot();

/**
 * ⚙️ 설정값
 */
const CONFIG = {
    DB_PATH: "gamble_storage.json",
    INITIAL_MONEY: 10000, // 초기 자금
    DAILY_AMOUNT: 5000,   // 일일 보상
    WIN_RATE: 0.4,        // 승률 (0.4 = 40%)
    MULTIPLIER: 2.0       // 당첨 시 배율
};

/**
 * 💾 데이터 엔진
 */
const DB = {
    load() {
        try {
            const content = Database.readString(CONFIG.DB_PATH);
            return content ? JSON.parse(content) : {};
        } catch (e) { return {}; }
    },
    save(data) {
        try {
            Database.writeString(CONFIG.DB_PATH, JSON.stringify(data, null, 4));
        } catch (e) { /* 저장 오류 무시 */ }
    }
};

/**
 * 🛠️ 유틸리티
 */
const format = (n) => Math.floor(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/**
 * 🎰 메인 로직
 */
bot.addListener(Event.MESSAGE, (msg) => {
    const text = msg.content.trim();
    const hash = msg.author.hash || msg.author.name;
    const data = DB.load();

    // 유저 데이터 초기화
    if (!data[hash]) {
        data[hash] = { 
            name: msg.author.name, 
            money: CONFIG.INITIAL_MONEY, 
            lastDaily: "" 
        };
    }
    const user = data[hash];

    /**
     * 📜 명령어: .도움말
     */
    if (text === ".도움말") {
        msg.reply(
            "🎰 **도박 시스템 명령어**\n" +
            "────────────────\n" +
            "💰 .내정보 : 현재 잔액 확인\n" +
            "🧧 .지원금 : 매일 지원금 수령\n" +
            "🎲 .올인 : 전재산을 걸고 승부\n" +
            "🎰 .도박 [금액] : 정해진 금액으로 도박\n" +
            "🏆 .랭킹 : 자산 순위 TOP 10\n" +
            "────────────────"
        );
        return;
    }

    /**
     * 💰 명령어: .내정보
     */
    if (text === ".내정보") {
        msg.reply(`👤 [${user.name}]님의 자산\n💵 보유 금액: ${format(user.money)}원`);
        return;
    }

    /**
     * 🧧 명령어: .지원금
     */
    if (text === ".지원금") {
        const today = new Date().toLocaleDateString();
        if (user.lastDaily === today) return msg.reply("⏳ 오늘 지원금은 이미 받으셨습니다.");
        
        user.money += CONFIG.DAILY_AMOUNT;
        user.lastDaily = today;
        DB.save(data);
        msg.reply(`🧧 지원금 ${format(CONFIG.DAILY_AMOUNT)}원이 지급되었습니다!\n현재 잔액: ${format(user.money)}원`);
        return;
    }

    /**
     * 🎲 명령어: .도박 & .올인
     */
    if (text.startsWith(".도박") || text === ".올인") {
        let bet = 0;

        if (text === ".올인") {
            bet = user.money;
        } else {
            bet = parseInt(text.split(" ")[1]);
        }

        if (isNaN(bet) || bet <= 0) return msg.reply("❌ 올바른 금액을 입력해주세요.");
        if (user.money < bet) return msg.reply("❌ 잔액이 부족합니다.");

        user.money -= bet;
        const win = Math.random() < CONFIG.WIN_RATE;
        
        let resultMsg = "";
        if (win) {
            const prize = Math.floor(bet * CONFIG.MULTIPLIER);
            user.money += prize;
            resultMsg = `🎊 **당첨!** 🎊\n📈 수익: +${format(prize)}원`;
        } else {
            resultMsg = `💀 **낙첨...** 💀\n📉 손실: -${format(bet)}원`;
        }

        DB.save(data);
        msg.reply(`🎰 **도박 결과**\n────────────────\n${resultMsg}\n💵 현재 잔액: ${format(user.money)}원\n────────────────`);
        return;
    }

    /**
     * 🏆 명령어: .랭킹
     */
    if (text === ".랭킹") {
        const sorted = Object.values(data).sort((a, b) => b.money - a.money).slice(0, 10);
        let rankMsg = "🏆 **자산 랭킹 TOP 10**\n────────────────\n";
        sorted.forEach((u, i) => {
            rankMsg += `${i + 1}위. ${u.name} (${format(u.money)}원)\n`;
        });
        msg.reply(rankMsg + "────────────────");
        return;
    }
});