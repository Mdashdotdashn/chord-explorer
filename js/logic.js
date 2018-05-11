const EventEmitter = require('events').EventEmitter;
const util = require('util');
const Interval = require('tonal-interval');
const Distance = require('tonal-distance');

require ("./domain.js");

Logic = function(model)
{
  this.model_ = model;
  this.baseInversion_ = 0;
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
      this.handleChord(m.value.name, m.value.pressed);
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
  const notes = notesForChord(chordName, this.model_.octave);
  this.tonicChord_ = this.baseInversion_ < 0 ? invertChord(notes, this.baseInversion_) : notes;
  console.log("Tonic: " + chordName + " / "+ this.tonicChord_);
}

var chordCache = [];

Logic.prototype.handleChord = function(name, pressed)
{
  outputChord = this.model_.invert ? invertChordType(name) : name;

  if (pressed)
  {
    chordCache[name] = outputChord;
  }
  else
  {
    outputChord = chordCache[name];
  }
  var notes = notesForChord(outputChord, this.model_.octave);
//  var rootTranspose = (this.baseInversion_ < 0) ? "-15P" : "-8P";
  var rootTranspose = "-15P";
  var rootnote = Distance.transpose(notes[0], rootTranspose);
  rectified = rectifyChord(this.tonicChord_, notes);
  rectified.push(rootnote);

//  inverted = invertChord(notes,-2);

  if (pressed)
  {
    console.log(outputChord + " / " + rectified);
  }
  this.emit(pressed?"noteon":"noteoff", translateToMidi(rectified));
}
