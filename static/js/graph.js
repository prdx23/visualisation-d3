d3.json('data',
    function(data) {
        data = data['data'] //data, data and also data :)

        var updatedata = function() {
            var circle = d3.select(this);
            circle.transition().duration(150)
                .attr("r", 6);
            var name = d3.select(this).attr('id');
            $('.pulsarname').html(name)
            $.ajax({
                    url: "/data/" + name,
                })
                .done(function(data) {
                    $('.toa').html(data['TOAs'])
                    $('.raw').html(data['Raw Profiles'])
                    $('.period').html(data['Period'])
                    $('.pd').html(data['Period Derivative'])
                    $('.dm').html(data['DM'])
                    $('.rms').html(data['RMS'])
                    $('.binary').html(data['Binary'])
                });
        }
        var removedata = function() {
            var circle = d3.select(this);
            circle.transition().duration(150)
                .attr("r", 2.5);
            $('.pulsarname').html('')
            $('.toa').html('')
            $('.raw').html('')
            $('.period').html('')
            $('.pd').html('')
            $('.dm').html('')
            $('.rms').html('')
            $('.binary').html('')
        }

        var periods = [];
        for (i = 0; i < data.length; i++) {
            periods.push(data[i]['Period'])
        }

        var periods_der = [];
        for (i = 0; i < data.length; i++) {
            periods_der.push(Math.log10(data[i]['Period Derivative']))
        }

        var basewidth = $('.graph').width()
        var baseheight = $('.graph').height()

        var margin = {
                top: 10,
                right: 10,
                bottom: 30,
                left: 40
            },
            width = basewidth - margin.left - margin.right,
            height = baseheight - margin.top - margin.bottom;

        // x related values
        var xscale = d3.scale.log()
            .domain([
                Math.round(Math.floor(d3.min(periods) * 10000)) / 10000,
                Math.round(Math.ceil(d3.max(periods) * 10000)) / 10000
            ])
            .range([0, width]),
            xAxis = d3.svg.axis()
            .scale(xscale)
            .ticks(5, function(d) {
                return d.toExponential(2).replace('e', 'x10^')
            })
            .orient("bottom")
            .innerTickSize(-height)
            .outerTickSize(0)
            .tickPadding(5);

        // y related values
        var yscale = d3.scale.linear()
            .domain([
                Math.floor(d3.min(periods_der)),
                Math.ceil(d3.max(periods_der))
            ])
            .range([height - 0, 0]),
            yAxis = d3.svg.axis()
            .scale(yscale)
            .ticks(20)
            .orient("left")
            .innerTickSize(-width)
            .outerTickSize(0)
            .tickPadding(5);


        var zoom = d3.behavior.zoom()
            .x(xscale)
            .y(yscale)
            // .scaleExtent([1, 10])
            .on("zoom", zoomed);

        function zoomed() {
            g_xaxis.call(xAxis);
            g_yaxis.call(yAxis);
            console.log('zoom')
            updategraph()
        }

        // main canvas
        var canvas = d3.select('.graph')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .call(zoom)
            .append("g")
            .attr("class", "points")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


        // y axis
        var g_yaxis = canvas.append("g")
            .attr("class", "axis axis--y")
            .attr("position", "fixed")
        g_yaxis.call(yAxis);

        // x axis
        var g_xaxis = canvas.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (height) + ")")
        g_xaxis.call(xAxis);

        // plot points
        canvas
            .append("g")
            .attr("class", "points")

        function updategraph() {
            var circle =
                canvas
                .select('.points')
                .selectAll('circle')
                .data(data)

            //remove extra data
            circle.exit().remove()

            // add new data
            circle.enter()
                .append("circle")
                .attr("class", "datapoint")
                .attr("id", function(d) {
                    return d['Pulsar']
                })
                .attr("cx", function(d, i) {
                    return xscale(d['Period']);
                })
                .attr("cy", function(d, i) {
                    return yscale(Math.log10(d['Period Derivative']));
                })
                .attr("r", 2.5)
                .attr("opacity", 0.75)
                .style('fill', function(d) {
                    if (d['Binary'] == 'Y') {
                        return '#FF3D00'
                    } else {
                        return '#3D5AFE'
                    }
                })
                .on("mouseover", updatedata)
                .on("mouseout", removedata);

            // update data
            circle
                .attr("cx", function(d, i) {
                    return xscale(d['Period']);
                })
                .attr("cy", function(d, i) {
                    return yscale(Math.log10(d['Period Derivative']));
                })
        }
        updategraph()
    });