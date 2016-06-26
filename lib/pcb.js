'use strict';

const fs = require( 'fs' );
const jsonGate = require( 'json-gate' );

const Format = require( './format.js' );
const PointTransformation = require( './point-transformation.js' );
const GerberReader = require( './gerber-in.js' );
const ExcellonReader = require( './excellon-in.js' );

// Schema for PCB definition
const schema = jsonGate.createSchema( {
	type: 'object',
	additionalProperties: false,
	properties: {
		'dir': {
			type: 'string',
			required: true,
		},
		'padding': {
			type: 'array',
			minItems: 4,
			maxItems: 4,
			default: [ 0, 0, 0, 0 ],
			items: {
				type: 'number'
			}
		},
		'layers': {
			type: 'object',
			additionalProperties: false,
			required: true,
			patternProperties: {
				'^[0-9a-zA-Z_-]+$': {
					type: 'object',
					additionalProperties: false,
					properties: {
						'file': {
							type: 'string',
							required: true
						},
						'format': {
							type: 'object',
							additionalProperties: false,
							required: false,
							properties: {
								'unit': {
									enum: [ 'metric', 'imperial' ],
									required: true
								},
								'zeroSupression': {
									enum: [ 'none', 'leading', 'trailing' ],
									required: true
								},
								'precisionPre': {
									type: 'number',
									required: false
								},
								'precisionPost': {
									type: 'number',
									required: false
								}
							}
						}
					}
				}
			}
		}
	}
} );

class PCB {

	constructor( name, options, layers, outlineLayer, unit ) {

		// Test against schema
		if( options === undefined ) options = {};
		schema.validate( options );

		// Check if all layers are given
		if( ! options.layers[ outlineLayer ] ) {
			throw new Error( `Mandatory outline layer is missing` );
		}
		for( let name in layers ) {
			if( layers[ name ].mandatory && ! options.layers[ name ] ) {
				throw new Error( `Mandatory layer ${name} is missing` );
			}
		}

		// Read layers:
		this._pcbLayers = {};

		// First read ontline layer to get PCB boundaries
		let bounds = new GerberReader(
			name,
			fs.readFileSync( `${options.dir}/${options.layers[outlineLayer].file}` ),
			layers[ outlineLayer ].apertureStore,
			layers[ outlineLayer ].format
		).getBounds( unit );

		// Read other layers
		for( name in options.layers ) {

			// Skip outline layer since it should not be placed on the final layer
			if( name == outlineLayer ) continue;

			if( layers.type == 'gerber' ) {
				this._pcbLayers[ name ] = new GerberReader(
					name,
					fs.readFileSync( `${options.dir}/${options.layers[name].file}` ),
					layers[ name ].apertureStore,
					layers[ name ].format,
					bounds
				);
			} else {
				this._pcbLayers[ name ] = new ExcellonReader(
					name,
					fs.readFileSync( `${options.dir}/${options.layers[name].file}` ),
					layers[ name ].toolStore,
					new Format( {
						type: 'string',
						point: 'fixed',
						unit: options.layers[name].format.unit,
						precisionPre: options.layers[name].format.precisionPre,
						precisionPost: options.layers[name].format.precisionPost
					} ),
					layers[ name ].format,
					bounds
				);
			}

		}

		// Get origin and measurements
		// The bounds object helds the unit in bounds[0], so it has an index offset
		this._origin = {
			x: bounds[4] - options.padding[3],
			y: bounds[3] - options.padding[2]
		};
		this._measurements = {
			x: bounds[2] - bounds[4] + options.padding[3] + options.padding[1],
			y: bounds[1] - bounds[3] + options.padding[2] + options.padding[0]
		};

		this._panelLayers = layers;
		this._unit = unit;

	}

	getDimensions() {

		return this._measurements;

	}

	place( anchor ) {

		// Check for correct anchor
		if( typeof anchor.x != 'number' || typeof anchor.y != 'number' ) {
			throw new Error( "Anchor must have properties x and y of type number" );
		}

		let transformation = new PointTransformation( this._unit, {
			x: [ '-', this._origin.x, '+', anchor.x ],
			y: [ '-', this._origin.y, '+', anchor.y ],
		} );

		for( let name in this._pcbLayers ) {
			this._panelLayers[ name ].writer.add( this._pcbLayers[ name ].toString( transformation ) );
		}

	}

}

module.exports = PCB;
