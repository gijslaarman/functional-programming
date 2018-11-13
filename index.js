const OBA = require('./modules/oba-api')
const express = require('express')
const env = require('dotenv').config()
const app = express()
const chalk = require('chalk')
const fs = require('fs')

const client = new OBA({
    public: process.env.PUBLIC_KEY
})

const search = {
    endpoint: 'search',
    query: {
        q: 'boek',
        facet: 'Type(book)',
        refine: true
    },
    pages: {
        page: 1,
        pagesize: 20,
        maxpages: 20
    }
}

// json.map(book => {
//     results.push(
//         {
//             pubYear: book.publication && book.publication[0].year && book.publication[0].year[0]['_'] ? book.publication[0].year[0]['_'] : null,
//             language: book.languages && book.languages[0] && book.languages[0].language && book.languages[0].language[0] ? book.languages[0].language[0]['_'] : null,
//             originLang: book.languages && book.languages[0] && book.languages[0]['original-language'] ? book.languages[0]['original-language'][0]['_'] : null
//         }
//     )
// })

client.getAll(search.endpoint, search.query, search.pages)
    .then(response => {
        fs.writeFile('list.json', JSON.stringify(response.data), 'utf8', () => {
            console.log('Created list.json')
        })
        fs.writeFile('failed_pages.json', JSON.stringify(response.failed), 'utf8', () => {
            console.log('Created failed_pages.json')
        })
    })

// fs.writeFile('books.json', JSON.stringify(results), 'utf8', () => {
//     console.log('created titles file')
// })

// client.getAll(search.endpoint, search.query, search.pages)
//     .then(response => {
//         console.log(chalk.bgGreen(response.url)) // URL ok

//         let results = [];
//         fs.writeFile('results.json', JSON.stringify(response.data), 'utf8', () => {
//             console.log('created results.json')
//         })

//         response.data.map(book => {
//             results.push(
//                 {   
//                     title: book.titles[0].title[0]['_'],
//                     pubYear: book.publication && book.publication[0].year && book.publication[0].year[0]['_'] ? book.publication[0].year[0]['_'] : null,
//                     language: book.languages ? book.languages[0].language[0]['_'] : null,
//                     originalLang: book.languages && book.languages[0] && book.languages[0]['original-language'] ? book.languages[0]['original-language'][0]['_'] : null
//                 }
//             )
//         })

//         let engToDutBooks = [];
//         results.forEach(book => {
//             if (book.language === 'dut' && book.originalLang === 'eng') {
//                 engToDutBooks.push(book)
//             }
//         })

//         let englishBooks = [];
//         results.forEach(book => {
//             if (book.language === 'eng' && book.originalLang === null) {
//                 englishBooks.push(book)
//             }
//         })

//         createData = (array, array2) => {
//             let json = []

//             for (let i = 2000; i <= 2018; i++) {
//                 let books1 = [];
//                 let books2 = [];

//                 array.forEach(book => {
//                     if (Number(book.pubYear) === i) {
//                         books1.push(book)
//                     }
//                 })

//                 array2.forEach(book => {
//                     if (Number(book.pubYear) === i) {
//                         books2.push(book)
//                     }
//                 })
    
//                 json.push({
//                     year: i,
//                     english: books1.length.toString(),
//                     englishToDutch: books2.length.toString()
//                 })
//             }

//             return json
//         }

//         createJSON = (array, array2, filename) => {
//             let file = filename + '.json'
//             fs.writeFile(file, JSON.stringify(createData(array, array2)), 'utf8', () => { console.log('File: ' + file + ' created.')})
//         }

//         console.log(results.length)
//         createJSON(englishBooks, engToDutBooks, 'data')

//         return
//         app.get('/', (req,res) => res.json(data)).listen(3000)
//         // app.get('/', (req, res) => res.render('pages/index', {results: englishBooks})).listen(3000)
//     })
//     .catch(err => {
//         if (err.err) {
//             console.log(chalk.red(err.err)) // The error
//             // console.log(chalk.bgRed(err.url)) // The broken link, maybe theres something missing, or you wrote something wrong in the facets.
//         } else {
//             console.log(chalk.red('Something went wrong in index.js: \n' + err))
//         }
        
//     })


