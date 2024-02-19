function chart_toggl(response) {
    // data preprocessing
    let current_date = new Date();
    const projects = response['projects'];
    const proj_data = response['last_30'].reduce(
        function(r, a){
            let start = new Date(a.start);
            start.setHours(0,0,0,0);
            start = `${start.getMonth()+1}/${start.getDate()}`;
            const name = projects[a.project_id]['name'];
            // update entry if exist
            const ei = r.findIndex(e => (e.date == start && e.name == name));        
            if (ei != -1)  {
              r[ei].duration += a.duration / 3600;
            }
            // create new entry
            else {
              const entry = {
                  date: start,
                  name: name,
                  duration: a.duration / 3600
              };
              r.push(entry);
            }
            return r;
        },
        []
    );
    proj_data.sort((a,b) => a.date - b.date);

    // stacked bar chart of date against project durations in last 30 days

    // Declare the chart dimensions and margins.
    const width = $('#toggl').width();
    const height = width / 2.8;
    const marginTop = 30;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 30;

    // Determine the series that need to be stacked.
    const series = d3.stack()
    .keys(d3.union(proj_data.map(d => d.name)))
    .value(([, group], key) => {
      if (!group.has(key)) {
          return 0; // i.e. a duration of 0
      } else {
          return group.get(key).duration;
      }
    })(d3.index(proj_data, d => d.date, d => d.name));


    // Prepare the scales for positional and color encodings.
    const x = d3.scaleBand()
      .domain(proj_data.map(d => d.date))
      .range([marginLeft, width - marginRight])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .rangeRound([height - marginBottom, marginTop]);

    const color_keys = series.map(d => d.key);
    color_keys.splice(Math.floor(series.length / 2), 0, 'null');
    const color = d3.scaleOrdinal()
      .domain(color_keys)
      .range(d3.schemePRGn[color_keys.length].map(d => d3.interpolateRgb(d, '#7fd1ae')(0.382)))
      .unknown("#ccc");

    // A function to format the value in the tooltip.
    const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

    // Create the SVG container.
    const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;")
      .attr("onclick", "location.href='/activities'")
      .attr("onmouseover", "this.style.cursor='pointer'");

    // Append a group for each series, and a rect for each element in the series.
    svg.append("g")
    .selectAll()
    .data(series)
    .join("g")
      .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(D => D.map(d => (d.key = D.key, d)))
    .join("rect")
      .attr("x", d => x(d.data[0]))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth());

    // Append the horizontal axis.
    svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call(g => g.selectAll(".domain").remove());

    // Append the vertical axis.
    svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(null, "s"))
      .call(g => g.selectAll(".domain").remove());

    // append legends
    const keys = series.map(d => d.key);
    for (k in keys) {
      $('#toggl').append(`<div style="display: inline-block; border-radius: 10px;font-size: .7rem; color: white; padding: 1px 10px 1px 10px; margin: 0 .3rem .1rem .3rem;  background-color: ${color(keys[k])}">${keys[k]}</div>`);
    }

    // append plot
    $('#toggl').append(svg.node());

    $('#toggl').append(`<div style="text-align: center;">My Activities (hrs) in Last ${series[0].length} Days</div>`);

    // append snap
    const snap_data = response['last_30'].reduce(
      function(r, a) {
        const tag_line = a.tags.join(', ');
        if (tag_line in r) {
          r[tag_line].duration += a.duration;
        } else {
          r[tag_line] = {
            duration: a.duration,
            project: projects[a.project_id]['name']
          };
        }
        return r;
      },
      {}
    );
    const max_tag = Object.entries(snap_data).reduce((a, b) => a[1].duration > b[1].duration ? a : b)[0];
    $('#toggl').append(`<br><p style="text-align: center;">In the past 30 days, I'm mostly <b>${snap_data[max_tag].project.toLowerCase().replace(/e+$/g, '')}ing</b> stuff on <b>${max_tag}</b>.</p>`);

    // append realtime activity
    if (response["current"]) {
      const entry = response["current"];
      const start = new Date(entry.start);
      const tags = entry.tags;
      if (tags.length >= 2) {
        tags[tags.length-1] = tags[tags.length-2] + " and " + tags[tags.length-1];
        tags.splice(tags.length-2, 1);
      }
      $('#toggl').append(`<p class="border-glow">Currently, since ${start.getHours()}:${start.getMinutes()}:${start.getSeconds()}, I have started <b>${projects[entry.project_id]['name'].toLowerCase().replace(/e+$/g, '')}ing</b> stuff on <b>${tags.join(', ')}</b>.</p>`);
    }

    $('#toggl').append("<br><hr><br>");
}

// Get data from toggl
$.ajax({
    url: "https://asia-east2-toggltrack-402101.cloudfunctions.net/function-toggl-feed",
    data: {req_all: true},
    dataType: "json",
    format: "json",
    crossDomain: true,
    success: function( response ) {
        chart_toggl(response);
    }
});

