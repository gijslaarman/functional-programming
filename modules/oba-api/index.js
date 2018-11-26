const axios = require('axios')
const convert = require('xml-to-json-promise').xmlDataToJSON

module.exports = class OBA {
    constructor(options) {
        this.key = options.public,
        this.pages = {}
    }

    stringify(object) {
        const keys = Object.keys(object)
        const values = Object.values(object)
        return keys.map((key, i) => `&${key}=${values[i]}`).join('')
    }

    get(endpoint, query, pages) {
        const url = `https://zoeken.oba.nl/api/v1/${endpoint}/?authorization=${this.key}${this.stringify(query)}`
        console.log(url)

        axios.get(url)
        .then(res => convert(res.data))
        .then(res => {
            return {
                data: res,
                url: url
            }
        })
    }

    getFailed(endpoint, query, failedPages) {
        const url = `https://zoeken.oba.nl/api/v1/${endpoint}/?authorization=${this.key}${this.stringify(query)}`
        this.failedPages = failedPages

        return this.getAmountOfRequests(url).then(helpers => {
            helpers.amount = failedPages.length

            let promiseToSendFailedPages = new Promise((resolve, reject) => {

            })
        })
        failedPages.forEach(page => {
            axios.get(`${url}&page=${page}&pagesize=20&rctx=${helpers.rctx}`)
        })
    }

    getAll(endpoint, query, pages) {
        const url = `https://zoeken.oba.nl/api/v1/${endpoint}/?authorization=${this.key}${this.stringify(query)}`
        this.pages = pages
        this.pages.maxpages = this.pages.page + this.pages.maxpages - 1
        console.log(`Starting from page ${this.pages.page}, ending at page ${this.pages.maxpages}`)

        return this.getRequests(url)
            .then(requests => {
                return {
                    data: [].concat(...requests.data),
                    url: url,
                    failed: requests.failed
                }
            })
        }

      getAmountOfRequests(url) {
        return axios.get(url)
          .then(res => convert(res.data))
          .then(res => {
              return {
                  amount: (Math.ceil(res.aquabrowser.meta[0].count[0] / this.pages.pagesize) + 1),
                  rctx: res.aquabrowser.meta[0].rctx[0]
              }
          })
      }

      getRequests(url) {
        return this.getAmountOfRequests(url).then(helpers => {
            helpers.amount > this.pages.maxpages ? helpers.amount = this.pages.maxpages : false

            // The builder array, this is the eventual data that gets send
            let promises = []
            let failedPages = []

            let promiseToSendAllData = new Promise( (resolve, reject) => {
                function TimeoutApi(pages, url, promises) {
                    if (pages.page > helpers.amount) {
                        setTimeout(() => {
                            resolve({data: promises, failed: failedPages})
                        }, 1000)
                    } else {
                        console.log(`Resolving page no.${pages.page}`)

                        axios.get(`${url}&page=${pages.page}&pagesize=20&rctx=${helpers.rctx}`)
                        // If status code 200:
                        .then(res => convert(res.data))
                        .then(res => res.aquabrowser.results[0].result)
                        .then(res => res.map(book => {
                            let bookarray = [];

                            bookarray.push({
                                pubYear: book.publication && book.publication[0].year && book.publication[0].year[0]['_'] ? book.publication[0].year[0]['_'] : null,
                                language: book.languages && book.languages[0] && book.languages[0].language && book.languages[0].language[0] ? book.languages[0].language[0]['_'] : null,
                                originLang: book.languages && book.languages[0] && book.languages[0]['original-language'] ? book.languages[0]['original-language'][0]['_'] : null
                            })

                            return promises.push(bookarray)
                        }))
                        .catch(err => {
                            let pageNumber = err.config.url.split('&')[4].split('=')[1]
                            console.log(`Error: Failed to resolve page: ${pageNumber}`)
                            return failedPages.push(pageNumber)
                        })

                        // If status code != 200, go on to the next request or retry.

                        pages.page++
                        setTimeout(TimeoutApi, 1100, pages, url, promises)
                    }
                }

                TimeoutApi(this.pages, url, promises)
            })

            return promiseToSendAllData
        })
    }
}