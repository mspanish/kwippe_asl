'use strict';


function _toConsumableArray(arr) {
	if (Array.isArray(arr)) {
		for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
			arr2[i] = arr[i];
		}return arr2;
	} else {
		return Array.from(arr);
	}
}

// Construct Buffer or Blob of a .zip file in store mode (i.e., no compression)

// thanks to:
// https://github.com/mrananyan/ZipperJS
// https://users.cs.jmu.edu/buchhofp/forensics/formats/pkzip.html
// https://stackoverflow.com/a/18639999

var crcTable = [];
for (var n = 0; n < 256; n++) {
	var c = n;
	for (var k = 0; k < 8; k++) {
		c = c & 1 ? 0xEDB88320 ^ c >>> 1 : c >>> 1;
	}
	crcTable[n] = c;
}

var strCRC = function strCRC(str) {
	
	if (typeof str !== "string") return str
	
	console.log('type is '+typeof str);
	
	var crc = -1;
	for (var i = 0; i < str.length; i++) {
		crc = crc >>> 8 ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
	}
	return crc ^ -1;
};

var intToBytes = function intToBytes(int, length) {
	var out = [];
	while (length--) {
		out.push(int & 0xFF);
		int >>>= 8;
	}
	return out;
};

var strToBytes = function strToBytes(str) {
	if (typeof str !== "string") return str

	return [].concat(_toConsumableArray(str)).map(function (char) {
		return char.charCodeAt(0);
	});
};

var doNotZip = function (files) {
	var fileData = [];
	var centralDirectory = [];
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var _step$value = _step.value,
			    path = _step$value.path,
			    data = _step$value.data;

			var commonHeader = [0x0A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00].concat(_toConsumableArray(intToBytes(strCRC(data), 4)), _toConsumableArray(intToBytes(data.length, 4)), _toConsumableArray(intToBytes(data.length, 4)), _toConsumableArray(intToBytes(path.length, 2)), [0x00, 0x00]);
			centralDirectory.push.apply(centralDirectory, [0x50, 0x4B, 0x01, 0x02, 0x14, 0x00].concat(_toConsumableArray(commonHeader), [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], _toConsumableArray(intToBytes(fileData.length, 4)), _toConsumableArray(strToBytes(path))));
			fileData.push.apply(fileData, [0x50, 0x4B, 0x03, 0x04].concat(_toConsumableArray(commonHeader), _toConsumableArray(strToBytes(path)), _toConsumableArray(strToBytes(data))));
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	var bytes = [].concat(fileData, centralDirectory, [0x50, 0x4B, 0x05, 0x06, 0x00, 0x00, 0x00, 0x00], _toConsumableArray(intToBytes(files.length, 2)), _toConsumableArray(intToBytes(files.length, 2)), _toConsumableArray(intToBytes(centralDirectory.length, 4)), _toConsumableArray(intToBytes(fileData.length, 4)), [0x00, 0x00]);
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(bytes);
	}
	if (typeof Blob !== 'undefined' && typeof Uint8Array !== 'undefined') {
		return new Blob([Uint8Array.from(bytes)], { type: 'application/zip' });
	}
};

var downloadFiles = (filename, blob) => {
  //cross browser
  window.URL = window.URL || window.webkitURL;

  if (navigator.msSaveOrOpenBlob) {
	  navigator.msSaveOrOpenBlob(blob, filename);
  } else {
	  var a = document.createElement("a");
	  document.body.appendChild(a);
	  a.style = "display:none";
	  var url = window.URL.createObjectURL(blob);
	  //var url = window.URL.createObjectURL(new Blob(blob, {type: "application/zip"}))
	  a.href = url;
	  a.download = filename;
	  a.click();
	  window.URL.revokeObjectURL(url);
	  a.remove();
  }
};

export { doNotZip, downloadFiles}