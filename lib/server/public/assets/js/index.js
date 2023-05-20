
let numCurrentItems = 0
const dataFileName = 'scanned/scanned_data.json';

const formatCreatedAt = (date) => {
    // show the date as time ago, if the date is less than 24 hours ago
    // if it is more than 24 hours ago, show the date as a date
    const timeNow = Date.now();
    const dateTime = new Date(date).getTime();

    const timeDiff = timeNow - dateTime;
    const _24Hours = 1000 * 60 * 60 * 24;

    if (timeDiff < _24Hours) {
        // show time ago, get the hours, mins, seconds elapsed
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const mins = Math.floor(timeDiff / (1000 * 60));
        const seconds = Math.floor(timeDiff / 1000);

        let timeAgo = "";

        if (hours > 0) {
            timeAgo += `${hours} ${hours > 1 ? 'hours' : 'hour'} ago`;
        } else if (mins > 0) {
            timeAgo += `${mins} ${mins > 1 ? 'minutes' : 'minute'} ago`;
        } else {
            timeAgo += `${seconds} ${seconds > 1 ? 'seconds' : 'second'} ago`
        }



        return timeAgo;
    } else {
        return new Date(scannedItem.addedAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true
        })
    }
}


const foundItemCard = ({ barcode, info, createdAt }) => `
<div class="card text-shadow">
    <header class="card-header ${info.toLowerCase() == 'product not found' ? "not-found" : ""}">
        <h2 class="card-title">${info}</h2>
    </header>

    <div class="card-body">
        <p class="card-description">Barcode: ${barcode}</p>
        <p class="card-created-at">Scanned: ${createdAt}</p>
    </div>
</div>
`

const fetchScanned = () => fetch(`http://localhost:8000/${dataFileName}`, {
    method: 'GET',
    mode: 'cors'
})
    .then(data => data.json())
    .catch(e => {
        // try to get the data from localStorage
        const data = localStorage.getItem('scannedData');
        return JSON.parse(data || '{}');
    });

const renderItems = (items) => {
    const listContainerEl = document?.getElementById('listContainer') || null

    if (listContainerEl) {
        listContainerEl.innerHTML = "";
        for (const scannedItem of items) {
            listContainerEl.innerHTML += foundItemCard({
                barcode: scannedItem.productData.barcode[0] || "Not Found",
                info: scannedItem.alias || scannedItem.productData.name || "Product not Found",
                createdAt: formatCreatedAt(scannedItem.addedAt)
            })
        }

        document?.body?.main?.append(listContainerEl);
    }

}


const checkForUpdates = async () => {
    const { recentlyScanned } = await fetchScanned();

    numCurrentItems = recentlyScanned?.length || 0
    recentlyScanned && localStorage.setItem('scannedData', JSON.stringify({ recentlyScanned }));
    recentlyScanned && renderItems(recentlyScanned)
}


// wait for the document to load before doing anything
window.addEventListener('DOMContentLoaded', async () => {
    checkForUpdates();
    setInterval(checkForUpdates, 1500)
})