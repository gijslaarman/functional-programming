const axios = require('axios')
const env = require('dotenv').config()
const queryString = require('query-string')
const convert = require('xml-to-json-promise')

module.exports = class OBA {
    constructor(options) {
        this.publicKey = options.public,
        this.secretKey = options.secret
    }

    get (endpoint, query, facet) {
        return new Promise ((resolve, reject) => {
            const baseUrl = 'https://zoeken.oba.nl/api/v1/'
            query = queryString.stringify(query)
            const facetKind = facet.kind
            const facetQuery = queryString.stringify(facet).split('&').shift() + `(${facet.kind})`
            endpoint = endpoint + '/' + '?'

            axios.get(baseUrl + endpoint + query + '&authorization=' + this.publicKey + '&' + facetQuery)
                .then( res => resolve(convert.xmlDataToJSON(res.data)))
                .catch( err => reject(err) )
        })
    }
}