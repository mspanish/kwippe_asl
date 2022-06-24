import { writable } from 'svelte/store';


export const settings = writable({
   // rootURL: 'https://kwippeschool.netlify.app',
    rootURL: 'http://localhost:8888',
    equationsUngrouped: false,
    pdfLoaded: false,
    pdfIndex: 1,
    pdfTotal: 0,
	preloadPDF: false, //should be relative link to a PDF in the root folder ./ or false,
    editor: {},
    textFill: '#000000',
    textStroke: '#ffffff',
    textAlign: 'left',
    strokeWidth: 0,
    fontSize: 22,
    fontFamily: 'arial',
    lineHeight: 1,
    letterSpacing: 1,
    randomizeObjectColor: true,
    coloringMode: 'stepped',
    coloringIndex: 0,
	patternSpacingX: 0,
	patternSpacingY: 0,
    patternRows: 2,
    patternCols: 2,
    objectFill: '#a6d6f3',
    objectStroke: '#000000',
    objectStrokeWidth: 0,
	objectRadius: 10,
	selectedHasRadius: false,
    currentObjectOpacity: 1,
	lineStroke: '#000000',
	lineStrokeWidth: 10,
	lineType: 'solid',
    lineDash1: 0,
    lineDash2: 0,
    gradient: 'linear',
    gradientTarget: 'objects',
    gradientColor1: '#ffffff',
    gradientColor2: '#000000',
    linearAngle: null,
    gradientRadius: 0,
    gradientRadiusInner: 0,
    gradientDirection: 'up',
    gradientWidthOffset: 0,
    gradientHeightOffset: 0,
    penFill: '#ff0000',
    penShadow: '#000000',
    drawingBrush: 'pencil',
    drawingBrushWidth: 30,
    drawingShadowWidth: 0,
    drawingShadowOffsetX: 10,
    drawingShadowOffsetY: 10,
    penOpacity: 1,
    toastAction: null,
    blendColor: '#ff0000',
    blendMode: 'tint',
    blendAlpha: .8,
});
export const onscreen = writable({});
export const active = writable(0);
export const drawType = writable(0);
export const fillCol = writable(0);
export const outlineCol = writable(0);

export const user = writable(0);
export const currentPage = writable(0);

//misc kwippe things needed
export const memes = writable(0);
export const selectedLayer = writable(0);
export const controls = writable(0);

// things needed for the port of the image loading from Kwippe
export const iconsArray = writable(0);
export const icons = writable(0);
export const iconPaths = writable(0);
export const iconFiles = writable(0);
export const tempIcons = writable(0);
export const search = writable(0);
export const xhrArray = writable(0);
export const searchMode = writable(0);
export const filtersActive = writable(0);
export const kd = writable(0);
export const colorsForParts = writable(0);
export const licensing = writable(0);

export const colorNames = writable(0);
export const iconsForPalette = writable(0);
export const paletteBLoaded = writable(0);
export const shades = writable(0);
export const patternPalette = writable(0);
export const currentPalette = writable(0);
export const currentPalettes = writable(0);
export const currentColor = writable(0);
export const colorPalette = writable(0);
export const colorPalettes = writable(0);
export const paletteName = writable(0);
export const paletteExpand = writable(0);
export const paletteV = writable(0);
export const paletteBuilderColors = writable(0);

export const paletteChangedFlag= writable(0)
export const colorsFromPaletteFlag = writable(0)

export const selectedModePuppet = writable(0)
export const tooltipOffset = writable(0)

