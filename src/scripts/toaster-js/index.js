import { toaster } from "./Toaster.js";
import Input from "../../components/Input.svelte";
import TextInput from "../../components/TextInput.svelte";
import PalettesExport from "../../components/PalettesExport.svelte";
import PaletteSettings from "../../components/PaletteSettings.svelte";
import Buttons from "../../components/Buttons.svelte";
import { recolorPaletteIcons } from "../colorHelpers.js";

/* I added this initially for any input coming from a Toast, so I can just pass the input type and then it will execute here. Yeah yeah terrible place for this code, whatever!! */


const cancel = () => {
	console.log('CANCEL!!');
	// this is bad as what if we are displaying an error on top of our full window modal?
	//	deleteAllToasts();
	deleteTopToast();
}

/* here is how you can use this component!! 
                deleteAllToasts(); 
                let element = document.createElement("div"); 
                element.textContent = "Please enter a set name";
   //             let newToast = new Toast(element,'toast','toast-success'); //console.log('code is now ' + code)
   
                let newToast = new Toast(element,'modal','input',0); //console.log('code is now ' + code)
   
             //   element.parentNode.parentNode.addEventListener("click", () => newToast.delete()); // delete a toast on message click!
  
                element.addEventListener("click", () => newToast.delete()); // delete a toast on message click!
*/


Toast.TYPE = "toast" // possible 'toast', 'modal', 'fullscreen'  => this becomes the className for the outer div
Toast.MODE = "info";  /* possible: => this is added to the classNames for the inner div

                            'toast info' - regular side served fading toast blue w/ info icon
                            'toast success' - regular side served fading toast green with success icon
                            'toast error' - regular side served fading toast red w/ error icon
                            'modal success' - modal middle fading success like windowise
                            'modal error' - modal middle fading error like windowise
                            'modal info' - modal middle, blue - info like windowise
                            'modal warning' - modal middle, yellow - warning like windowise
                            'modal input' - only for modal middle, orange - input like windowise

                            */

Toast.BUTTONS = []; // possible [], ['ok'], ['ok', 'cancel']

Toast.TIME_SHORT = 2000;
Toast.TIME_NORMAL = 4000;
Toast.TIME_LONG = 8000;
Toast.TIME_STICK = 0;
Toast.INPUT_TYPE = 'import_palette';
Toast.SHOWICON = true;

let options = {
	deleteDelay: 350,
    topOrigin: 0
};

/**
 * Allows you to configure Toasts options during the application setup.
 * @param newOptions
 */
export function configureToasts (newOptions = {}) {
    Object.assign(options, newOptions);
}

/**
 * Delete the TOP toast in case we have more than 1 displayed
 */
export function deleteTopToast () {
    return toaster.removeTop();
}


/**
 * Delete all toast currently displayed.
 */
export function deleteAllToasts () {
    return toaster.removeAll();
}

/**
 * On-screen toast message.
 * @param {string|Element} text - Message text.
 * @param {string} [mode] - Toast.MODE_*
 * @param {number} [timeout] - Toast.TIME_*
 * @constructor
 */
