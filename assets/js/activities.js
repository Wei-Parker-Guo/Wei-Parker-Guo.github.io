function chart_overview(response) {
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
    const width = $('#overview').width();
    const height = width / 2.8;
    const marginTop = 30;
    const marginRight = 0;
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
      .attr("style", "max-width: 100%; height: auto;");

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
      $('#overview').append(`<div class="legend" style="background-color: ${color(keys[k])}">${keys[k]}</div>`);
    }

    // append plot
    $('#overview').append(svg.node());

    $('#overview').append(`<div style="text-align: center;">My Activities (hrs) in Last ${series[0].length} Days</div>`);

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
    $('#overview').append(`<br><p style="text-align: center;">In the past 30 days, I'm mostly <b>${snap_data[max_tag].project.toLowerCase()}ing</b> stuff on <b>${max_tag}</b>.</p>`);

    // append realtime activity
    if (response["current"]) {
      const entry = response["current"];
      const start = new Date(entry.start);
      const tags = entry.tags;
      if (tags.length >= 2) {
        tags[tags.length-1] = tags[tags.length-2] + " and " + tags[tags.length-1];
        tags.splice(tags.length-2, 1);
      }
      $('#overview').append(`<p class="border-glow">Currently, since ${start.getHours()}:${start.getMinutes()}:${start.getSeconds()}, I have started <b>${projects[entry.project_id]['name'].toLowerCase()}ing</b> stuff on <b>${tags.join(', ')}</b>.</p>`);
    }
}

function chart_focus_bar(data, div_id, width, axis, desc) {
  // Declare the chart dimensions and margins.
  const height = width / 2;
  const marginTop = 15;
  let marginRight = 0;
  const marginBottom = 15;
  let marginLeft = 30;

  if (axis != 0) {
    marginRight = 30;
    marginLeft = 0;
  }

  // Declare the x (horizontal position) scale.
  const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([marginLeft, width - marginRight])
      .padding(0.1);
  
  // Declare the y (vertical position) scale.
  const y_min = d3.min(data, (d) => d.duration) / 2;
  const y = d3.scaleLog()
      .domain([y_min, d3.max(data, (d) => d.duration)])
      .range([height - marginBottom, marginTop]);

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

  // color
  const color_keys = data.map(d => d.name);
  color_keys.splice(Math.floor(data.length / 2), 0, 'null1', 'null2', 'null3');

  const color = d3.scaleOrdinal()
        .domain(color_keys)
        .range(color_keys.map((k, i) => d3.interpolateRgb(d3.interpolatePRGn(i / color_keys.length), '#7fd1ae')(0.382)))
        .unknown("#ccc");

  // Add a rect for each bar.
  svg.append("g")
    .selectAll()
    .data(data)
    .join("rect")
      .attr("x", (d) => x(d.name))
      .attr("y", (d) => y(d.duration))
      .attr("height", (d) => y(y_min) - y(d.duration))
      .attr("width", x.bandwidth())
      .attr("fill", d => color(d.name));

  // Add the y-axis and label, and remove the domain line.
  if (axis == 0) {
    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(10, "r"))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", 0)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ Duration (hrs)"));
  }
  else {
    svg.append("g")
        .attr("transform", `translate(${width - marginRight},0)`)
        .call(d3.axisRight(y).ticks(10, "r"))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", -2 * marginRight)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ Duration (hrs)"));
  }

  // Return the SVG element.
  $(div_id).append(svg.node());
  $(div_id).attr("width", width);
  if (axis != 0) {
    $(div_id).attr("style", "text-align: right;");
  }

  // append legends
  const keys = data.map(d => d.name);
  for (k in keys) {
    $(div_id).append(`<div class="legend" style="background-color: ${color(keys[k])}">${keys[k]}</div>`);
  }
}


function chart_time_entries_bar(response) {
  const projects = response['projects'];
  const result = response['last_30'].reduce(
    function(r, a){
        const name = a.description;
        const duration = a.duration / 3600;
        const tags = a.tags;
        // update entry if exist
        const ei = r[0].findIndex(e => (e.name == name));        
        
        if (ei != -1)  {
          r[0][ei].duration += duration;
        }
        // create new entry
        else {
          const entry = {
              name: name,
              duration: duration
          };
          r[0].push(entry);
        }
        r[1] += duration;

        for (let t in tags) {
          const ti = r[2].findIndex(e => (e.name == tags[t]));
          if (ti != -1) {
            r[2][ti].duration += duration;
          }
          else {
            const entry = {
              name: tags[t],
              duration: duration
            };
            r[2].push(entry);
          }
        }

        return r;
    },
    [[], 0, []]
  );
  const total_duration = result[1];
  const time_entries_data = result[0].sort((a, b) => d3.ascending(a.duration, b.duration));
  const time_entries_tags_data = result[2].sort((a, b) => d3.descending(a.duration, b.duration));

  // *************
  // descriptions chart
  // *************

  const width = ($("#time-entries-focus").width() - 30) / 2;
  chart_focus_bar(time_entries_data, "#time-entries-bar", width, 1, "Materials");

  // *************
  // tags chart
  // *************

  chart_focus_bar(time_entries_tags_data, "#time-entries-tag-bar", width, 0, "Categories");

  // append titles
  $("#time-entries-focus").append(`<div style="text-align: center; grid-column: 1; grid-row: 2">Focus Distribution for ${time_entries_data.length} Materials</div>`);
  $("#time-entries-focus").append(`<div style="text-align: center; grid-column: 2; grid-row: 2">Focus Distribution for ${time_entries_tags_data.length} Categories</div>`);
}


// Get data from toggl
$.ajax({
    url: "https://asia-east2-toggltrack-402101.cloudfunctions.net/function-toggl-feed",
    data: {req_all: true},
    dataType: "json",
    format: "json",
    crossDomain: true,
    success: function( response ) {
        chart_overview(response);
        chart_time_entries_bar(response);
    }
});

