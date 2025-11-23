// محاولة التقاط WebSocket الأصلي الخاص باللعبة
let oldWebSocket = window.WebSocket;
let socket;

window.WebSocket = function (...args) {
    socket = new oldWebSocket(...args);

    socket.addEventListener("open", () => log("🔌 WebSocket Connected"));
    socket.addEventListener("message", (msg) => log("📥 Received: " + msg.data));
    socket.addEventListener("close", () => log("❌ WebSocket Closed"));

    return socket;
};

function log(msg) {
    document.getElementById("log").textContent += msg + "\n";
}

// زر بدأ اللعب
document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("playBtn").onclick = () => {
        log("▶ بدء اللعب");

        // إرسال بايت تشغيل اللعبة (هذا مثال — يمكنني جلب البايت الحقيقي إذا أعطيتني HAR)
        if (socket) socket.send(new Uint8Array([1, 0]));
    };

    document.getElementById("splitBtn").onclick = () => {
        log("🟦 Split!");
        if (socket) socket.send(new Uint8Array([17]));
    };

    document.getElementById("feedBtn").onclick = () => {
        log("🟩 Feed!");
        if (socket) socket.send(new Uint8Array([21]));
    };
});
