const Tonal = require("tonal");
const Detect = require("tonal-detector")

degreeChord = function (root, scale, degree)
{
  const note = Tonal.Scale.notes(root, scale)[degree];

  const scaleIntervals = Tonal.Scale.intervals(scale);

  const chordIntervals= [0,2,4].map(d => {
    const offset = d + degree;
    const octave = Tonal.Interval.fromSemitones(12 * Math.floor(offset / scaleIntervals.length));
    const interval = scaleIntervals[offset % scaleIntervals.length];
    return Tonal.Distance.add(interval, octave);
  }, this);

    // We need to recover the chord type from the interval list.
  // Since tonal list the result from (C->B) in the case there's several options
  // we first re-root the progression so the first interval is 1P
  const backToRoot = "-" + chordIntervals[0];
  const transposed = chordIntervals.map(Tonal.Distance.add(backToRoot));
  const notes = transposed.map(Tonal.Distance.transpose('C'));
  const detected = Detect.chord(notes);

  const props = Tonal.Chord.tokenize(detected[0]);
  const chordType = props[1] =='64' ? "M" : props[1];
  const chordName = note + chordType;
  return chordName;
}

notesForChord = function (chordName, octave)
{
  var intervals = Tonal.Chord.intervals(chordName);
  var root = Tonal.Chord.tokenize(chordName)[0];
  root += octave;
  return intervals.map(Tonal.Distance.transpose(root));
}

translateToMidi = function (notes)
{
  return notes.map(Tonal.Note.midi);
}

invertChord = function (chord)
{
  var _inversionMap =
  {
        'M': 'm', //
        'M#5': 'M#5', // Augmented
        'm': 'M', // Minor
        'o': 'o'  // Dim
  };

  const token = Tonal.Chord.tokenize(chord);
  return token[0] + _inversionMap[token[1]];
}
