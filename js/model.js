
Model = function()
{
  // current root note
  this.root = 'C';
  // current scale
  this.scale = 'major';
  // octave
  this.octave = 4;
  // Assuming a 4 part harmony, specifies whether a part is active or not
  // part 0 is the bass
  this.activeVoices = [true, true, true, true];
}
