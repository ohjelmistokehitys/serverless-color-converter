# Serverless Color Converter

Tässä tehtävässä opit hyödyntämään [Hono-sovelluskehystä](http://hono.dev/) ja toteuttamaan funktioita, jotka käsittelevät HTTP-pyyntöjä ja -vastauksia, mutta jotka eivät ole riippuvaisia tietystä palvelinympäristöstä.

> *"Hono - means flame🔥 in Japanese - is a small, simple, and ultrafast web framework built on Web Standards. It works on any JavaScript runtime: Cloudflare Workers, Fastly Compute, Deno, Bun, Vercel, AWS Lambda, Lambda@Edge, and Node.js."*
>
> https://www.npmjs.com/package/hono

Honolla on kirjoitushetkellä kymmeniä miljoonia viikoittaisia latauksia [npm-pakettirekisterissä](https://www.npmjs.com/package/hono). Hono on suunniteltu toimimaan useissa eri ympäristöissä, joten tämän harjoituksen menetelmät ja työkalut ovat sovellettavissa laajemmin kuin vain yhden palveluntarjoajan ekosysteemiin.

Palvelinprosessin sijasta serverless-sovellukset toimivat tapahtumapohjaisesti, jolloin koodi suoritetaan vain, kun tietty tapahtuma, kuten HTTP-pyyntö, laukaisee sen. Vaikka tässä kehitysympäristössä käynnistämme sovelluksen kuuntelemaan HTTP-pyyntöjä tietyssä portissa, tuotantoympäristössä sovelluksesi voidaan ajaa ilman omaa pitkään käynnissä olevaa palvelinprosessia. Hiljaisena aikana se ei siis kuluta ylimääräisiä resursseja ja ruuhka-aikoina sovellusta voidaan suorittaa tehokkaasti rinnakkain.

Tämän tehtävän suorittamiseksi sinun tulee perehtyä [Honon dokumentaatioon](https://hono.dev/docs/). Tässä readme-tiedostossa olevat ohjeet täydentävät virallista dokumentaatiota ja tarkentavat serverless-funktioidesi vaatimuksia, mutta joudut etsimään itse tietoa Honon käytöstä, JavaScriptin numero-operaatioista ja muista tarvittavista asioista.


## Kehitysympäristö

Tämä tehtävä on suunniteltu ratkaistavaksi [kehityskontissa](https://code.visualstudio.com/docs/devcontainers/containers) tai [CodeSpacessa](https://github.com/features/codespaces). Repositorio sisältää valmiin [`devcontainer.json`-tiedoston](./.devcontainer/devcontainer.json), jossa on määritetty kehitysympäristön asetukset. Kehityskontti eristää projektin muusta käyttöjärjestelmästä, joten sillä voi olla myös positiivisia tietoturvavaikutuksia.

Halutessasi voit ratkaista tehtävän myös paikallisessa kehitysympäristössä, kunhan sinulla on tuore Node.js-versio sekä npm-paketinhallinta asennettuna.


## Toiminnalliset vaatimukset

Tässä tehtävässä tarkoituksenasi on toteuttaa HTTP-pyyntöihin vastaavia funktioita, jotka muuntavat värejä [HEX- ja RGB-muotojen](https://en.wikipedia.org/wiki/Web_colors) välillä.

HEX ja RGB ovat yleisimpiä tapoja esittää värejä web-kehityksessä. Molemmissa muodoissa väri määritellään punaisen, vihreän ja sinisen (**R**ed, **G**reen, **B**lue) komponenttien avulla. HEX-muodossa väri esitetään kuusinumeroisena [heksadesimaalilukuna](https://fi.wikipedia.org/wiki/Heksadesimaalij%C3%A4rjestelm%C3%A4), kun taas RGB-muodossa väri esitetään kolmella desimaaliluvulla. Molemmat kuvaavat samaa väriä ja niiden välillä voidaan tehdä suoraviivaisia muunnoksia.

Esimerkiksi RGB-arvo `255, 0, 0` vastaa HEX-arvoa `#FF0000`, joka vastaa punaista väriä. `0, 255, 0` eli vihreä voidaan esittää muodossa `#00FF00`, kun taas valkoinen on `255, 255, 255` (`#FFFFFF`) ja musta on `0, 0, 0` (`#000000`):

Väri     | RGB       | HEX
---------|-----------|----
Punainen | 255, 0, 0 | #FF0000
Vihreä   | 0, 255, 0 | #00FF00
Sininen  | 0, 0, 255 | #0000FF

Esimerkiksi MDN:n ["Color format converter" -työkalu](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Color_format_converter) tukee samankaltaisia ominaisuuksia kuin tässä tehtävässä toteutettavat funktiot, joten voit käyttää sitä apuna idean ymmärtämisessä. Tässä tehtävässä ei tarvitse ottaa kantaa mahdolliseen värien läpinäkyvyyteen (opacity / alpha channel).


### Projektipohja

Tähän repositorioon on luotu valmis projektipohja, joka noudattaa [Honon Getting Started -ohjeita](https://hono.dev/docs/getting-started/basic). Projekti on luotu seuraavalla komennolla:

```bash
# luontikomento (ei tarvitse suorittaa uudestaan)
npm create hono@latest . -- --template cloudflare-workers --pm npm --install
```

Sinun ei tarvitse suorittaa tätä luontikomentoa uudestaan, mutta voit halutessasi tutustua sen toimintaan ja luoda vastaavia uusia projekteja omiin tarkoituksiisi. Löydät tarkempaa tietoa projektin luonnissa käytetyistä työkaluista näistä npm-paketeista: [hono](https://www.npmjs.com/package/hono) ja [create-hono](https://www.npmjs.com/package/create-hono).

Honon alustariippumattomuudesta huolimatta tarvitsemme projektille jonkin kohdeympäristön, joka tässä tapauksessa on [Cloudflare Workers](https://workers.cloudflare.com/). Cloudflare Workers on serverless-alusta, joka mahdollistaa JavaScriptin suorittamisen "reunalla" (edge), eli lähellä käyttäjää, mikä parantaa suorituskykyä ja vähentää latenssia. Sinun ei tarvitse rekisteröityä Cloudflareen, koska sovellusta kokeillaan ja testataan paikallisesti. Jos haluat, voit jatkaa tehtävän parissa ja julkaista sovelluksesi Cloudflaressa tai muussa pilvipalvelussa itsenäisesti.

Cloudflare workers -sovelluksen testaaminen ja kehittäminen onnistuu paikallisesti [wrangler-kehityspalvelimen](https://www.npmjs.com/package/wrangler) avulla. Wrangler on Cloudflaren virallinen CLI-työkalu, joka mahdollistaa Workers-sovellusten hallinnan, testaamisen ja julkaisemisen. Wrangler on asennettu projektipohjan kehitysriippuvuuksiin, josta sitä käytetään taustalla esimerkiksi `npm run dev` -komennon yhteydessä.


### Sovelluksen käynnistäminen

[Projektipohjan dokumentaatiossa](https://github.com/honojs/starter/tree/main/templates/cloudflare-workers) on ohjeet projektin asentamiseksi ja käynnistämiseksi. Sovelluksen voi käynnistää paikallisesti seuraavilla komennoilla:

> ```txt
> npm install
> npm run dev
> ```
>
> [For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):
>
> ```txt
> npm run cf-typegen
> ```
>
> Pass the `CloudflareBindings` as generics when instantiating `Hono`:
>
> ```ts
> // src/index.ts
> const app = new Hono<{ Bindings: CloudflareBindings }>()
> ```
>
> *https://github.com/honojs/starter/tree/main/templates/cloudflare-workers*


Asenna riippuvuudet ja käynnistä kehityspalvelin edellä mainittujen ohjeiden mukaan. Varmista, että sovelluksesi vastaa selaimen pyyntöön osoitteessa `http://localhost:8787`.


### Automaattiset testit

Tehtävän automaattiset testit löytyvät [tests-hakemistosta](./tests/) ja ne on määritetty testaamaan `src/index.ts`-tiedostossa olevia funktioita. Toteuta siis varsinainen sovellus kyseiseen tiedostoon. Voit lisäksi luoda muita tiedostoja ja kansioita tarpeen mukaan, kunhan `index.ts`-tiedosto toimii sovelluksen "pääsisäänkäyntinä".

Testien suorittamiseksi tarvitset [Vitest-työkalun](https://vitest.dev/), joka on asennettu projektin kehitysriippuvuuksiin. Vitest on suosittu testaustyökalu, jolla on kirjoitushetkellä kymmeniä miljoonia viikoittaisia latauksia [npm-pakettirekisterissä](https://www.npmjs.com/package/vitest).


### Funktio 1: RGB → HEX -muunnin (25 %)

Kun olet saanut projektin luotua ja käynnistettyä, voit alkaa toteuttaa ensimmäistä funktiota, joka muuntaa RGB-värit HEX-muotoon.

Funktio tulee toteuttaa siten, että se kuuntelee HTTP GET -pyyntöjä polussa `/rgb-to-hex`. Funktio odottaa saavansa kolme kyselyparametria: `r`, `g` ja `b`, jotka edustavat punaisen, vihreän ja sinisen komponenttien arvoja. Jokaisen arvon tulee olla kokonaisluku välillä 0–255.

Pyynnön käsittelystä kerrotaan lyhyesti [Getting Started -sivulla](https://hono.dev/docs/getting-started/basic), mutta tarkemmat tiedot löydät [`HonoRequest`-dokumentista](https://hono.dev/docs/api/request).

Esimerkiksi pyynnöllä `http://localhost:8787/rgb-to-hex?r=64&g=224&b=208` funktiosi tulee palauttaa vastaus, joka sisältää HEX-muodossa olevan värin `#40E0D0` (turkoosi). Värikoodi tulee palauttaa joko tekstinä (`text/plain`) tai JSON-muodossa (`application/json`), oman valintasi mukaan. Esitä HEX-arvot aina isoilla kirjaimilla.

> [!TIP]
> Huomaa, että kyselyparametrit ovat aina merkkijonoja, joten ne on syytä muuntaa kokonaisluvuiksi ennen kuin käytät niitä laskuissa.

Testaa funktiosi toimintaa esimerkiksi selaimen tai curl-komennon avulla. Varmista, että ratkaisusi palauttaa oikeat HEX-arvot eri RGB-syötteillä. Voit myös hyödyntää automaattisia testejä, jotka on määritetty [`tests/rgbToHex.test.ts`-tiedostossa](./tests/rgbToHex.test.ts).

```bash
# testaa funktio curl-komennolla:
curl "http://localhost:8787/rgb-to-hex?r=64&g=224&b=208"

# testaa funktio Vitest-työkalulla:
npx vitest run tests/rgbToHex.test.ts
```

### Funktio 2: HEX → RGB -muunnin (25 %)

Toinen funktio tulee toteuttaa siten, että se kuuntelee HTTP GET -pyyntöjä polussa `/hex-to-rgb`. Funktio odottaa saavansa yhden kyselyparametrin: `hex`, joka edustaa HEX-värin arvoa muodossa `#RRGGBB`, jossa `RR`, `GG` ja `BB` ovat heksadesimaalilukuja välillä `00`-`FF`.

Esimerkiksi pyyntöön `http://localhost:8787/hex-to-rgb?hex=%23FA8072` tulee vastata JSON-objektilla, joka sisältää annettua väriä (Salmon) vastaavat RGB-komponentit:

```json
{ "r": 250, "g": 128, "b": 114 }
```

Vastaus voidaan antaa JSON-muodossa hyödyntäen Honon `Context`-olion `json`-metodia, josta kerrotaan tarkemmin [Context-dokumentissa](https://hono.dev/docs/api/context#json).

> [!TIP]
> Huomaa, että URL-osoitteessa `#`-merkki tulee koodata muodossa `%23`, jotta selain ei tulkitse sitä "ankkuriksi", eli sivun sisäiseksi linkiksi.

Voit jälleen testata funktiosi toimintaa selaimella, curl-komennolla tai automaattisilla testeillä, jotka on määritetty [`tests/hexToRgb.test.ts`-tiedostossa](./tests/hexToRgb.test.ts).

```bash
npx vitest run tests/hexToRgb.test.ts
```

### Funktio 3: värin esikatselu (25 %)

Tehtävän viimeisen funktion tulee kuunnella HTTP GET -pyyntöjä polussa `/preview`. Funktio odottaa saavansa joko kolme kyselyparametria: `r`, `g` ja `b`, tai yhden kyselyparametrin: `hex`.

Funktion tulee palauttaa vastauksena HTML-sivu, joka saa olla muuten tyhjä, mutta jonka taustaväri on määritetty saatujen parametrien perusteella. Taustaväri voidaan määritellä joko erillisessä CSS-tyylissä tai suoraan HTML-elementin `style`-attribuutissa. Voit halutessasi lisätä sivulle myös muita elementtejä, kuten otsikon tai värikoodin tekstinä.

Esimerkiksi seuraavien pyyntöjen tulee molempien palauttaa HTML-sivu, jonka taustaväri on "hot pink":

- `http://localhost:8787/preview?r=255&g=105&b=180`
- `http://localhost:8787/preview?hex=%23FF69B4`

HTML-sisällön palauttamisessa voidaan käyttää Honon `Context`-olion `html`-metodia, josta kerrotaan tarkemmin [Context-dokumentissa](https://hono.dev/docs/api/context#html).

> [!WARNING]
> Käyttäjältä saadut arvot tulee aina tarkistaa ennen niiden käyttöä, jotta vältetään mahdolliset [XSS-hyökkäykset (Cross-Site Scripting)](https://owasp.org/www-community/attacks/xss). Jos laitat käyttäjän syöttämät arvot suoraan HTML:ään ilman tarkistusta, saattaa hyökkääjä pystyä muotoilemaan syötteensä siten, että se suoritetaan osana HTML-sivua.
>
> Jos käyttäjä syöttää esimerkiksi tekstin `<script>alert('Hacked!');</script>` HEX-parametrina, ja et tarkista tätä arvoa, se voi johtaa haitallisen JavaScript-koodin suorittamiseen sivulla. Tyypilliset XSS-hyökkäykset vuotavat tietoja, kuten evästeitä tai kirjautumistietoja, mikäli hyökkääjä onnistuu saamaan uhrin avaamaan sivun linkillä, jossa on mukana haitallista koodia.
>
> Hono tarjoaa erilaisia keinoja suojautua XSS-hyökkäyksiltä, kuten [html Helperin](https://hono.dev/docs/helpers/html#html-helper), joka voi olla avuksi. Voit myös käyttää HTML-rakenteen muodostamisessa Reactista tuttua JSX-syntaksia, jonka avulla merkkijonot käsitellään turvallisesti. JSX:n käytöstä on [oma erillinen ohjesivunsa Honon dokumentaatiossa](https://hono.dev/docs/guides/jsx), josta löydät tärkeimmät ohjeet. Jos käytät JSX:ää, muista vaihtaa tiedostopääte `.ts` → `.tsx` sekä päivitä `wrangler.jsonc`-tiedoston `main`-kenttä vastaamaan uutta tiedostopäätettä.
>
> Vaihtoehtoisesti voit käyttää myös muita keinoja, kuten säännöllisiä lausekkeita, enkoodausta tai kolmannen osapuolen kirjastoja syötteiden tarkistamiseen.


### Laadulliset vaatimukset (25 %)

Kaikkien funktioiden tulee tarkistaa, että saatuja parametreja on oikea määrä ja että niiden arvot ovat sallituissa rajoissa. Jos parametrit puuttuvat tai niiden arvot ovat virheellisiä, tulee funktioiden palauttaa HTTP-vastaus, jossa on virhekoodi 400 (Bad Request) ja kuvaava virheilmoitus.

Lisäksi koodisi ei saa sisältää TypeScript- tai linter-virheitä.


### Ratkaisujen testaaminen

Ratkaisusi testataan automaattisesti [Vitest-työkalun avulla](https://vitest.dev/). Testit on määritelty valmiiksi `tests`-kansiossa, ja ne tarkistavat, että funktiosi toimivat vaatimusten mukaisesti.

Voit testata ratkaisusi toimivuutta ajamalla yksittäisiä testitiedostoja tai kaikki testit kerralla:

```bash
# tehtävän vaiheet 1-3:
npx vitest run tests/rgbToHex.test.ts
npx vitest run tests/hexToRgb.test.ts
npx vitest run tests/preview.test.ts

# lisäksi testataan virhetilanteet:
npx vitest run tests/errorHandling.test.ts

# jos haluat, voit ajaa kaikki testit kerralla:
npx vitest run
```


## Ratkaisun lähettäminen GitHubiin

Tarkista, että olet lisännyt tekemäsi muutokset versionhallintaan ja tee commit. Lopuksi pushaa tekemäsi muutokset GitHubiin tarkastettavaksi. GitHub actions -työkalu tarkistaa automaattisesti, menevätkö testit läpi, ja näet tulokset GitHubin käyttöliittymästä actions-välilehdeltä.

Voit lähettää ratkaisusi uudestaan niin monesti kuin haluat tehtävän määräaikaan asti. Viimeisimmän arvioinnin pisteet jäävät voimaan.


## Lopuksi: mikä ihmeen serverless?

Paikallisessa kehitysympäristössä tämä serverless-sovellus ei juuri eronnut palvelinpohjaisista sovelluksista. Tehtävässä tarvitsit [wrangler-kehityspalvelimen](https://www.npmjs.com/package/wrangler) sekä oman Node.js-prosessin, joka kuunteli HTTP-pyyntöjä tietyssä portissa.

Tuotantokäytössä funktiosi voidaan kuitenkin ajaa ilman omaa pitkään käynnissä olevaa palvelinprosessia, jolloin maksat esimerkiksi vain siitä ajasta, kun funktiosi todella suoritetaan. Tämä voi olla kustannustehokasta, erityisesti silloin, jos sovelluksesi kuormitus eri ajankohtina vaihtelee.

Serverlessin todellinen luonne tulee siis esiin vasta, kun sovellus julkaistaan pilvipalveluun.


## Lisenssit ja tekijänoikeudet

### Hono-sovelluskehys

Hono-sovelluskehys on [avoimen lähdekoodin projekti](https://github.com/honojs/hono), joka on lisensoitu [MIT-lisenssillä](https://github.com/honojs/hono/blob/main/LICENSE).

## Honon starter-projektipohja

Tämän projektin pohjana on käytetty Honon [cloudflare-workers-pohjaa](https://github.com/honojs/starter/tree/main/templates/cloudflare-workers), joka on lisensoitu [MIT-lisenssillä](https://github.com/honojs/starter#license).

## Cloudflare Workers SDK (Wrangler)

Cloudflare Workers SDK on [avoimen lähdekoodin projekti](https://github.com/cloudflare/workers-sdk), joka on lisensoitu sekä Apache 2.0- että MIT-lisenssillä.

## Vitest-testaustyökalu

Vitest-työkalu on lisensoitu MIT-lisenssillä: https://github.com/vitest-dev/vitest/blob/main/LICENSE

### Tämä tehtävä

Tämän tehtävän on kehittänyt Teemu Havulinna ja se on lisensoitu [Creative Commons BY-NC-SA -lisenssillä](https://creativecommons.org/licenses/by-nc-sa/4.0/).

Tehtävänannon, lähdekoodien ja testien toteutuksessa on hyödynnetty ChatGPT-kielimallia sekä GitHub copilot -tekoälyavustinta.
