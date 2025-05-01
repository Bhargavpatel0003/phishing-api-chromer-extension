// background.js



let notification = false

const API_HOST = "https://developers.checkphish.ai/api"
const API_KEY = "j9s8twdcqsexk432ppa8zvdlq7p81jvh6ucqvc7ojhuo2qy19xkokr7clesqn3px";
const API_HEADERS = {
    "Content-Type": "application/json"
}

let job_response = {
    job_id: "",
    timestamp: ""
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'checkUrl') {
        setTimeout(() => {
            notification = false
            checkUrl(request.url, "full", sendResponse);
        }, 10);
        return true; // Will respond asynchronously.
    } else {
        sendResponse({ error: "Invalid Call" })
        return true;
    }
});


const createJob = async (url, scanType) => {
    try {

        const API_ENDPOINT = "/neo/scan"
        const body = JSON.stringify({
            apiKey: API_KEY,
            urlInfo: {
                url,
                scanType
            }
        })
        const response = await fetch(API_HOST + API_ENDPOINT, {
            method: 'POST',
            headers: API_HEADERS,
            body: body
        })

        const data = await response.json()

        return data


    } catch (error) {
        console.log(error)
    }
}
const checkJobStatus = async (jobID) => {
    try {
        const API_ENDPOINT = "/neo/scan/status"
        const body = JSON.stringify({
            apiKey: API_KEY,
            jobID: jobID,
            insights: true
        })
        const response = await fetch(API_HOST + API_ENDPOINT, {
            method: 'POST',
            headers: API_HEADERS,
            body: body
        })

        const data = await response.json()

        return data

    } catch (error) {
        console.log(error)
    }
}

async function checkUrl(url, scanType, sendResponse) {
    try {
        chrome.storage.local.get([url], async function (result) {
            if (result[url]) {
                console.log("🧠 Cache hit for:", url);
                sendResponse({ response: result[url], url });
            } else {
                const createJobData = await createJob(url, scanType)

                if (createJobData.jobID !== undefined) {
                    job_response.job_id = createJobData.jobID
                    job_response.timestamp = createJobData.timestamp
                }

                // check the status of the job

                let jobExecutioTime = 60 * 1000

                if (job_response.job_id !== "") {


                    setTimeout(async () => {
                        const jobStatusData = await checkJobStatus(job_response.job_id)
                        if (jobStatusData.status === "DONE") {
                            // Cache the result using the URL as the key
                            chrome.storage.local.set({ [url]: jobStatusData }, () => {
                                console.log("✅ Cached result for:", url);
                            });

                            sendResponse({ response: jobStatusData, url })
                        }
                    }, jobExecutioTime);

                }

            }
        })
        // create the job



    } catch (error) {
        console.error(error)
    }

}

