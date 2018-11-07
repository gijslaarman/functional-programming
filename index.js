const OBA = require('./modules/oba-api')
const express = require('express')
const env = require('dotenv').config()
const app = express()
const chalk = require('chalk')
const d3 = require('d3')

const client = new OBA({
    public: process.env.PUBLIC_KEY
})

const search = {
    endpoint: 'search',
    query: {
        q: 'dogs',
        facet: 'Type(book)',
        refine: true
    },
    pages: {
        page: 1,
        pagesize: 20,
        maxpages: 20
    }
}

client.getAll(search.endpoint, search.query, search.pages)
    .then(response => {
        console.log(chalk.bgGreen(response.url)) // URL ok

        let results = [];

        response.data.map(book => {
            results.push(
                {   
                    title: book.titles[0].title[0]['_'],
                    pubYear: book.publication && book.publication[0].year && book.publication[0].year[0]['_'] ? book.publication[0].year[0]['_'] : null,
                    language: book.languages ? book.languages[0].language[0]['_'] : null,
                    originalLang: book.languages && book.languages[0] && book.languages[0]['original-language'] ? book.languages[0]['original-language'][0]['_'] : null
                }
            )
        })

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

        // app.get('/', (req, res) => res.send(d3)).listen(3000)
        app.get('/', (req, res) => res.json(engToDutBooks)).listen(3000)
    })
    .catch(err => {
        if (err.err) {
            console.log(chalk.red(err.err)) // The error
            // console.log(chalk.bgRed(err.url)) // The broken link, maybe theres something missing, or you wrote something wrong in the facets.
        } else {
            console.log(chalk.red('Something went wrong in index.js: \n' + err))
        }
        
    })


