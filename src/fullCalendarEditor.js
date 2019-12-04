import moment from 'moment';
import Handsontable from 'handsontable';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';

import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';
import '@fullcalendar/list/main.css';
import './fullCalendarEditor.css'

// convert HTML to a dom element
function htmlToElement(html) {
  var template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}

/**
 * @private
 * @editor DateEditor
 * @class DateEditor
 * @dependencies TextEditor
 */
class FullCalendarEditor {// extends Handsontable.editors.TextEditor {
  makeCalendar() {
    console.log("hey there")

    let newDiv = htmlToElement(`<div id="open-apps-calendar-container"><div id="open-apps-calendar"></div></div>`)
    document.body.appendChild(newDiv);

    var calendarEl = document.getElementById('open-apps-calendar');

    var calendar = new Calendar(calendarEl, {
      plugins: [ dayGridPlugin ]
    });

    calendar.render();
  }
}

export { FullCalendarEditor };
