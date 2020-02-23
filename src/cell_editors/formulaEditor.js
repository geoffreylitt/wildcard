import Handsontable from 'handsontable';

class FormulaEditor extends Handsontable.editors.TextEditor {
  constructor(hotInstance) {
    super(hotInstance);
  }

  prepare(row, col, prop, td, originalValue, cellProperties) {
    super.prepare(row, col, prop, td, originalValue, cellProperties);
    console.log("meta:", cellProperties)
    if(cellProperties.formula) {
      this.formula = cellProperties.formula
    } else {
      this.formula = null
    }
  }

  // If cell contains a formula, edit the formula, not the value
  beginEditing(newValue, event) {
    let valueToEdit = newValue

    if (this.formula) {
      valueToEdit = this.formula
    }

    super.beginEditing(valueToEdit, event)
  }
}

export { FormulaEditor };
