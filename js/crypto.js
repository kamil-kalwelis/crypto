// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBZf9w8yU5NWKYNoMFOCGNurDMXmJRjbak",
    authDomain: "proste-krypto.firebaseapp.com",
    projectId: "proste-krypto",
    storageBucket: "proste-krypto.appspot.com",
    messagingSenderId: "426573901397",
    appId: "1:426573901397:web:a0555cb3cafae4b920aedc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Funkcja przypisująca nowemu użytkownikowi milion USDT
function assignInitialBalance(uid) {
    const db = getDatabase();
    const balanceRef = ref(db, `users/${uid}/balance`);
    set(balanceRef, 1000000)
        .then(() => {
            console.log('Przypisano nowemu użytkownikowi milion USDT.');
            // Po udanym przypisaniu salda, odśwież wyświetlane saldo na stronie
            onAuthStateChangedCallback(getAuth().currentUser);
        })
        .catch((error) => {
            console.error('Błąd podczas przypisywania salda:', error);
        });
}


// Funkcja do logowania przez Google
function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    signInWithPopup(auth, provider)
        .catch((error) => {
            // Wystąpił błąd podczas logowania
            console.error('Błąd logowania:', error);
        });
}

// Funkcja do wylogowywania
function signOutUser() {
    const auth = getAuth();
    signOut(auth).then(() => {
        // Wyczyszczenie informacji o użytkowniku
        document.getElementById('userEmail').textContent = '';
        document.getElementById('balance').textContent = '';
        document.getElementById('cryptoList').innerHTML = 'brak';
    }).catch((error) => {
        // Wystąpił błąd podczas wylogowywania
        console.error('Błąd wylogowywania:', error);
    });
}

// Funkcja wywoływana po zmianie stanu uwierzytelnienia
function onAuthStateChangedCallback(user) {
    if (user) {
        // Użytkownik jest zalogowany
        console.log('Zalogowano użytkownika:', user.displayName);
        document.getElementById('userEmail').textContent = user.email; // Wyświetlenie adresu email użytkownika
        document.getElementById('googleLoginButton').style.display = 'none'; // Ukrycie przycisku logowania
        document.getElementById('logoutButton').style.display = 'block'; // Pokazanie przycisku do wylogowania
        document.getElementById('mycrypto').style.display = 'block';
        document.getElementById('buy').style.display = 'block';

        // Pobierz saldo użytkownika i wyświetl je
        const db = getDatabase();
        const balanceRef = ref(db, `users/${user.uid}/balance`);
        get(balanceRef).then((snapshot) => {
            if (!snapshot.exists()) {
                assignInitialBalance(user.uid);
            } else {
                const balance = snapshot.val();
                document.getElementById('balance').textContent = `Saldo: ${balance.toFixed(2)} USDT`;
            }
        }).catch((error) => {
            console.error('Błąd podczas pobierania salda:', error);
        });

        // Pobierz zakupione kryptowaluty użytkownika
        const cryptoListRef = ref(db, `users/${user.uid}/cryptoList`);
        get(cryptoListRef).then((snapshot) => {
            if (snapshot.exists()) {
                const cryptoList = snapshot.val();
                displayCryptoList(cryptoList);
            }
        }).catch((error) => {
            console.error('Błąd podczas pobierania listy zakupionych kryptowalut:', error);
        });

    } else {
        // Użytkownik jest wylogowany
        console.log('Użytkownik jest wylogowany');
        document.getElementById('userEmail').textContent = ''; // Usunięcie adresu email użytkownika
        document.getElementById('googleLoginButton').style.display = 'block'; // Pokazanie przycisku logowania
        document.getElementById('logoutButton').style.display = 'none'; // Ukrycie przycisku do wylogowania
        document.getElementById('mycrypto').style.display = 'none';
        document.getElementById('buy').style.display = 'none';
    }
}