export function Toast (text = `No text!`, type = Toast.TYPE, mode = Toast.MODE, timeout = Toast.TIME_SHORT, buttons = Toast.BUTTONS, input_type = Toast.INPUT_TYPE, showicon = Toast.ICON) {
	
	//console.log('input_type is '+input_type);

    let el1 = document.createElement("div"),
        el2 = document.createElement("div"),
        el3 = document.createElement("div"), // added this for our text so we can adjust text/icons inline-block
        icon = document.createElement("div");
    
    if (type == 'modal') {
        var overlay = document.createElement("div"),
        wrapper = document.createElement("div");
        overlay.className = 'modal-overlay';
        wrapper.className = 'modal-wrapper ';
    }

    icon.className = type+'-icon-holder';
    el1.className = type ;//+ ' animated zoomIn';
    el2.className = `modal-body ${type}-${mode} animated zoomIn`;

  //  el1.appendChild(el2);
    el2.appendChild(el3);

    if (text instanceof Element) {
        el3.appendChild(text);
    } else {
	    el3.textContent = `${text}`;
    }
    el3.className = type+'-message noselect';

    let svg;
    let cat = mode;
    
    // add icons from windowise, when not fullscreen, and we didn't override w/ an icon FALSE flag...
    if (cat != 'fullscreen' && showicon) {
      //console.log('addding svg for '+cat)
        svg = this.addicon(mode);
        icon.innerHTML = svg;
        el2.appendChild(icon);
    }
    else {
   // nada
    }
    
    if (type == 'modal') {
        document.body.appendChild(overlay);
        /* comment this out if you want to disable closing on click overlay */
        overlay.addEventListener("click", () => this.delete());      
        wrapper.appendChild(el2);
        this.element = wrapper;
    }
    else {
        this.element = el1;
    }

    /* this is how easy it is to add a Svelte component inside another es6 module...

	const app = new App({
		target: document.body,
		props: {
			name: 'world'
		}
	});
	*/

    if (cat == 'input') {
        var input;
        if (input_type == 'import_palette') {
            input = new TextInput({
                target: el2,
                props: {
                    placeholder: 'enter text',
                    maxLength: 80,
					input_type: input_type,
                }
            });
        }
        else {
            input = new Input({
                target: el2,
                props: {
                    placeholder: 'enter text',
                    maxLength: 20,
					input_type: input_type,					
                }
            });       
		}
    }

    if (cat == 'fullscreen') {

        if(input_type == 'palettesExport') {
                let component = new PalettesExport({
                    target: el2,
                });
        }
		if (input_type == 'paletteSettings') {
				let component = new PaletteSettings({
                    target: el2,
                    data: {
                        
                    }
                });			
			el2.classList.add('settingsModal');
		}
    // fullscreen logic here

        let close = document.createElement("div");
		
        close.className = 'modal-close animatedLong fadeIn';
        close.addEventListener("click", () => this.delete());      
        el2.appendChild(close);
    }


 /* I added the 'value' attr so we could pass a value to the fn, like deleting a palette by name. I futher added input to pass the input text when the modal is just checking a name or something from another input field like the palette importer */
    if (cat == 'warning') {
        let val = buttons[1].value || false;
        let props = {
             btn1: buttons[0].text,
             btn2: buttons[1].text,
             action1: buttons[0].action,
             action2: buttons[1].action,
             value: val,
			 input: buttons[1].input || false
         }
         if (buttons[2]) {
            props.btn3 = buttons[2].text;
            props.action3 = buttons[2].action;
         }
        
		console.log('our buttons json is '+JSON.stringify(buttons));

        let input = new Buttons({
         target: el2,
         props: props
        });
    }
    if (cat == 'error' && buttons.length>0) {
        var input = new Buttons({
            target: el2,
            props: {
                btn1: buttons[0].text,
				action1: buttons[0].action,
            }
           });
    }

    this.position = 0;
    toaster.push(this, cat, timeout);
}

/**
 * Attaches toast to DOM and returns the height of the element.
 */
Toast.prototype.attach = function (position,cat) {
	
    this.position = position;
    this.updateVisualPosition(cat);
    document.body.appendChild(this.element);

    requestAnimationFrame(() => {
	    this.element.classList.add("displayed");
    });
    return this.element.offsetHeight;

};

/**
 * Seek the toast message by Y coordinate.
 * @param delta
 */
Toast.prototype.seek = function (delta) {

    this.position += delta;
    let cat = Toast.mode;
    /* I am not doing stacked toasts and it messes up my modals, so I am disabling this */
    this.updateVisualPosition(cat);

};

/**
 * @private
 */
Toast.prototype.updateVisualPosition = function (cat) {

    requestAnimationFrame(() => {
    /* add style, colors for mode. We could also adjust text or box-shadow here. */

  //  color: white;
  //  text-shadow: 0 0 1px black;
	let colors = {
		info: 'rgba(42, 128, 255, 0.95)', 
		warning: 'rgba(255, 183, 99, 0.95)',
		error: 'rgba(255, 86, 86, 0.95)',
        success: 'rgba(45, 193, 80, 0.95)',
        fullscreen: '#ffffff'
    }
    let text = {
        warning: '#3c4148f2'
    }
    colors.input = colors.info;


    var bod = this.element.getElementsByClassName('modal-body')[0];
    if (bod) 
	{
		bod.style.background =  colors[cat];
	}
    
    if (cat == 'warning' && bod)  {
      
	  bod.firstChild.style.color =  text[cat];
    }

        //   this.element.style.bottom = -options.topOrigin + this.position + "px";
    });

};

/**
 * Removes toast from DOM.
 */
Toast.prototype.detach = function () {

    let self = this;


    if (!this.element.parentNode) return;

    requestAnimationFrame(() => {
        this.element.classList.remove("displayed");
        this.element.classList.remove("zoomIn")
        this.element.classList.add("zoomOut");
    });
    setTimeout(() => {
        requestAnimationFrame(() => {
            if (!self.element || !self.element.parentNode)
                return;
            self.element.parentNode.removeChild(self.element);

            // added for modals, get rid of overlay too!
            let overlay = document.getElementsByClassName('modal-overlay')[0];

            if (overlay) {
                overlay.parentNode.removeChild(overlay)
            }   
       
        });
    }, options.deleteDelay);

};

Toast.prototype.delete = function () {

    toaster.remove(this);

};

Toast.prototype.addicon = function(mode) {

    let href = '';
    (mode == 'info') && (href = '#info-button');
    (mode == 'success') && (href = '#tick');
    (mode == 'error') && (href = '#cancel');
    (mode == 'input') && (href = '#danger');
    (mode == 'warning') && (href = '#danger');
  //  (mode == 'min') && (href = '#line');
  //  (mode == 'close') && (href = '#close');

    return '<svg class="toast-icon"><use xlink:href="'+href+'" /></svg>';
}
