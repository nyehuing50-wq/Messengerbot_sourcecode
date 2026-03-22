/**
 * @author 와우
 * @description API2 방식 낚시 게임 (v0.7.40+ GraalJS)
 */

/**
 * @description 유저 데이터 저장소 (세션 동안 유지)
 */
 
 /** 봇 재시작 시 초기화 됩니다. */
const userData = new Map();

/**
 * @description 물고기 목록 및 희귀도
 */
const FISH_LIST = [
    { name: "장화", price: 0, chance: 20 },
    { name: "멸치", price: 10, chance: 30 },
    { name: "고등어", price: 50, chance: 25 },
    { name: "참치", price: 200, chance: 15 },
    { name: "상어", price: 500, chance: 8 },
    { name: "🐲 전설의 용왕무신", price: 5000, chance: 2 }
];

const bot = BotManager.getCurrentBot();

/**
 * @description 메시지 이벤트 리스너
 */
bot.addListener(Event.MESSAGE, (msg) => {
    if (msg.author.name === "슬로대리 전문 넴스") return;

    /**
     * @description 사용자 식별 및 초기화
     */
    const userId = msg.author.hash || msg.author.name;
    if (!userData.has(userId)) {
        userData.set(userId, { money: 0, count: 0, lastFish: "" });
    }
    const user = userData.get(userId);

    /**
     * @description 명령어: .낚시
     */
    if (msg.content === ".낚시") {
        // 확률 계산 로직
        const rand = Math.random() * 100;
        let accum = 0;
        let caught = FISH_LIST[0];

        for (const f of FISH_LIST) {
            accum += f.chance;
            if (rand <= accum) {
                caught = f;
                break;
            }
        }

        user.count++;
        user.money += caught.price;
        user.lastFish = caught.name;

        let res = `🎣 [${msg.author.name}] 님의 낚시 결과!\n`;
        res += `────────────────\n`;
        if (caught.price === 0) {
            res += `👞 에구... ${caught.name}를 낚았습니다.`;
        } else {
            res += `🐟 [${caught.name}] 획득!\n`;
            res += `💰 가치: ${caught.price}원`;
        }
        res += `\n────────────────\n`;
        res += `현재 총 자산: ${user.money}원\n`;
        res += `누적 횟수: ${user.count}회`;

        msg.reply(res);
    }

    /**
     * @description 명령어: .내정보
     */
    if (msg.content === ".내정보") {
        msg.reply(
            `👤 [${msg.author.name}] 님의 정보\n` +
            `💰 보유 자산: ${user.money}원\n` +
            `🎣 낚시 횟수: ${user.count}회\n` +
            `✨ 최근 월척: ${user.lastFish || "없음"}`
        );
    }
});