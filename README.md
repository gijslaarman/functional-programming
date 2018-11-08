# How to install
Request an API key from the [OBA](https://www.oba.nl/oba/english.html)
```
# Clone the repo:
git clone https://github.com/gijslaarman/functional-programming.git

# change directory:
cd functional-programming

# Install packages:
npm install

# Create .env file for storing API key:
touch .env

# paste the APIkey in the .env file:
PUBLIC_KEY={your_API_key}

# Start up the nodeJS server:
node index
```

### Code explained
The app consists of the 'front-end' index.js where you can modify the requested data. In the modules folder theres the backend side for retrieving the data from the API. The main elements that exist in the frontside `index.js`

**The search variable:**
```javascript
const search = {
    endpoint: 'search',      // The endpoint on what to search for. Can be search/index etc.
    query: {                 // The query, to add more queries just add a key with the value e.g: 'librarian=true' > librarian: true
        q: 'genre=school',
        facet: 'Type(book)',
        refine: true
    },
    pages: {
        page: 1,              // Change what page to start at for searching.
        pagesize: 20,         // The pagesize (maximum is 20, higher doesn't work) per page. This will give you 20 results per page.
        maxpages: 85          // Maxpages you want to retrieve so the maximum pages you want to get, less is faster (less requests) this could end up giving you 85*20 = 1700 results.
    }
}
```

**Do what you want with the results**
```javascript
client.getAll(search.endpoint, search.query, search.pages)
    .then(response => {
      let data = response.data
      // The variable data is now the data retrieved from the server. Its one array with every object in it being a book, with ID, title, format etc being documented.
    })
```
From here on out you can clean up the data and use it to create a clean JSON file or to use the data dynamically on a website.

:exclamation::exclamation: **Dutch school text below** :exclamation::exclamation:  

# Functional Programming
**Dit is het verhaal van Gijs voor functional programming. Gijs vond dit twee hele zware weken kan ik je alvast verklappen.**


## Mijn onderzoeksvraag
Allereerst, voordat ik het onderzoek ging beginnen heb ik een onderzoeksvraag nodig. Wat wil ik te weten komen. Nou daar had Gijs baat bij. Gijs was namelijk dinsdag en woensdag van de eerste week ziek en had daarom geen onderzoek gedaan naar de onderzoeksvragen (lekker bezig pik). Daarom ging Gijs meteen aan de slag met de API om te kijken of hij resultaten kon ophalen. Na 1,5 week stoeien met de API heeft Gijs deze onderzoeksvraag bedacht: <br>

> ### **Wat voor effect heeft globalisering op de vertaling van boeken?**
> 
> #### De Deelvragen daarbij:
> 1. Hoeveel boeken zijn er in de OBA die engels zijn per publicatie jaar.
> 2. Hoeveel boeken zijn er van Engels naar Nederlands vertaald.
> 3. Wat is het percentage buitenlandse boeken tegen over Nederlandse boeken.

## Het resultaat
Eerst was ik een beetje sceptisch over mijn onderzoekvraag, uiteindelijk vond ik het toch wel mooi om te zien dat je eventuele conclusies kan trekken uit de grafiek. 

Om de data die ik nodig heb uit de array te filteren en in een mooie array te zetten heb ik dit bedacht:
```javascript
let results = [];
response.data.map(book => {
    results.push(
        {   // hier wordt de titel, publicatiejaar, taal en originele taal uit het boek gefiltered en in een nieuw object gestopt die wordt gepushed naar de results array. Er zit een failsafe op, als het boek geen publicatie jaar heeft krijgt het een null ipv het jaar. 
            title: book.titles[0].title[0]['_'],
            pubYear: book.publication && book.publication[0].year && book.publication[0].year[0]['_'] ? book.publication[0].year[0]['_'] : null,
            language: book.languages ? book.languages[0].language[0]['_'] : null,
            originalLang: book.languages && book.languages[0] && book.languages[0]['original-language'] ? book.languages[0]['original-language'][0]['_'] : null
        }
    )
})
```

Met die results heb ik nog een keer gefiltered, op alle Nederlandse boeken die vertaald zijn uit het Engels en alle Engelse boeken die nooit vertaald zijn: 

```javascript
// Ik ben van mening dat dit netter had gekund, en er een funtie voor had kunnen schrijven, alleen qua tijds besteks lukten mij dat niet meer.
let engToDutBooks = [];

results.forEach(book => {
    if (book.language === 'dut' && book.originalLang === 'eng') {
        engToDutBooks.push(book)
    }
})

let englishBooks = [];
results.forEach(book => {
    if (book.language === 'eng' && book.originalLang === null) {
        englishBooks.push(book)
    }
})
```

Vervolgens ben ik een JSON bestand gaan maken, waar ik alle twee de arrays een getal meegeef per jaar, zoals dit per jaar:
```json
[
  {
    "year": 2001,
    "englishBooks": "2",
    "englishToDutchBooks": "4"
  }
]
```

Om dit te bereiken heb ik een for loop moeten gebruiken, want ik wilde alle boeken vanaf het jaar 2000 t/m 2018.
```javascript
createData = (array, array2) => {
  let json = [] // Maak opnieuw een array aan.

  for (let i = 2000; i <= 2018; i++) {
      let books1 = []; // Alle boeken van dit jaar tal van de eerste array gaan hier in.
      let books2 = []; // Alle boeken van dit jaar tal van de tweede array gaan hier in.

      array.forEach(book => {
          if (Number(book.pubYear) === i) { // Kijk of het jaartal (wat een nummer moet zijn) gelijk is aan het jaartal waar we nu door heen loopen. 
              books1.push(book)
          }
      })

      array2.forEach(book => {
          if (Number(book.pubYear) === i) {
              books2.push(book)
          }
      })

      json.push({ // Aan het einde van de loop voeg ik de twee arrays met alle boeken van het jaartal samen in een object:
          year: i, // Het jaargetal is de index.
          english: books1.length.toString(), // Alle boeken in array books1, de lengte daarvan want we hebben een getal nodig en dat moet een string zijn voor D3.
          englishToDutch: books2.length.toString()
      })
  }

  return json // Return de nieuwe array met daarin alle objecten per jaartal en aantallen.
}
```

En dan de final touch: De JSON file aanmaken, zodat we dit kunnen gebruiken in D3:

```javascript
createJSON = (array, array2, filename) => {
    let file = filename + '.json'
    fs.writeFile(file, JSON.stringify(createData(array, array2)), 'utf8', () => { console.log('File: ' + file + ' created.')})
    // De createData functie wordt hier aangeroepen, die de parameters array, en array2 meekrijgt.
}

createJSON(englishBooks, engToDutBooks, 'data') // Hier roepen we de twee arrays die we hadden aangemaakt met alle boeken die in het Engels zijn en alle van Engels naar Nederlands vertaalde boeken. 
// 'data' is hoe we de json file willen noemen.
```

#### D3 Resultaat
[Insert Here]

## Credits
Credits aan:
[Dennis Wegereef](https://github.com/Denniswegereef)
[Folkert-Jan v/d Pol](https://github.com/fjvdpol/)

Zij hebben mij geholpen met het loopen door de API van de OBA, zodat ik meer dan 20 resultaten kreeg.
