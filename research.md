---
layout: index
title: Research
permalink: /research
sidebar_link: true
---

<style>
	.tag {
		background: lightgrey;
		padding: 3px;
		color: white;
		border-radius: 5px;
		font-size: .7rem;
	}
</style>

## Declaration
I regularly post my research products here including publications, data, code and surveys. Anything published here is free to use, but please consider quoting me.

---

## Publications
<table style="font-size: 1rem;">
	<tr>
		<th>Category</th>
		<th>Title</th>
		<th>Date</th>
	</tr>
	<tr>
		<th>Procedural Generation</th>
		<td><a href="https://doi.org/10.1016/j.cej.2023.142108">Enhancement of hollow Ni/CeO2-Co3O4 for CO2 methanation: From CO2 adsorption and activation by synergistic effects</a><br><div style="text-align: right;"><span class="tag">rendering</span> <span class="tag">visualization</span> <span class="tag">simulation</span></div></td>
		<td>2023-04</td>
	</tr>
</table>

---

## Surveys

A compilation of papers for which I have written personal survey notes.

<table style="font-size: 1rem;">
	<tr>
		<th>Category</th>
		<th>Paper</th>
		<th>Fresh</th>
	</tr>
	{% assign categories = site.surveys | map: "categories" | uniq %}
	{% for category in categories%}
	{% assign surveys = site.surveys | where: "categories", category | sort: "pub-date" | reverse %}
	<tr>
		<th rowspan={{surveys | size}}>{{category}}</th>
		<td>
			<a href="{{surveys[0].url}}">{{surveys[0].title}}</a>
			<br>
			<div style="text-align: right;">
			{% for tag in surveys[0].tags %}
			<span class="tag">{{tag}}</span>
			{% endfor %}
			</div>
		</td>
		<td>{{surveys[0].pub-date | date: "%Y-%m"}}</td>
	</tr>
		{% for survey in surveys %}
			{% assign imod2 = forloop.index | modulo: 2 %}
			{% if imod2 == 1 %}
			<tr>
			{% endif %}
				{% if survey.title != surveys[0].title %}
				<td>
					<a href="{{survey.url}}">{{survey.title}}</a>
					<div style="text-align: right;">
					{% for tag in survey.tags %}
					<span class="tag">{{tag}}</span>
					{% endfor %}
					</div>
				</td>
				<td>{{survey.pub-date | date: "%Y-%m"}}</td>
				{% endif %}
			{% if imod2 == 0 or forloop.last %}
			</tr>
			{% endif %}
		{% endfor %}
	{% endfor %}
</table>