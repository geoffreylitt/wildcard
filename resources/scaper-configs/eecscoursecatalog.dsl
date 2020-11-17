{
  name: "MIT EECS Course Catalog",
  contains: "eecs.scripts.mit.edu/eduportal/who_is_teaching_what/F/2020",
  attributes: [
    { name: "id", type: "text", hidden: true },
    { name: "number", type: "text" },
    { name: "title", type: "text" },
    { name: "mode", type: "text" },
    { name: "lecturers", type: "text" },
    { name: "recitation instructors", type: "text" }
  ],
  scrapePage: () => {
    return Array.from(document.querySelectorAll("tr[id]")).map(el => {
      let courseData = el.getElementsByTagName("td")
      let courseNumber = el.id
      let courseName = courseData[0].innerText

      return {
        id: courseNumber,
        rowElements: [el],
        dataValues: {
          number: courseNumber,
          title: courseName.substring(courseNumber.length + 1),
          mode: courseData[1].innerText,
          lecturers: courseData[2].innerText,
          "recitation instructors": courseData[3].innerText
        }
      }
    })
  },
  onRowSelected: (row) => {
    row.rowElements.forEach(el => {
      if (el.style) {
        el.style["background-color"] = `#c9ebff`
      }
    });
    row.rowElements[0].scrollIntoView({ behavior: "smooth", block: "center" })
  },
  onRowUnselected: (row) => {
    row.rowElements.forEach(el => {
      if (el.style) {
        el.style["background-color"] = ``
      }
    })
  }
}