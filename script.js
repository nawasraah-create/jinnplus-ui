let originalStartGame = null;

function hookOriginalStart() {
    let startBtn = document.querySelector(".play-btn, #play, .start, button.start");
    
    if (!startBtn) {
        console.log("⏳ بستنّى صفحة اللعبة تخلص تحميل...");
        setTimeout(hookOriginalStart, 500);
        return;
    }

    // محاولة سحب الدالة الأصلية
    if (startBtn.onclick) {
        originalStartGame = startBtn.onclick;
    } 
    
    console.log("🔥 تم العثور على الدالة الأصلية لزر Start!");
}

hookOriginalStart();

// زر PLAY في الواجهة الجديدة
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("playBtn").onclick = () => {
        if (typeof originalStartGame === "function") {
            console.log("🎮 تشغيل الدالة الأصلية!");
            originalStartGame(); // هذا يفتح اللعبة نفس الأصل
        } else {
            console.log("❌ لم يتم العثور على الدالة الأصلية حتى الآن، أعد تحميل الصفحة");
        }
    };
});
