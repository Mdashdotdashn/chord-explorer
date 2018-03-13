var EventEmitter = require('events').EventEmitter;
var util = require('util');

require ("./domain.js");

Logic = function(model)
{
  this.model_ = model;
  this.updateTonicChord();
}

util.inherits(Logic, EventEmitter);

Logic.prototype.processCommand = function(m)
{
  switch(m.name)
  {
    case 'scale':
      this.model_.scale = m.value;
      this.updateTonicChord();
      break;
    case 'root':
      this.model_.root = m.value;
      this.updateTonicChord();
      break;
    case 'octave':
      this.model_.octave = m.value;
      this.updateTonicChord();
      break;
    case 'chord':
      this.handleChord(m.value.degree, m.value.pressed);
      break;
    case 'invert':
      this.model_.invert = m.value;
      break;
    default:
      console.log("unknown command to process " + JSON.stringify(m));
  }
}

Logic.prototype.updateTonicChord = function()
{
  const chordName = degreeChord(this.model_.root, this.model_.scale, 0);
  this.tonicChord_ = notesForChord(chordName, this.model_.octave);
  console.log("Tonic: " + chordName + " / "+ this.tonicChord_);
}

Logic.prototype.handleChord = function(degree, pressed)
{
  const chordName = degreeChord(this.model_.root, this.model_.scale, degree);
  const outputChord = this.model_.invert ? invertChordType(chordName) : chordName;

  var notes = notesForChord(outputChord, this.model_.octave);
  rectified = rectifyChord(this.tonicChord_, notes);

  var rootnote = notes[0];

//  inverted = invertChord(notes,-2);

  if (pressed)
  {
    console.log(outputChord + " / " + rectified);
  }
  this.emit(pressed?"noteon":"noteoff", translateToMidi(rectified));
}
