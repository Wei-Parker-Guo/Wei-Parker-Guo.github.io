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
  let color_keys = data.map(d => d.name);
  if (axis != 0) {
    color_keys = color_keys.reverse();
  }
  const colors = [...color_keys];
  colors.splice(Math.floor(data.length / 2), 0, 'null1', 'null2', 'null3');

  const color = d3.scaleOrdinal()
        .domain(colors)
        .range(colors.map((k, i) => d3.interpolateRgb(d3.interpolatePRGn(i / colors.length), '#7fd1ae')(0.382)))
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
  for (k in color_keys) {
    $(div_id).append(`<div class="legend" style="background-color: ${color(color_keys[k])}">${color_keys[k]}</div>`);
  }
}

function chart_pie(data, div_id, width, unit) {
  const height = width * 0.618;
  const radius = width * 0.618 / 2;

  const arc = d3.arc()
      .innerRadius(radius * 0.618)
      .outerRadius(radius - 1);

  const pie = d3.pie()
      .padAngle(3 / radius)
      .sort(null)
      .value(d => d.duration);

  const color_keys = data.map(d => d.name);
  color_keys.splice(Math.floor(color_keys.length / 2), 0, 'null');
  const color = d3.scaleOrdinal()
      .domain(color_keys)
      .range(d3.schemePRGn[color_keys.length].map(d => d3.interpolateRgb(d, '#7fd1ae')(0.382)))
      .unknown("#ccc");

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height]);

  svg.append("g")
    .selectAll()
    .data(pie(data))
    .join("path")
      .attr("fill", d => color(d.data.name))
      .attr("d", arc)
    .append("title")
      .text(d => `${d.data.name}: ${d.data.duration.toLocaleString()}`);

  if (unit != "$") {
    svg.append("g")
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
      .selectAll()
      .data(pie(data))
      .join("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .call(text => text.append("tspan")
            .attr("fill", "white")
            .text(d => `${Math.round(d.data.duration)}${unit}`));

    svg.append("text")
      .attr("font-size", 16)
      .attr("text-anchor", "middle")
      .attr("dy", "-0.618em")
      .text(`${(d3.sum(data, d => d.duration) / 30).toFixed(2)} ${unit}/day`);

    svg.append("text")
      .attr("font-size", 16)
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .text(`${d3.mean(data, d => d.duration).toFixed(2)} ${unit}/item`);
  }
  else {
    svg.append("g")
        .attr("font-size", 12)
        .attr("text-anchor", "middle")
      .selectAll()
      .data(pie(data))
      .join("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .call(text => text.append("tspan")
            .attr("fill", "white")
            .text(d => `${unit}${Math.round(d.data.duration)}`)); 

    svg.append("text")
      .attr("font-size", 16)
      .attr("text-anchor", "middle")
      .attr("dy", "-0.618em")
      .text(`${unit}${(d3.sum(data, d => d.duration) / 30).toFixed(2)}/day`);

    svg.append("text")
      .attr("font-size", 16)
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .text(`${unit}${d3.mean(data, d => d.duration).toFixed(2)}/item`);
  }

  $(div_id).append(svg.node());
  $(div_id).attr("width", width).attr("style", "text-align: center;");

  // append legends
  const keys = data.map(d => d.name);
  for (k in keys) {
    $(div_id).append(`<div class="legend" style="background-color: ${color(keys[k])};">${keys[k]}</div>`);
  }
}

function chart_time_entries(response) {
  const projects = response['projects'];
  const clients = response['clients'];
  const result = response['last_30'].reduce(
    function(r, a){
        const name = a.description;
        const duration = a.duration / 3600;
        const tags = a.tags;
        const pid = a.project_id;

        // time entries data
        const ei = r[0].findIndex(e => (e.name == name));
        if (ei != -1)  {
          r[0][ei].duration += duration;
        }
        else {
          const entry = {
              name: name,
              duration: duration
          };
          r[0].push(entry);
        }
        r[1] += duration;

        // time entries tags data
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

        // time entries project data
        const pi = r[3].findIndex(e => (e.name == projects[pid].name));
        if (pi != -1) {
          r[3][pi].duration += duration;
        }
        else {
          const entry = {
            name: projects[pid].name,
            duration: duration,
            total_duration: projects[pid].actual_seconds
          };
          r[3].push(entry);
        }

        // time entries client data
        const ci = r[4].findIndex(e => (e.name == clients[projects[pid].client_id].name));
        if (ci != -1) {
          r[4][ci].duration += duration;
        }
        else {
          const entry = {
            name: clients[projects[pid].client_id].name,
            duration: duration
          };
          r[4].push(entry);
        }

        return r;
    },
    [[], 0, [], [], []]
  );
  const total_duration = result[1];
  const time_entries_data = result[0].sort((a, b) => d3.ascending(a.duration, b.duration));
  const time_entries_tags_data = result[2].sort((a, b) => d3.descending(a.duration, b.duration));
  const projects_data = result[3].sort((a, b) => d3.descending(a.duration, b.duration));
  const clients_data = result[4].sort((a, b) => d3.descending(a.duration, b.duration));

  // *************
  // descriptions chart
  // *************

  let width = ($("#time-entries-focus").width() - 20) / 2;
  chart_focus_bar(time_entries_data, "#time-entries-bar", width, 1, "Materials");

  // *************
  // tags chart
  // *************

  chart_focus_bar(time_entries_tags_data, "#time-entries-tag-bar", width, 0, "Categories");

  // append titles
  $("#time-entries-focus").append(`<div style="text-align: center; grid-column: 1; grid-row: 2">Focus Distribution for ${time_entries_data.length} Materials</div>`);
  $("#time-entries-focus").append(`<div style="text-align: center; grid-column: 2; grid-row: 2">Focus Distribution for ${time_entries_tags_data.length} Categories</div>`);

  // *************
  // tags chart
  // *************
  
  width = ($("#time-entries-ratio").width() - 20) / 3;

  const weights = {
    "Default": 10,
    "Study": 16.49,
    "Read": 13.17,
    "Survey": 6.87,
    "Implement": 12.5,
    "Blog": 11.09,
    "Review": 9.87
  };

  chart_pie(projects_data, "#project-pie", width, "hrs");

  chart_pie(
    projects_data.map(function(d) {
      if (weights[d.name] == undefined) {
        return {name: d.name, duration: d.duration * weights["Default"]};
      }
      else {
        return {name: d.name, duration: d.duration * weights[d.name]};
      }
    }), "#weighted-project-pie", width, "$");

  chart_pie(clients_data, "#client-pie", width, "hrs");

  $("#time-entries-ratio").append(`<div style="text-align: center; grid-column: 1; grid-row: 2">Projects</div>`);
  $("#time-entries-ratio").append(`<div style="text-align: center; grid-column: 2; grid-row: 2">Income*</div>`);
  $("#time-entries-ratio").append(`<div style="text-align: center; grid-column: 3; grid-row: 2">Clients</div>`);
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
        chart_time_entries(response);
        $("#footnote").append(`*Income is estimated from the importance weighted project durations instead of actual rates.`);
    }
});

