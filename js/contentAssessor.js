var Assessor = require( "./assessor.js" );

var fleschReadingEase = require( "./assessments/fleschReadingEaseAssessment.js" );
var paragraphTooLong = require( "./assessments/paragraphTooLongAssessment.js" );
var sentenceLengthInText = require( "./assessments/sentenceLengthInTextAssessment.js" );
var subheadingDistributionTooLong = require( "./assessments/subheadingDistributionTooLongAssessment.js" );
var transitionWords = require( "./assessments/transitionWordsAssessment.js" );
var passiveVoice = require( "./assessments/passiveVoiceAssessment.js" );
var sentenceBeginnings = require( "./assessments/sentenceBeginningsAssessment.js" );
var textPresence = require( "./assessments/textPresenceAssessment.js" );
// var sentenceVariation = require( "./assessments/sentenceVariationAssessment.js" );
// var subHeadingLength = require( "./assessments/getSubheadingLengthAssessment.js" );
// var getSubheadingPresence = require( "./assessments/subheadingPresenceAssessment.js" );
// var wordComplexity = require( "./assessments/wordComplexityAssessment.js" );
// var subheadingDistributionTooShort = require( "./assessments/subheadingDistributionTooShortAssessment.js" );
// var paragraphTooShort = require( "./assessments/paragraphTooShortAssessment.js" );
// var sentenceLengthInDescription = require( "./assessments/sentenceLengthInDescriptionAssessment.js" );

var scoreToRating = require( "./interpreters/scoreToRating" );

var map = require( "lodash/map" );
var sum = require( "lodash/sum" );

/**
 * Creates the Assessor
 *
 * @param {object} i18n The i18n object used for translations.
 * @param {Object} options The options for this assessor.
 * @param {Object} options.marker The marker to pass the list of marks to.
 *
 * @constructor
 */
var ContentAssessor = function( i18n, options ) {
	Assessor.call( this, i18n, options );

	this._assessments = [
		fleschReadingEase,
		subheadingDistributionTooLong,
		paragraphTooLong,
		sentenceLengthInText,
		transitionWords,
		passiveVoice,
		textPresence,
		sentenceBeginnings,
		// sentenceVariation,
		// wordComplexity,
		// subheadingDistributionTooShort,
		// paragraphTooShort
		// sentenceLengthInDescription,
	];
};

require( "util" ).inherits( ContentAssessor, Assessor );

/**
 * Calculates the weighted rating for English languages based on a given rating.
 *
 * @param {number} rating The rating to be weighted.
 * @returns {number} The weighted rating.
 */
ContentAssessor.prototype.calculatePenaltyPointsEnglish = function( rating ) {
	switch ( rating ) {
		case "bad":
			return 3;
		case "ok":
			return 2;
		default:
		case "good":
			return 0;
	}
};

/**
 * Calculates the weighted rating for non-English languages based on a given rating.
 *
 * @param {number} rating The rating to be weighted.
 * @returns {number} The weighted rating.
 */
ContentAssessor.prototype.calculatePenaltyPointsNonEnglish = function( rating ) {
	switch ( rating ) {
		case "bad":
			return 4;
		case "ok":
			return 2;
		default:
		case "good":
			return 0;
	}
};

/**
 * Calculates the penalty points based on the assessment results.
 *
 * @returns {number} The total penalty points for the results.
 */
ContentAssessor.prototype.calculatePenaltyPoints = function() {
	var results = this.getValidResults();

	var penaltyPoints = map( results, function( result ) {
		var rating = scoreToRating( result.getScore() );

		if ( this.getPaper().getLocale().indexOf( "en_" ) > -1 ) {
			return this.calculatePenaltyPointsEnglish( rating );
		}

		return this.calculatePenaltyPointsNonEnglish( rating );
	}.bind( this ) );

	return sum( penaltyPoints );
};

/**
 * Rates the penalty points
 *
 * @param {number} totalPenaltyPoints The amount of penalty points.
 * @returns {number} The score based on the amount of penalty points.
 *
 * @private
 */
ContentAssessor.prototype._ratePenaltyPoints = function( totalPenaltyPoints ) {
	if ( this.getValidResults().length === 1 ) {
		// If we have only 1 result, we only have a "no content" result
		return 30;
	}

	if ( this.getPaper().getLocale().indexOf( "en_" ) > -1 ) {
		// Determine the total score based on the total penalty points.
		if ( totalPenaltyPoints > 6 ) {
			// A red indicator.
			return 30;
		}

		if ( totalPenaltyPoints > 4 ) {
			// An orange indicator.
			return 60;
		}
	} else {
		if ( totalPenaltyPoints > 4 ) {
			// A red indicator.
			return 30;
		}

		if ( totalPenaltyPoints > 2 ) {
			// An orange indicator.
			return 60;
		}
	}
	// A green indicator.
	return 90;
};

/**
 * Calculates the overall score based on the assessment results.
 *
 * @returns {number} The overall score.
 */
ContentAssessor.prototype.calculateOverallScore = function() {
	var results = this.getValidResults();

	// If you have no content, you have a red indicator.
	if ( results.length === 0 ) {
		return 30;
	}

	var totalPenaltyPoints = this.calculatePenaltyPoints();

	return this._ratePenaltyPoints( totalPenaltyPoints );
};

module.exports = ContentAssessor;

