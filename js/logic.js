var EventEmitter = require('events').EventEmitter;
var util = require('util');

require ("./domain.js");

Logic = function(model)
{
  this.model_ = model;
}

util.inherits(Logic, EventEmitter);

Logic.prototype.processCommand = function(m)
{
  switch(m.name)
  {
    case 'scale':
      this.model_.scale = m.value;
      break;
    case 'root':
      this.model_.root = m.value;
      break;
    case 'octave':
      this.model_.octave = m.value;
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

Logic.prototype.handleChord = function(degree, pressed)
{
  const chordName = degreeChord(this.model_.root, this.model_.scale, degree);
  const outputChord = this.model_.invert ? invertChord(chordName) : chordName;

  if (pressed)
  {
    console.log(outputChord);
  }
  const notes = notesForChord(outputChord, this.model_.octave);
  this.emit(pressed?"noteon":"noteoff", translateToMidi(notes));
}
