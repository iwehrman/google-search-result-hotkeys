window.addEventListener("keydown", function handleNavigation (event) {
    if (window.document.activeElement !== window.document.body) {
        return;
    }

    const keyCode = event.code;
    if (keyCode.indexOf("Digit") !== 0) {
        return;
    }

    const digit = Number(keyCode[5]);
    if (digit < 0 || digit > 9) {
        return;
    }

    const index = (digit === 0) ? 8 : (digit - 1);
    const results = document.body.querySelectorAll("h3.r");
    const result = results[index];
    if (!result) {
        return;
    }

    event.stopPropagation();

    const anchor = result.querySelector("a");
    const href = anchor.href;

    window.location.href = href;
}, true);

const emojicationSuffix = "\u{FE0F}\u{20e3} ";

const observerConfig = { subtree: true, childList: true };

function emojifyResults () {
    const results = document.body.querySelectorAll("h3.r");
    const last = results.length - 1;

    results.forEach((result, index) => {
        if (index === last || index < 9) {
            if (result.textContent.indexOf(emojicationSuffix) > -1) {
                return;
            }

            const digit = (index === last) ? 0 : index + 1;
            const emojiDigit = String(digit) + emojicationSuffix;

            result.insertAdjacentText("afterbegin", emojiDigit);
        }
    });

    const container = document.querySelector("#res");
    const search = document.querySelector("#search");
    const observer = new MutationObserver(mutations => {
        mutations.some(mutation => {
            if (mutation.type === "childList" && mutation.target === search) {
                observer.disconnect();
                window.requestAnimationFrame(emojifyResults);
                return true;
            }
        });
    });

    observer.observe(container, observerConfig);
};

if (window.document.readyState === "complete") {
    emojifyResults();
}

window.document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        emojifyResults();
    }
}
