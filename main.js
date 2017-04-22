window.addEventListener("keypress", function (event) {
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

    const anchor = result.querySelector("a");
    const href = anchor.href;

    window.location.href = href;
});

const emojicationSuffix = "\u{FE0F}\u{20e3} ";

function emojifyResults () {
    const results = document.body.querySelectorAll("h3.r");
    const last = results.length - 1;

    console.log("results", results);

    results.forEach((result, index) => {
        if (index === last || index < 9) {
            const digit = (index === last) ? 0 : index + 1;
            const emojiDigit = String(digit) + emojicationSuffix;

            result.insertAdjacentText("afterbegin", emojiDigit);
        }
    });
};

if (window.document.readyState === "complete") {
    emojifyResults();
}

window.document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        emojifyResults();
    }
}

