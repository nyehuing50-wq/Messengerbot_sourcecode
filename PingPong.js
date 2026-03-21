/** 제작자 : 와우 */
/** 핑퐁 소스 */

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
    
    if (msg === "!ping") {
        
        const startTime = Date.now();

        const replyText = "pong!";

        replier.reply(replyText);

        const endTime = Date.now();
        
        const elapsedTime = endTime - startTime;

        replier.reply("⏱️ 처리 시간: " + elapsedTime + "ms");
        
    }
}