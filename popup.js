// Define the function to handle button clicks
// function scanCurrentTab() {
//     // Fetch the active tab's URL
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         const activeTab = tabs[0];
//         const url = activeTab.url;

//         // Show the result to the user
//         document.getElementById("scan_result").style.display = "block"
//         document.getElementById("result").style.display = "none"
//         document.getElementById("scan_result").textContent = `Scanning URL: ${url}`;

//         // You can also send a message to the background script for further processing
//         chrome.runtime.sendMessage({ type: "checkUrl", url: url }, (response) => {
//             if (chrome.runtime.lastError) {
//                 console.error(chrome.runtime.lastError.message);
//                 return;
//             }
//             document.getElementById("scan_result").style.display = "none"
//             document.getElementById("result").style.display = "block"


//             if (response.phishing) {
//                 document.getElementById("result").textContent = "WARNING !!!!";

//                 document.getElementById("result").classList.remove("blue")
//                 document.getElementById("result").classList.add("red")

//             } else {
//                 document.getElementById("result").textContent = "URL is safe";

//                 document.getElementById("result").classList.remove("red")
//                 document.getElementById("result").classList.add("blue")
//             }
//         });
//     });
// }


const resultMap = {
    "phish": ["Phishing", "./icons/phish.jpeg"],
    "scam": ["Scam", "./icons/scam.png"],
    "adult": ["Adult", "./icons/adults.png"],
    "drug_scam": ["Drug Scam", "./icons/drug.jpg"],
    "gambling": ["Gambling", "./icons/gambling.png"],
    "suspicious": ["Scam", "./icons/suspect.png"],
    "likely_phish": ["Scam", "./icons/likelyphish.png"],
    "cryptojacking": ["Crypto Jacking", "./icons/cryptojacking.jpg"],
    "streaming": ["Streaming", "./icons/livestream.png"],
    "hacked_website": ["Hacked Website", "./icons/hacked.png"],
    "mortgage": ["Mortgage", "./icons/mortage.png"],
    "clean": ["Clean", "./icons/clean.png"],
}

function scanThisWebsite() {
    const mainHeader = document.getElementsByClassName("main-header")[0]
    const scanBtn = document.getElementsByClassName("scan-me-btn")[0]
    const scanBtnContainer = document.getElementsByClassName("btn-container")[0]
    const resultContainer = document.getElementsByClassName("result-container")[0]

    //PHISHING TITLE
    const phishingTitle = document.getElementById("p-title")
    const phishingImg = document.getElementById("p-logo")

    // Insignts btn
    const iURL = document.getElementById("i-url")

    // Screenshot btn
    const ssURL = document.getElementById("ss-url")

    // cat-btn
    const catBtn = document.getElementById("cat-btn")

    const catContainer = document.getElementById("cat-container");

    // add loading spinner
    scanBtn.classList.add("loading")

    // Fetch the API
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        const url = activeTab.url;

        // You can also send a message to the background script for further processing
        chrome.runtime.sendMessage({ type: "checkUrl", url: url }, (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                return;
            }
            if (response.response.status === "DONE") {
                // SHOW THE NEXT PAGE
                mainHeader.classList.add("d-none")
                scanBtnContainer.classList.add("d-none")
                scanBtn.classList.remove("loading")
                resultContainer.classList.remove("d-none")

                // Set the title
                phishingTitle.innerText = resultMap[response.response.disposition][0]
                phishingImg.src = resultMap[response.response.disposition][1]

                iURL.innerText = response.response.insights
                ssURL.innerText = response.response.screenshot_path
                if (response.response.categories.length > 0) {

                    catBtn.innerText = response.response.categories[0]
                }
                else {
                    if (catContainer !== null) {
                        catContainer.style.display = "none"
                    }
                }

                downloadLogFile(response.url, response.response)
            }

        });
    });


    // Remove the loading spinner
    // show  the next page


}
function goBack() {
    const mainHeader = document.getElementsByClassName("main-header")[0]
    const scanBtn = document.getElementsByClassName("scan-me-btn")[0]
    const scanBtnContainer = document.getElementsByClassName("btn-container")[0]
    const resultContainer = document.getElementsByClassName("result-container")[0]
    // Insignts btn
    const iURL = document.getElementById("i-url")

    // Screenshot btn
    const ssURL = document.getElementById("ss-url")

    iURL.innerText = ""
    ssURL.innerText = ""


    mainHeader.classList.remove("d-none")
    scanBtnContainer.classList.remove("d-none")
    resultContainer.classList.add("d-none")


}

async function downloadLogFile(url, scanResult) {
    const timestamp = Date.now();  // Current timestamp in milliseconds
    const logData = {
        url_scan: url,
        timestamp: timestamp,
        scan_result: scanResult
    };
    let scanResultText = ""
    Object.entries(logData.scan_result).map((arr) => {
        scanResultText += (arr[0] + " - " + arr[1] + "\n\n")
    })
    const logText = `url_scan - ${logData.url_scan}\n\ntimestamp - ${logData.timestamp}\n\n${scanResultText}`;


    const blob = new Blob([logText], { type: "text/plain" });
    // const fileUrl =  ;
    const date = new Date();
    const dateFolder = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

    const logFilename = `phishing_scan_logs/${dateFolder}/logs_${timestamp}.txt`;

    // // Create a temporary link
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = filename;
    // a.style.display = 'none';
    // document.body.appendChild(a);

    // // Trigger the download
    // a.click();

    // // Clean up
    // URL.revokeObjectURL(url);
    // document.body.removeChild(a);

    // Trigger the download
    chrome.downloads.download({
        url: URL.createObjectURL(blob),
        filename: logFilename, // Example filename: logs_1625654659.txt
        saveAs: false, // Automatically save without prompting
        conflictAction: "overwrite" // Overwrite the file if it exists
    });

    console.log(`📥 Log file saved as: ${logFilename}`);
}


// Attach the click event to the button
document.getElementById("scan-me-btn").addEventListener("click", scanThisWebsite);
document.getElementById("back-btn").addEventListener("click", goBack);



document.getElementById("insights-btn").addEventListener("click", () => {
    // OPEN URL IN NEW WINDOW
    const iURL = document.getElementById("i-url")
    window.open(iURL.innerText, "_blank")

});
document.getElementById("ss-btn").addEventListener("click", () => {
    // OPEN URL IN NEW WINDOW
    const ssURL = document.getElementById("ss-url")
    window.open(ssURL.innerText, "_blank")

});
