require ("./logic.js");
require ("./model.js");
require("./lp-screen-buffer.js");
require("./scale-select-view.js");
require("./play-view.js");
require("./midi-output.js");

Application = function(pad, options)
{
  this.pad_ = pad;
  this.midiOutput_ = new MidiOutput(options.device);
  this.model_ = new Model();
  this.logic_ = new Logic(this.model_);
  this.launchpadBuffer_ = new LaunchpadScreenBuffer();
  this.installView(new PlayView(this.model_));

  this.pad_.on('key', k => {
    if (!this.handleKey(k))
    {
      this.currentView_.handleKey(k);
    }
    else
    {
      this.redraw();
    }
  })

  this.logic_.on('noteon', n => this.midiOutput_.sendNoteOn(n));
  this.logic_.on('noteoff', n => this.midiOutput_.sendNoteOff(n));
}

Application.prototype.installView = function(view)
{
  this.currentView_ = view;
  view.on("command", m => {
    this.logic_.processCommand(m);
    this.redraw();
  });
}

Application.prototype.handleKey = function(k)
{
  if (k.x ==8 && k.y ==0)
  {
    if (k.pressed)
    {
      this.installView(new ScaleSelectView(this.model_));
    }
    else {
      this.installView(new PlayView(this.model_));
    }
    return true;
  }
  return false;
}

Application.prototype.run = function()
{
  this.redraw();
}

Application.prototype.redraw = function()
{
  buffer = new ScreenBuffer();
  this.currentView_.draw(buffer);
  this.launchpadBuffer_.update(buffer, this.pad_);
}
