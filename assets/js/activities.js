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
    $('#overview').append(`<br><p style="text-align: center;">In the past 30 days, I'm mostly <b>${snap_data[max_tag].project.toLowerCase().replace(/e+$/g, '')}ing</b> stuff on <b>${max_tag}</b>.</p>`);

    // append realtime activity
    if (response["current"]) {
      const entry = response["current"];
      const start = new Date(entry.start);
      const tags = entry.tags;
      if (tags.length >= 2) {
        tags[tags.length-1] = tags[tags.length-2] + " and " + tags[tags.length-1];
        tags.splice(tags.length-2, 1);
      }
      $('#overview').append(`<p class="border-glow">Currently, since ${start.getHours()}:${start.getMinutes()}:${start.getSeconds()}, I have started <b>${projects[entry.project_id]['name'].toLowerCase().replace(/e+$/g, '')}ing</b> stuff on <b>${tags.join(', ')}</b>.</p>`);
    }

    // return active days
    return series[0].length;
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

function chart_pie(data, div_id, width, unit, active_days) {
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
      .text(`${d3.sum(data, d => d.duration).toFixed(2)} ${unit}`);

    svg.append("text")
      .attr("font-size", 16)
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .text(`${(d3.sum(data, d => d.duration) / active_days).toFixed(2)} ${unit}/day`);
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
      .text(`${unit}${d3.sum(data, d => d.duration).toFixed(2)}`);

    svg.append("text")
      .attr("font-size", 16)
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .text(`${unit}${(d3.sum(data, d => d.duration) / active_days).toFixed(2)}/day`);
  }

  $(div_id).append(svg.node());
  $(div_id).attr("width", width).attr("style", "text-align: center;");

  // append legends
  const keys = data.map(d => d.name);
  for (k in keys) {
    $(div_id).append(`<div class="legend" style="background-color: ${color(keys[k])};">${keys[k]}</div>`);
  }
}

