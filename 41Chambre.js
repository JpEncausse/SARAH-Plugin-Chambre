
exports.action = function(data, callback, config, SARAH){
  
  if (data.move){
    movement(data.move, SARAH);
  }
  if (data.sunset){
    playing  = false;
    speaking = false;
    steps    = data.steps   ? parseInt(data.steps)   : steps;
    timeout  = data.timeout ? parseInt(data.timeout) : timeout;
    sunset(0, SARAH);
  }
  
  callback({});
}

// ------------------------------------------
//  MOVE
// ------------------------------------------

var movement = function(move, SARAH){
  var color  = 'FFCCAA';
  var answer = 'Mouvement détectés  dans la chambre'
   
  if (move == 0){
    answer = 'Plus de mouvements dans la chambre'
  }
  
  var now = new Date();
  if (now.getHours() > 1 && now.getHours() < 8){ return; }
  
  SARAH.speak(answer, function(){  
    SARAH.call('hue', { 'on': (move == 1), 'rgb1': color, 'rgb3': color, 'rgb4': color, 'rgb5': color, 'rgb6':  color, 'rgb7':  color});
  });
  
  clearTimeout(clear);
}

// ------------------------------------------
//  SUNSET
// ------------------------------------------

var cc  = require('../hue/lib/colorconverter').cc;
var steps    =  6;
var timeout  =  1000 * 2;
var rainbow  = ['230F51', 'FD0E67', 'FE5B35', 'FE7518', 'FFCCAA']; //6622FF
var clear    = false;
var playing  = false;
var speaking = false;
var sunset   = function(counter, SARAH){
  
  var step  = Math.floor(counter % steps);
  var index = Math.floor(counter / steps);
  if (index+1 >= rainbow.length){ return; }
  
  var color1 = rainbow[index];
  var color2 = rainbow[index+1];
  
  var rgb1   = cc.hexStringToRgb(color1);
  var rgb2   = cc.hexStringToRgb(color2);
  var rgb    = {
    r: rgb1.r + (rgb2.r-rgb1.r) / (steps-step),
    g: rgb1.g + (rgb2.g-rgb1.g) / (steps-step),
    b: rgb1.b + (rgb2.b-rgb1.b) / (steps-step)
  }
  
  var total = steps * (rainbow.length-1)
  var bri = (255 / total) * (counter+1);
  var color =  cc.rgbToHexString(rgb);
  console.log(counter+'/'+total, color, bri);
  
  if (counter > total/2 && !playing){
    playing = true;
    SARAH.play('plugins/41Chambre/medias/zen.mp3');
  }
  
  if (counter > (total/3*2) && !speaking){
    speaking = true;
    SARAH.call('meteo', { zip : '786460', date : '0' }, function(cb){
      var moment = require('moment');
          moment.lang('fr');
      var now = moment();
      SARAH.speak('Bonjour Jean-Philippe, nous sommes le '+now.format('dddd DD MMMM')+'. Il est '+now.format('hh:mm')+'. '+cb.tts+'. Bonne journée.');
    });
  }
  
  SARAH.call('hue', { 'on': 'true', 'bri': Math.round(bri), 
             'rgb1': color, 'rgb3': color, 'rgb4': color, 'rgb5': color, 'rgb6':  color, 'rgb7':  color });
             
  clear = setTimeout(function(){ sunset(counter+1, SARAH); }, timeout);
}