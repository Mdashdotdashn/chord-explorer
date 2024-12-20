const EventEmitter = require('events').EventEmitter;
const util = require('util');
const Scale = require("tonal-scale");
const Chord = require("tonal-chord");
const Distance = require("tonal-distance");
const Interval = require("tonal-interval");

require('./domain.js')

buildChordArray = function(tonic, scale)
{
  var chordArray = new Array();
  // prepare the 7 chord degrees
  var intervals = Scale.intervals(scale);
  if (intervals.length != 7)
  {
    throw "Only supporting major/minor based scales";
  }

  for (var index = 0; index < intervals.length; index++)
  {
    // adds the chord's degree
    const chord = degreeChord(tonic, scale, index);
    chordArray.push({name: chord, position: [0, 7 - index]});
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
      chordArray.push({name: sharpie, position: [1, 7 - index]});
    }
  }
  return chordArray;
}

buildHistoryArray = function()
{
  var historyArray = new Array();

  for (var h = 0; h < 8; h++)
  {
      historyArray.push({index: h, position: [4,7-h]});
  }
  return historyArray;
}

/*---------------------------------------------------------------------------*/

PlayView = function(model)
{
  this.model_ = model;
  this.chords_ = buildChordArray(this.model_.root, this.model_.scale);
  this.history_ = buildHistoryArray();
  this.voice_ = this.model_.activeVoices.map((v,i) => { return {index: i, position: [3 + i, 8]}});
  this.invertKey_ = false;
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
    const chordType = Chord.tokenize(this.invertKey_ ? inverted : chord)[1];
    screenBuffer.col(_colorMap[chordType], this.chords_[index].position);
  }

  screenBuffer.col(this.model_.invert ? 'A' : 'G', [8,7]);

  for (var index = 0; index < this.voice_.length; index++)
  {
    if (this.model_.activeVoices[index])
    {
      screenBuffer.col('G', this.voice_[index].position);
    }
  }

  for (var index = 0; index < this.history_.length; index++)
  {
    var historyIndex = this.history_[index].index;
    if (historyIndex < this.model_.history.length)
    {
      const chord = this.model_.history[historyIndex].chord;
      const chordType = Chord.tokenize(chord)[1];
      screenBuffer.col(_colorMap[chordType], this.history_[index].position);
    }

  }
}

PlayView.prototype.emitMessage = function(message,value)
{
  this.emit("command", {name: message, value: value});
}


PlayView.prototype.handleKey = function(k)
{
  if ((k.x == 8) && (k.y == 7))
  {
    this.invertKey_ = k.pressed;
    return;
  }

  for (var index = 0; index < this.chords_.length; index++)
  {
    const position = this.chords_[index].position;
    if ((position[0] == k[0]) && (position[1] == k[1]))
    {
      this.emitMessage("chord", { name: this.chords_[index].name, invert: this.invertKey_, pressed: k.pressed});
    }
  }

  for (var index = 0; index < this.voice_.length; index++)
  {
    const position = this.voice_[index].position;
    if ((position[0] == k[0]) && (position[1] == k[1]))
    {
      this.emitMessage("voice", { pressed: k.pressed, index: this.voice_[index].index});
    }
  }

  for (var index = 0; index < this.history_.length; index++)
  {
    var historyIndex = this.history_[index].index;
    if (historyIndex < this.model_.history.length)
    {
      const position = this.history_[index].position;
      if ((position[0] == k[0]) && (position[1] == k[1]))
      {
        this.emitMessage("chord", { name: this.model_.history[historyIndex].chord, invert: false, pressed: k.pressed});
      }
    }

  }

}
