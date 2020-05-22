# Weather Gallery

Most of us have a weather app that we check daily. It usually has a chart that gives an hourly breakdown of the weather. But what if we wanted **more specific** information, eg. during what hour will it be warmest today? Let's see how Wildcard helps us to accomplish this. 

<div class="w3-content w3-display-container">

<img class="galleryImages" src="examples/_images/weather/wildcard_closed.png" alt="Weather Default View" style="display:block;">
<figcaption class="figcaption" style="display:block"> Weather Default View.  </figcaption>

<img class="galleryImages" src="examples/_images/weather/wildcard_open.png" alt="Weather Default View">
<figcaption> Default View with Wildcard Open. </figcaption>

<img class="galleryImages" src="examples/_images/weather/warmest.png" alt="Weather Default View">
<figcaption> Wildcard showing the warmest hours of the day. </figcaption>

<div class="w3-center w3-container" style="width:100%">
    <div class="w3-left w3-display-left" onclick="moveBy(-1)">&#10094;</div>
    <div class="w3-right w3-display-right" onclick="moveBy(1)">&#10095;</div>
    <span class="w3-badge demo w3-white w3-border w3-hover-lime" onclick="moveToFigure(1)"></span>
    <span class="w3-badge demo w3-green w3-border w3-hover-lime" onclick="moveToFigure(2)"></span>
    <span class="w3-badge demo w3-green w3-border w3-hover-lime" onclick="moveToFigure(3)"></span>
</div>

</div>