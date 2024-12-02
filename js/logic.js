const EventEmitter = require('events').EventEmitter;
const util = require('util');
const Interval = require('tonal-interval');
const Distance = require('tonal-distance');
const Tonal = require('tonal');

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
    // Compute chord to be played from the pressed chord
    // by applying alterations like inversion
    outputChord = invert ? invertChordType(name) : name;

    // Extract the notes from the chord
    var notes = notesForChord(outputChord, this.model_.octave);

    // Calculate a bass note consisting of the root two octave
    // down and the fifth above it. These notes won't be reharmonized
    // through inversion
    var bassnotes = new Array(2);
    var rootTranspose = "-15P";
    bassnotes[0] = Distance.transpose(notes[0], rootTranspose);
    bassnotes[1] = Distance.transpose(bassnotes[0], "5P");

    // Rectify the notes of the chord (i.e. place it close to the gravity center)
    var rectified = rectifyChord(this.tonicChord_, notes);
    // Add the bass notes
    rectified.push(bassnotes[0]);
    rectified.push(bassnotes[1]);

    var sorted = rectified.sort((a,b) => Tonal.Note.midi(a) - Tonal.Note.midi(b));
    var outputNotes = sorted.filter((n,i) => { return this.model_.activeVoices[i]; }, this);

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
