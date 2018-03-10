//------------------------------------------------------------------------------

ScreenBuffer = function()
{
  this.buffer_ = new Array(81).fill('');
}

ScreenBuffer.prototype.col = function(value, position)
{
  this.buffer_[position[0] + position[1] * 9] = value;
}

ScreenBuffer.prototype.reset = function()
{
  this.buffer_.fill('');
}

//------------------------------------------------------------------------------

LaunchpadScreenBuffer = function()
{
  this.backbuffer_ = new Array(81).fill('');
}

LaunchpadScreenBuffer.prototype.update = function(screenbuffer, pad)
{
  screenbuffer.buffer_.forEach(function(data, index) {
    if (data != this.backbuffer_[index])
    {
      var color = pad.red.off;
      col = index % 9;
      row = (index - col) / 9
      switch(data)
      {
        case 'r':
        color = pad.red.low;
        break;
        case 'R':
        color = pad.red.full;
        break;
        case 'g':
        color = pad.green.low;
        break;
        case 'G':
        color = pad.green.full;
        break;
        case 'a':
        color = pad.amber.low;
        break;
        case 'A':
        color = pad.amber.full;
        break;
      }
      pad.col(color, [col,row]);
    }
  }, this);
  this.backbuffer_ = screenbuffer.buffer_;
}
