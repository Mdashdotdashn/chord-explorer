var EventEmitter = require('events').EventEmitter;
var util = require('util');

var _scales = [
  { name: "major", position: [0,6] },
  { name: "minor", position: [1,6] },
  { name: "harmonic minor", position: [2,6] }
];

var _notes = [
  { name: "C", position: [0,4]},
  { name: "C#", position: [0,3]},
  { name: "D", position: [1,4]},
  { name: "D#", position: [1,3]},
  { name: "E", position: [2,4]},
  { name: "F", position: [3,4]},
  { name: "F#", position: [3,3]},
  { name: "G", position: [4,4]},
  { name: "G#", position: [4,3]},
  { name: "A", position: [5,4]},
  { name: "A#", position: [5,3]},
  { name: "B", position: [6,4]},
]

ScaleSelectView = function(model)
{
  this.model_ = model;
}

util.inherits(ScaleSelectView, EventEmitter);

ScaleSelectView.prototype.draw = function(screenBuffer)
{
  _scales.forEach(scale => {
    screenBuffer.col((scale.name == this.model_.scale) ? 'R' : 'G',scale.position);
  });

  _notes.forEach(note => {
    screenBuffer.col((note.name == this.model_.root) ? 'R' : 'G',note.position);
  });

  for (var octave = -1; octave < 7; octave++)
  {
    screenBuffer.col((octave == this.model_.octave) ? 'R' : 'G', [octave + 1, 0]);
  }
}

ScaleSelectView.prototype.emitMessage = function(message,value)
{
  this.emit("command", {name: message, value: value});
}

ScaleSelectView.prototype.handleKey = function(k)
{
  if (k.pressed)
  {
    _scales.forEach(scale => {
      if (k[0] == scale.position[0] && k[1] == scale.position[1])
      {
        this.emitMessage("scale", scale.name);
        return;
      }
    });
    _notes.forEach(note => {
      if (k[0] == note.position[0] && k[1] == note.position[1])
      {
        this.emitMessage("root", note.name);
        return;
      }
    });

    if (k[1] == 0)
    {
      this.emitMessage("octave", k[0] - 1);
      return;
    }
  }
}
