---
layout: index
title: Research
permalink: /research
sidebar_link: true
---

## Declaration
I regularly post my research products here including publications, data, code and surveys. Anything published here is free to use, but please consider quoting me.

## Surveys

A compilation of papers for which I have written personal survey notes.

<table style="font-size: 1rem;">
	<tr>
		<th>Category</th>
		<th>Paper</th>
	</tr>
	{% assign categories = site.surveys | map: "categories" | uniq | sort %}
	{% for category in categories%}
	{% assign surveys = site.surveys | where: "categories", category %}
	<tr>
		<th rowspan={{surveys | size}}>{{category}}</th>
		<td>
			<a href="{{surveys[0].url}}">{{surveys[0].title}}</a>
			<br>
			<div style="text-align: right;">
			{% for tag in surveys[0].tags %}
			<span style="background: lightgrey; padding: 3px; color: white; border-radius: 5px; font-size: .7rem;">{{tag}}</span>
			{% endfor %}
			</div>
		</td>
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
					{% for tag in surveys[0].tags %}
					<span style="background: lightgrey; padding: 3px; color: white; border-radius: 5px; font-size: .7rem;">{{tag}}</span>
					{% endfor %}
					</div>
				</td>
				{% endif %}
			{% if imod2 == 0 or forloop.last %}
			</tr>
			{% endif %}
		{% endfor %}
	{% endfor %}
</table>