export const handSwaps = writable({ 
 '1': '1',
 '3': '2',
 '4': '3',
 '5': '4',
 '5-c': '5',
 '5-c-l': '6',
 '7': '9',
 '8': '10',
 '10': '12',
 'a': '14',
 'alt-g': '26',
 'B': '19',
 'b': '19',
 'b-l': '18',
 'b/l': '18',
 'b-xd': '19',
 'base-hand': '93',
 'v/2': '2',
 'bent-b': '23',
 'bent-b-l': '18',
 'bent-b-xd': '91',
 'bent-i-l-y': '95',
 'baby-o': '21',
 'bent-1': '22',
 'bent-m': '27',
 'bent-n': '28',
 'bent-u': '29',
 'bent-u-l': '86',
 'bent-v': '41',
 'bent-horns': '25',
 'c': '30',
 'cocked-7': '90',
 'cocked-8': '32',
 'cocked-f': '33',
 'cocked-s': '34',
 'clsd-b': '19',
 'clsd-e': '43',
 'crvd-1': '38',
 'crvd-3': '84',
 'crvd-w': '85',
 'crvd-4': '7',
 'crvd-5': '5',
 'crvd-h': '40',
 'crvd-l': '59',
 'crvd-v': '41',
 'crvd-flat-b': '37',
 'crvd-sprd-b': '39',
 'curved-u': '40',
 'crvd-v': '41',
 'closed-b': '19',
 'closed-e': '43',
 'curved-1': '38',
 'curved-4': '7',
 'curved-5': '5',
 'curved-h': '40',
 'curved-l': '59',
 'curved-v': '41',
 'd': '42',
 'e': '43',
 'f': '44',
 'fanned-flat-o': '45',
 'f/9': '44',
 'f-9': '44',
 'flat-1': '100',
 'flat_l': '100',
 'flat-4': '100',
 'flat-b': '46',
 'flat-h': '100',
 'flat-horns': '100',
 'flat-ily': '100',
 'flat-m': '100',
 'flat-n': '100',
 'flat-o': '51',
 'flat-0-2': '50',
 'flat-v': '100',
 'flatspread-5': '45',
 'full-m': '52',
 'g': '53',
 'g/q': '53',
 'g-q': '53',
 'goody-goody': '89',
 'h': '76',
 'u-l': '76',
 'u/h': '76',
 'horns': '55',
 'i': '57',
 'ily': '56',
 'i-l-y': '56',
 'k': '58',
 'l': '60',
 'l/x': '59',
 'l-x': '59',
 'loose-e': '61',
 'o': '65',
 'open-7': '89',
 'open-8': '66',
 'open-f': '67',
 'open-b': '18',
 'open-e': '61',
 'loose-e': '61',
 'open-f': '67',
 'open-h': '75',
 'o-2-horns': '64',
 'p': '58',
 'p/k': '58',
 'p-k': '58',
 'r': '70',
 'rlxd': '93',
 's': '82',
 'sml-c-3': '71',
 'spread-e': '7',
 'spread-open-e': '61',
 'stacked-5': '45',
 't': '72',
 'tight-c-2': '73',
 'tight-c': '74',
 'u/l': '75',
 'u-l': '75',
 'v': '77',
 'vulcan': '92',
 'w': '78',
 'x': '79',
 'x-over-thumb': '80',
 'y': '81',
 }
)

