// Index.js is alleen gebruikt om de data op te halen.

const OBA = require('./modules/oba-api')
const express = require('express')
const env = require('dotenv').config()
const app = express()
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
        // Start from page:
        page: 1,
        // Results per page:
        pagesize: 20,
        // Maximum pages you want to resolve (maxpages * pagsize = #results)
        maxpages: 10
    }
}

// Gebruikt om de data weg te schrijven naar een JSON.
client.getAll(search.endpoint, search.query, search.pages)
    .then(response => {
        fs.writeFile(`list_${search.pages.page}-${search.pages.maxpages}.json`, JSON.stringify(response.data), 'utf8', () => { console.log('Created list.json') })
    })