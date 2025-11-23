// v.js - Multibox controller by Youcef & ChatGPT
(function () {
    console.log("v.js loaded: 3rb.io Multibox controller active");

    const openedWindows = [];

    function openNewPlayer() {
        // نغير الرابط ليعمل على فتح نافذة جديدة
        const url = "https://3rb.io/"; 
        const win = window.open(url, "_blank");
        if (!win) {
            alert("المتصفح منع فتح النوافذ المنبثقة.\nفعّل السماح بالنوافذ (Popups) لـ 3rb.io و GitHub.");
            return;
        }
        openedWindows.push(win);
        console.log("Opened new player. Total:", openedWindows.length);
    }

    function openNPlayers(n) {
        for (let i = 0; i < n; i++) {
            openNewPlayer();
        }
    }

    function focusPlayer(index) {
        const win = openedWindows[index];
        if (win && !win.closed) {
            win.focus();
        } else {
            alert("👀 اللاعب " + (index + 1) + " غير مفتوح أو تم إغلاقه.");
        }
    }

    function setupUI() {
        const btnOpen1 = document.getElementById("open-1");
        const btnOpen3 = document.getElementById("open-3");
        const btnOpenCustom = document.getElementById("open-custom");
        const btnFocus1 = document.getElementById("focus-1");
        const btnFocus2 = document.getElementById("focus-2");
        const btnFocus3 = document.getElementById("focus-3");

        if (!btnOpen1) {
            console.warn("Multibox UI not found. Are we on the control page?");
            return;
        }

        btnOpen1.addEventListener("click", () => openNPlayers(1));
        btnOpen3.addEventListener("click", () => openNPlayers(3));
        btnOpenCustom.addEventListener("click", () => openNewPlayer());

        btnFocus1.addEventListener("click", () => focusPlayer(0));
        btnFocus2.addEventListener("click", () => focusPlayer(1));
        btnFocus3.addEventListener("click", () => focusPlayer(2));

        document.addEventListener("keydown", (e) => {
            if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

            if (e.key === "1") {
                focusPlayer(0);
            } else if (e.key === "2") {
                focusPlayer(1);
            } else if (e.key === "3") {
                focusPlayer(2);
            }
        });

        console.log("Multibox UI initialized.");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupUI);
    } else {
        setupUI();
    }
})();