export const characterColors = writable(
   {
   male: {
      mouth: [ "#ff5027", "#fe856a", "#F18F77", "#e66638", "#e2a28c", "#e2a69a", "#E2929B", "#e28c7c", "#e0a4a0", "#dfb0b5", "#DA7C87", "#bd5c69", "#b8727b", "#ae8987", "#a96a47", "#A06B59", "#9D6D5F", "#9B565F", "#904539"],
      
      faceshape:// ["#f0c7b1","#F3D4CF","#FFD0BC","#D9B8AF"],
      ["#D9A494","#E9B995","#F5AF95","#E19E95","#DAA488"],
      //,"#F2AA92","#ECC4B8","#F6E4E2","#EEAA83","#CDA184","#93614A","#764630","#753915","#582812","#B36A33","#4C2D18"],
      
      hair: ["#2a232b", "#080806", "#3b3128", "#4e4341", "#504543", "#6b4e40", "#a68469", "#b79675", "#decfbc", "#ddbc9b", "#a46c47", "#543c32", "#73625b", "#b84131", "#d6c4c4", "#fef6e1", "#cac1b2", "#b7513b", "#caa478", "#56342e" ],
      glasses: [ "#e05f48", "#da6972", "#97cf10", "#28be9c", "#107aa8", "#9b6db6", "#a90094", "#268135", "#c20b0b", "#2c2c2c", "#604ab3", "#092e0c", "#2e0914", "#edd218", "#210d34", "#153a4d", "#000000", "#130b3c", "#193d31", "#4d1f1f"],
      eyesiris: [ "#00f0f1", "#4DBCE9", "#ddb332", "#bd1c1b", "#8ab42d", "#7085b3", "#9fae70", "#4faaab", "#104BA9", "#4e60a3", "#9b1d1b", "#3c8d8e", "#284A7E", "#724f7c", "#7b5c33", "#282978", "#66724e", "#681711", "#4d3623", "#3e4442" ],
      eyesfront: [ "#000000", "#191c29", "#0f190c", "#09152e", "#302040", "#1b2a40", "#2c1630", "#2a150e", "#131111", "#1b1929", "#09112e", "#092e0c", "#2e0914", "#582311", "#210d34", "#153a4d", "#d6f7f4", "#5fa2a5", "#782c76", "#587d90"],
      },

   female: {
      mouth: [ "#ff5027", "#fe856a", "#F18F77", "#e66638", "#e2a28c", "#e2a69a", "#E2929B", "#e28c7c", "#e0a4a0", "#dfb0b5", "#DA7C87", "#bd5c69", "#b8727b", "#ae8987", "#a96a47", "#A06B59", "#9D6D5F", "#9B565F", "#904539"],
      
      faceshape: ["#f0c7b1","#F3D4CF","#FFD0BC","#D9B8AF","#D9A494","#E9B995","#F5AF95","#E19E95","#DAA488","#F2AA92","#ECC4B8","#F6E4E2","#EEAA83","#CDA184","#93614A","#764630","#753915","#582812","#B36A33","#4C2D18"],
      
      hair: ["#2a232b", "#080806", "#3b3128", "#4e4341", "#504543", "#6b4e40", "#a68469", "#b79675", "#decfbc", "#ddbc9b", "#a46c47", "#543c32", "#73625b", "#b84131", "#d6c4c4", "#fef6e1", "#cac1b2", "#b7513b", "#caa478", "#56342e" ],
      glasses: [ "#e05f48", "#da6972", "#97cf10", "#28be9c", "#107aa8", "#9b6db6", "#a90094", "#268135", "#c20b0b", "#2c2c2c", "#604ab3", "#092e0c", "#2e0914", "#edd218", "#210d34", "#153a4d", "#000000", "#130b3c", "#193d31", "#4d1f1f"],
      eyesiris: [ "#00f0f1", "#4DBCE9", "#ddb332", "#bd1c1b", "#8ab42d", "#7085b3", "#9fae70", "#4faaab", "#104BA9", "#4e60a3", "#9b1d1b", "#3c8d8e", "#284A7E", "#724f7c", "#7b5c33", "#282978", "#66724e", "#681711", "#4d3623", "#3e4442" ],
      eyesfront: [ "#000000", "#191c29", "#0f190c", "#09152e", "#302040", "#1b2a40", "#2c1630", "#2a150e", "#131111", "#1b1929", "#09112e", "#092e0c", "#2e0914", "#582311", "#210d34", "#153a4d", "#d6f7f4", "#5fa2a5", "#782c76", "#587d90"],
      
      },
   monster: {
      mouth: [ "#ff5027", "#fe856a", "#F18F77", "#e66638", "#e2a28c", "#e2a69a", "#E2929B", "#e28c7c", "#e0a4a0", "#dfb0b5", "#DA7C87", "#bd5c69", "#b8727b", "#ae8987", "#a96a47", "#A06B59", "#9D6D5F", "#9B565F", "#904539"],
      
      faceshape: ["#f0c7b1","#F3D4CF","#FFD0BC","#D9B8AF","#D9A494","#E9B995","#F5AF95","#E19E95","#DAA488","#F2AA92","#ECC4B8","#F6E4E2","#EEAA83","#CDA184","#93614A","#764630","#753915","#582812","#B36A33","#4C2D18"],
      
      hair: ["#2a232b", "#080806", "#3b3128", "#4e4341", "#504543", "#6b4e40", "#a68469", "#b79675", "#decfbc", "#ddbc9b", "#a46c47", "#543c32", "#73625b", "#b84131", "#d6c4c4", "#fef6e1", "#cac1b2", "#b7513b", "#caa478", "#56342e" ],
      glasses: [ "#e05f48", "#da6972", "#97cf10", "#28be9c", "#107aa8", "#9b6db6", "#a90094", "#268135", "#c20b0b", "#2c2c2c", "#604ab3", "#092e0c", "#2e0914", "#edd218", "#210d34", "#153a4d", "#000000", "#130b3c", "#193d31", "#4d1f1f"],
      eyesiris: [ "#00f0f1", "#4DBCE9", "#ddb332", "#bd1c1b", "#8ab42d", "#7085b3", "#9fae70", "#4faaab", "#104BA9", "#4e60a3", "#9b1d1b", "#3c8d8e", "#284A7E", "#724f7c", "#7b5c33", "#282978", "#66724e", "#681711", "#4d3623", "#3e4442" ],
      eyesfront: [ "#000000", "#191c29", "#0f190c", "#09152e", "#302040", "#1b2a40", "#2c1630", "#2a150e", "#131111", "#1b1929", "#09112e", "#092e0c", "#2e0914", "#582311", "#210d34", "#153a4d", "#d6f7f4", "#5fa2a5", "#782c76", "#587d90"],
      }     
}
)

