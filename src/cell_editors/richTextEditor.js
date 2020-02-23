import Handsontable from 'handsontable';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import './richTextEditor.css'

let TEXTAREA_ID = "open-apps-rich-text-editor";

function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

class RichTextEditor extends Handsontable.editors.BaseEditor {
    constructor(hotInstance) {
        super(hotInstance);
    }

    init(){
        this.text = this.originalValue;
        this.initializeHTML();
    }

    getValue(){
        return this.editor.getData();
    }

    setValue(newValue){
        this.text = newValue;
    }

    open(){
        let oldValue = document.getElementById(TEXTAREA_ID).value;

        //Has to update the textarea for the rich text editor api to update as well
        if(this.text !== oldValue){
            this.destroyEditor();
            document.getElementById(TEXTAREA_ID).value = this.text;
            this.createEditor();
        }

        this.textEditorDiv.style.display = '';
    }

    initializeHTML(){
        this.textEditorDiv = htmlToElement(`<div id="open-apps-rich-text-editor-container"><textarea id=${TEXTAREA_ID}>${this.text}</textarea></div>`);
        document.body.appendChild(this.textEditorDiv);

        this.createEditor();

        this.textEditorDiv.style.display = "none";
        this.textEditorDiv.addEventListener('mousedown', e => {
            event.stopPropagation();
        });
    }

    createEditor(){
        this.richTextEditor = ClassicEditor.create( document.querySelector(`#${TEXTAREA_ID}`))
            .then( newEditor => {
                this.editor = newEditor;
            })
            .catch( error => {
                console.error(error);
            });
    }

    destroyEditor(){
        this.editor.destroy()
            .catch( error => {
                console.log( error );
            });
    }

    close(){
        this.textEditorDiv.style.display = 'none';
    }

    focus(){
        this.textEditorDiv.focus();
    }
}

export {RichTextEditor};
