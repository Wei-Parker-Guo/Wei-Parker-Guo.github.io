---
layout: index
title: Activities
permalink: /activities
sidebar_link: false
---

<style>
	.legend {
		display: inline-block;
		border-radius: 10px;
		font-size: .7rem;
		color: white;
		padding: 1px 10px 1px 10px;
		margin: 0 .3rem .1rem .3rem;
	}
	.radar-div {
		width: 80%;
		margin-left: auto;
		margin-right: auto;
	}
</style>

## Activities
This page offers a more detailed dashboard of statistics for my **realtime** daily activities recorded. Please [contact me](/email) with good reasons if you are interested in the entire dataset collected since September 2023.

---

<script src="/assets/js/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<div id="overview" width="100%"></div>

---

<div id="time-entries-ratio" style="display: grid; grid-gap: 10px; width: 100%">
	<div id="project-pie" style="grid-column: 1; grid-row: 1;"></div>
	<div id="weighted-project-pie" style="grid-column: 2; grid-row: 1;"></div>
	<div id="client-pie" style="grid-column: 3; grid-row: 1;"></div>
</div>

---

<div id="time-entries-focus" style="display: grid; grid-gap: 10px; width: 100%;">
	<div id="time-entries-bar" style="grid-column: 1; grid-row: 1;"></div>
	<div id="time-entries-tag-bar" style="grid-column: 2; grid-row: 1;"></div>
</div>

---

<div id="time-lag-comparisons" style="width: 100%">
	<canvas id="comparisons-canvas"></canvas>
</div>

---

<div id="time-entries-radars" style="display: grid; grid-gap: 10px; width: 100%">
	<div class="radar-div" id="time-entries-radar-1" style="grid-column: 1; grid-row: 1;">
		<canvas id="time-entries-project-radar"></canvas>
	</div>
	<div class="radar-div" id="time-entries-radar-2" style="grid-column: 2; grid-row: 1;">
		<canvas id="time-entries-category-radar"></canvas>
	</div>
</div>

---

<div id="time-entries-distribution" style="display: grid; grid-gap: 10px; width: 100%;">
	<div id="days-density" style="grid-column: 1; grid-row: 1;"></div>
	<div id="hours-density" style="grid-column: 2; grid-row: 1;"></div>
</div>

---

<div id="time-entries-moving-average"></div>

---

<div id="footnote" style="text-align: right; font-size: .7rem;"></div>

<script src='/assets/js/activities.js'></script>

