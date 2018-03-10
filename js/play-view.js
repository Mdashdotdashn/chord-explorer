var EventEmitter = require('events').EventEmitter;
var util = require('util');
const Scale = require("tonal-scale");

PlayView = function(model)
{
  this.model_ = model;
}

util.inherits(PlayView, EventEmitter);

PlayView.prototype.draw = function(screenBuffer)
{
  var intervals = Scale.intervals(this.model_.scale);
  for (var index = 0; index < intervals.length; index++)
  {
    screenBuffer.col('G', [index,7]);
  }
}

PlayView.prototype.emitMessage = function(message,value)
{
  this.emit("command", {name: message, value: value});
}

PlayView.prototype.handleKey = function(k)
{
  var intervals = Scale.intervals(this.model_.scale);
  if ((k.y == 7) && k.x < intervals.length)
  {
    this.emitMessage("chord", { degree: k.x, pressed: k.pressed});
  }
}