export const kwippeSignSchema = writable(
{
  "word": "word",
  "signer": "name",
  "num_positions": 0,
  "dpiX": 200,
  "dpiY": 150,
  "oValX": -135,
  "oValY": -20,
  "scale": .82,
  "shapes": {
    "dh": {
      "begin": "",
      "end": ""
    },
    "ndh": {
      "begin": "",
      "end": ""
    }
  },
  "passive_arm": "",
  "positions": [
    {
      "skeleton": {
        
        "staticNeck": {
          "x": 355,
          "y": 205
        },
        "neck": {
          "x": 0,
          "y": 0
        },
        "staticShoulder": {
          "r": {
            "x": 276,
            "y": 240
          },
          "l": {
            "x": 426,
            "y": 240
          }
        },
        "r_shoulder": {
          "x": 0,
          "y": 0
        },
        "l_shoulder": {
          "x": 0,
          "y": 0
        },
        "offset": {
          "x": 0,
          "y": 0
        }
      },
      "elbow": {
        "r": {
          "x": 0,
          "y": 0,
          "angles": [
            1,
            2,
            3
          ],
          "angleReverse": false,
          "angleDir": "",
          "aClickStart": 4,
          "extras": 0,
          "aClicks": 0,
          "degrees": 5,
          "elbowToHandPts": {
            "x": 0,
            "y": 0
          }
        },
        "l": {
          "x": 0,
          "y": 0,
          "angles": [
            1,
            2,
            3
          ],
          "angleReverse": false,
          "angleDir": "",          
          "aClickStart": 4,
          "extras": 0,
          "aClicks": 0,
          "degrees": 5,
          "elbowToHandPts": {
            "x": 0,
            "y": 0
          }
        }
      },
      "wrist": {
        "r": {
          "x": 0,
          "y": 0,
          "angles": [
            1,
            2,
            3
          ],
          "angleReverse": false,
          "angleDir": "",               
          "aClickStart": 40,
          "extras": 0,
          "aClicks": 0,
          "degrees": 5
        },
        "l": {
          "x": 0,
          "y": 0,
          "angles": [
            1,
            2,
            3
          ],
          "angleReverse": false,
          "angleDir": "",               
          "aClickStart": 40,
          "extras": 0,
          "aClicks": 0,
          "degrees": 5
        }
      },
      "hand": {
        "r": {
          "thumb_tip": {
            "x": 0,
            "y": 0
          },
          "middle_tip": {
            "x": 0,
            "y": 0
          },
          "pinky_tip": {
            "x": 0,
            "y": 0
          },
          "angles": [
            1,
            2,
            3
          ],
          "angleReverse": false,
          "angleDir": "",            
          "aClicks": 0,
          "degrees": 2.5,
          "thumb_angle": {
            "angles": [
              1,
              2,
              3
            ],
            "angleReverse": false
          }
        },
        "l": {
          "thumb_tip": {
            "x": 0,
            "y": 0
          },
          "middle_tip": {
            "x": 0,
            "y": 0
          },
          "pinky_tip": {
            "x": 0,
            "y": 0
          },
          "angles": [
            1,
            2,
            3
          ],
          "angleReverse": false,
          "angleDir": "",            
          "aClicks": 0,
          "degrees": 2.5,
          "thumb_angle": {
            "angles": [
              1,
              2,
              3
            ],
            "angleReverse": false
          }
        }
      }
    }
  ]
}
);

export const kwippeWordMenu = writable(0); 

export const aslObj = writable({}); 
// [word, frame, kwippeData, curSigndata, color];