function chart_moving_average(data, ks, div_id, width, window_size) {
  // kernel
  const kernel = [...Array(window_size).keys()].map(a => Math.exp(-((a/(Math.sqrt(window_size ** 1.236)))**2)));
  // preprocessing for moving averages
  data = data.reduce(
    function(r, a, i) {
      if (i + 1 >= window_size) {
        const entry = {
          date: a.date,
          durations: {"Total": a.total_duration}
        };

        for (var k in ks) {
          k = ks[k];
          if (k in a.durations) {
            entry.durations[k] = a.durations[k];
          }
          else {
            entry.durations[k] = 0;
          }
        }

        for (j=1; j < window_size; j++) {
          entry.durations["Total"] += data[i - j].total_duration * kernel[j];
          for (var k in ks) {
            k = ks[k];
            if (k in data[i-j].durations) {
              entry.durations[k] += data[i-j].durations[k] * kernel[j];
            }
          }
        }

        for (var k in entry.durations) {
          entry.durations[k] /= window_size;
        }

        r.push(entry);
      }
      return r;
    },
    []
  );

  // Declare the chart dimensions and margins.
  const height = width / 3.708;
  const marginTop = 30;
  const marginRight = 0;
  const marginBottom = 40;
  const marginLeft = 30;

  // Declare the x (horizontal position) scale.
  const x = d3.scaleBand(data.map(d => d.date), [marginLeft, width - marginRight]);

  // Declare the y (vertical position) scale.
  const y = d3.scaleLinear([0, 1], [height - marginBottom, marginTop]);

  // color
  const colors = [...ks];
  colors.push("Total");
  colors.splice(Math.floor(data.length / 2), 0, 'null');

  const color = d3.scaleOrdinal()
        .domain(colors)
        .range(d3.schemePRGn[colors.length].map(d => d3.interpolateRgb(d, '#7fd1ae')(0.382)))
        .unknown("#ccc");

  // Declare the lines
  const lines = {};
  const y_max = d3.max(data, d => d.durations["Total"]);
  const y_min = d3.min(data, d => d.durations["Total"]);
  lines["Total"] = d3.line()
    .x(d => x(d.date))
    .y(d => y((d.durations["Total"] - y_min) / (y_max - y_min)))
    .curve(d3.curveCardinal.tension(.618));
  for (var k in ks) {
    k = ks[k];
    const y_max = d3.max(data, d => d.durations[k]);
    const y_min = d3.min(data, d => d.durations[k]);
    lines[k] = d3.line()
      .x(d => x(d.date))
      .y(d => y((d.durations[k] - y_min) / (y_max - y_min)))
      .curve(d3.curveCardinal.tension(.618));
  }

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

  // Add the x-axis.
  svg.append("g")
      .attr("transform", `translate(0,${height + 10 - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .call(g => g.selectAll(".domain").remove());

  // Add the y-axis, remove the domain line, add grid lines and a label.
  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(height / 40))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", width - marginRight - 150)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("↑ Normalized Duration"));

  // Append a path for the line.
  for (var k in ks) {
    k = ks[k];
    svg.append("path")
      .attr("fill", "none")
      .attr("stroke", color(k))
      .attr("stroke-width", 3.437)
      .attr("stroke-linecap", "round")
      .attr("stroke-opacity", .5)
      .attr("transform", `translate(${(x(data[1].date)-x(data[0].date))/2},0)`)
      .attr("d", lines[k](data));
  }
  svg.append("path")
    .attr("fill", "none")
    .attr("stroke", color("Total"))
    .attr("stroke-width", 9)
    .attr("stroke-linecap", "round")
    .attr("transform", `translate(${(x(data[1].date)-x(data[0].date))/2},0)`)
    .attr("d", lines["Total"](data));

  for (k in ks) {
      $(div_id).append(`<div class="legend" style="background-color: ${color(ks[k])}">${ks[k]}</div>`);
  }
  $(div_id).append(`<div class="legend" style="background-color: ${color("Total")}">Total</div>`);

  $(div_id).append(svg.node());

  $(div_id).append(`<div style="text-align: center;">Convolution with Gaussian Kernel [${kernel.map(a => a.toFixed(2)).join(", ")}]</div>`);
}

function chart_area(data, width, color) {
  // Declare the chart dimensions and margins.
  const height = width / 2;
  const marginTop = 30;
  const marginRight = 0;
  const marginLeft = 30;
  const marginBottom = 30;

  // Declare the x (horizontal position) scale.
  const x = d3.scaleBand(data.map(d => d[0]), [marginLeft, width - marginRight]);

  // Declare the y (vertical position) scale.
  const y = d3.scaleLinear([0, d3.max(data, d => d[1])], [height - marginBottom, marginTop]);

  // Declare the area generator.
  const area = d3.area()
      .x(d => x(d[0]))
      .y0(y(0))
      .y1(d => y(d[1]))
      .curve(d3.curveMonotoneX);

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

  // Add the x-axis.
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom + 5})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
      .call(g => g.select(".domain").remove());

  // Append a path for the area.
  svg.append("path")
      .attr("fill", color)
      .attr("opacity", 0.7)
      .attr("d", area(data))
      .attr("transform", `translate(${(x(1)-x(0))/2},0)`);

  // Add the y-axis, remove the domain line, add grid lines and a label.
  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(height / 40))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("↑ Density"));

  return svg.node();
}

function kde(kernel, thresholds, data) {
  return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))]);
}

function epanechnikov(bandwidth) {
  return x => Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0;
}

function chart_distributions(data, day_div_id, hour_div_id, width, day_res, day_band, hour_res, hour_band) {
  const hours = [...Array(24).keys()];
  const days = [...Array(7).keys()];

  const days_data = [];
  for (i in data) {
    var start = new Date(data[i].start);
    var start = Math.round((start.getDay() + start.getHours()/24) / day_res) * day_res;
    const points = [...Array(1 + Math.round(data[i].duration/3600/24/day_res)).keys()].map(a => (start + a * day_res));
    days_data.push(...points);
  }
  const days_density = kde(epanechnikov(day_band), days, days_data);

  $(day_div_id).append(chart_area(days_density, width, "#69598c"));

  const hours_data = [];
  for (i in data) {
    var start = new Date(data[i].start);
    var start = Math.round((start.getHours() + start.getMinutes() / 60) / hour_res) * hour_res;
    const points = [...Array(1 + Math.round(data[i].duration/3600/hour_res)).keys()].map(a => (start + a * hour_res));
    hours_data.push(...points);
  }
  const hours_density = kde(epanechnikov(hour_band), hours, hours_data);

  $(hour_div_id).append(chart_area(hours_density, width, "#2b9651"));
}

function chart_time_entries(response, active_days) {
  const projects = response['projects'];
  const clients = response['clients'];
  const result = response['last_30'].reduce(
    function(r, a){
        const name = a.description;
        const duration = a.duration / 3600;
        const tags = a.tags;
        const pid = a.project_id;
        const proj_name = projects[pid].name;
        let date = new Date(a.start);
        date.setHours(0,0,0,0);
        date = `${date.getMonth()+1}/${date.getDate()}`

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
            r[2][ti].entries += 1;
          }
          else {
            const entry = {
              name: tags[t],
              entries: 1,
              duration: duration
            };
            r[2].push(entry);
          }
        }

        // time entries project data
        const pi = r[3].findIndex(e => (e.name == projects[pid].name));
        if (pi != -1) {
          r[3][pi].duration += duration;
          r[3][pi].entries += 1;
        }
        else {
          const entry = {
            name: proj_name,
            duration: duration,
            entries: 1,
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

        // date data
        const di = r[5].findIndex(e => (e.date == date));
        if (di != -1) {
          r[5][di].total_duration += duration;
          if (proj_name in r[5][di].durations) {
            r[5][di].durations[proj_name] += duration;
          }
          else {
            r[5][di].durations[proj_name] = duration;
          }
          for (let t in tags) {
            tag = tags[t];
            if (tag in r[5][di].tag_durations) {
              r[5][di].tag_durations[tag] += duration;
            }
            else {
              r[5][di].tag_durations[tag] = duration;
            }
          }
        }
        else {
          const entry = {
            date: date,
            total_duration: duration,
            durations: {},
            tag_durations: {}
          };
          entry.durations[proj_name] = duration;
          for (let t in tags) {
            tag = tags[t];
            entry.tag_durations[tag] = duration;
          }
          r[5].push(entry);
        }

        return r;
    },
    [[], 0, [], [], [], []]
  );
  const total_duration = result[1];
  const time_entries_data = result[0].sort((a, b) => d3.ascending(a.duration, b.duration));
  const time_entries_tags_data = result[2].sort((a, b) => d3.descending(a.duration, b.duration));
  const projects_data = result[3].sort((a, b) => d3.descending(a.duration, b.duration));
  const clients_data = result[4].sort((a, b) => d3.descending(a.duration, b.duration));
  const date_data = result[5];

  // *************
  // weights
  // *************

  const weights = {
    "Default": 10,
    "Study": 16.49,
    "Read": 13.17,
    "Survey": 6.87,
    "Implement": 12.5,
    "Blog": 11.09,
    "Review": 9.87,
    "Research": 19.67
  };

  // *************
  // pie charts
  // *************
  
  let width = ($("#time-entries-ratio").width() - 20) / 3;

  chart_pie(projects_data, "#project-pie", width, "hrs", active_days);

  chart_pie(
    projects_data.map(function(d) {
      if (weights[d.name] == undefined) {
        return {name: d.name, duration: d.duration * weights["Default"]};
      }
      else {
        return {name: d.name, duration: d.duration * weights[d.name]};
      }
    }), "#weighted-project-pie", width, "$", active_days);

  chart_pie(clients_data, "#client-pie", width, "hrs", active_days);

  $("#time-entries-ratio").append(`<div style="text-align: center; grid-column: 1; grid-row: 2">Projects</div>`);
  $("#time-entries-ratio").append(`<div style="text-align: center; grid-column: 2; grid-row: 2">Income*</div>`);
  $("#time-entries-ratio").append(`<div style="text-align: center; grid-column: 3; grid-row: 2">Clients</div>`);

  // *************
  // focus chart
  // *************

  width = ($("#time-entries-focus").width() - 20) / 2;
  chart_focus_bar(time_entries_data, "#time-entries-bar", width, 1, "Materials");
  chart_focus_bar(time_entries_tags_data, "#time-entries-tag-bar", width, 0, "Categories");

  // append titles
  $("#time-entries-focus").append(`<div style="text-align: center; grid-column: 1; grid-row: 2">Focus Distribution for ${time_entries_data.length} Materials</div>`);
  $("#time-entries-focus").append(`<div style="text-align: center; grid-column: 2; grid-row: 2">Focus Distribution for ${time_entries_tags_data.length} Categories</div>`);

  // *************
  // time lag comparison chart
  // *************

  const time_lag = 7; // time lag in days

  const comps = date_data.slice(-time_lag-1, -1).reduce(
    function (r, a) {
      for (const k in a.durations) {
        if (k in r[0]) {
          r[0][k] += a.durations[k];
        }
        else {
          r[0][k] = a.durations[k];
        }
      }
      for (const k in a.tag_durations) {
        if (k in r[1]) {
          r[1][k] += a.tag_durations[k];
        }
        else {
          r[1][k] = a.tag_durations[k];
        }
      }
      return r;
    },
    [{}, {}]
  );

  const proj_comp = comps[0];
  const tag_comp = comps[1];

  const current = date_data[date_data.length-1];
  const proj_ks = Object.keys(proj_comp);
  const tag_ks = Object.keys(tag_comp);
  const comp_ks = proj_ks.concat(tag_ks);

  const comp_canvas = document.getElementById('comparisons-canvas');
  const comp_chart = new Chart(comp_canvas, {
    type: 'bar',
    data: {
      labels: comp_ks,
      datasets: [
        {
          label: 'Projects and Categories',
          data: comp_ks.map(
            function (a) {
              if (a in current.durations) {
                return current.durations[a] - proj_comp[a]/time_lag;
              }
              else if (a in current.tag_durations) {
                return current.tag_durations[a] - tag_comp[a]/time_lag;
              }
              else if (a in proj_comp) {
                return 0 - proj_comp[a]/time_lag;
              }
              else {
                return 0 - tag_comp[a]/time_lag;
              }
            }
          ),
          backgroundColor: comp_ks.map(
            function (a) {
              if (a in proj_comp) {
                return 'rgba(105, 89, 140, 0.2)';
              }
              else {
                return 'rgba(43, 150, 80, 0.2)';
              }
            }
          ),
          borderColor: comp_ks.map(
            function (a) {
              if (a in proj_comp) {
                return 'rgba(105, 89, 140, 0.7)';
              }
              else {
                return 'rgba(43, 150, 80, 0.7)';
              }
            }
          )
        }
      ]
    },
    options: {
      responsive: true,
      aspectRatio: 2.8,
      plugins: {
        title: {
          display: false
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {display: false},
          border: {display: false}
        },
        y: {
          border: {display: false}
        }
      }
    }
  });

  $("#time-lag-comparisons").append(`<div style="text-align: center;">Work Comparison of Latest Day Against Past ${time_lag} Days</div>`);

  // *************
  // radar chart
  // *************

  const proj_radar_canvas = document.getElementById('time-entries-project-radar');

  const proj_radar = new Chart(proj_radar_canvas, {
    type: 'radar',
    data: {
      labels: projects_data.map(d => d.name),
      datasets: [{
        label: 'Average Project Entry Duration',
        data: projects_data.map(d => d.duration / d.entries),
        fill: true,
        backgroundColor: 'rgba(105, 89, 140, 0.2)',
        borderColor: 'rgba(105, 89, 140, .7)',
        pointBackgroundColor: 'rgba(105, 89, 140, .7)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(105, 89, 140)'
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          ticks: {
            maxTicksLimit: 5
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });

  const cate_radar_canvas = document.getElementById('time-entries-category-radar');

  const cate_radar = new Chart(cate_radar_canvas, {
    type: 'radar',
    data: {
      labels: time_entries_tags_data.map(d => d.name),
      datasets: [{
        label: 'Average Category Entry Duration',
        data: time_entries_tags_data.map(d => d.duration / d.entries),
        fill: true,
        backgroundColor: 'rgba(43, 150, 80, 0.2)',
        borderColor: 'rgba(43, 150, 80, .7)',
        pointBackgroundColor: 'rgba(43, 150, 80, .7)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(43, 150, 80)'
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          ticks: {
            maxTicksLimit: 5
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });

  // append titles
  $("#time-entries-radars").append(`<div style="text-align: center; grid-column: 1; grid-row: 2">Average Duration per Entry for Each Project</div>`);
  $("#time-entries-radars").append(`<div style="text-align: center; grid-column: 2; grid-row: 2">Average Duration per Entry for Each Category</div>`);

  // *************
  // time entries distribution chart
  // *************

  width = ($("#time-entries-distribution").width() - 20) / 2;

  chart_distributions(response["last_30"], "#days-density", "#hours-density", width, .1, 1, .1, 3);

  // append titles
  $("#time-entries-distribution").append(`<div style="text-align: center; grid-column: 1; grid-row: 2">Focus Density for One Week</div>`);
  $("#time-entries-distribution").append(`<div style="text-align: center; grid-column: 2; grid-row: 2">Focus Density for One Day</div>`);

  // *************
  // moving average chart
  // *************

  width = $("#time-entries-ratio").width();

  chart_moving_average(date_data, projects_data.map(d => d.name), "#time-entries-moving-average", width, 10);
}


// Get data from toggl
$.ajax({
    url: "https://asia-east2-toggltrack-402101.cloudfunctions.net/function-toggl-feed",
    data: {req_all: true},
    dataType: "json",
    format: "json",
    crossDomain: true,
    success: function( response ) {
        const active_days = chart_overview(response);
        chart_time_entries(response, active_days);
        $("#footnote").append(`*Income is estimated from the importance weighted project durations instead of actual rates.`);
    }
});

