const OBA = require('./modules/oba-api')
const express = require('express')
const app = express()
const fs = require('fs')

const client = new OBA({
    public: process.env.PUBLIC_KEY,
    secret: process.env.SECRET_KEY
})

let apiResponse = null;

client.get('search', { q: 'boek' }, { facet: 'type', kind: 'book' } )
    .then( response =>
        app.get('/', (req, res) => {
            response.aquabrowser.results.map(result => {
                result.result.map(value => {
                    value.publication.map(data => {
                        data.year.map(year => {
                            console.log(year._)
                        })
                    })
                })
            })
            res.json(response)
        }).listen(3000)
    )