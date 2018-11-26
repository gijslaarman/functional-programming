function checkForLanguage(langCode) {
    switch(langCode) {
        case null:
        case 'eng':
        case 'fre':
        case 'ger':
            return true
        default:
            return false
    }
}

d3.json('list.json').then(data => {
    // Create data per year
    let booksPerYear = []
    for (let i = 1960; i <= 2018; i++) {
        let thisYearsData = {
            year: i,
            dut: 0,
            eng: 0,
            fre: 0,
            ger: 0
        }
        data.forEach(book => {
            if (!checkForLanguage(book.originLang)) {
                return
            }
            if (Number(book.pubYear) === i && book.language === 'dut') {
                if (book.originLang === null) {
                    thisYearsData[book.language] ? thisYearsData[book.language]++ : thisYearsData[book.language] = 1
                } else {
                    thisYearsData[book.originLang] ? (thisYearsData[book.originLang]++) : thisYearsData[book.originLang] = 1
                }
            }
        })
        booksPerYear.push(thisYearsData)
    }

    return booksPerYear
}).then(data => {
    var margin = {top: 20, right: 20, bottom: 30, left: 50}
    var width = 960 - margin.left - margin.right
    var height = 500 - margin.top - margin.bottom

    var svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

    var keys = Object.keys(data[0]).splice(1)
    var relatives = data.map(year => {
        let totalAmount = year.dut + year.eng + year.fre + year.ger
        return {
            year: year.year,
            dut: (year.dut / totalAmount * 100),
            eng: (year.eng / totalAmount * 100),
            fre: (year.fre / totalAmount * 100),
            ger: (year.ger / totalAmount * 100)
        }
    })

    var parseYear = d3.timeParse('%Y')
    var x = d3.scaleBand().rangeRound([0, width - 10]).paddingInner(0.05).align(0.1);
    var y = d3.scaleLinear().range([height, 0])
    var z = d3.scaleOrdinal()
    .range(["#ff8c00", "#ef3737", "#3749ef", "#4a4a4f"]);

    x.domain(data.map(d => parseYear(d.year)))
    y.domain([0, 100]).nice()
    z.domain(keys)

    svg.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(relatives))
    .enter().append("g")
      .attr("fill", d => z(d.key))
    .selectAll("rect")
    .data(d => d)
    .enter().append("rect")
      .attr("x", d => x(parseYear(d.data.year)))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .on("mouseover", () => { tooltip.style("display", null); })
    .on("mouseout", () => { tooltip.style("display", "none"); })
    .on("mousemove", function(d) {
      console.log(d);
      var xPosition = d3.mouse(this)[0] + 10;
      var yPosition = d3.mouse(this)[1] + 20;
      tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
      tooltip.select("text").text((d[1]-d[0]).toFixed(2) + '%');
    })

    svg.append('g')
        .attr('class', 'y axis')
        .call(d3.axisLeft(y))

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%Y')).ticks(20))
        .append('text')
            .attr('class', 'pubyear')
            .attr('x', 10)
            .attr('dx', '0.71em')
            .attr('fill', '#000')
            .text('Publicatie jaar')

    var legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });

    var tooltip = svg.append("g")
    .attr("class", "tooltip")
    .style("display", "none");

    tooltip.append("rect")
    .attr("width", 60)
    .attr("height", 20)
    .attr("fill", "white")
    .style("opacity", 0.5);

    tooltip.append("text")
    .attr("x", 30)
    .attr("dy", "1.2em")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");
})