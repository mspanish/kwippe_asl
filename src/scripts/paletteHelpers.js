 import { rgbToCMYK, hexToRgb, fromHSL } from './colorConverters.js';
 import { getColorDataEntry } from './colorHelpers.js';
 
 const importGPL = (input) => { 
	 let gpl = input.trim().split('\n')
	 //console.table(gpl);
	 let title = gpl[1].replace('Name:','').trim();
	 gpl = gpl.map(x => x.trim())
	  .filter(x => !(x[0].match(/[a-z]|#/i)))
	  .map(x => {
		const [r, g, b, name] = x.split(/[ |\t]+/g)
		return {
		  name,
		  r: Number(r),
		  g: Number(g),
		  b: Number(b),
		}
	  })
	  return {name: title, type: 'gpl', colors: gpl};
 }
 
 
 //given an array, saves each element in the array on its own line, then downloads the file in .CSV format
    //because colorData is a nested array, each line is saved in the format r, g, b    
    const saveAsCSV = function (data) {
        var saveString = "";
        
        if (data.length > 0) {
            data.forEach(function (color) {
                saveString = saveString + color.rgb[0] + "," + color.rgb[1] + "," + color.rgb[2] + "," + color.hex + "," + color.name +  "\n";
            });
            downloadBlob(saveString, "pal_" + timestamp() + ".csv", "text/csv");
        }
	};
    
    const saveAsASE = function (data) {
    
        var buffer,
            view,
            allStringsLength = 0,
            bufferLength,
            byteIndex = 0;

        //calculate the length of the buffer needed for the ASE file
        //signature: 4 bytes
        //version: 4 bytes
        //number of blocks: 4 bytes
        //FOR EACH BLOCK - colorData.length
        //block start indicator: 2 bytes
        //block size: 4 bytes
        //name string length: 2 bytes
        //name string: 2*(color[3].length + 1) (different for each color)
        //color mode: 4 bytes
        //RGB color values: 3*4 bytes
        //type: 1 byte
        //padding: 1 byte
        data.forEach(function (color) {
            allStringsLength += color.name.length + 1;
        });

        bufferLength = 4 + 4 + 4 + data.length * (2 + 4 + 2  + 4 + 12 + 2) + 2 * allStringsLength;

        // create an ArrayBuffer with a size in bytes
        buffer = new ArrayBuffer(bufferLength);
        view = new DataView(buffer);

        //Set file signature ASEF as the first 4 characters
        [].forEach.call("ASEF", function (character, index) {
            view.setUint8(index, character.charCodeAt(0));
        });
        byteIndex += 4;

        //Set the version to be 1.0
        view.setInt16(byteIndex, 1);
        byteIndex += 2;
        view.setInt16(byteIndex, 0);
        byteIndex += 2;

        //Set the number of blocks, equal to the number of colors
        view.setInt32(byteIndex, data.length);
        byteIndex += 4;

        //for each block (each block represents a single color)
        data.forEach(function (color) {

            //indicate the start of a block through 2 bytes 0x01?
            view.setInt16(byteIndex, 1);
            byteIndex += 2;

            //calculate the size of this block (not including this or previous bytes)
            //2 bytes for the blocks indicating the string length
            //2 bytes per character, plus 2 terminal bytes, for the name string: colorData[0][3].length
            //4 bytes for the color mode
            //12 bytes for red, green and blue (4 bytes each) (could be different for different color mode)
            view.setInt32(byteIndex, 20 + 2 * (color.name.length + 1));
            byteIndex += 4;

            //name string length - note this is for the string with a terminal blank, not the number of bytes
            view.setInt16(byteIndex, color.name.length + 1);
            byteIndex += 2;

            color.name.split("").forEach(function (character) {
                view.setUint8(byteIndex, 0);
                view.setUint8(byteIndex + 1, character.charCodeAt(0));
                byteIndex += 2;
            });
            view.setInt16(byteIndex, 0);
            byteIndex += 2;

            //Set the color mode to RGB in 4 bytes
            view.setUint8(byteIndex, "R".charCodeAt(0));
            byteIndex += 1;
            view.setUint8(byteIndex, "G".charCodeAt(0));
            byteIndex += 1;
            view.setUint8(byteIndex, "B".charCodeAt(0));
            byteIndex += 1;
            view.setUint8(byteIndex, " ".charCodeAt(0));
            byteIndex += 1;

            //Set the color values. Finally!
            view.setFloat32(byteIndex, color.rgb[0] / 255);
            byteIndex += 4;
            view.setFloat32(byteIndex, color.rgb[1] / 255);
            byteIndex += 4;
            view.setFloat32(byteIndex, color.rgb[2] / 255);
            byteIndex += 4;

            //Set the color type
            view.setUint8(byteIndex, 0); //global color, seems safest.
            byteIndex += 1;

            //final padding byte
            view.setUint8(byteIndex, 0);
            byteIndex += 1;
        });
		return buffer
       // downloadBlob(buffer, "pal_" + timestamp() + ".ase", 'application/octet-stream');
    };
    
    const saveAsSketch = function (colorData) {
        var colorPalette = [],
            fileData,
            saveString;

        colorData.forEach(function (color) {
            colorPalette.push({
                red: color.rgb[0] / 255,
                green: color.rgb[1] / 255,
                blue: color.rgb[2] / 255,
                alpha: 1
            });
        });

        fileData = {
            "compatibleVersion": "2.0", // min plugin version to load palette
            "pluginVersion": "2.14", //  version at the time this code was written
            "colors": colorPalette,
            "gradients": [],
            "images":  []
        };

        // Write file to chosen file path
        saveString = JSON.stringify(fileData);
        return saveString
        //downloadBlob(saveString, "pal_" + timestamp() + ".sketchpalette");
    };

    const timestamp = function () {
        var d = new Date(),
            yr = (d.getFullYear() % 100).toString(),
            mo = (d.getMonth() + 1).toString(),
            dy = d.getDate().toString(),
            hr = d.getHours().toString(),
            mi = d.getMinutes().toString();
        
        if (mo.length < 2) {
            mo = "0" + mo;
        }
        if (dy.length < 2) {
            dy = "0" + dy;
        }
        
        if (hr.length < 2) {
            hr = "0" + hr;
        }
        if (mi.length < 2) {
            mi = "0" + mi;
        }
        return yr + mo + dy + hr + mi;
    };
    
    const downloadBlob = function (data, fileName, mimeType) {
        var blob, url;
        blob = new Blob([data], {
            type: mimeType
        });
        url = window.URL.createObjectURL(blob);
        downloadURL(url, fileName);
        window.setTimeout(function () {
            return window.URL.revokeObjectURL(url);
        }, 1000);
    };
    
    //automatically downloads a file locally, by creating then emulating a click on a link
    //a bit hacky, but seemed the simplest way to get a file saved locally
    const downloadURL = function (data, fileName) {
        var a;
        a = document.createElement('a');
        a.href = data;
        a.download = fileName;
        document.body.appendChild(a);
        a.style = 'display: none';
        a.click();
        a.remove();
    };
	
const createTypeForExports = (type, colorPalettes, palettes) => {
	
  //  let data = [];
	let obj = {};
	let css = '';
	let array = [];
	let colorData = [];

  
   //console.log('running types '+type)
	switch (type) {
	 case 'SVG (current palette only)': 
		

		let svgs = document.getElementsByClassName('iconTop');
		//console.log('found '+ svgs.length+ ' no of svgs');
		let index = 0;
		for (let svg of svgs) {

			let svgInside = svg.innerHTML;
			array.push({path: 'palette'+index+'.svg', data:svgInside});
			index++;
		}
		
	    return array 
	 break;
	 
	
	  case 'GIMP Palette':
		 //   //console.log('running json_array')
		  
			let arr2 = [];
			
			for (let i = 0; i < palettes.length; i++) {
				//console.log('selectedPalette '+palettes[i])
				let palette = palettes[i];
				
				
				  let txt = `GIMP Palette\nName: ${palette}\nColumns: 12\n# made by https://palettes.kwippe.com`

				for (let e = 0; e < colorPalettes.length; e++) {
					if (colorPalettes[e].n == palette) {
						let tempArr = [];
						for (var c = 0; c <colorPalettes[e].c.length; c++){
							let col = colorPalettes[e].c[c].toString();
						   // //console.log('col is '+col)
							let hex = fromHSL(col);
							hex = hex.toLowerCase();
							col = hexToRgb(hex);
							txt+=`\n${col[0]}\t${col[1]}\t${col[2]}`
						}
					  arr2.push({path: palette+'.gpl', data:txt}); 
					}
				}
			  
			} 
		  
			return arr2
		break;				
	
	

		case 'Adobe Swatch Exchange':
			
			
			for (let i = 0; i < palettes.length; i++) {
				//console.log('selectedPalette '+palettes[i])
				let palette = palettes[i];
				

				for (let e = 0; e < colorPalettes.length; e++) {
					if (colorPalettes[e].n == palette) {
					
						obj[palette] = {};
										
				
						// loop through colors, create 1 key per
						let colors = colorPalettes[e].c;
						
						for (let f = 0; f < colors.length; f++ ) {
							let hex = fromHSL(colors[f].toString())
							hex = hex.toLowerCase();
							let col = hexToRgb(hex);
							//console.log('col is '+col);
							//let color = rgbToCMYK(col);
							//console.log('color is now '+JSON.stringify(color));
							
							let colory = getColorDataEntry(col,hex);
							colorData.push(colory);
						}
						
					let buff = saveAsASE(colorData);

					let b = new Uint8Array(buff);
					
					array.push({path: palette+'.ase', data:b});
					}
				}
			  
			}

			return array
		break;

		case 'Sketch Palette':
									
			for (let i = 0; i < palettes.length; i++) {
				//console.log('selectedPalette '+palettes[i])
				let palette = palettes[i];
				

				for (let e = 0; e < colorPalettes.length; e++) {
					if (colorPalettes[e].n == palette) {
					
						obj[palette] = {};
										
				
						// loop through colors, create 1 key per
						let colors = colorPalettes[e].c;
						
						for (let f = 0; f < colors.length; f++ ) {
							let hex = fromHSL(colors[f].toString())
							hex = hex.toLowerCase();
							let col = hexToRgb(hex);
							//console.log('col is '+col);
							//let color = rgbToCMYK(col);
							//console.log('color is now '+JSON.stringify(color));
							
							let colory = getColorDataEntry(col,hex);
							colorData.push(colory);
						}
						
					let str = saveAsSketch(colorData);
					
					array.push({path: palette+'.sketchpalette', data:str});
					}
				}
			  
			}

			return array
		break;					
		

		case 'json_array':
		 //   //console.log('running json_array')
	   
	   let moana = `GIMP Palette\nName: moana\nColumns: 12\n# made by https://palettes.kwippe.com\n255	255	255\n204	204	255\n102	102	204\n203	240	255\n153	153	255\n149	211	236\n55	148	185`;
	   
	   let m = importGPL(moana);
	   //console.log('gpl import '+JSON.stringify(m));
	   
	   
	   
			for (let i = 0; i < palettes.length; i++) {
				//console.log('selectedPalette '+palettes[i])
				let palette = palettes[i];

				for (let e = 0; e < colorPalettes.length; e++) {
					if (colorPalettes[e].n == palette) {
						let tempArr = [];
						for (var c = 0; c <colorPalettes[e].c.length; c++){
							let col = colorPalettes[e].c[c].toString();
						   // //console.log('col is '+col)
							let color = fromHSL(col);
							tempArr.push(color);
						}
						array.push({name: palette, colors: tempArr});
					}
				}
			  
			} 
		   return {path: 'json_array.json', data:JSON.stringify(array)};
		break;
		case 'json_object':
	   // //console.log('running json_object');
	   
	   
			for (let i = 0; i < palettes.length; i++) {
				//console.log('selectedPalette '+palettes[i])
				let palette = palettes[i];

				for (let e = 0; e < colorPalettes.length; e++) {
					if (colorPalettes[e].n == palette) {
						obj[palette] = {};
						// loop through colors, create 1 key per
						let colors = colorPalettes[e].c;
						for (let f = 0; f < colors.length; f++ ) {
							let color = fromHSL(colors[f].toString())
							obj[palette]['color_'+f] = color;
						}
					}
				}
			  
			} 
		   return {path: 'json_object.json', data:JSON.stringify(obj)};
		break;
		case 'css':
		 // //console.log('running css');

			for (let i = 0; i < palettes.length; i++) {
			   // //console.log('selectedPalette '+palettes[i])
				let palette = palettes[i];

				for (let e = 0; e < colorPalettes.length; e++) {
					if (colorPalettes[e].n == palette) {
				   
						// loop through colors, create 1 key per
						let colors = colorPalettes[e].c;
						for (let f = 0; f < colors.length; f++ ) {    
							let color = fromHSL(colors[f].toString())									
							css+= '.'+palette+'_'+f + '{\nbackground-color: '+color+ ';\n}\n'
						}
					}
				}   
			} 
		   return {path: 'color_palettes.css', data:css};
		break;
		case 'html_table':
		let html = '';
		
		
		
		// First create a template string:
		let templateBegin = `<!DOCTYPE html> <html> <head><style>.wrap { width: 100%; margin-left: 10%; margin-right:10%; } .flex-container { display: flex; flex-wrap: wrap; margin-left: 10%; margin-right:10%; } .flex-container > div { width: 200px; margin: 10px; text-align: center; line-height: 75px; font-size: 1.5rem; border-radius: 5px; border: solid 1px #e7d7d7;} span {text-shadow: -1px -1px 1px #dedddd;}`
	   
		for (let i = 0; i < palettes.length; i++) {
			// //console.log('selectedPalette '+palettes[i])
			let palette = palettes[i];
	  
			html+= '<h1 class="title">'+palette+'</h1><div class="flex-container">';
		

			for (let e = 0; e < colorPalettes.length; e++) {
				if (colorPalettes[e].n == palette) {       
					// loop through colors, create 1 key per
					let colors = colorPalettes[e].c;
					
					for (let f = 0; f < colors.length; f++ ) {   
						let color = fromHSL(colors[f].toString())
						css+= '.'+palette+'_'+f + '{\nbackground-color: '+color+ ';\n}\n'								
						html+= '<div class="'+palette+'_'+f+'"><span>'+color+'</span></div>';
					}
				}
			}   
			html+= '</div>';
		} 
		let templateEnd = '</div></body></html>';

	   return {path: 'color_palettes.html', data:templateBegin + css + '</style></head><body><div class="wrap">' +  html + templateEnd};
		break;
		case 'text': 
			let text = '';
	   
			for (let i = 0; i < palettes.length; i++) {
				// //console.log('selectedPalette '+palettes[i])
				let palette = palettes[i];
				if (i > 0) text+= '\n';
				text+= palette+'\n';

				for (let e = 0; e < colorPalettes.length; e++) {
					if (colorPalettes[e].n == palette) {       
						// loop through colors, create 1 key per
						let colors = colorPalettes[e].c;
						for (let f = 0; f < colors.length; f++ ) {   
							let color = fromHSL(colors[f].toString())   
							text+= color;
							if (f < colors.length-1) text+=',';
						}
					}
				}   
			} 
			return {path: 'color_palettes.txt', data:text};
		break;
	}	
	
}
	
export {downloadURL, downloadBlob, saveAsSketch, saveAsASE, saveAsCSV, createTypeForExports, importGPL }