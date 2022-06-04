const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;

//connetion to IndexedDB named 'budgetTracker'
const request = indexedDB.open('budgetTracker', 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;

    db.createObjectStore('new_transaction', {autoIncrement:true})
};

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveTransaction () {
    const transaction = db.transaction(['new_transcation'], 'readWrite');

    const budgetObjectStore = transaction.objectStore('new_transaction');

    budgetObjectStore.add();

}

function uploadTransaction() {
    const transaction = db.transaction(['new_transcation'], 'readWrite');

    const budgetObjectStore = transaction.objectStore('new_transaction');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function () {
        if(getAll.result.length > 0) {
            fetch('api/transcation', {
                method:'POST',
                body:JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_transaction'], 'readWrite');

                const budgetObjectStore = transaction.objectStore('new_transaction');

                budgetObjectStore.clear();

                alert('All saved transaction have been submitted!');
            })
            .catch(error => {
                console.log(error);
            });
        }
    }
}

window.addEventListener('online', uploadTransaction);