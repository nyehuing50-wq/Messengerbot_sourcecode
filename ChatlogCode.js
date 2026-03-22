/**
 * @author 와우
 * @description 채팅 로그 시스템 (v1.2)
 * @environment MessengerBotR / v0.7.40+ GraalJS (API2)
 */

const bot = BotManager.getCurrentBot();

/**
 * 채팅 로그 저장소 (메모리 상주)
 */
const chatLogs = new Map();

/**
 * 설정값
 */
const CONFIG = {
    MAX_LOGS: 100, // 방당 저장할 최대 로그 개수
    SPACING: "\u200b".repeat(500) // 전체보기용 공백
};

/**
 * 유틸리티: 시간 포맷
 */
const getNow = () => {
    const d = new Date();
    return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
};

/**
 * 메인 리스너
 */
bot.addListener(Event.MESSAGE, (msg) => {
    const { room, content, sender } = msg;
    
    /**
     * 사용자 식별 정보 추출
     * msg.author.hash: 사용자의 고유 해시값
     */
    const userHash = msg.author.hash;
    const userName = msg.author.name;

    // 방별 로그 배열 초기화
    if (!chatLogs.has(room)) {
        chatLogs.set(room, []);
    }
    const currentRoomLogs = chatLogs.get(room);

    /**
     * 명령어: .챗 로그
     */
    if (content === ".챗 로그") {
        if (currentRoomLogs.length === 0) {
            msg.reply("저장된 채팅 로그가 없습니다.");
            return;
        }

        // 최신순으로 정렬하여 출력
        const logDisplay = currentRoomLogs.slice().reverse().join("\n\n");
        msg.reply("[ " + room + " 채팅 로그 ]" + CONFIG.SPACING + "\n\n" + logDisplay);
        return;
    }

    /**
     * 명령어: .로그초기화
     */
    if (content === ".로그초기화") {
        chatLogs.set(room, []);
        msg.reply("해당 방의 로그가 초기화되었습니다.");
        return;
    }

    /**
     * 실시간 로그 기록 (명령어 제외)
     * 닉네임과 전체 해시값을 정확하게 기록합니다.
     */
    if (content && !content.startsWith(".")) {
        const logEntry = "[" + getNow() + "] [" + userHash + "] " + userName + ": " + content;
        
        currentRoomLogs.push(logEntry);

        // 최대 로그 개수 유지 (오래된 로그 삭제)
        if (currentRoomLogs.length > CONFIG.MAX_LOGS) {
            currentRoomLogs.shift();
        }
    }
});