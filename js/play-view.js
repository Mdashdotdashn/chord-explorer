const EventEmitter = require('events').EventEmitter;
const util = require('util');
const Scale = require("tonal-scale");
const Chord = require("tonal-chord");
const Distance = require("tonal-distance");
const Interval = require("tonal-interval");

require('./domain.js')

PlayView = function(model)
{
  this.model_ = model;
  this.chords_ = new Array();
  // prepare the 7 chord degrees
  var intervals = Scale.intervals(this.model_.scale);
  for (var index = 0; index < intervals.length; index++)
  {
    // adds the chord's degree
    const chord = degreeChord(this.model_.root, this.model_.scale, index);
    this.chords_.push({name: chord, position: [0, 7 - index]});
    // look if we need to add a off-scale
    var needOffscale = false;
    if (index < intervals.length -1)
    {
      const distance = Distance.subtract(intervals[index+1], intervals[index]);
      needOffscale = (Interval.semitones(distance) > 1);
    }
    else {

      needOffscale = (intervals[index] != "7M");
    }

    if (needOffscale)
    {
      const t = Chord.tokenize(chord);
      const sharpie = Distance.transpose(t[0],"2m")+t[1];
      this.chords_.push({name: sharpie, position: [1, 7 - index]});
    }
  }
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
  for (var index = 0; index < this.chords_.length; index++)
  {
    const chord = this.chords_[index].name;
    const inverted = invertChordType(chord);
    const chordType = Chord.tokenize(this.model_.invert ? inverted : chord)[1];
    screenBuffer.col(_colorMap[chordType], this.chords_[index].position);
  }

  screenBuffer.col(this.model_.invert ? 'A' : 'G', [8,7]);
}

PlayView.prototype.emitMessage = function(message,value)
{
  this.emit("command", {name: message, value: value});
}

PlayView.prototype.handleKey = function(k)
{
  if ((k.x == 8) && (k.y == 7))
  {
    this.emitMessage("invert", k.pressed);
    return;
  }

  for (var index = 0; index < this.chords_.length; index++)
  {
    const position = this.chords_[index].position;
    if ((position[0] == k[0]) && (position[1] == k[1]))
    {
      this.emitMessage("chord", { name: this.chords_[index].name, pressed: k.pressed});
    }
  }
}
