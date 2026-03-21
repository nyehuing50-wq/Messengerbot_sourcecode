/**
 * @author 와우
 * @description API2 방식의 공학용 계산기 (v0.7.40+ GraalJS 전용)
 */

/**
 * @description 사용자별 데이터 저장소 (Memory & Last Result)
 */
const calcMemory = new Map();

/**
 * @description 팩토리얼 계산 함수 (안전 범위 제한)
 * @param {number} n
 * @returns {number}
 */
function factorial(n) {
    if (n < 0 || n > 170) return NaN;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

/**
 * @description 현재 봇 객체 가져오기
 */
const bot = BotManager.getCurrentBot();

/**
 * @description 메시지 수신 이벤트 리스너 (API2)
 */
bot.addListener(Event.MESSAGE, (msg) => {
    /**
     * @description 특정 닉네임 제외 및 접두사( .계산 ) 확인
     */
    if (msg.author.name === "슬로대리 전문 넴스") return;
    if (!msg.content.startsWith(".계산")) return;

    /**
     * @description 사용자 식별자 (v0.7.41-alpha 복구된 userHash 또는 hash 사용)
     */
    const userId = msg.author.hash || msg.author.name;
    
    if (!calcMemory.has(userId)) {
        calcMemory.set(userId, { lastResult: 0, memory: 0 });
    }
    const userStats = calcMemory.get(userId);

    const input = msg.content.substring(3).trim().toLowerCase();
    if (!input) return;

    /**
     * @description 도움말 기능
     */
    if (input === "도움말") {
        msg.reply(
            "📌 [.계산] 사용법 (API2)\n" +
            "────────────────\n" +
            "✅ 연산: +, -, ×, ÷, ^, %\n" +
            "✅ 상수: pi, e, φ\n" +
            "✅ 메모리: M+, MR, MC, ans\n" +
            "✅ 함수: sqrt, sin, cos, tan, log, ln, fact, abs, pow\n" +
            "────────────────\n" +
            "예시: .계산 (10 + 5) × 2"
        );
        return;
    }

    /**
     * @description 메모리 명령어 처리
     */
    if (input === "mr") return msg.reply(`🔢 메모리 값: ${userStats.memory}`);
    if (input === "mc") {
        userStats.memory = 0;
        return msg.reply("🗑 메모리 초기화 완료");
    }
    if (input.startsWith("m+")) {
        const addVal = parseFloat(input.replace("m+", "").trim());
        if (isNaN(addVal)) return msg.reply("❌ 숫자를 입력하세요.");
        userStats.memory += addVal;
        return msg.reply(`✅ 메모리 추가됨: ${userStats.memory}`);
    }

    /**
     * @description 수식 변환 및 계산
     */
    try {
        let expression = input;

        // 팩토리얼 처리
        expression = expression.replace(/fact\((\d+)\)/g, (_, n) => factorial(Number(n)));

        // 기호 및 상수 치환
        expression = expression
            .replace(/×/g, "*").replace(/÷/g, "/")
            .replace(/\^/g, "**")
            .replace(/pi/g, "Math.PI").replace(/e/g, "Math.E")
            .replace(/φ/g, "((1+Math.sqrt(5))/2)")
            .replace(/ans/g, userStats.lastResult);

        // 수학 함수 매핑 (GraalJS 최적화)
        const mathMap = {
            "sqrt": "Math.sqrt", "ln": "Math.log", "log": "Math.log10",
            "sin": "Math.sin", "cos": "Math.cos", "tan": "Math.tan",
            "abs": "Math.abs", "exp": "Math.exp", "pow": "Math.pow"
        };
        
        Object.keys(mathMap).forEach(key => {
            expression = expression.split(key + "(").join(mathMap[key] + "(");
        });

        /**
         * @description 보안 필터링: 화이트리스트 기반 검사
         */
        if (/[^0-9.+\-*/%() ,MathPIE]/.test(expression)) {
            return msg.reply("❌ 허용되지 않은 문자가 포함되어 있습니다.");
        }

        /**
         * @description 계산 실행 (Function 생성자)
         */
        const result = new Function(`return (${expression})`)();

        if (typeof result !== "number" || !isFinite(result)) {
            throw new Error();
        }

        userStats.lastResult = result;
        msg.reply(`🧮 결과: ${result}`);

    } catch (e) {
        msg.reply("❌ 올바른 수식이 아닙니다.");
    }
});