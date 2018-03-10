const Tonal = require("tonal");

var EventEmitter = require('events').EventEmitter;
var util = require('util');

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
    default:
      console.log("unknown command to process " + JSON.stringify(m));
  }
}

Logic.prototype.handleChord = function(degree, pressed)
{
  var intervals = Tonal.Scale.intervals(this.model_.scale);

  var chordIntervals= [0,2,4].map(d => {
    var offset = d + degree;
    var octave = Tonal.Interval.fromSemitones(12 * Math.floor(offset / intervals.length));
    var interval = intervals[offset % intervals.length];
    return Tonal.Distance.add(interval, octave);
  }, this);

  var rootNote = this.model_.root + this.model_.octave;
  var notes = chordIntervals.map(i => {
    return Tonal.transpose(rootNote,i);
  })

  console.log(notes);
  this.emit(pressed?"noteon":"noteoff", notes.map(Tonal.Note.midi));
}
