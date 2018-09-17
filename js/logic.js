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
      this.handleChord(m.value.name, m.value.invert, m.value.pressed);
      break;
    case 'voice':
      if (m.value.pressed)
      {
        this.model_.activeVoices[m.value.index] = !this.model_.activeVoices[m.value.index];
      }
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

var noteCache = [];

Logic.prototype.emitNotesForChords = function(name, invert, pressed)
{
  if (pressed)
  {
    // Compute the note set from the original chord and alterations
    outputChord = invert ? invertChordType(name) : name;
    var notes = notesForChord(outputChord, this.model_.octave);
    var rootTranspose = "-15P";
    var rootnote = Distance.transpose(notes[0], rootTranspose);
    rectified = rectifyChord(this.tonicChord_, notes);
    rectified.push(rootnote);
    var outputNotes = rectified.sort().filter((n,i) => { return this.model_.activeVoices[i]; }, this);

    console.log(outputChord + " / " + outputNotes);

    noteCache[name] = outputNotes;
  }

  var midiNotes = translateToMidi(noteCache[name]);
  console.log(midiNotes);
  this.emit(pressed?"noteon":"noteoff", midiNotes);
}

// Receives the chord event from the chord keyboard layout
Logic.prototype.handleChord = function(name, invert, pressed)
{
  this.emitNotesForChords(name, invert, pressed);
}
