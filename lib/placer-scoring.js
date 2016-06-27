'use strict';

const jsonGate = require( 'json-gate' );

// Schema for PCB definition
const schema = jsonGate.createSchema( {
	type: 'object',
	additionalProperties: false,
	properties: {
		'seperation': {
			type: 'string',
			required: true,
		},
		'scoringLayer': {
			type: 'string',
			required: true,
		},
		'margin': {
			type: 'array',
			minItems: 4,
			maxItems: 4,
			default: [ 0, 0, 0, 0 ],
			items: {
				type: 'number'
			}
		}
	}
} );

class PlacerScoring {

	constructor( options, panelLayers, unit ) {

		// Test against schema
		if( options === undefined ) options = {};
		schema.validate( options );

		// Check if scoring layer has been defined
		if( ! panelLayers[ options.scoringLayer ] ) {
			throw new Error( "Specified scoringLayer has not been defined" );
		}
		if( panelLayers[ options.scoringLayer ].type != 'gerber' ) {
			throw new Error( "Scoring layer must be in Gerber format" );
		}

		this._scoringLayer = panelLayers[ options.scoringLayer ];
		this._margin = options.margin;
		this._unit = unit;

	}

	place( placing, pcbs ) {

		// Check input
		if( ! ( placing instanceof Array ) ) {
			throw new Error( "Placing must be an array" );
		}

		// Revers placing array. This is necessary in order to bring the result in the same order as the array.
		placing.reverse();

		// Find number of rows and cols
		let rowsCnt = placing.length;
		let colsCnt = 0;
		for( let p in placing ) {

			// Convert everything into an array
			if( ! ( placing[p] instanceof Array ) ) {
				placing[p] = [ placing[p] ];
			}

			// Find the maximum cols count
			if( colsCnt < placing[p].length ) colsCnt = placing[p].length;

		}

		// Replace names with actual boards
		for( let x = 0; x < colsCnt; x++ ) {
			for( let y = 0; y < rowsCnt; y++ ) {

				// Blank out empty cells
				if( typeof placing[y][x] != 'string' ) {
					placing[y][x] = null;
					continue;
				}

				// Check if given PCB exists
				if( ! pcbs[ placing[y][x] ] ) {
					throw new Error( `PCB ${placing[y][x]} does not exist` );
				}

				// Replace PCB name with the actual instance
				placing[y][x] = pcbs[ placing[y][x] ];

			}
		}

		// Find the maximum measurements of each row and column
		let colsWidth = [];
		let rowsHeight = [];
		for( let x = 0; x < colsCnt; x++ ) colsWidth.push( 0 );
		for( let y = 0; y < rowsCnt; y++ ) rowsHeight.push( 0 );
		for( let x = 0; x < colsCnt; x++ ) {
			for( let y = 0; y < rowsCnt; y++ ) {

				// Skip empty cells
				if( ! placing[y][x] ) continue;

				// Get maximum measurements
				let m = placing[y][x].getDimensions();
				if( colsWidth[x] < m.x ) colsWidth[x] = m.x;
				if( rowsHeight[y] < m.y ) rowsHeight[y] = m.y;

			}
		}

		// Place PCBs
		let curX, curY;
		curX = this._margin[ 3 ];
		for( let x = 0; x < colsCnt; x++ ) {
			curY = this._margin[ 2 ];
			for( let y = 0; y < rowsCnt; y++ ) {

				// Just place non-empty cells
				if( placing[y][x] ) placing[y][x].place( { x: curX, y: curY } );

				// Increase anchor pointer
				curY += rowsHeight[y];

			}
			curX += colsWidth[x];
		}

		// Get panel dimensions
		let panelWidth = curX + this._margin[1];
		let panelHeight = curY + this._margin[0];

		// Create scoring lines
		curX = this._margin[ 3 ];
		for( let x = 0; x < colsCnt; x++ ) {
			if( x > 0 || curX > 0 ) this._scoringLayer.writer.addPolygon( this._unit, [
				{ x: curX, y: 0 },
				{ x: curX, y: panelHeight }
			] );
			curX += colsWidth[x];
		}
		if( curX < panelWidth )this._scoringLayer.writer.addPolygon( this._unit, [
			{ x: curX, y: 0 },
			{ x: curX, y: panelHeight }
		] );

		curY = this._margin[ 2 ];
		for( let y = 0; y < rowsCnt; y++ ) {
			if( y > 0 || curY > 0 ) this._scoringLayer.writer.addPolygon( this._unit, [
				{ x: 0, y: curY },
				{ x: panelWidth, y: curY }
			] );
			curY += rowsHeight[y];
		}
		if( curY < panelHeight ) this._scoringLayer.writer.addPolygon( this._unit, [
			{ x: 0, y: curY },
			{ x: panelWidth, y: curY }
		] );

		// Return dimensions
		return { x: panelWidth, y: panelHeight };

	}

}

module.exports = PlacerScoring;
