const OBA = require('./modules/oba-api')
const express = require('express')
const env = require('dotenv').config()
const app = express()
const chalk = require('chalk')

const client = new OBA({
    public: process.env.PUBLIC_KEY
})

const search = {
    endpoint: 'search',
    query: {
        q: 'Type(book)',
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

        let translatedBooks = [];

        response.data.map(book => {
            translatedBooks.push(
                {   
                    title: book.titles[0].title[0]['_'],
                    pubYear: book.publication && book.publication[0].year && book.publication[0].year[0]['_'] ? book.publication[0].year[0]['_'] : null,
                    language: book.languages ? book.languages[0].language[0]['_'] : null,
                    originalLang: book.languages && book.languages[0] && book.languages[0]['original-language'] ? book.languages[0]['original-language'][0]['_'] : null
                }
            )
        })

        let results = [];
        
        translatedBooks.forEach(book => {
            if (book.language === 'dut' && book.originalLang === 'eng') {
                results.push(book)
            }
        })
        
        // result.map(book => {
        //     if (book.language === 'dut' && book['original-language'] === 'eng') {
        //         translatedBooks.push(book)
        //     }
        // })

        app.get('/', (req, res) => res.json(results)).listen(3000)
    })
    .catch(err => {
        if (err.err) {
            console.log(chalk.red(err.err)) // The error
            // console.log(chalk.bgRed(err.url)) // The broken link, maybe theres something missing, or you wrote something wrong in the facets.
        } else {
            console.log(chalk.red('Something went wrong in index.js: \n' + err))
        }
        
    })


