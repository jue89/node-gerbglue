'use strict';

const Point = require( './point.js' );
const Format = require( './format.js' );

class ExcellonWriter {

	constructor( job, dstFormat, toolStore, description ) {

		this._job = job;
		this._dstFormat = dstFormat;
		this._toolStore = toolStore;
		this._description = description;

		this._data = '';

	}

	addExcellon( data ) {

		// Append Excellon data
		this._data += data;

		// Make sure the last charcter is \n
		if( this._data[ this._data.length -1 ] != '\n' ) this._data += '\n';

	}

	toString() {

		let h = `M48\n`;

		// Create header:
		// - description
		if( typeof this._description == 'string' ) {
			h += `; ${this._description}\n`;
		}
		// - Excellon Format
		h += `; ${this._dstFormat}\n`;
		h += (this._dstFormat.unit == 'metric' ) ? 'METRIC,' : 'INCH,';
		h += (this._dstFormat.zeroSupression == 'leading' ) ? 'TZ\n' : 'LZ\n';
		h += `${this._toolStore}\n`;
		h += `%\n`;

		// Prepend header and append EOF
		return h + this._data + 'M30\n';

	}

}

module.exports = ExcellonWriter;