// Wywołanie funkcji refreshPrice() przy ładowaniu strony
window.onload = function() {
    // Rejestracja funkcji wywoływanej po zmianie stanu uwierzytelnienia
    const auth = getAuth();
    onAuthStateChanged(auth, onAuthStateChangedCallback);
    getCryptoPrice();
    // Wywołanie funkcji do pobrania ceny kryptowaluty i odświeżenia salda
    refreshPrice();

    // Dodaj obsługę przycisku logowania przez Google
    document.getElementById('googleLoginButton').addEventListener('click', signInWithGoogle);

    // Dodaj obsługę przycisku do wylogowania
    document.getElementById('logoutButton').addEventListener('click', signOutUser);

    // Dodaj obsługę przycisku zakupu
    document.getElementById('buyButton').addEventListener('click', buyCrypto);
}

// Funkcja do pobierania ceny wybranej kryptowaluty z API CoinGecko
function getCryptoPrice() {
    // Pobranie wybranej kryptowaluty z listy rozwijanej
    const selectedCrypto = document.getElementById('cryptoSelect').value;
    // Dodanie aktualnego czasu do adresu URL zapytania
    const timestamp = new Date().getTime();
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${selectedCrypto}&vs_currencies=usd&_=${timestamp}`)
        .then(response => response.json())
        .then(data => {
            // Pobranie ceny wybranej kryptowaluty z danych JSON
            const cryptoPrice = data[selectedCrypto.toLowerCase()].usd;
            // Wyświetlenie ceny na stronie
            document.getElementById('cryptoPrice').textContent = cryptoPrice + " USDT";
        })
        .catch(error => {
            console.error('Błąd podczas pobierania ceny kryptowaluty:', error);
        });
}

// Funkcja do wywoływania getCryptoPrice() przy zmianie wyboru z listy rozwijanej
function refreshPriceOnChange() {
    document.getElementById('cryptoSelect').addEventListener('change', getCryptoPrice);
}

// Funkcja do wywoływania getCryptoPrice() co minutę
function refreshPriceOnTime() {
    setInterval(getCryptoPrice, 30000); // Wywołanie funkcji co 30 sekund
}

function refreshPrice() {
    refreshPriceOnChange();
    refreshPriceOnTime();
}

// Funkcja do zakupu kryptowaluty
function buyCrypto() {
    const selectedCrypto = document.getElementById('cryptoSelect').value;
    const cryptoPrice = parseFloat(document.getElementById('cryptoPrice').textContent);
    const balance = parseFloat(document.getElementById('balance').textContent.replace('Saldo: ', '').replace(' USDT', ''));
    const amountToBuy = parseFloat(document.getElementById('buyAmount').value);

    if (isNaN(amountToBuy) || amountToBuy <= 0) {
        alert('Podaj prawidłową kwotę do zakupu.');
        return;
    }

    const totalCost = cryptoPrice * amountToBuy;

    if (totalCost > balance) {
        alert('Nie masz wystarczających środków.');
        return;
    }

    // Oblicz nowe saldo po zakupie
    const newBalance = balance - totalCost;

    // Aktualizuj saldo na stronie
    document.getElementById('balance').textContent = `Saldo: ${newBalance.toFixed(2)} USDT`;

    // Zapisz nowe saldo w bazie danych Firebase
    const auth = getAuth();
    if (auth.currentUser) {
        const db = getDatabase();
        const balanceRef = ref(db, `users/${auth.currentUser.uid}/balance`);
        set(balanceRef, newBalance)
            .then(() => {
                console.log('Saldo zostało zaktualizowane w bazie danych.');
            })
            .catch((error) => {
                console.error('Błąd podczas aktualizacji salda w bazie danych:', error);
            });

        // Aktualizacja listy zakupionych kryptowalut
        const cryptoListRef = ref(db, `users/${auth.currentUser.uid}/cryptoList/${selectedCrypto}`);
        get(cryptoListRef).then((snapshot) => {
            let cryptoAmount = amountToBuy;
            if (snapshot.exists()) {
                cryptoAmount += snapshot.val();
            }
            set(cryptoListRef, cryptoAmount)
                .then(() => {
                    console.log('Lista zakupionych kryptowalut została zaktualizowana w bazie danych.');
                    // Odświeżenie listy na stronie po zaktualizowaniu
                    getUpdatedCryptoList(auth.currentUser.uid);
                })
                .catch((error) => {
                    console.error('Błąd podczas aktualizacji listy zakupionych kryptowalut w bazie danych:', error);
                });
        }).catch((error) => {
            console.error('Błąd podczas pobierania listy zakupionych kryptowalut:', error);
        });
    } else {
        console.error('Użytkownik niezalogowany.');
    }
}

// Funkcja do pobierania i wyświetlania zaktualizowanej listy zakupionych kryptowalut
function getUpdatedCryptoList(uid) {
    const db = getDatabase();
    const cryptoListRef = ref(db, `users/${uid}/cryptoList`);
    get(cryptoListRef).then((snapshot) => {
        if (snapshot.exists()) {
            const cryptoList = snapshot.val();
            displayCryptoList(cryptoList);
        }
    }).catch((error) => {
        console.error('Błąd podczas pobierania listy zakupionych kryptowalut:', error);
    });
}

// Funkcja do sprzedaży kryptowaluty
function sellCrypto(selectedCrypto, cryptoAmount) {
    const auth = getAuth();
    if (auth.currentUser) {
        // Pobierz aktualną cenę kryptowaluty, którą użytkownik sprzedaje
        const timestamp = new Date().getTime();
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${selectedCrypto}&vs_currencies=usd&_=${timestamp}`)
            .then(response => response.json())
            .then(data => {
                const cryptoPrice = data[selectedCrypto.toLowerCase()].usd;
                const saleAmount = cryptoAmount * cryptoPrice;

                const db = getDatabase();
                const balanceRef = ref(db, `users/${auth.currentUser.uid}/balance`);
                get(balanceRef).then((snapshot) => {
                    const balance = snapshot.val();
                    const newBalance = balance + saleAmount;

                    // Aktualizuj saldo na stronie
                    document.getElementById('balance').textContent = `Saldo: ${newBalance.toFixed(2)} USDT`;

                    // Zapisz nowe saldo w bazie danych Firebase
                    set(balanceRef, newBalance)
                        .then(() => {
                            console.log('Saldo zostało zaktualizowane w bazie danych.');
                            // Usuń sprzedaną kryptowalutę z listy zakupionych kryptowalut
                            const cryptoListRef = ref(db, `users/${auth.currentUser.uid}/cryptoList/${selectedCrypto}`);
                            set(cryptoListRef, null)
                                .then(() => {
                                    console.log('Kryptowaluta została sprzedana i usunięta z listy.');
                                    // Odświeżenie listy na stronie po sprzedaży
                                    getUpdatedCryptoList(auth.currentUser.uid);
                                })
                                .catch((error) => {
                                    console.error('Błąd podczas usuwania kryptowaluty z listy:', error);
                                });
                        })
                        .catch((error) => {
                            console.error('Błąd podczas aktualizacji salda w bazie danych:', error);
                        });
                }).catch((error) => {
                    console.error('Błąd podczas pobierania salda:', error);
                });
            })
            .catch(error => {
                console.error('Błąd podczas pobierania ceny kryptowaluty:', error);
            });
    } else {
        console.error('Użytkownik niezalogowany.');
    }
}

// Funkcja do wyświetlania listy zakupionych kryptowalut
function displayCryptoList(cryptoList) {
    const listContainer = document.getElementById('cryptoList');
    listContainer.innerHTML = ''; // Wyczyść poprzednią listę przed aktualizacją

    if (cryptoList) {
        const list = document.createElement('ul');
        for (const crypto in cryptoList) {
            const listItem = document.createElement('li');
            listItem.textContent = `${cryptoList[crypto]} ${crypto}  `;
            const sellButton = document.createElement('button');
            sellButton.textContent = 'Sprzedaj';
            sellButton.addEventListener('click', () => {
                const cryptoAmount = cryptoList[crypto];
                const cryptoPrice = parseFloat(document.getElementById('cryptoPrice').textContent);
                sellCrypto(crypto, cryptoAmount, cryptoPrice);
                delete cryptoList[crypto]; // Remove the sold crypto from the list
                displayCryptoList(cryptoList); // Update the displayed list
            });
            listItem.appendChild(sellButton);
            list.appendChild(listItem);
        }
        listContainer.appendChild(list);
    }
}