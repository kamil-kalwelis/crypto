# proste-crypto

Projekt uproszczonej giełdy kryptowalutowej, wykonany w technologii JavaScript oraz HTML+CSS, z użyciem Firebase, jako narzędzia autentykacji z użyciem konta google oraz bazy danych.

Funkcje:
1. Aplikacja używa API CoinGecko, do pobierania aktualnych cen kryptowalut.
2. Nowy użytkownik otrzymuje saldo początkowe - 1 000 000 USDT.
3. Korzystając z salda, użytkownik może zakupić wybrane kryptowaluty.
5. Saldo oraz lista zakupionych tokenów, zapisywane są dla każdego użytkownika w bazie Firebase.
6. Aktualne saldo oraz lista z zakupionymi kryptowalutami jest odświeżana na stronie.
7. Cena wybranej kryptowaluty, jest aktualizowana co 30 sekund i jej wartość jest odświeżana na stronie.
8. Użytkownik może sprzedać, wcześniej zakupione tokeny, po aktualnej cenie pobranej przez api.


UWAGA!
API CoinGecko jest w wersji demonstracyjnej i zawiera ograniczenia zapytań w czasie.
Po przekroczeniu limitu, program przestaje działać prawidłowo i należy odczekać 1 minutę,
co automatycznie przywróci poprawne działanie skryptu.

W plikach projektu znajduje się dwuminutowy film ilustrujący działanie programu.
