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
  this.viewForRelease_ = new Array();

  this.pad_.on('key', k => {
    if (!this.handleKey(k))
    {
      const keyIndex = k.x + k.y * 9;
      if (k.pressed)
      {
        // Remember which view handled a particular even so we can send the off state
        this.viewForRelease_[keyIndex] = this.currentView_;
        this.currentView_.handleKey(k);
      }
      else
      {
        this.viewForRelease_[keyIndex].handleKey(k);
        this.viewForRelease_[keyIndex] = null;
      }
    }
    this.redraw();
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
