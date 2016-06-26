'use strict';

const Point = require( './point.js' );
const Format = require( './format.js' );

class GerberWriter {

	constructor( job, dstFormat, apertureStore, description ) {

		this._job = job;
		this._dstFormat = dstFormat;
		this._apertureStore = apertureStore;
		this._description = description;

		this._data = '';
		this._lastMode = null;
		this._lastAperture = null;

	}

	_setAperture( diameter ) {

		// Check wheter aperture has been given and if not create one
		if( ! this._aperture ) {
			this._apertureStore.add(
				10,
				`C,${diameter}`,
				this._job,
				new Format( { type: 'number', unit: 'metric', point: 'floating' } )
			);
			this._aperture = this._apertureStore.lookup( this._job, 10 );
		}

		// Set aperture if necessary
		if( this._lastAperture != this._aperture ) {
			this._lastAperture = this._aperture;
			this._data += `D${this._aperture}*\n`;
		}

	}

	add( data ) {

		// Append Gerber data
		this._data += data;

		// Make sure the last charcter is \n
		if( this._data[ this._data.length -1 ] != '\n' ) this._data += '\n';

		// Wo don't know the last mode and aperture of the given data
		this._lastMode = null;
		this._lastAperture = null;

	}

	addPolygon( unit, points ) {

		// Check input
		if( ! ( points instanceof Array ) ) {
			throw new Error( "points must be an array" );
		}
		if( points.length < 2 ) {
			throw new Error( "points must have a least 2 items" );
		}

		// If last mode is not G01*, prepend Mode change
		if( this._lastMode != 1 ) {
			this._data += 'G01*\n';
			this._lastMode = 1;
		}

		// Set the aperture (in mm)
		this._setAperture( 0.15 );

		// Set all intermediate points
		let pointFormat = new Format( {
			type: 'number',
			unit: unit,
			point: 'floating'
		} );

		// Convert all items
		for( let p = 0; p < points.length; p++ ) {

			// Check type
			if( typeof points[p].x != 'number' || typeof points[p].y != 'number' ) {
				throw new Error( "All items of points[] must have properties x and y of type number" );
			}

			points[p] = new Point( points[p], pointFormat, this._dstFormat );

		}

		// Set start
		this._data += `${points[0]}D02*\n`;

		// Set all intermediate points
		for( let p = 1; p < points.length; p++ ) {
			this._data += `${points[p]}D01*\n`;
		}

		// Close polygon if more then one line has been drawn
		if( points.length > 2 ) this._data += `${points[0]}D01*\n`;

	}

	// TODO: addArc( begin, end )

	// TODO: addText( anchor, text, vAlign, hAlign )

	toString() {

		let h = '';

		// Create header:
		// - description
		if( typeof this._description == 'string' ) {
			h += `G04 ${this._description}*\n`;
		}
		// - Gerber Format
		h += `%FS`;
		h += (this._dstFormat.zeroSupression == 'leading' ) ? 'LA' : 'TA';
		h += `X${this._dstFormat.precisionPre}${this._dstFormat.precisionPost}`;
		h += `Y${this._dstFormat.precisionPre}${this._dstFormat.precisionPost}`;
		h += `*%\n`;
		// - Unit
		h += `%MO`;
		h += (this._dstFormat.unit == 'metric' ) ? 'MM' : 'IN';
		h += `*%\n`;
		// - Aperture List
		h += `${this._apertureStore}\n`;

		// Prepend header and append EOF
		return h + this._data + 'M02*';

	}

}

module.exports = GerberWriter;
