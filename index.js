const OBA = require('./modules/oba-api')
const express = require('express')
const app = express()
const fs = require('fs')
const chalk = require('chalk')

const client = new OBA({
    public: process.env.PUBLIC_KEY,
    secret: process.env.SECRET_KEY,
})

const search = {
    endpoint: 'search',
    query: {    
        q: 'Gijs',
        pagesize: 20,
        facet: 'Type(book)'
    },
    format: '', 
    narrowDown: true
}

client.get(search.endpoint, search.query, search.format, search.narrowDown)
    .then(response => {
        console.log(chalk.bgGreen(response.url)) // URL ok
        let data = response.data.aquabrowser.results[0].result

        let result = data.map(book => {
            return {
                title: book.titles[0].title[0]['_'].split('/').slice(0,1).join().trim(),
                type: book.formats[0].format[0]['_'],
                publication_year: book.publication ? book.publication[0].year[0]['_'] : null,
                summary: book.summaries ? book.summaries[0].summary[0]['_'] : null,
                language: book.languages ? book.languages[0].language[0]['_'] : null
            }
        })

        let publications = {}
        result.forEach(book => { 
            let count = publications[book.language] ? publications[book.language] : 0
            return publications = { [book.language]: count++ }
        })

        console.log(result.forEach(book => book['type']))

        console.log(publications)

        app.get('/', (req, res) => res.json(result)).listen(3000)
    })
    .catch(err => {
        if (err.err) {
            console.log(chalk.red(err.err)) // The error
            // console.log(chalk.bgRed(err.url)) // The broken link, maybe theres something missing, or you wrote something wrong in the facets.
        } else {
            console.log(chalk.red('Something went wrong in index.js: ' + err))
        }
        
    })


