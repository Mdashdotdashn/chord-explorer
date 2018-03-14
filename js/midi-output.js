var easymidi = require("easymidi");

MidiOutput = function(outputName)
{
  var lowercaseOutName = outputName.toLowerCase();
  var outputs = easymidi.getOutputs();
  outputs.forEach(o => {
    if (o.toLowerCase().indexOf(lowercaseOutName) != -1)
    {
      console.log("Using midi output "+o);
      this.output_ = new easymidi.Output(o);
    }
  }, this)
  this.channel_ = 0;
  this.notes_ = new Array(128).fill(0)
}

MidiOutput.prototype.sendNoteOn = function(notes)
{
  notes.forEach(n => {
    this.notes_[n]++;
    this.output_.send('noteon', {
      note: n,
      velocity: 100,
      channel: this.channel_
    }, this);
  })
}

MidiOutput.prototype.sendNoteOff = function(notes)
{
  notes.forEach(n => {
    if (this.notes_[n]-- ==0)
    {
      this.output_.send('noteoff', {
        note: n,
        velocity: 100,
        channel: this.channel_
      }, this);
    }
  })
}
