import moment from 'moment';
import Handsontable from 'handsontable';
import { Calendar } from '@fullcalendar/core';
import googleCalendarPlugin from '@fullcalendar/google-calendar'
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

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

class FullCalendarEditor extends Handsontable.editors.BaseEditor {
  constructor(hotInstance) {
    super(hotInstance);
  }

  init () {
    this.selectedDate = new Date()

    this.calendarDiv = htmlToElement(`<div id="open-apps-calendar-container"><div id="open-apps-calendar"></div></div>`);
    document.body.appendChild(this.calendarDiv);

    this.calendar = new Calendar(document.getElementById('open-apps-calendar'), {
      plugins: [ interactionPlugin, dayGridPlugin, googleCalendarPlugin ],
      selectable: true,
      select: (info) => {
        console.log("selected ", info.start, info.end);
        this.selectedDate = info.start;
      },
      googleCalendarApiKey: 'AIzaSyCpKAQzhc5HOvQ1a7j1QXEKqpIAeEaawLE',
      events: {
        googleCalendarId: '858lgk6ojl7vio2e3d15gkppv4@group.calendar.google.com'
      }
    });
 
    this.calendar.render();
    this.calendarDiv.style.display = "none"

    this.calendarDiv.addEventListener('mousedown', e => {
      event.stopPropagation()
    });
  }

  getValue() {
    return moment(this.selectedDate).format("M/D/YYYY");
  }

  setValue(newValue) {
    let date = moment(newValue, "M/D/YYYY").toDate;
    this.calendar.select(date);
  }

  open() {
    this.calendarDiv.style.display = '';
  }

  close() {
    this.calendarDiv.style.display = 'none';
  }

  focus() {
    this.calendarDiv.focus();
  }
}

export { FullCalendarEditor };
