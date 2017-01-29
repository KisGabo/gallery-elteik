# Gallery

**A projekt inaktív.**

**Egyszerű fotókatalogizáló app, ahol a képek galériákba sorolhatók, és a képekhez és galériákhoz különböző információkat tárolhatunk el, valamint a publikus képek böngészhetőek a látogatók számára.**

Ez egy gyakorló projekt, beadandó feladat az ELTE Informatikai Karon, az Alkalmazások fejlesztése nevű tárgyból.

* **App kipróbálása:** [Heroku](https://gallery-elteik.herokuapp.com/)
   - Admin email / pass: `admin@admin.com` / `pwd`
* **Dokumentáció:** [lásd projekt wiki](https://github.com/KisGabo/gallery-elteik/wiki)

## Beadandók

* **Első beadandó**: [bead-1.0](https://github.com/KisGabo/gallery-elteik/tree/bead-1.0)
* **Második beadandó határidőre**: [bead-2.0](https://github.com/KisGabo/gallery-elteik/tree/bead-2.0)
* **Második beadandó kész:** [bead-2.3](https://github.com/KisGabo/gallery-elteik/tree/bead-2.3)
  ([pótlások](https://github.com/KisGabo/gallery-elteik/wiki/P%C3%B3tl%C3%A1sok))
* **Harmadik beadandó**: [bead-3.0](https://github.com/KisGabo/gallery-elteik/tree/bead-3.0)

## Konfigurálás
(bővebben [lásd a doksit](https://github.com/KisGabo/gallery-elteik/wiki/Implement%C3%A1ci%C3%B3#fejleszt%C5%91k%C3%B6rnyezet-fel%C3%A1ll%C3%ADt%C3%A1sa))

1. Függőségek telepítése: `npm i`
2. Kívánt adatbázismotor telepítése, ha még nincs, pl: `npm i sqlite3`
3. `.env.example` átnevezése `.env`-re, és tartalmának ellenőrzése
4. Konfigurálás: `config/gallery.js` ellenőrzése (főleg az admin felhasználó adatait)
5. Adatbázis felépítése példaadatokkal: `npm run fresh-db-force`
6. Példa képek letöltése: `node ace storage:download`
7. **Indítás**: `npm start` vagy `npm run dev`

## Tervek a ~~közel~~távoli jövőben

- egy másik ImagePersistence service, ami AWS Simple Storage Service-szel dolgozik a lokál fájlrendszer helyett (mert utóbbi Herokun periodikusan resetálódik)  
  ezzel együtt a használandó service eldöntése környezeti változóból
- todok a kódban
- templated hibaoldalak
- lapozás
- aktív menüelem jelzése
- middleware-rel ellenőrizzük hogy a cucc a currentuserhez tartozik-e
- controllerek rövidítése, ismétlődő kódrészletek főleg
- amit lehet, vegyünk ki a controllerből
  (validáció, képek mentése menjen modellbe?)
- galéria updated_at frissítése képfeltöltéskor
- legnépszerűbb kulcsszavak oldala
- galériáknál kijelezni, hány kép van bennük (rendezés aszerint)
- template változók nincsenek összevissza?
- named route-ok használata mindenhol
- settings oldalon a jelszónál valamilyen required-if féleség
- image-size modul bug, orientációt nem veszi figyelembe
- Lucid: .fetch() kigyomlálása, ahol nem szükséges
- még kommentelés

--------------------

## Funkcionális követelmények (régi)

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
  - dátum - exif adatból automatikusan beállítódik
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
* Keresés a galériák és képek közt név, leírás, dátum, kulcsszavak alapján
* Leggyakoribb kulcsszavak listázása
* Felhasználó kedvelt képeinek listázása

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
