# Amazon Gallery

When browsing through used products on Amazon, users are not shown the total cost of these product. With Wildcard, they can not just see the total cost but also sort the items in the page by price, rating, condition, delivery date, etc.

<div class="w3-content w3-display-container">

<img class="galleryImages" src="examples/_images/amazon/wildcard_closed.png" alt="Educated by Tara Westover without Wildcard" style="display:block;">
<figcaption class="figcaption" style="display:block"> Amazon listings before Wildcard is opened </figcaption>

<img class="galleryImages" src="examples/_images/amazon/wildcard_open.png" alt="Educated by Tara Westover with Wildcard opened">
<figcaption> Wildcard opened on the page. Notice how relevant information has been extracted into the spreadsheet. </figcaption>

<img class="galleryImages" src="examples/_images/amazon/select_cell_highlighted.png" alt="Specific row selected">
<figcaption> When the user selects a row, the corresponding element is highlighted in Wildcard. </figcaption>

<img class="galleryImages" src="examples/_images/amazon/ascended_sort.png" alt="Total price sorted in ascending order">
<figcaption> Wildcard computes the total price from the three listed per item, and sorts the total price in ascending order. </figcaption>

<img class="galleryImages" src="examples/_images/amazon/descended_sort.png" alt="Total price sorted in descending order">
<figcaption>  On the other hand, Wildcard can sort price in descending order. </figcaption>

<img class="galleryImages" src="examples/_images/amazon/cheap_item.png" alt="Books sorted by condition">
<figcaption> Notice that by sorting the condition of the books, the user will find that the New copy costs only $1.06 more than the used copy.</figcaption>

<div class="w3-center w3-container" style="width:100%">
    <div class="w3-left w3-display-left" onclick="moveBy(-1)">&#10094;</div>
    <div class="w3-right w3-display-right" onclick="moveBy(1)">&#10095;</div>
    <span class="w3-badge demo w3-white w3-border w3-hover-lime" onclick="moveToFigure(1)"></span>
    <span class="w3-badge demo w3-green w3-border w3-hover-lime" onclick="moveToFigure(2)"></span>
    <span class="w3-badge demo w3-green w3-border w3-hover-lime" onclick="moveToFigure(3)"></span>
    <span class="w3-badge demo w3-green w3-border w3-hover-lime" onclick="moveToFigure(4)"></span>
    <span class="w3-badge demo w3-green w3-border w3-hover-lime" onclick="moveToFigure(5)"></span>
    <span class="w3-badge demo w3-green w3-border w3-hover-lime" onclick="moveToFigure(6)"></span>
</div>

</div>
