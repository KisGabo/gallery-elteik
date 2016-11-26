# Gallery

## Állapotok

* **nov. 24. 19:36**: 
[7f3e0ab](https://github.com/KisGabo/gallery-elteik/tree/7f3e0ab33dac40d0babe9e359e5db7e6dd323ec3)  
Na, ez már valami
* **nov. 23. 15:07**:
[bb7aedd](https://github.com/KisGabo/gallery-elteik/tree/bb7aeddc80eda155f0d7ab0c4ce3a12319aa0d52)  
Második beadandó viszonylag vállalható és elvileg működő változata
* **nov. 20. 23:59**:
[8f4c048](https://github.com/KisGabo/gallery-elteik/tree/8f4c048bf0601f58164b33dbe90b26e6d2f119aa)  
Második beadandó lejártakor félkész, de elvileg működő állapot. Key-feature-ök hiányoznak.

**Végre megy Herokun is!** A 'deploy' branch van Herokura kötve.  
**Admin email / pass**: admin@admin.com / pwd  
https://gallery-elteik.herokuapp.com/

**Egyszerű fotókatalogizáló app, ahol a képek galériákba sorolhatók, és a képekhez és galériákhoz különböző információkat tárolhatunk el, valamint a publikus képek böngészhetőek a látogatók számára.**

Ez egy gyakorló projekt, beadandó feladat az ELTE Informatikai Karon, az Alkalmazások fejlesztése nevű tárgyból.
**Jelenleg fejlesztés alatt.**

## Konfigurálás

1. Függőségek telepítése: `npm i`  
2. Kívánt adatbázismotor telepítése, ha még nincs, pl: `npm i sqlite3`
3. `.env.example` átnevezése `.env`-re, és tartalmának ellenőrzése
4. Konfigurálás: `config/gallery.js` ellenőrzése (főleg az admin felhasználó adatait)
5. Adatbázis felépítése példaadatokkal: `npm run fresh-db-force`  
   _Ez a parancs futtatható bármikor, ha tiszta adatbázist akarunk, ekkor figyeljünk a storage könyvtárra_
6. Példa képek letöltése: `node ace storage:download`
7. **Indítás**: `npm start` vagy `npm run dev`

* _(opcionális)_ express-admin telepítése:
  1. Telepítés: `npm i express-admin`
  2. Konfigurálás / indítás: `npm run sqladmin`
    - Adatbázis típusa: `sqlite`
    - Adatbázisfájl: `database/db.sqlite`

## Tervek a közeljövőben

- **doksi, kód kommentelése**
- valahogy megoldani, hogy a master brancen ne legyenek environment-dependent dolgok, pl PROCILFE meg .profile
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
