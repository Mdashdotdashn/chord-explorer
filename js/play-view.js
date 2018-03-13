const EventEmitter = require('events').EventEmitter;
const util = require('util');
const Scale = require("tonal-scale");
const Chord = require("tonal-chord");

require('./domain.js')

PlayView = function(model)
{
  this.model_ = model;
}

util.inherits(PlayView, EventEmitter);

const _colorMap =
{
    'M': 'G', //
    'M#5': 'g', // Augmented
    'm': 'A', // Minor
    'o': 'a'  // Dim
}

PlayView.prototype.draw = function(screenBuffer)
{
  var intervals = Scale.intervals(this.model_.scale);
  for (var index = 0; index < intervals.length; index++)
  {
    const chord = degreeChord(this.model_.root, this.model_.scale, index);
    const inverted = invertChordType(chord);
    const chordType = Chord.tokenize(this.model_.invert ? inverted : chord)[1];
    screenBuffer.col(_colorMap[chordType], [0,7-index]);
  }

  screenBuffer.col(this.model_.invert ? 'A' : 'G', [8,7]);
}

PlayView.prototype.emitMessage = function(message,value)
{
  this.emit("command", {name: message, value: value});
}

PlayView.prototype.handleKey = function(k)
{
  var intervals = Scale.intervals(this.model_.scale);
  if ((k.x == 0) && (7-k.y < intervals.length))
  {
    this.emitMessage("chord", { degree: 7-k.y, pressed: k.pressed});
  }

  if ((k.x == 8) && (k.y == 7))
  {
    this.emitMessage("invert", k.pressed);
  }
}
