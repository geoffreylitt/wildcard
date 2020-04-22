'use strict';

import { extractNumber, urlExact, urlContains } from "../utils"
import { createDomScrapingAdapter } from "./domScrapingBase"
import * as moment from 'moment';

const WeatherChannelAdapter = createDomScrapingAdapter({
    name: "Weather Channel",
    enabled: () => {
        return urlContains("https://weather.com/weather/hourbyhour")
    },
    attributes: [
        { name: "id", type: "text", hidden: true },
        { name: "Time", type: "time", timeFormat: 'h:mm:ss a',
            correctFormat: true },
        { name: "Description", type: "text"},
        { name: "Temp °F", type: "numeric"},
        { name: "Feels °F", type: "numeric"},
        { name: "Precip %", type: "numeric"},
        { name: "Humidity %", type: "numeric"},
        { name: "Wind", type: "text"}
    ],
    scrapePage: () => {
        let tableRows = document.querySelector('.twc-table').querySelectorAll("tr");
        //tableRows includes the heading, so we don't want to include that
        let arrayOfRows = Array.from(tableRows);
        arrayOfRows.shift();
        return arrayOfRows.map(el => {
            return {
                rowElements: [el],
                id: el.querySelector('.dsx-date').textContent,
                dataValues: {
                    Time: el.querySelector('.dsx-date'),
                    Description: el.querySelector('.description').children[0],
                    'Temp °F': el.querySelector('.temp').children[0],
                    'Feels °F': el.querySelector('.feels').children[0],
                    'Precip %': el.querySelector('.precip').children[0],
                    'Humidity %': el.querySelector('.humidity').children[0],
                    Wind: el.querySelector('.wind').children[0],
                },
            }
        })
    },
    // Reload data anytime there's a click or keypress on the page
    addScrapeTriggers: (reload) => {
        document.addEventListener("click", (e) => { reload() });
        document.addEventListener("keydown", (e) => { reload() });
    }
});

export default WeatherChannelAdapter;

