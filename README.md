# Gallery

**Egyszerű fotókatalogizáló app, ahol a képek galériákba sorolhatók, és a képekhez és galériákhoz különböző információkat tárolhatunk el, valamint a publikus képek böngészhetőek a látogatók számára.**

Ez a projekt egy beadandó feladat az ELTE Informatikai Karon, az Alkalmazások fejlesztése nevű tárgyból.
**Jelenleg fejlesztés alatt.**

## Konfigurálás

1. Függőségek telepítése: `npm i`
2. Adatbázis migrációk futtatása: `node ace migration:run`
3. _(opcionális)_ Példa adatok beszúrása az adatbázisba: `node ace db:seed --files initial`
4. _(opcionális)_ express-admin telepítése:
  1. Telepítés: `npm i express-admin`
  2. Konfigurálás / indítás: `npm run sqladmin`
    - Adatbázis típusa: `sqlite`
    - Adatbázisfájl: `database/db.sqlite`
5. **Indítás**: `npm start` vagy `npm run dev`

--------------------

## Funkcionális követelmények

### Bejelentkezett felhasználók

#### Galériák

* Galériák listázása
* Galéria létrehozása, módosítása, törlése
* Galériához tartozhat:
  - név
  - leírás
  - dátum (tól-ig)
  - kulcsszavak
* A galéria lehet publikus vagy privát
* Egy galéria dátumát a program automatikusan beállíthatja a képek alapján

#### Képek

* Egy adott galéria képeinek listázása a kép adataival, többek közt:
  - megtekintések száma
  - like-ok száma (ha publikus)
* Egy kép feltöltése a galériába, kép módosítása, törlése
* Képekhez automatikusan generálódik kiskép
* Képek csoportos feltöltése
  - egyenként
  - zip állományban
* Egy képhez tartozhat:
  - cím
  - leírás
  - dátum
  - kulcsszavak
  - személynevek (a képbeli pozícióval együtt tárolva)
    * a képen kattintva kijelölhető az adott személy
* Egy kép lehet publikus vagy privát
  - Publikus galériában néhány kép priváttá tehető
  - Privát galériában néhány kép publikussá tehető

#### Saját képek böngészése

* A vendég felülethez hasonló felületen böngészhetők és kereshetők a felhasználó saját képei
* Képek keresése személy alapján

### Vendég látogatók

* Regisztrálás, bejelentkezés
* Publikus galériák és képek böngészése
* Galériák és képek rendezése dátum szerint
* Képek rendezése like-ok száma szerint
* Keresés a galériák és képek közt név, leírás, dátum, helyszín, kulcsszavak alapján
* Leggyakoribb kulcsszavak és helyszínek listázása
* Képek like-olása

### Moderátorok

* A publikus képek ellenőrzése: ha egy kép nem felel meg a "szabályzatnak", akkor véglegesen priváttá állíthatja

### Adminisztrátor

* Moderátori feladatok ellátása
* Felhasználók listázása
* Felhasználóknak moderátori jog adása
* Felhasználóktól moderátori jog elvétele

## Nem funkcionális követelmények

* Felhasználóbarát, egyszerű, letisztult felület
* Keresési eredmények gyors megjelenítése
* Jelszavas azonosítás, jelszavak biztonságos tárolása

## Szakterületi fogalomjegyzék

* **galéria**: összefüggő képek csoportja
* **kulcsszó**: egy rövid (1-2 szavas) kifejezés, amely összefüggésbe hozható egy galériával vagy képpel
