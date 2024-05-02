---
layout: home
title: Home
permalink: /
---

<!-- Slogans -->
<style>
  #slogan {
    text-align: center;
    margin-top: .7rem;
    font-family: ZiShiZhengKai, ZanHuaXiaoKai, Kai, sans-serif;
  }
</style>

<script type="text/javascript">
  const slogans = [
    "That which is done out of love is always beyond good and evil.",
    "稻花香里说丰年，听取蛙声一片。",
    "Information is merely a means to insight.",
    "知不可乎骤得，惟江上之清风。",
    "Sisyphus is happy.",
    "踏遍青山人未老，风景这边独好。",
    "The only way around is through.",
    "马作的卢飞快，弓如霹雳弦惊。",
    "There are no beautiful surfaces without a terrible depth.",
    "欲待曲终寻问取，人不见，数峰青。"
  ];
  var si = Math.floor(Math.random() * slogans.length);
  function changeSlogan() {
    var display = document.getElementById('slogan');
    display.innerHTML = slogans[si];
    si = (si + 1) % slogans.length;
  }
</script>


<!-- Progress Bars -->
<script src="/assets/js/jquery-3.6.0.min.js"></script>
<script src="/assets/js/progressbar.min.js"></script>
<script src="/assets/js/progress.js"></script>
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>

<div class="text_block" markdown="1">

## Index

<div class="container_flex">

  <div>
    <a class="no-link-color" href="/about">
     <i class="icon_button material-icons">sentiment_very_satisfied</i>
    </a>
     <p class="no_line_height">About</p>
   </div>

   <div>
    <a class="no-link-color" href="/research">
     <i class="icon_button material-icons">data_usage</i>
   </a>
     <p class="no_line_height">Research</p>
   </div>

   <div>
     <i class="icon_button material-icons">catching_pokemon</i>
     <p class="no_line_height">Projects</p>
   </div>

   <div>
    <a class="no-link-color" href="/blog">
     <i class="icon_button material-icons">cookie</i>
   </a>
     <p class="no_line_height">Blogs</p>
   </div>

</div>

<div id="slogan" onmouseover="changeSlogan()"></div>
<script type="text/javascript">
  changeSlogan();
</script>

---

## Activities
You need to disable adblocker for some **realtime** statistics.

<!-- Toggl Activities -->
<div id='toggl' width='100%'></div>
<script src='/assets/js/togglfeed.js'></script>

<!-- Calendar Heatmap -->
<a href='https://github.com/Wei-Parker-Guo'>
  <img src="http://ghchart.rshah.org/7fd1ae/Wei-Parker-Guo" alt="My Git Chart" width="100%" />
</a>
<div style="text-align: center;">My Github Commits</div>

<br>

---

## Disclaimers

<b>Pronoun Usage: </b><br>
By a common narrating perspective, "we" is sometimes used despite of the fact that I'm not directly involved in others' works. I appreciate your understanding in this matter.

<b>Personal Opinions: </b><br>
As this site contains a blog, a lot of personal opinions exist throughout the posts.

<b>References: </b><br>
I try to provide references to others' works throughout the posts. Exact quotations are not made for ease of reading. However, I make sure every reference is presented properly.


</div>

