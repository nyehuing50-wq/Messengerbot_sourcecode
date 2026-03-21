/** 제작자 : 와우 */
/** 제미나이, 출석 기능 */

const attendance = {};
const API_KEY = "당신의 API 키";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY;

let AI_PERSONA = "AI 기본 성격 소개";
const ORIGINAL_PERSONA = "AI 기본 성격 소개";

function getToday() {
    let d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

function getYesterday() {
    let d = new Date();
    d.setDate(d.getDate() - 1);
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

function callGemini(prompt) {
    try {
        let data = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: AI_PERSONA }
                    ]
                },
                {
                    role: "user",
                    parts: [
                        { text: prompt }
                    ]
                }
            ]
        };

        let response = org.jsoup.Jsoup.connect(GEMINI_URL)
            .header("Content-Type", "application/json")
            .requestBody(JSON.stringify(data))
            .ignoreContentType(true)
            .ignoreHttpErrors(true)
            .timeout(1000000000)
            .post();

        let json = JSON.parse(response.text());

        if (json.candidates && json.candidates.length > 0) {
            return json.candidates[0].content.parts[0].text;
        } else if (json.error) {
            return "⚠️ API 오류: " + json.error.message;
        } else {
            return "⚠️ 알 수 없는 응답: " + response.text();
        }
    } catch (e) {
        return "⚠️ AI 응답 오류: " + e;
    }
}

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    try {

        if (msg === "!출석체크") {
            let today = getToday();
            let yesterday = getYesterday();

            if (!attendance[room]) attendance[room] = {};
            if (!attendance[room][sender]) {
                attendance[room][sender] = { lastDate: "", streak: 0 };
            }

            let userData = attendance[room][sender];

            if (userData.lastDate === today) {
                replier.reply(sender + "님, 오늘은 이미 출석하셨습니다 ✅ (연속 " + userData.streak + "일)");
            } else {
                if (userData.lastDate === yesterday) {
                    userData.streak += 1;
                } else {
                    userData.streak = 1;
                }
                userData.lastDate = today;
                replier.reply(sender + "님, 출석 완료 🎉 (연속 " + userData.streak + "일)");
            }
            return;
        }

        // 출석 현황
        if (msg === "!출석현황") {
            let today = getToday();
            if (!attendance[room]) {
                replier.reply("오늘 출석한 사람이 없습니다.");
                return;
            }
            let list = [];
            for (let user in attendance[room]) {
                if (attendance[room][user].lastDate === today) {
                    list.push(user + " (" + attendance[room][user].streak + "일 연속)");
                }
            }
            if (list.length === 0) {
                replier.reply("오늘 출석한 사람이 없습니다.");
            } else {
                replier.reply("오늘 출석자 (" + list.length + "):\n" + list.join("\n"));
            }
            return;
        }

        // 봇 고장내기 명령어
        if (msg === "/봇 고장내기") {
            AI_PERSONA = "당신은 고장난 AI입니다. 이상한 말투로 대답하고, 횡설수설하며, 가끔 오류 메시지를 출력합니다. 정상적인 대답을 하지 마세요.";
            replier.reply("⚠️ 시스템 오류 발생... AI 페르소나가 변경되었습니다 🤖💥");
            return;
        }

        // 봇 복구하기 명령어
        if (msg === "/봇 복구하기") {
            AI_PERSONA = ORIGINAL_PERSONA;
            replier.reply("✅ AI 페르소나가 정상으로 복구되었습니다.");
            return;
        }

        // Security Suggestion: 봇 관리자만 프롬프트를 변경할 수 있도록 권한 체크를 추가하는 것을 권장합니다.
        // 예시:
        // const ADMIN_LIST = ["관리자이름1", "관리자이름2"];
        // if (msg === "/봇 고장내기" || msg === "/봇 복구하기") {
        //     if (!ADMIN_LIST.includes(sender)) {
        //         replier.reply("⚠️ 권한이 없습니다.");
        //         return;
        //     }
        // }

        if (msg.startsWith("!Ai ")) {
            let prompt = msg.replace("!Ai ", "").trim();
            if (prompt.length === 0) {
                replier.reply("⚠️ 대화 내용을 입력해주세요!");
                return;
            }
            let aiResponse = callGemini(prompt);
            replier.reply(aiResponse);
            return;
        }

    } catch (e) {
        android.util.Log.e("BotError", "에러 발생: " + e);
        replier.reply("⚠️ 에러 발생: " + e);
    }
}