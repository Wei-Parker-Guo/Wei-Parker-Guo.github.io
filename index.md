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
    "One must imagine Sisyphus happy.",
    "踏遍青山人未老，风景这边独好。",
    "The only way around is through.",
    "马作的卢飞快，弓如霹雳弦惊。",
    "Pain is inevitable. Suffering is optional.",
    "上善若水，利万物而不争。",
    "dum vivimus, vivamus.",
    "胜人者有力，自胜者强。",
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

# Index
Please [contact me](/email) if you need anything else.

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

# Activities
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

<br>

<!-- Progress Bars -->
<div class="container_flex">
  <div id="progress-bar-0" class="progress-bar" value="9" max="20">
    Posts Published: 9/20
  </div>
  <div id="progress-bar-1" class="progress-bar" value="42.5" max="100">
    Pages Written: 42.5/100
  </div>
  <div id="progress-bar-2" class="progress-bar" value="1.68" max="3">
    Reading Time: 1.68/3 hrs
  </div>
</div>

---

# Axioms
Without some "self-evident" beliefs, I cannot express myself. Therefore, for all my products on this site, I hold the following axioms to be true:

1. **What I believe in:**
    1. Knowledge belongs to everyone, and should stay available to everyone.
    2. Learning.
    3. 积累（Curiously, there is no exact mapping of this word in English!）
    4. Non-zero-sum games.
    5. Future is generative instead of deterministic.

2. **What I don't believe in:**
    1. A solution eliminates its problem.
    2. Assumptions.
    3. Appointed genius.
    4. Authority over reality.
    5. A person without [humor](/humor).

But I also don't believe in believing beliefs! It's not a paradox if you think about it carefully.

---

# Disclaimers

<b>Pronoun Usage: </b><br>
By Axiom 1.1, and a common narrating perspective, "we" is often used despite of the fact that I'm not directly involved in others' works. I appreciate your understanding in this matter.

Situation often arises for the usage of gender neutral pronouns. For ease of reading, sometimes only a random pronoun is drawn instead of "he/she". This by no means conveys any gender bias from the author.

<b>Personal Opinions: </b><br>
As this site contains a blog, a lot of personal opinions exist throughout the posts. I stand by Axiom 2.4, but welcome discussions.

<b>References: </b><br>
I try to provide references to others' works throughout the posts. Exact quotations are not made for ease of reading. However, I make sure every reference is presented properly.


</div>

