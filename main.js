require("./js/application.js");

function midiPortForPlatform()
{
  var devices =
  {
  	dar: "iac",
  	win: "microsoft",
  //	win: "loop",
  	lin: "through"
  }

  var platformKey = process.platform.substring(0, 3);
  return devices[platformKey];
}

const Launchpad = require( 'launchpad-mini' );
pad = new Launchpad();


pad.connect().then( () => {     // Auto-detect Launchpad

  pad.reset();
  var app = new Application(pad,{
   device: midiPortForPlatform()
  });
  app.run();
});
