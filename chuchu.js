// This program was compiled from OCaml by js_of_ocaml 1.4
function caml_raise_with_arg (tag, arg) { throw [0, tag, arg]; }
function caml_raise_with_string (tag, msg) {
  caml_raise_with_arg (tag, new MlWrappedString (msg));
}
function caml_invalid_argument (msg) {
  caml_raise_with_string(caml_global_data[4], msg);
}
function caml_array_bound_error () {
  caml_invalid_argument("index out of bounds");
}
function caml_str_repeat(n, s) {
  if (!n) { return ""; }
  if (n & 1) { return caml_str_repeat(n - 1, s) + s; }
  var r = caml_str_repeat(n >> 1, s);
  return r + r;
}
function MlString(param) {
  if (param != null) {
    this.bytes = this.fullBytes = param;
    this.last = this.len = param.length;
  }
}
MlString.prototype = {
  string:null,
  bytes:null,
  fullBytes:null,
  array:null,
  len:null,
  last:0,
  toJsString:function() {
    return this.string = decodeURIComponent (escape(this.getFullBytes()));
  },
  toBytes:function() {
    if (this.string != null)
      var b = unescape (encodeURIComponent (this.string));
    else {
      var b = "", a = this.array, l = a.length;
      for (var i = 0; i < l; i ++) b += String.fromCharCode (a[i]);
    }
    this.bytes = this.fullBytes = b;
    this.last = this.len = b.length;
    return b;
  },
  getBytes:function() {
    var b = this.bytes;
    if (b == null) b = this.toBytes();
    return b;
  },
  getFullBytes:function() {
    var b = this.fullBytes;
    if (b !== null) return b;
    b = this.bytes;
    if (b == null) b = this.toBytes ();
    if (this.last < this.len) {
      this.bytes = (b += caml_str_repeat(this.len - this.last, '\0'));
      this.last = this.len;
    }
    this.fullBytes = b;
    return b;
  },
  toArray:function() {
    var b = this.bytes;
    if (b == null) b = this.toBytes ();
    var a = [], l = this.last;
    for (var i = 0; i < l; i++) a[i] = b.charCodeAt(i);
    for (l = this.len; i < l; i++) a[i] = 0;
    this.string = this.bytes = this.fullBytes = null;
    this.last = this.len;
    this.array = a;
    return a;
  },
  getArray:function() {
    var a = this.array;
    if (!a) a = this.toArray();
    return a;
  },
  getLen:function() {
    var len = this.len;
    if (len !== null) return len;
    this.toBytes();
    return this.len;
  },
  toString:function() { var s = this.string; return s?s:this.toJsString(); },
  valueOf:function() { var s = this.string; return s?s:this.toJsString(); },
  blitToArray:function(i1, a2, i2, l) {
    var a1 = this.array;
    if (a1) {
      if (i2 <= i1) {
        for (var i = 0; i < l; i++) a2[i2 + i] = a1[i1 + i];
      } else {
        for (var i = l - 1; i >= 0; i--) a2[i2 + i] = a1[i1 + i];
      }
    } else {
      var b = this.bytes;
      if (b == null) b = this.toBytes();
      var l1 = this.last - i1;
      if (l <= l1)
        for (var i = 0; i < l; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);
      else {
        for (var i = 0; i < l1; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);
        for (; i < l; i++) a2 [i2 + i] = 0;
      }
    }
  },
  get:function (i) {
    var a = this.array;
    if (a) return a[i];
    var b = this.bytes;
    if (b == null) b = this.toBytes();
    return (i<this.last)?b.charCodeAt(i):0;
  },
  safeGet:function (i) {
    if (this.len == null) this.toBytes();
    if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
    return this.get(i);
  },
  set:function (i, c) {
    var a = this.array;
    if (!a) {
      if (this.last == i) {
        this.bytes += String.fromCharCode (c & 0xff);
        this.last ++;
        return 0;
      }
      a = this.toArray();
    } else if (this.bytes != null) {
      this.bytes = this.fullBytes = this.string = null;
    }
    a[i] = c & 0xff;
    return 0;
  },
  safeSet:function (i, c) {
    if (this.len == null) this.toBytes ();
    if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
    this.set(i, c);
  },
  fill:function (ofs, len, c) {
    if (ofs >= this.last && this.last && c == 0) return;
    var a = this.array;
    if (!a) a = this.toArray();
    else if (this.bytes != null) {
      this.bytes = this.fullBytes = this.string = null;
    }
    var l = ofs + len;
    for (var i = ofs; i < l; i++) a[i] = c;
  },
  compare:function (s2) {
    if (this.string != null && s2.string != null) {
      if (this.string < s2.string) return -1;
      if (this.string > s2.string) return 1;
      return 0;
    }
    var b1 = this.getFullBytes ();
    var b2 = s2.getFullBytes ();
    if (b1 < b2) return -1;
    if (b1 > b2) return 1;
    return 0;
  },
  equal:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string == s2.string;
    return this.getFullBytes () == s2.getFullBytes ();
  },
  lessThan:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string < s2.string;
    return this.getFullBytes () < s2.getFullBytes ();
  },
  lessEqual:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string <= s2.string;
    return this.getFullBytes () <= s2.getFullBytes ();
  }
}
function MlWrappedString (s) { this.string = s; }
MlWrappedString.prototype = new MlString();
function MlMakeString (l) { this.bytes = ""; this.len = l; }
MlMakeString.prototype = new MlString ();
function caml_array_get (array, index) {
  if ((index < 0) || (index >= array.length - 1)) caml_array_bound_error();
  return array[index+1];
}
function caml_array_set (array, index, newval) {
  if ((index < 0) || (index >= array.length - 1)) caml_array_bound_error();
  array[index+1]=newval; return 0;
}
function caml_blit_string(s1, i1, s2, i2, len) {
  if (len === 0) return;
  if (i2 === s2.last && s2.bytes != null) {
    var b = s1.bytes;
    if (b == null) b = s1.toBytes ();
    if (i1 > 0 || s1.last > len) b = b.slice(i1, i1 + len);
    s2.bytes += b;
    s2.last += b.length;
    return;
  }
  var a = s2.array;
  if (!a) a = s2.toArray(); else { s2.bytes = s2.string = null; }
  s1.blitToArray (i1, a, i2, len);
}
function caml_call_gen(f, args) {
  if(f.fun)
    return caml_call_gen(f.fun, args);
  var n = f.length;
  var d = n - args.length;
  if (d == 0)
    return f.apply(null, args);
  else if (d < 0)
    return caml_call_gen(f.apply(null, args.slice(0,n)), args.slice(n));
  else
    return function (x){ return caml_call_gen(f, args.concat([x])); };
}
function caml_classify_float (x) {
  if (isFinite (x)) {
    if (Math.abs(x) >= 2.2250738585072014e-308) return 0;
    if (x != 0) return 1;
    return 2;
  }
  return isNaN(x)?4:3;
}
function caml_create_string(len) {
  if (len < 0) caml_invalid_argument("String.create");
  return new MlMakeString(len);
}
function caml_int64_compare(x,y) {
  var x3 = x[3] << 16;
  var y3 = y[3] << 16;
  if (x3 > y3) return 1;
  if (x3 < y3) return -1;
  if (x[2] > y[2]) return 1;
  if (x[2] < y[2]) return -1;
  if (x[1] > y[1]) return 1;
  if (x[1] < y[1]) return -1;
  return 0;
}
function caml_int_compare (a, b) {
  if (a < b) return (-1); if (a == b) return 0; return 1;
}
function caml_compare_val (a, b, total) {
  var stack = [];
  for(;;) {
    if (!(total && a === b)) {
      if (a instanceof MlString) {
        if (b instanceof MlString) {
            if (a != b) {
		var x = a.compare(b);
		if (x != 0) return x;
	    }
        } else
          return 1;
      } else if (a instanceof Array && a[0] === (a[0]|0)) {
        var ta = a[0];
        if (ta === 250) {
          a = a[1];
          continue;
        } else if (b instanceof Array && b[0] === (b[0]|0)) {
          var tb = b[0];
          if (tb === 250) {
            b = b[1];
            continue;
          } else if (ta != tb) {
            return (ta < tb)?-1:1;
          } else {
            switch (ta) {
            case 248: {
		var x = caml_int_compare(a[2], b[2]);
		if (x != 0) return x;
		break;
	    }
            case 255: {
		var x = caml_int64_compare(a, b);
		if (x != 0) return x;
		break;
	    }
            default:
              if (a.length != b.length) return (a.length < b.length)?-1:1;
              if (a.length > 1) stack.push(a, b, 1);
            }
          }
        } else
          return 1;
      } else if (b instanceof MlString ||
                 (b instanceof Array && b[0] === (b[0]|0))) {
        return -1;
      } else {
        if (a < b) return -1;
        if (a > b) return 1;
        if (total && a != b) {
          if (a == a) return 1;
          if (b == b) return -1;
        }
      }
    }
    if (stack.length == 0) return 0;
    var i = stack.pop();
    b = stack.pop();
    a = stack.pop();
    if (i + 1 < a.length) stack.push(a, b, i + 1);
    a = a[i];
    b = b[i];
  }
}
function caml_equal (x, y) { return +(caml_compare_val(x,y,false) == 0); }
function caml_fill_string(s, i, l, c) { s.fill (i, l, c); }
function caml_parse_format (fmt) {
  fmt = fmt.toString ();
  var len = fmt.length;
  if (len > 31) caml_invalid_argument("format_int: format too long");
  var f =
    { justify:'+', signstyle:'-', filler:' ', alternate:false,
      base:0, signedconv:false, width:0, uppercase:false,
      sign:1, prec:-1, conv:'f' };
  for (var i = 0; i < len; i++) {
    var c = fmt.charAt(i);
    switch (c) {
    case '-':
      f.justify = '-'; break;
    case '+': case ' ':
      f.signstyle = c; break;
    case '0':
      f.filler = '0'; break;
    case '#':
      f.alternate = true; break;
    case '1': case '2': case '3': case '4': case '5':
    case '6': case '7': case '8': case '9':
      f.width = 0;
      while (c=fmt.charCodeAt(i) - 48, c >= 0 && c <= 9) {
        f.width = f.width * 10 + c; i++
      }
      i--;
     break;
    case '.':
      f.prec = 0;
      i++;
      while (c=fmt.charCodeAt(i) - 48, c >= 0 && c <= 9) {
        f.prec = f.prec * 10 + c; i++
      }
      i--;
    case 'd': case 'i':
      f.signedconv = true; /* fallthrough */
    case 'u':
      f.base = 10; break;
    case 'x':
      f.base = 16; break;
    case 'X':
      f.base = 16; f.uppercase = true; break;
    case 'o':
      f.base = 8; break;
    case 'e': case 'f': case 'g':
      f.signedconv = true; f.conv = c; break;
    case 'E': case 'F': case 'G':
      f.signedconv = true; f.uppercase = true;
      f.conv = c.toLowerCase (); break;
    }
  }
  return f;
}
function caml_finish_formatting(f, rawbuffer) {
  if (f.uppercase) rawbuffer = rawbuffer.toUpperCase();
  var len = rawbuffer.length;
  if (f.signedconv && (f.sign < 0 || f.signstyle != '-')) len++;
  if (f.alternate) {
    if (f.base == 8) len += 1;
    if (f.base == 16) len += 2;
  }
  var buffer = "";
  if (f.justify == '+' && f.filler == ' ')
    for (var i = len; i < f.width; i++) buffer += ' ';
  if (f.signedconv) {
    if (f.sign < 0) buffer += '-';
    else if (f.signstyle != '-') buffer += f.signstyle;
  }
  if (f.alternate && f.base == 8) buffer += '0';
  if (f.alternate && f.base == 16) buffer += "0x";
  if (f.justify == '+' && f.filler == '0')
    for (var i = len; i < f.width; i++) buffer += '0';
  buffer += rawbuffer;
  if (f.justify == '-')
    for (var i = len; i < f.width; i++) buffer += ' ';
  return new MlWrappedString (buffer);
}
function caml_format_float (fmt, x) {
  var s, f = caml_parse_format(fmt);
  var prec = (f.prec < 0)?6:f.prec;
  if (x < 0) { f.sign = -1; x = -x; }
  if (isNaN(x)) { s = "nan"; f.filler = ' '; }
  else if (!isFinite(x)) { s = "inf"; f.filler = ' '; }
  else
    switch (f.conv) {
    case 'e':
      var s = x.toExponential(prec);
      var i = s.length;
      if (s.charAt(i - 3) == 'e')
        s = s.slice (0, i - 1) + '0' + s.slice (i - 1);
      break;
    case 'f':
      s = x.toFixed(prec); break;
    case 'g':
      prec = prec?prec:1;
      s = x.toExponential(prec - 1);
      var j = s.indexOf('e');
      var exp = +s.slice(j + 1);
      if (exp < -4 || x.toFixed(0).length > prec) {
        var i = j - 1; while (s.charAt(i) == '0') i--;
        if (s.charAt(i) == '.') i--;
        s = s.slice(0, i + 1) + s.slice(j);
        i = s.length;
        if (s.charAt(i - 3) == 'e')
          s = s.slice (0, i - 1) + '0' + s.slice (i - 1);
        break;
      } else {
        var p = prec;
        if (exp < 0) { p -= exp + 1; s = x.toFixed(p); }
        else while (s = x.toFixed(p), s.length > prec + 1) p--;
        if (p) {
          var i = s.length - 1; while (s.charAt(i) == '0') i--;
          if (s.charAt(i) == '.') i--;
          s = s.slice(0, i + 1);
        }
      }
      break;
    }
  return caml_finish_formatting(f, s);
}
function caml_format_int(fmt, i) {
  if (fmt.toString() == "%d") return new MlWrappedString(""+i);
  var f = caml_parse_format(fmt);
  if (i < 0) { if (f.signedconv) { f.sign = -1; i = -i; } else i >>>= 0; }
  var s = i.toString(f.base);
  if (f.prec >= 0) {
    f.filler = ' ';
    var n = f.prec - s.length;
    if (n > 0) s = caml_str_repeat (n, '0') + s;
  }
  return caml_finish_formatting(f, s);
}
function caml_int64_is_negative(x) {
  return (x[3] << 16) < 0;
}
function caml_int64_neg (x) {
  var y1 = - x[1];
  var y2 = - x[2] + (y1 >> 24);
  var y3 = - x[3] + (y2 >> 24);
  return [255, y1 & 0xffffff, y2 & 0xffffff, y3 & 0xffff];
}
function caml_int64_of_int32 (x) {
  return [255, x & 0xffffff, (x >> 24) & 0xffffff, (x >> 31) & 0xffff]
}
function caml_int64_ucompare(x,y) {
  if (x[3] > y[3]) return 1;
  if (x[3] < y[3]) return -1;
  if (x[2] > y[2]) return 1;
  if (x[2] < y[2]) return -1;
  if (x[1] > y[1]) return 1;
  if (x[1] < y[1]) return -1;
  return 0;
}
function caml_int64_lsl1 (x) {
  x[3] = (x[3] << 1) | (x[2] >> 23);
  x[2] = ((x[2] << 1) | (x[1] >> 23)) & 0xffffff;
  x[1] = (x[1] << 1) & 0xffffff;
}
function caml_int64_lsr1 (x) {
  x[1] = ((x[1] >>> 1) | (x[2] << 23)) & 0xffffff;
  x[2] = ((x[2] >>> 1) | (x[3] << 23)) & 0xffffff;
  x[3] = x[3] >>> 1;
}
function caml_int64_sub (x, y) {
  var z1 = x[1] - y[1];
  var z2 = x[2] - y[2] + (z1 >> 24);
  var z3 = x[3] - y[3] + (z2 >> 24);
  return [255, z1 & 0xffffff, z2 & 0xffffff, z3 & 0xffff];
}
function caml_int64_udivmod (x, y) {
  var offset = 0;
  var modulus = x.slice ();
  var divisor = y.slice ();
  var quotient = [255, 0, 0, 0];
  while (caml_int64_ucompare (modulus, divisor) > 0) {
    offset++;
    caml_int64_lsl1 (divisor);
  }
  while (offset >= 0) {
    offset --;
    caml_int64_lsl1 (quotient);
    if (caml_int64_ucompare (modulus, divisor) >= 0) {
      quotient[1] ++;
      modulus = caml_int64_sub (modulus, divisor);
    }
    caml_int64_lsr1 (divisor);
  }
  return [0,quotient, modulus];
}
function caml_int64_to_int32 (x) {
  return x[1] | (x[2] << 24);
}
function caml_int64_is_zero(x) {
  return (x[3]|x[2]|x[1]) == 0;
}
function caml_int64_format (fmt, x) {
  var f = caml_parse_format(fmt);
  if (f.signedconv && caml_int64_is_negative(x)) {
    f.sign = -1; x = caml_int64_neg(x);
  }
  var buffer = "";
  var wbase = caml_int64_of_int32(f.base);
  var cvtbl = "0123456789abcdef";
  do {
    var p = caml_int64_udivmod(x, wbase);
    x = p[1];
    buffer = cvtbl.charAt(caml_int64_to_int32(p[2])) + buffer;
  } while (! caml_int64_is_zero(x));
  if (f.prec >= 0) {
    f.filler = ' ';
    var n = f.prec - buffer.length;
    if (n > 0) buffer = caml_str_repeat (n, '0') + buffer;
  }
  return caml_finish_formatting(f, buffer);
}
function caml_parse_sign_and_base (s) {
  var i = 0, base = 10, sign = s.get(0) == 45?(i++,-1):1;
  if (s.get(i) == 48)
    switch (s.get(i + 1)) {
    case 120: case 88: base = 16; i += 2; break;
    case 111: case 79: base =  8; i += 2; break;
    case  98: case 66: base =  2; i += 2; break;
    }
  return [i, sign, base];
}
function caml_parse_digit(c) {
  if (c >= 48 && c <= 57)  return c - 48;
  if (c >= 65 && c <= 90)  return c - 55;
  if (c >= 97 && c <= 122) return c - 87;
  return -1;
}
var caml_global_data = [0];
function caml_failwith (msg) {
  caml_raise_with_string(caml_global_data[3], msg);
}
function caml_int_of_string (s) {
  var r = caml_parse_sign_and_base (s);
  var i = r[0], sign = r[1], base = r[2];
  var threshold = -1 >>> 0;
  var c = s.get(i);
  var d = caml_parse_digit(c);
  if (d < 0 || d >= base) caml_failwith("int_of_string");
  var res = d;
  for (;;) {
    i++;
    c = s.get(i);
    if (c == 95) continue;
    d = caml_parse_digit(c);
    if (d < 0 || d >= base) break;
    res = base * res + d;
    if (res > threshold) caml_failwith("int_of_string");
  }
  if (i != s.getLen()) caml_failwith("int_of_string");
  res = sign * res;
  if ((res | 0) != res) caml_failwith("int_of_string");
  return res;
}
function caml_is_printable(c) { return +(c > 31 && c < 127); }
function caml_js_wrap_callback(f) {
  var toArray = Array.prototype.slice;
  return function () {
    var args = (arguments.length > 0)?toArray.call (arguments):[undefined];
    return caml_call_gen(f, args);
  }
}
function caml_make_vect (len, init) {
  var b = [0]; for (var i = 1; i <= len; i++) b[i] = init; return b;
}
function caml_ml_out_channels_list () { return 0; }
function caml_modf_float (x) {
  if (isFinite (x)) {
    var neg = (1/x) < 0;
    x = Math.abs(x);
    var i = Math.floor (x);
    var f = x - i;
    if (neg) { i = -i; f = -f; }
    return [0, f, i];
  }
  if (isNaN (x)) return [0, NaN, NaN];
  return [0, 1/x, x];
}
function caml_mul(x,y) {
  return ((((x >> 16) * y) << 16) + (x & 0xffff) * y)|0;
}
function caml_register_global (n, v) { caml_global_data[n + 1] = v; }
var caml_named_values = {};
function caml_register_named_value(nm,v) {
  caml_named_values[nm] = v; return 0;
}
function caml_sys_const_word_size () { return 32; }
(function(){function gr(iQ,iR,iS,iT,iU,iV,iW){return iQ.length==6?iQ(iR,iS,iT,iU,iV,iW):caml_call_gen(iQ,[iR,iS,iT,iU,iV,iW]);}function cc(iM,iN,iO,iP){return iM.length==3?iM(iN,iO,iP):caml_call_gen(iM,[iN,iO,iP]);}function cH(iJ,iK,iL){return iJ.length==2?iJ(iK,iL):caml_call_gen(iJ,[iK,iL]);}function bf(iH,iI){return iH.length==1?iH(iI):caml_call_gen(iH,[iI]);}var a=[0,new MlString("Failure")],b=[0,new MlString("Invalid_argument")],c=[0,new MlString("Assert_failure")];caml_register_global(6,[0,new MlString("Not_found")]);caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,b);caml_register_global(2,a);var al=new MlString("%d"),ak=new MlString("true"),aj=new MlString("false"),ai=new MlString("Pervasives.do_at_exit"),ah=new MlString("\\b"),ag=new MlString("\\t"),af=new MlString("\\n"),ae=new MlString("\\r"),ad=new MlString("\\\\"),ac=new MlString("\\'"),ab=new MlString("String.blit"),aa=new MlString("String.sub"),$=new MlString("Buffer.add: cannot grow buffer"),_=new MlString(""),Z=new MlString(""),Y=new MlString("%.12g"),X=new MlString("\""),W=new MlString("\""),V=new MlString("'"),U=new MlString("'"),T=new MlString("nan"),S=new MlString("neg_infinity"),R=new MlString("infinity"),Q=new MlString("."),P=new MlString("printf: bad positional specification (0)."),O=new MlString("%_"),N=[0,new MlString("printf.ml"),143,8],M=new MlString("'"),L=new MlString("Printf: premature end of format string '"),K=new MlString("'"),J=new MlString(" in format string '"),I=new MlString(", at char number "),H=new MlString("Printf: bad conversion %"),G=new MlString("Sformat.index_of_int: negative argument "),F=new MlString("pre"),E=new MlString("div"),D=[0,new MlString("web.ml"),230,17],C=new MlString("row"),B=new MlString("cell-even"),A=new MlString("cell-odd"),z=new MlString("cell"),y=[0,0,2],x=[0,4,4],w=[0,4,2],v=new MlString("arrow"),u=new MlString("arrow"),t=new MlString("mouse-right"),s=new MlString("mouse"),r=[0,0,0],q=new MlString("wall"),p=new MlString("wall"),o=new MlString("mouse"),n=new MlString("mouse"),m=new MlString("%.fpx"),l=new MlString("-up"),k=new MlString("-down"),j=new MlString("-left"),i=new MlString("-right"),h=new MlString(" "),g=new MlString("game");function f(d){throw [0,a,d];}function am(e){throw [0,b,e];}function ax(an,ap){var ao=an.getLen(),aq=ap.getLen(),ar=caml_create_string(ao+aq|0);caml_blit_string(an,0,ar,0,ao);caml_blit_string(ap,0,ar,ao,aq);return ar;}function ay(as){return caml_format_int(al,as);}function az(aw){var at=caml_ml_out_channels_list(0);for(;;){if(at){var au=at[2];try {}catch(av){}var at=au;continue;}return 0;}}caml_register_named_value(ai,az);function aM(aA,aC){var aB=caml_create_string(aA);caml_fill_string(aB,0,aA,aC);return aB;}function aN(aF,aD,aE){if(0<=aD&&0<=aE&&!((aF.getLen()-aE|0)<aD)){var aG=caml_create_string(aE);caml_blit_string(aF,aD,aG,0,aE);return aG;}return am(aa);}function aO(aJ,aI,aL,aK,aH){if(0<=aH&&0<=aI&&!((aJ.getLen()-aH|0)<aI)&&0<=aK&&!((aL.getLen()-aH|0)<aK))return caml_blit_string(aJ,aI,aL,aK,aH);return am(ab);}var aP=caml_sys_const_word_size(0),aQ=caml_mul(aP/8|0,(1<<(aP-10|0))-1|0)-1|0;function a8(aR){var aS=1<=aR?aR:1,aT=aQ<aS?aQ:aS,aU=caml_create_string(aT);return [0,aU,0,aT,aU];}function a9(aV){return aN(aV[1],0,aV[2]);}function a2(aW,aY){var aX=[0,aW[3]];for(;;){if(aX[1]<(aW[2]+aY|0)){aX[1]=2*aX[1]|0;continue;}if(aQ<aX[1])if((aW[2]+aY|0)<=aQ)aX[1]=aQ;else f($);var aZ=caml_create_string(aX[1]);aO(aW[1],0,aZ,0,aW[2]);aW[1]=aZ;aW[3]=aX[1];return 0;}}function a_(a0,a3){var a1=a0[2];if(a0[3]<=a1)a2(a0,1);a0[1].safeSet(a1,a3);a0[2]=a1+1|0;return 0;}function a$(a6,a4){var a5=a4.getLen(),a7=a6[2]+a5|0;if(a6[3]<a7)a2(a6,a5);aO(a4,0,a6[1],a6[2],a5);a6[2]=a7;return 0;}function bd(ba){return 0<=ba?ba:f(ax(G,ay(ba)));}function be(bb,bc){return bd(bb+bc|0);}var bg=bf(be,1);function bn(bh){return aN(bh,0,bh.getLen());}function bp(bi,bj,bl){var bk=ax(J,ax(bi,K)),bm=ax(I,ax(ay(bj),bk));return am(ax(H,ax(aM(1,bl),bm)));}function ci(bo,br,bq){return bp(bn(bo),br,bq);}function cj(bs){return am(ax(L,ax(bn(bs),M)));}function bQ(bt,bB,bD,bF){function bA(bu){if((bt.safeGet(bu)-48|0)<0||9<(bt.safeGet(bu)-48|0))return bu;var bv=bu+1|0;for(;;){var bw=bt.safeGet(bv);if(48<=bw){if(!(58<=bw)){var by=bv+1|0,bv=by;continue;}var bx=0;}else if(36===bw){var bz=bv+1|0,bx=1;}else var bx=0;if(!bx)var bz=bu;return bz;}}var bC=bA(bB+1|0),bE=a8((bD-bC|0)+10|0);a_(bE,37);var bG=bF,bH=0;for(;;){if(bG){var bI=bG[2],bJ=[0,bG[1],bH],bG=bI,bH=bJ;continue;}var bK=bC,bL=bH;for(;;){if(bK<=bD){var bM=bt.safeGet(bK);if(42===bM){if(bL){var bN=bL[2];a$(bE,ay(bL[1]));var bO=bA(bK+1|0),bK=bO,bL=bN;continue;}throw [0,c,N];}a_(bE,bM);var bP=bK+1|0,bK=bP;continue;}return a9(bE);}}}function dL(bW,bU,bT,bS,bR){var bV=bQ(bU,bT,bS,bR);if(78!==bW&&110!==bW)return bV;bV.safeSet(bV.getLen()-1|0,117);return bV;}function ck(b3,cb,cg,bX,cf){var bY=bX.getLen();function cd(bZ,ca){var b0=40===bZ?41:125;function b$(b1){var b2=b1;for(;;){if(bY<=b2)return bf(b3,bX);if(37===bX.safeGet(b2)){var b4=b2+1|0;if(bY<=b4)var b5=bf(b3,bX);else{var b6=bX.safeGet(b4),b7=b6-40|0;if(b7<0||1<b7){var b8=b7-83|0;if(b8<0||2<b8)var b9=1;else switch(b8){case 1:var b9=1;break;case 2:var b_=1,b9=0;break;default:var b_=0,b9=0;}if(b9){var b5=b$(b4+1|0),b_=2;}}else var b_=0===b7?0:1;switch(b_){case 1:var b5=b6===b0?b4+1|0:cc(cb,bX,ca,b6);break;case 2:break;default:var b5=b$(cd(b6,b4+1|0)+1|0);}}return b5;}var ce=b2+1|0,b2=ce;continue;}}return b$(ca);}return cd(cg,cf);}function cK(ch){return cc(ck,cj,ci,ch);}function c0(cl,cw,cG){var cm=cl.getLen()-1|0;function cI(cn){var co=cn;a:for(;;){if(co<cm){if(37===cl.safeGet(co)){var cp=0,cq=co+1|0;for(;;){if(cm<cq)var cr=cj(cl);else{var cs=cl.safeGet(cq);if(58<=cs){if(95===cs){var cu=cq+1|0,ct=1,cp=ct,cq=cu;continue;}}else if(32<=cs)switch(cs-32|0){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 0:case 3:case 11:case 13:var cv=cq+1|0,cq=cv;continue;case 10:var cx=cc(cw,cp,cq,105),cq=cx;continue;default:var cy=cq+1|0,cq=cy;continue;}var cz=cq;c:for(;;){if(cm<cz)var cA=cj(cl);else{var cB=cl.safeGet(cz);if(126<=cB)var cC=0;else switch(cB){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var cA=cc(cw,cp,cz,105),cC=1;break;case 69:case 70:case 71:case 101:case 102:case 103:var cA=cc(cw,cp,cz,102),cC=1;break;case 33:case 37:case 44:case 64:var cA=cz+1|0,cC=1;break;case 83:case 91:case 115:var cA=cc(cw,cp,cz,115),cC=1;break;case 97:case 114:case 116:var cA=cc(cw,cp,cz,cB),cC=1;break;case 76:case 108:case 110:var cD=cz+1|0;if(cm<cD){var cA=cc(cw,cp,cz,105),cC=1;}else{var cE=cl.safeGet(cD)-88|0;if(cE<0||32<cE)var cF=1;else switch(cE){case 0:case 12:case 17:case 23:case 29:case 32:var cA=cH(cG,cc(cw,cp,cz,cB),105),cC=1,cF=0;break;default:var cF=1;}if(cF){var cA=cc(cw,cp,cz,105),cC=1;}}break;case 67:case 99:var cA=cc(cw,cp,cz,99),cC=1;break;case 66:case 98:var cA=cc(cw,cp,cz,66),cC=1;break;case 41:case 125:var cA=cc(cw,cp,cz,cB),cC=1;break;case 40:var cA=cI(cc(cw,cp,cz,cB)),cC=1;break;case 123:var cJ=cc(cw,cp,cz,cB),cL=cc(cK,cB,cl,cJ),cM=cJ;for(;;){if(cM<(cL-2|0)){var cN=cH(cG,cM,cl.safeGet(cM)),cM=cN;continue;}var cO=cL-1|0,cz=cO;continue c;}default:var cC=0;}if(!cC)var cA=ci(cl,cz,cB);}var cr=cA;break;}}var co=cr;continue a;}}var cP=co+1|0,co=cP;continue;}return co;}}cI(0);return 0;}function e0(c1){var cQ=[0,0,0,0];function cZ(cV,cW,cR){var cS=41!==cR?1:0,cT=cS?125!==cR?1:0:cS;if(cT){var cU=97===cR?2:1;if(114===cR)cQ[3]=cQ[3]+1|0;if(cV)cQ[2]=cQ[2]+cU|0;else cQ[1]=cQ[1]+cU|0;}return cW+1|0;}c0(c1,cZ,function(cX,cY){return cX+1|0;});return cQ[1];}function dH(c2,c5,c3){var c4=c2.safeGet(c3);if((c4-48|0)<0||9<(c4-48|0))return cH(c5,0,c3);var c6=c4-48|0,c7=c3+1|0;for(;;){var c8=c2.safeGet(c7);if(48<=c8){if(!(58<=c8)){var c$=c7+1|0,c_=(10*c6|0)+(c8-48|0)|0,c6=c_,c7=c$;continue;}var c9=0;}else if(36===c8)if(0===c6){var da=f(P),c9=1;}else{var da=cH(c5,[0,bd(c6-1|0)],c7+1|0),c9=1;}else var c9=0;if(!c9)var da=cH(c5,0,c3);return da;}}function dC(db,dc){return db?dc:bf(bg,dc);}function dr(dd,de){return dd?dd[1]:de;}function gq(fj,dg,fv,dj,e5,fB,df){var dh=bf(dg,df);function fk(di){return cH(dj,dh,di);}function e4(dp,fA,dk,du){var dn=dk.getLen();function e1(fs,dl){var dm=dl;for(;;){if(dn<=dm)return bf(dp,dh);var dq=dk.safeGet(dm);if(37===dq){var dy=function(dt,ds){return caml_array_get(du,dr(dt,ds));},dE=function(dG,dz,dB,dv){var dw=dv;for(;;){var dx=dk.safeGet(dw)-32|0;if(!(dx<0||25<dx))switch(dx){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 10:return dH(dk,function(dA,dF){var dD=[0,dy(dA,dz),dB];return dE(dG,dC(dA,dz),dD,dF);},dw+1|0);default:var dI=dw+1|0,dw=dI;continue;}var dJ=dk.safeGet(dw);if(124<=dJ)var dK=0;else switch(dJ){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var dM=dy(dG,dz),dN=caml_format_int(dL(dJ,dk,dm,dw,dB),dM),dP=dO(dC(dG,dz),dN,dw+1|0),dK=1;break;case 69:case 71:case 101:case 102:case 103:var dQ=dy(dG,dz),dR=caml_format_float(bQ(dk,dm,dw,dB),dQ),dP=dO(dC(dG,dz),dR,dw+1|0),dK=1;break;case 76:case 108:case 110:var dS=dk.safeGet(dw+1|0)-88|0;if(dS<0||32<dS)var dT=1;else switch(dS){case 0:case 12:case 17:case 23:case 29:case 32:var dU=dw+1|0,dV=dJ-108|0;if(dV<0||2<dV)var dW=0;else{switch(dV){case 1:var dW=0,dX=0;break;case 2:var dY=dy(dG,dz),dZ=caml_format_int(bQ(dk,dm,dU,dB),dY),dX=1;break;default:var d0=dy(dG,dz),dZ=caml_format_int(bQ(dk,dm,dU,dB),d0),dX=1;}if(dX){var d1=dZ,dW=1;}}if(!dW){var d2=dy(dG,dz),d1=caml_int64_format(bQ(dk,dm,dU,dB),d2);}var dP=dO(dC(dG,dz),d1,dU+1|0),dK=1,dT=0;break;default:var dT=1;}if(dT){var d3=dy(dG,dz),d4=caml_format_int(dL(110,dk,dm,dw,dB),d3),dP=dO(dC(dG,dz),d4,dw+1|0),dK=1;}break;case 37:case 64:var dP=dO(dz,aM(1,dJ),dw+1|0),dK=1;break;case 83:case 115:var d5=dy(dG,dz);if(115===dJ)var d6=d5;else{var d7=[0,0],d8=0,d9=d5.getLen()-1|0;if(!(d9<d8)){var d_=d8;for(;;){var d$=d5.safeGet(d_),ea=14<=d$?34===d$?1:92===d$?1:0:11<=d$?13<=d$?1:0:8<=d$?1:0,eb=ea?2:caml_is_printable(d$)?1:4;d7[1]=d7[1]+eb|0;var ec=d_+1|0;if(d9!==d_){var d_=ec;continue;}break;}}if(d7[1]===d5.getLen())var ed=d5;else{var ee=caml_create_string(d7[1]);d7[1]=0;var ef=0,eg=d5.getLen()-1|0;if(!(eg<ef)){var eh=ef;for(;;){var ei=d5.safeGet(eh),ej=ei-34|0;if(ej<0||58<ej)if(-20<=ej)var ek=1;else{switch(ej+34|0){case 8:ee.safeSet(d7[1],92);d7[1]+=1;ee.safeSet(d7[1],98);var el=1;break;case 9:ee.safeSet(d7[1],92);d7[1]+=1;ee.safeSet(d7[1],116);var el=1;break;case 10:ee.safeSet(d7[1],92);d7[1]+=1;ee.safeSet(d7[1],110);var el=1;break;case 13:ee.safeSet(d7[1],92);d7[1]+=1;ee.safeSet(d7[1],114);var el=1;break;default:var ek=1,el=0;}if(el)var ek=0;}else var ek=(ej-1|0)<0||56<(ej-1|0)?(ee.safeSet(d7[1],92),d7[1]+=1,ee.safeSet(d7[1],ei),0):1;if(ek)if(caml_is_printable(ei))ee.safeSet(d7[1],ei);else{ee.safeSet(d7[1],92);d7[1]+=1;ee.safeSet(d7[1],48+(ei/100|0)|0);d7[1]+=1;ee.safeSet(d7[1],48+((ei/10|0)%10|0)|0);d7[1]+=1;ee.safeSet(d7[1],48+(ei%10|0)|0);}d7[1]+=1;var em=eh+1|0;if(eg!==eh){var eh=em;continue;}break;}}var ed=ee;}var d6=ax(W,ax(ed,X));}if(dw===(dm+1|0))var en=d6;else{var eo=bQ(dk,dm,dw,dB);try {var ep=0,eq=1;for(;;){if(eo.getLen()<=eq)var er=[0,0,ep];else{var es=eo.safeGet(eq);if(49<=es)if(58<=es)var et=0;else{var er=[0,caml_int_of_string(aN(eo,eq,(eo.getLen()-eq|0)-1|0)),ep],et=1;}else{if(45===es){var ev=eq+1|0,eu=1,ep=eu,eq=ev;continue;}var et=0;}if(!et){var ew=eq+1|0,eq=ew;continue;}}var ex=er;break;}}catch(ey){if(ey[1]!==a)throw ey;var ex=bp(eo,0,115);}var ez=ex[1],eA=d6.getLen(),eB=0,eF=ex[2],eE=32;if(ez===eA&&0===eB){var eC=d6,eD=1;}else var eD=0;if(!eD)if(ez<=eA)var eC=aN(d6,eB,eA);else{var eG=aM(ez,eE);if(eF)aO(d6,eB,eG,0,eA);else aO(d6,eB,eG,ez-eA|0,eA);var eC=eG;}var en=eC;}var dP=dO(dC(dG,dz),en,dw+1|0),dK=1;break;case 67:case 99:var eH=dy(dG,dz);if(99===dJ)var eI=aM(1,eH);else{if(39===eH)var eJ=ac;else if(92===eH)var eJ=ad;else{if(14<=eH)var eK=0;else switch(eH){case 8:var eJ=ah,eK=1;break;case 9:var eJ=ag,eK=1;break;case 10:var eJ=af,eK=1;break;case 13:var eJ=ae,eK=1;break;default:var eK=0;}if(!eK)if(caml_is_printable(eH)){var eL=caml_create_string(1);eL.safeSet(0,eH);var eJ=eL;}else{var eM=caml_create_string(4);eM.safeSet(0,92);eM.safeSet(1,48+(eH/100|0)|0);eM.safeSet(2,48+((eH/10|0)%10|0)|0);eM.safeSet(3,48+(eH%10|0)|0);var eJ=eM;}}var eI=ax(U,ax(eJ,V));}var dP=dO(dC(dG,dz),eI,dw+1|0),dK=1;break;case 66:case 98:var eO=dw+1|0,eN=dy(dG,dz)?ak:aj,dP=dO(dC(dG,dz),eN,eO),dK=1;break;case 40:case 123:var eP=dy(dG,dz),eQ=cc(cK,dJ,dk,dw+1|0);if(123===dJ){var eR=a8(eP.getLen()),eV=function(eT,eS){a_(eR,eS);return eT+1|0;};c0(eP,function(eU,eX,eW){if(eU)a$(eR,O);else a_(eR,37);return eV(eX,eW);},eV);var eY=a9(eR),dP=dO(dC(dG,dz),eY,eQ),dK=1;}else{var eZ=dC(dG,dz),e2=be(e0(eP),eZ),dP=e4(function(e3){return e1(e2,eQ);},eZ,eP,du),dK=1;}break;case 33:bf(e5,dh);var dP=e1(dz,dw+1|0),dK=1;break;case 41:var dP=dO(dz,_,dw+1|0),dK=1;break;case 44:var dP=dO(dz,Z,dw+1|0),dK=1;break;case 70:var e6=dy(dG,dz);if(0===dB)var e7=Y;else{var e8=bQ(dk,dm,dw,dB);if(70===dJ)e8.safeSet(e8.getLen()-1|0,103);var e7=e8;}var e9=caml_classify_float(e6);if(3===e9)var e_=e6<0?S:R;else if(4<=e9)var e_=T;else{var e$=caml_format_float(e7,e6),fa=0,fb=e$.getLen();for(;;){if(fb<=fa)var fc=ax(e$,Q);else{var fd=e$.safeGet(fa)-46|0,fe=fd<0||23<fd?55===fd?1:0:(fd-1|0)<0||21<(fd-1|0)?1:0;if(!fe){var ff=fa+1|0,fa=ff;continue;}var fc=e$;}var e_=fc;break;}}var dP=dO(dC(dG,dz),e_,dw+1|0),dK=1;break;case 91:var dP=ci(dk,dw,dJ),dK=1;break;case 97:var fg=dy(dG,dz),fh=bf(bg,dr(dG,dz)),fi=dy(0,fh),fm=dw+1|0,fl=dC(dG,fh);if(fj)fk(cH(fg,0,fi));else cH(fg,dh,fi);var dP=e1(fl,fm),dK=1;break;case 114:var dP=ci(dk,dw,dJ),dK=1;break;case 116:var fn=dy(dG,dz),fp=dw+1|0,fo=dC(dG,dz);if(fj)fk(bf(fn,0));else bf(fn,dh);var dP=e1(fo,fp),dK=1;break;default:var dK=0;}if(!dK)var dP=ci(dk,dw,dJ);return dP;}},fu=dm+1|0,fr=0;return dH(dk,function(ft,fq){return dE(ft,fs,fr,fq);},fu);}cH(fv,dh,dq);var fw=dm+1|0,dm=fw;continue;}}function dO(fz,fx,fy){fk(fx);return e1(fz,fy);}return e1(fA,0);}var fC=cH(e4,fB,bd(0)),fD=e0(df);if(fD<0||6<fD){var fQ=function(fE,fK){if(fD<=fE){var fF=caml_make_vect(fD,0),fI=function(fG,fH){return caml_array_set(fF,(fD-fG|0)-1|0,fH);},fJ=0,fL=fK;for(;;){if(fL){var fM=fL[2],fN=fL[1];if(fM){fI(fJ,fN);var fO=fJ+1|0,fJ=fO,fL=fM;continue;}fI(fJ,fN);}return cH(fC,df,fF);}}return function(fP){return fQ(fE+1|0,[0,fP,fK]);};},fR=fQ(0,0);}else switch(fD){case 1:var fR=function(fT){var fS=caml_make_vect(1,0);caml_array_set(fS,0,fT);return cH(fC,df,fS);};break;case 2:var fR=function(fV,fW){var fU=caml_make_vect(2,0);caml_array_set(fU,0,fV);caml_array_set(fU,1,fW);return cH(fC,df,fU);};break;case 3:var fR=function(fY,fZ,f0){var fX=caml_make_vect(3,0);caml_array_set(fX,0,fY);caml_array_set(fX,1,fZ);caml_array_set(fX,2,f0);return cH(fC,df,fX);};break;case 4:var fR=function(f2,f3,f4,f5){var f1=caml_make_vect(4,0);caml_array_set(f1,0,f2);caml_array_set(f1,1,f3);caml_array_set(f1,2,f4);caml_array_set(f1,3,f5);return cH(fC,df,f1);};break;case 5:var fR=function(f7,f8,f9,f_,f$){var f6=caml_make_vect(5,0);caml_array_set(f6,0,f7);caml_array_set(f6,1,f8);caml_array_set(f6,2,f9);caml_array_set(f6,3,f_);caml_array_set(f6,4,f$);return cH(fC,df,f6);};break;case 6:var fR=function(gb,gc,gd,ge,gf,gg){var ga=caml_make_vect(6,0);caml_array_set(ga,0,gb);caml_array_set(ga,1,gc);caml_array_set(ga,2,gd);caml_array_set(ga,3,ge);caml_array_set(ga,4,gf);caml_array_set(ga,5,gg);return cH(fC,df,ga);};break;default:var fR=cH(fC,df,[0]);}return fR;}function gp(gh){return a8(2*gh.getLen()|0);}function gm(gk,gi){var gj=a9(gi);gi[2]=0;return bf(gk,gj);}function gu(gl){var go=bf(gm,gl);return gr(gq,1,gp,a_,a$,function(gn){return 0;},go);}var gv=[0,0];function gB(gt){return cH(gu,function(gs){return gs;},gt);}var gA=null,gz=undefined,gy=true,gx=Array;function gC(gw){return gw instanceof gx?0:[0,new MlWrappedString(gw.toString())];}gv[1]=[0,gC,gv[1]];function gF(gD,gE){gD.appendChild(gE);return 0;}var gG=this,gH=gG.document;function gK(gJ,gI){return gJ.createElement(gI.toString());}this.HTMLElement===gz;function gP(gL){return gL.toString();}function gS(gQ,gM,gN){var gO=gM?ax(gN,ax(h,gM[1])):gN;return gQ.className=gP(gO);}function hk(gU,gT){var gR=gK(gH,E);gS(gR,gU,gT);return gR;}function g$(gX,gV){switch(gV){case 1:var gW=k;break;case 2:var gW=j;break;case 3:var gW=i;break;default:var gW=l;}return ax(gX,gW);}function g5(g0,g1){function gZ(gY){return gP(cH(gB,m,60*gY));}var g2=g0.style;g2.left=gZ(g1[1]);var g3=g0.style;return g3.top=gZ(g1[2]);}function hu(g4,g6){g5(g4[1],g6);g4[2]=g6;return 0;}function hc(g7){return g7+0.5|0;}function hW(g8){switch(g8){case 1:return 2;case 2:return 0;case 3:return 1;default:return 3;}}function hN(g9,g_){g9[3]=g_;var ha=[0,g$(o,g9[3])];gS(g9[1],ha,n);if(2<=g9[3]){var hb=g9[2],hd=hc(hb[2]),he=[0,hb[1],hd];}else{var hf=g9[2],hg=hf[2],he=[0,hc(hf[1]),hg];}g9[2]=he;return 0;}function hY(hm,hh,hi){var hj=[0,hh[1],hh[2]],hl=hk([0,g$(q,hi)],p);g5(hl,hj);gF(hm,hl);return [0,hl,hh,hi];}function hZ(hL,hn){var ho=hn[3],hp=hn[2],hq=hp[2],hr=hp[1],hs=0.05;switch(ho){case 1:var ht=[0,hr,hq+hs];break;case 2:var ht=[0,hr-hs,hq];break;case 3:var ht=[0,hr+hs,hq];break;default:var ht=[0,hr,hq-hs];}hu(hn,ht);var hv=hn[2],hw=caml_modf_float(hv[1]+1),hx=hw[1],hy=caml_modf_float(hv[2]+1),hz=hy[1],hA=hw[2]-1|0,hB=hy[2]-1|0;function hE(hC){return hC<0.5?1:0;}function hF(hD){return 0.5<=hD?1:0;}switch(hn[3]){case 1:if(hE(hz)){var hG=[0,[0,hA,hB]],hH=1;}else var hH=0;break;case 2:if(hF(hx)){var hG=[0,[0,hA+1|0,hB]],hH=1;}else var hH=0;break;case 3:if(hE(hx)){var hG=[0,[0,hA,hB]],hH=1;}else var hH=0;break;default:if(hF(hz)){var hG=[0,[0,hA,hB+1|0]],hH=1;}else var hH=0;}if(!hH)var hG=0;if(hG){var hI=hG[1],hJ=hI[2],hK=hI[1],hM=caml_array_get(caml_array_get(hL[4],hK),hJ);if(hM)return hN(hn,hM[1][1]);var hO=hL[3];for(;;){if(hO){var hP=hO[1],hQ=caml_equal([0,hK,hJ],hP[2]),hS=hO[2],hR=hQ?caml_equal(ho,hP[3]):hQ;if(!hR){var hO=hS;continue;}var hT=hR;}else var hT=0;if(hT)var hU=hT;else{switch(ho){case 1:var hV=7===hJ?1:0;break;case 2:var hV=0===hK?1:0;break;case 3:var hV=7===hK?1:0;break;default:var hV=0===hJ?1:0;}var hU=hV;}if(hU)return hN(hn,hW(hn[3]));var hX=hU;break;}}else var hX=hG;return hX;}var h0=gH.getElementById(gP(g));if(h0==gA)throw [0,c,D];var h1=8,h2=caml_make_vect(h1,[0]),h3=0,h4=h1-1|0,h6=0,h7=8;if(!(h4<h3)){var h5=h3;for(;;){h2[h5+1]=caml_make_vect(h7,h6);var h8=h5+1|0;if(h4!==h5){var h5=h8;continue;}break;}}var h9=0,h_=7;if(!(h_<h9)){var h$=h9;for(;;){var ia=hk(0,C),ib=0,ic=7;if(!(ic<ib)){var id=ib;for(;;){var ie=0===((h$+id|0)%2|0)?B:A,ig=hk([0,ie],z),im=function(h$,id,ig){return function(il){var ih=caml_array_get(caml_array_get(h2,id),h$);if(ih){var ii=ih[1];ig.removeChild(ii[2]);var ij=hW(ii[1]);}else var ij=ih;var ik=hk([0,g$(v,ij)],u);gF(ig,ik);caml_array_set(caml_array_get(h2,id),h$,[0,[0,ij,ik]]);return gy;};}(h$,id,ig);ig.onclick=caml_js_wrap_callback(function(im){return function(io){if(io){var ip=im(io);if(!(ip|0))io.preventDefault();return ip;}var iq=event,ir=im(iq);if(!(ir|0))iq.returnValue=ir;return ir;};}(im));gF(ia,ig);var is=id+1|0;if(ic!==id){var id=is;continue;}break;}}gF(h0,ia);var it=h$+1|0;if(h_!==h$){var h$=it;continue;}break;}}var iu=gK(gH,F);gF(h0,iu);var iv=hk([0,t],s),iw=[0,iv,r,3];hu(iw,y);gF(h0,iv);var ix=[0,iw,0],iy=[0,hY(h0,x,1),0],iA=[0,hY(h0,w,3),iy],iB=[0,h0,ix,iA,h2,function(iz){return iu.innerHTML=gP(iz);}],iG=16;gG.setInterval(caml_js_wrap_callback(function(iF){var iC=ix,iD=bf(hZ,iB);for(;;){if(iC){var iE=iC[2];bf(iD,iC[1]);var iC=iE;continue;}return 0;}}),iG);az(0);return;}());
