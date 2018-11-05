const axios = require('axios')
const env = require('dotenv').config()
const queryString = require('query-string')
const convert = require('xml-to-json-promise')
const jp = require('jsonpath')

module.exports = class OBA {
    constructor(options) {
        this.publicKey = options.public,
        this.secretKey = options.secret
    }

    get(endpoint, query, format) {
        return new Promise((resolve, reject) => {
            const baseUrl = 'https://zoeken.oba.nl/api/v1/'
            query = '&' + queryString.stringify(query)
            endpoint = endpoint + '/' + '?'

            const URL = baseUrl + endpoint + 'authorization=' + this.publicKey + query
            
            axios.get(URL)
                .then(res => {
                    return convert.xmlDataToJSON(res.data)
                })
                // .then(res => {
                //     if (format.includes(',')) {
                //         let resultArray = []
                //         const formats = format.split(',').map(item => item.trim())
                //         resultArray.push(formats.map(item => jp.query(res, `$..${item}`)))

                //         return results
                //     } else {
                //         return format ? jp.query(res, `$..${format}`) : res
                //     }
                // })
                .then(res => {
                    return resolve({
                        data: res,
                        url: URL,
                    })
                }).catch(err => {
                    return reject({
                        err: err,
                        url: URL
                    })
                })
        })
    }
}