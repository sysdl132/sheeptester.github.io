// too lazy to make my own
var convertCOLOR={
  hsl2rgb(hsl) {
    // http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
    var h=hsl.h,s=hsl.s,l=hsl.l;
    var r, g, b;
    if(s == 0) r = g = b = l; // achromatic
    else {
      var hue2rgb = function hue2rgb(p, q, t){
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return {
      h:Math.round(r*255),
      s:Math.round(g*255),
      l:Math.round(b*255)
    };
  },
  rgb2hsl(rgb) {
    var r=rgb.r/255,g=rgb.g/255,b=rgb.b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if(max == min) h = s = 0; // achromatic
    else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
      h:Math.round(h*360),
      s:Math.round(s*100)/100,
      l:Math.round(l*100)/100
    };
  },
  rgb2hex(rgb) {
    // http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    var r=rgb.r,g=rgb.g,b=rgb.b;
    function componentToHex(c) {
      var hex=c.toString(16);
      return hex.length==1?"0"+hex:hex;
    }
    return "#"+componentToHex(r)+componentToHex(g)+componentToHex(b);
  },
  hex2rgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  hex2long(hex) {
    return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(m,r,g,b){
      return r+r+g+g+b+b;
    });
  }
}

function canBeDragged(elem,xwise,ywise,moreoptions) {
  var drag={},
  x,y,maxx,maxy,min=false,
  idenifydrag=e=>{
    let x,y;
    if (xwise) x=Number(elem.style.left.slice(0,-2));
    if (ywise) y=Number(elem.style.top.slice(0,-2));
    if (xwise) x=e.clientX-drag.offx;
    if (ywise) y=e.clientY-drag.offy;
    if (min) {
      if (xwise&&x<0) x=0;
      else if (xwise&&maxx&&x>maxx) x=maxx;
      if (ywise&&y<0) y=0;
      else if (ywise&&maxy&&y>maxy) y=maxy;
    }
    if (xwise) elem.style.left=x+'px';
    if (ywise) elem.style.top=y+'px';
  },
  mousedown=e=>{
    if (!drag.dragging) {
      drag.dragging=true;
      if (xwise) drag.offx=e.clientX-Number(elem.style.left.slice(0,-2));
      if (ywise) drag.offy=e.clientY-Number(elem.style.top.slice(0,-2));
      elem.parentNode.onmousemove=mousemove;
      elem.parentNode.onmouseup=mouseup;
    }
  },
  mousemove=e=>{
    if (drag.dragging) {
      idenifydrag(e);
    }
  },
  mouseup=e=>{
    if (drag.dragging) {
      idenifydrag(e);
      drag.dragging=false;
      elem.parentNode.onmousemove=null;
      elem.parentNode.onmouseup=null;
    }
  };
  if (moreoptions) {
    if (xwise) elem.style.left=(moreoptions.x||0)+'px';
    if (ywise) elem.style.top=(moreoptions.y||0)+'px';
    maxx=moreoptions.maxx;
    maxy=moreoptions.maxy;
    if (maxx||maxy) min=true;
  }
  elem.parentNode.onmousedown=mousedown;
}
function isAColorInput(input,options) {
  if (input&&input.tagName==='INPUT') {
    var picker=document.createElement('colorpicker'),
    inputfocused=false,
    pickerfocused=false,
    timeout,
    prevpickerfocus;
    function isDescendant(parent,child) {
      // http://stackoverflow.com/questions/2234979/how-to-check-in-javascript-if-one-element-is-contained-within-another
      var node=child.parentNode;
      while (node!=null) {
        if (node==parent)
          return true;
        node=node.parentNode;
      }
      return false;
    }
    (_=>{
      var s,o,
      t=u=>document.createElement(u), // too lazy to type stuff so badly named functions here :D
      v=w=>picker.appendChild(w),
      r=(q,p)=>q.classList.add(p),
      classes,inner;
      s=t('div');
      r(s,'inputsCOLOR');
      r(s,'activeCOLOR');
      classes=['hex','#','rgb','rgb()','hsl','hsl()'];
      inner='';
      for (var i=0;i<classes.length;i+=2)
        inner+='<input type="text" placeholder="'+classes[i+1]+'" class="'+classes[i]+'COLOR"/>';
      s.innerHTML=inner;
      v(s);
      s=t('div');
      r(s,'shadesCOLOR');
      v(s);
      s=t('div');
      r(s,'wheelCOLOR');
      o=t('saturation');
      o.appendChild(t('value'));
      o.appendChild(t('drag2d'));
      s.appendChild(o);
      o=t('hue');
      o.appendChild(t('drag1d'));
      s.appendChild(o);
      o=t('alpha');
      o.appendChild(t('alphagradient'));
      o.appendChild(t('drag1d'));
      s.appendChild(o);
      v(s);
      s=t('div');
      r(s,'slidersCOLOR');
      classes=['black','red','black','green','black','blue','cyan','white','magenta','white','yellow','white'];
      inner='';
      for (var i=0;i<classes.length;i+=2)
        inner+='<slider style="background-image:linear-gradient(to right,'+classes[i]+','+classes[i+1]+');"><drag1d></drag1d></slider>';
      s.innerHTML=inner;
      // s.querySelector('slider:last-of-type').classList.add('transparentCOLOR');
      v(s);
      s=t('nav');
      classes=['inputsCOLOR active','shades','wheel','sliders'];
      inner='';
      for (var i=0;i<classes.length;i++)
        inner+='<place class="'+classes[i]+'COLOR"></place>';
      s.innerHTML=inner;
      s.onclick=e=>{
        if (e.target.tagName==='PLACE') {
          var t=picker.querySelectorAll('.activeCOLOR')
          for (var i=0;i<t.length;i++) t[i].classList.remove('activeCOLOR');
          e.target.classList.add('activeCOLOR');
          picker.querySelector('.'+e.target.classList[0]).classList.add('activeCOLOR');
        }
      };
      v(s);
      o=picker.querySelectorAll('*');
      for (var i=0;i<o.length;i++) o[i].setAttribute('tabindex','0');
      canBeDragged(picker.querySelector('drag2d'),true,true,{x:50,y:50,maxx:190,maxy:100});
      o=picker.querySelectorAll('drag1d');
      for (var i=0;i<o.length;i++) canBeDragged(o[i],true,false,{x:50,maxx:190});
    })();
    picker.setAttribute('tabindex','0');
    document.body.appendChild(picker);
    input.style.color='transparent';
    input.oninput=()=>input.value='';
    input.onmousedown=()=>{
      if (!inputfocused) {
        inputfocused=true;
        if (!pickerfocused) {
          var rect=input.getBoundingClientRect();
          picker.style.left=(rect.left+window.scrollX)+'px';
          picker.style.top=(rect.top+window.scrollY+rect.height+10)+'px';
          picker.style.display='block';
          picker.classList.add('pickerin');
          timeout=setTimeout(()=>{
            picker.classList.remove('pickerin');
          },300);
        }
      }
      pickerfocused=false;
    };
    input.onblur=()=>{
      if (inputfocused) {
        inputfocused=false;
        if (!pickerfocused) {
          picker.classList.add('pickerout');
          timeout=setTimeout(()=>{
            picker.style.display='none';
            picker.classList.remove('pickerout');
          },300);
        }
      }
    };
    // mousedown then blur then focus/click
    picker.onmousedown=e=>{
      if (pickerfocused!=e.target) {
        if (prevpickerfocus) prevpickerfocus.onblur=null;
        pickerfocused=e.target;
        clearTimeout(timeout);
        picker.classList.remove('pickerout');
        prevpickerfocus=e.target;
        e.target.focus();
        e.target.onblur=e=>{
          e.target.onblur=null;
          if (pickerfocused) {
            pickerfocused=false;
            if (!inputfocused) {
              picker.classList.add('pickerout');
              timeout=setTimeout(()=>{
                picker.style.display='none';
                picker.classList.remove('pickerout');
                prevpickerfocus=null;
              },300);
            }
          }
        }
      }
      inputfocused=false;
    };
    if (options.value) input.value=options.value;
    else if (!input.value) input.value='#000';
    input.style.backgroundColor=input.value;
    let converted, object;
    if ('#rh'.indexOf(input.value[0])===-1) input.value='#'+input.value;
    switch (input.value[0]) {
      case '#':
        input.value=convertCOLOR.hex2long(input.value);
        picker.querySelector('input.hexCOLOR').value=input.value;
        converted=convertCOLOR.hex2rgb(input.value);
        picker.querySelector('input.rgbCOLOR').value='rgb('+converted.r+','+converted.g+','+converted.b+')';
        converted=convertCOLOR.rgb2hsl(converted);
        picker.querySelector('input.hslCOLOR').value='hsl('+converted.h+','+(converted.s*100)+'%,'+(converted.l*100)+'%)';
        break;
      case 'r':
        picker.querySelector('input.rgbCOLOR').value=input.value;
        object=input.value.slice(4,-1).split(',');
        object={r:Number(object[0]),g:Number(object[1]),b:Number(object[2])};
        picker.querySelector('input.hexCOLOR').value=convertCOLOR.rgb2hex(object);
        converted=convertCOLOR.rgb2hsl(object);
        picker.querySelector('input.hslCOLOR').value='hsl('+converted.h+','+(converted.s*100)+'%,'+(converted.l*100)+'%)';
        break;
      case 'h':
        picker.querySelector('input.hslCOLOR').value=input.value;
        object=input.value.slice(4,-1).split(',');
        object={h:Number(object[0]),s:Number(object[1].slice(0,-1)),l:Number(object[2].slice(0,-1))};
        // picker.querySelector('input.hexCOLOR').value=convertCOLOR.rgb2hex(object);
        // converted=convertCOLOR.rgb2hsl(object);
        // picker.querySelector('input.hslCOLOR').value='hsl('+converted.h+','+(converted.s*100)+'%,'+(converted.l*100)+'%)';
        break;
    }
  } else {
    console.error('No sir, that\'s not an input element.');
  }
}
