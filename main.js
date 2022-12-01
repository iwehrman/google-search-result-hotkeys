/**
 *
 * @param {(String|String[]|Function)} getter -
 *      string: selector to return a single element
 *      string[]: selector to return multiple elements (only the first selector will be taken)
 *      function: getter(mutationRecords|{})-> Element[]
 *          a getter function returning an array of elements (the return value will be directly passed back to the promise)
 *          the function will be passed the `mutationRecords`
 * @param {Object} opts
 * @param {Number=0} opts.timeout - timeout in milliseconds, how long to wait before throwing an error (default is 0, meaning no timeout (infinite))
 * @param {Element=} opts.target - element to be observed
 *
 * @returns {Promise<Element>} the value passed will be a single element matching the selector, or whatever the function returned
 */
function elementReady(getter, opts = {}) {
    return new Promise((resolve, reject) => {
        opts = Object.assign({
            timeout: 0,
            target: document.documentElement
        }, opts);
        const returnMultipleElements = getter instanceof Array && getter.length === 1;
        let _timeout;
        const _getter = typeof getter === 'function' ?
            (mutationRecords) => {
                try {
                    return getter(mutationRecords);
                } catch (e) {
                    return false;
                }
            } :
            () => returnMultipleElements ? document.querySelectorAll(getter[0]) : document.querySelector(getter)
        ;
        const computeResolveValue = function (mutationRecords) {
            // see if it already exists
            const ret = _getter(mutationRecords || {});
            if (ret && (!returnMultipleElements || ret.length)) {
                resolve(ret);
                clearTimeout(_timeout);

                return true;
            }
        };

        if (computeResolveValue(_getter())) {
            return;
        }

        if (opts.timeout)
            _timeout = setTimeout(() => {
                const error = new Error(`elementReady(${getter}) timed out at ${opts.timeout}ms`);
                reject(error);
            }, opts.timeout);


        new MutationObserver((mutationRecords, observer) => {
            const completed = computeResolveValue(_getter(mutationRecords));
            if (completed) {
                observer.disconnect();
            }
        }).observe(opts.target, {
            childList: true,
            subtree: true
        });
    });
}


function getMenuItems() {
    const menuItems = document.querySelectorAll('#top_nav .hdtb-mitem a, a[jsname="ONH4Gc"]');
    let menuItemsObj = {};

    for (const menuItem of menuItems) {
        menuItemsObj[menuItem.innerText] = menuItem;
    }

    return menuItemsObj;
}

window.addEventListener("keydown", function handleNavigation (event) {
    if (window.document.activeElement !== window.document.body) {
        return;
    }

    const keyCode = event.code;
    if (keyCode.indexOf("Digit") === 0) {
        return;
    }

    event.stopPropagation();

    const keyname2category = {
        "KeyA": "All",
        "KeyI": "Images",
        "KeyM": "Maps",
        "KeyN": "News",
        "KeyS": "Shopping",
        "KeyV": "Videos",
        "KeyB": "Books",
        "KeyC": "Finance",
        "KeyF": "Flights",
        "KeyW": "Weather",
        "KeyY": "YouTube",
    };
    if (event.altKey && keyname2category[keyCode]) {
        const menuItemName = keyname2category[keyCode];
        const menuItem = getMenuItems()[menuItemName];
        if (menuItem) {
            menuItem.click();
        }
    }
}, true);

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
    const results = document.body.querySelectorAll("a > h3");
    const result = results[index];
    if (!result) {
        return;
    }

    event.stopPropagation();

    clickResult(result, event.ctrlKey);
}, true);

function clickResult(result, isNewTab) {
    const anchor = result.closest("a") || result.querySelector("a");
    const href = anchor.href;

    // navigate to the result
    if (isNewTab === true) {
        handle = window.open(href, "_blank"); // Open a new window using let handle = 
        handle.blur(); // Lose focus of the new window by using 
        window.focus(); // The return focus to your existing window using 
    } else {
        window.location.assign(href);
    }
}

const emojicationSuffix = "\u{FE0F}\u{20e3} ";

const observerConfig = { subtree: true, childList: true };

function emojifyResults() {
    const results = document.body.querySelectorAll("a > h3");
    const last = results.length - 1;

    results.forEach((result, index) => {
        if (index === last || index < 9) {
            if (result.textContent.indexOf(emojicationSuffix) > -1) {
                result.childNodes[0].remove() // remove it and we will put it again
            }

            const digit = (index === last && results.length > 1) ? 0 : index + 1;
            const emojiDigit = String(digit) + emojicationSuffix;

            result.insertAdjacentText("afterbegin", emojiDigit);
        }
    });

    // add listener for next time
    const container = document.querySelector("#res");
    if (!container) return;
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

// click on the item which is found in the searchparam key "click"
// this is useful for creating a shotrcut for google search like "https://www.google.com/search?q=%s&click=1"
function pressResultFromUrl() {
    const searchParams = new URLSearchParams(window.location.search);
    const nth_target_item = Number(searchParams.get("click"));
    if (!nth_target_item) return;

    const results = document.body.querySelectorAll("a > h3");
    const result = results[nth_target_item - 1];
    if (!result) return;

    clickResult(result, false);
}

if (window.document.readyState === "complete") {
    pressResultFromUrl();
    emojifyResults();
}

window.document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        pressResultFromUrl();
        emojifyResults();
    }
}

// same as above but loop from 1 to 10 instead of the 2
for (let i = 1; i < 9; i++) {
    elementReady(() => document.querySelectorAll("h3").length >= i).then((h3s) => {
        pressResultFromUrl();
        emojifyResults();
    });
}
