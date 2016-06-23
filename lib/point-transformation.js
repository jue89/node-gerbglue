/*jslint evil: true */
'use strict';

class PointTransformation {

	constructor( unit, operations ) {

		// Check parameters
		if( unit != 'metric' && unit != 'imperial' ) {
			throw new Error( "unit must be 'metric' or 'imperial'" );
		}
		if( typeof operations != 'object' ) {
			throw new Error( "operations must be an object" );
		}

		// Interprete operations
		for( let o in operations ) {

			if( ! ( operations[o] instanceof Array ) ) {
				throw new Error( "operations[] must be an array" );
			}

			// Generate formulars
			let i = 0;
			let len = operations[o].length;
			if( (len % 2) !== 0 ) {
				throw new Error( "operations[] must have an even number of items" );
			}

			// One formular for metric and one for imperial transformations
			let formularIN, formularMM;
			if( unit == 'metric' ) {
				formularIN = '(x*25.4)';
				formularMM = 'x';
			} else {
				formularIN = 'x';
				formularMM = '(x/25.4)';
			}

			while( i < len ) {

				// Extract value and operation
				let op = operations[o][i++];
				let value = parseFloat( operations[o][i++] );

				// Check value and operation
				if( op != '+' && op != '-' && op != '*' && op != '/' ) {
					throw new Error( "Allowed operations: +, -, *, /" );
				}
				if( isNaN( value ) ) {
					throw new Error( "Not a number" );
				}

				value = value.toString();

				// Insert into formular
				formularIN = `(${formularIN}${op}(${value}))`;
				formularMM = `(${formularMM}${op}(${value}))`;

			}

			if( unit == 'metric' ) {
				formularIN = `${formularIN}/25.4`;
			} else {
				formularMM = `${formularMM}*25.4`;
			}

			this[o] = {
				metric: Function( 'x', `return ${formularMM};`),
				imperial: Function( 'x', `return ${formularIN};`)
			};

		}

	}

}

module.exports = PointTransformation;
