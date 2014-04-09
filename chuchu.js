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
function caml_array_blit(a1, i1, a2, i2, len) {
  if (i2 <= i1) {
    for (var j = 1; j <= len; j++) a2[i2 + j] = a1[i1 + j];
  } else {
    for (var j = len; j >= 1; j--) a2[i2 + j] = a1[i1 + j];
  }
}
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
function caml_raise_constant (tag) { throw [0, tag]; }
var caml_global_data = [0];
function caml_raise_zero_divide () {
  caml_raise_constant(caml_global_data[6]);
}
function caml_div(x,y) {
  if (y == 0) caml_raise_zero_divide ();
  return (x/y)|0;
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
function caml_get_public_method (obj, tag) {
  var meths = obj[1];
  var li = 3, hi = meths[1] * 2 + 1, mi;
  while (li < hi) {
    mi = ((li+hi) >> 1) | 1;
    if (tag < meths[mi+1]) hi = mi-2;
    else li = mi;
  }
  return (tag == meths[li+1] ? meths[li] : 0);
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
function caml_mod(x,y) {
  if (y == 0) caml_raise_zero_divide ();
  return x%y;
}
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
function caml_compare (a, b) { return caml_compare_val (a, b, true); }
function caml_notequal (x, y) { return +(caml_compare_val(x,y,false) != 0); }
function caml_obj_block (tag, size) {
  var o = [tag];
  for (var i = 1; i <= size; i++) o[i] = 0;
  return o;
}
function caml_register_global (n, v) { caml_global_data[n + 1] = v; }
var caml_named_values = {};
function caml_register_named_value(nm,v) {
  caml_named_values[nm] = v; return 0;
}
function caml_string_compare(s1, s2) { return s1.compare(s2); }
function caml_string_equal(s1, s2) {
  var b1 = s1.fullBytes;
  var b2 = s2.fullBytes;
  if (b1 != null && b2 != null) return (b1 == b2)?1:0;
  return (s1.getFullBytes () == s2.getFullBytes ())?1:0;
}
function caml_string_notequal(s1, s2) { return 1-caml_string_equal(s1, s2); }
function caml_sys_const_word_size () { return 32; }
function caml_update_dummy (x, y) {
  if( typeof y==="function" ) { x.fun = y; return 0; }
  if( y.fun ) { x.fun = y.fun; return 0; }
  var i = y.length; while (i--) x[i] = y[i]; return 0;
}
(function(){function mn(vE,vF,vG,vH,vI,vJ,vK){return vE.length==6?vE(vF,vG,vH,vI,vJ,vK):caml_call_gen(vE,[vF,vG,vH,vI,vJ,vK]);}function ux(vy,vz,vA,vB,vC,vD){return vy.length==5?vy(vz,vA,vB,vC,vD):caml_call_gen(vy,[vz,vA,vB,vC,vD]);}function qN(vt,vu,vv,vw,vx){return vt.length==4?vt(vu,vv,vw,vx):caml_call_gen(vt,[vu,vv,vw,vx]);}function dY(vp,vq,vr,vs){return vp.length==3?vp(vq,vr,vs):caml_call_gen(vp,[vq,vr,vs]);}function cF(vm,vn,vo){return vm.length==2?vm(vn,vo):caml_call_gen(vm,[vn,vo]);}function bm(vk,vl){return vk.length==1?vk(vl):caml_call_gen(vk,[vl]);}var a=[0,new MlString("Failure")],b=[0,new MlString("Invalid_argument")],c=[0,new MlString("Not_found")],d=[0,new MlString("Assert_failure")],e=[0,new MlString("is_at")],f=[0,new MlString("is_at")];caml_register_global(6,c);caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,b);caml_register_global(2,a);var a1=new MlString("%d"),a0=new MlString("true"),aZ=new MlString("false"),aY=new MlString("Pervasives.do_at_exit"),aX=new MlString("Array.blit"),aW=new MlString("\\b"),aV=new MlString("\\t"),aU=new MlString("\\n"),aT=new MlString("\\r"),aS=new MlString("\\\\"),aR=new MlString("\\'"),aQ=new MlString("String.blit"),aP=new MlString("String.sub"),aO=new MlString("Map.remove_min_elt"),aN=[0,0,0,0],aM=[0,new MlString("map.ml"),270,10],aL=[0,0,0],aK=new MlString("Map.bal"),aJ=new MlString("Map.bal"),aI=new MlString("Map.bal"),aH=new MlString("Map.bal"),aG=new MlString("Queue.Empty"),aF=new MlString("Buffer.add: cannot grow buffer"),aE=new MlString(""),aD=new MlString(""),aC=new MlString("%.12g"),aB=new MlString("\""),aA=new MlString("\""),az=new MlString("'"),ay=new MlString("'"),ax=new MlString("nan"),aw=new MlString("neg_infinity"),av=new MlString("infinity"),au=new MlString("."),at=new MlString("printf: bad positional specification (0)."),as=new MlString("%_"),ar=[0,new MlString("printf.ml"),143,8],aq=new MlString("'"),ap=new MlString("Printf: premature end of format string '"),ao=new MlString("'"),an=new MlString(" in format string '"),am=new MlString(", at char number "),al=new MlString("Printf: bad conversion %"),ak=new MlString("Sformat.index_of_int: negative argument "),aj=[0,987910699,495797812,364182224,414272206,318284740,990407751,383018966,270373319,840823159,24560019,536292337,512266505,189156120,730249596,143776328,51606627,140166561,366354223,1003410265,700563762,981890670,913149062,526082594,1021425055,784300257,667753350,630144451,949649812,48546892,415514493,258888527,511570777,89983870,283659902,308386020,242688715,482270760,865188196,1027664170,207196989,193777847,619708188,671350186,149669678,257044018,87658204,558145612,183450813,28133145,901332182,710253903,510646120,652377910,409934019,801085050],ai=new MlString(""),ah=new MlString("CamlinternalOO.last_id"),ag=new MlString("div"),af=new MlString(" "),ae=new MlString("-up"),ad=new MlString("-down"),ac=new MlString("-left"),ab=new MlString("-right"),aa=new MlString("%.fpx"),$=new MlString("Tools.QF_found"),_=new MlString("cat"),Z=new MlString("mouse"),Y=new MlString(""),X=new MlString(""),W=new MlString(""),V=[0,new MlString("update_class"),new MlString("turn_to"),new MlString("turn"),new MlString("move_straight"),new MlString("move"),new MlString("disappear"),new MlString("anim"),new MlString("act_tile")],U=[0,new MlString("dom"),new MlString("pos"),new MlString("dir")],T=[0,new MlString("anim"),new MlString("move"),new MlString("turn"),new MlString("move_straight"),new MlString("turn_to"),new MlString("update_class"),new MlString("disappear"),new MlString("act_tile")],S=new MlString("wall"),R=new MlString("wall"),Q=[0,new MlString("dom"),new MlString("pos"),new MlString("dir")],P=new MlString("sink"),O=[0,new MlString("pos")],N=new MlString("spawner"),M=new MlString(""),L=new MlString(""),K=new MlString("anim"),J=[0,new MlString("anim")],I=new MlString("arrow"),H=new MlString("arrow"),G=new MlString("arrow"),F=new MlString("arrow"),E=new MlString(""),D=[0,new MlString("pos"),new MlString("dom"),new MlString("dir")],C=[0,new MlString("turn"),new MlString("is_at"),new MlString("dir"),new MlString("detach")],B=[0,new MlString("is_at"),new MlString("turn"),new MlString("detach"),new MlString("dir")],A=new MlString("score"),z=new MlString("row"),y=new MlString("cell-even"),x=new MlString("cell-odd"),w=new MlString("cell"),v=new MlString("Score: %d"),u=[0,0],t=[0,[1,0]],s=new MlString(""),r=[0,new MlString("dom"),new MlString("walls"),new MlString("mouses"),new MlString("spawners"),new MlString("sinks"),new MlString("frames"),new MlString("score"),new MlString("arrows")],q=[0,new MlString("wall_at"),new MlString("update_score"),new MlString("try_arrow"),new MlString("start"),new MlString("score_mouse_for"),new MlString("remove_mouse"),new MlString("every_nth_frame"),new MlString("event_at"),new MlString("arrow_at"),new MlString("anim"),new MlString("add_wall"),new MlString("add_spawner"),new MlString("add_sink"),new MlString("add_mouse"),new MlString("add_arrow")],p=[0,new MlString("anim"),new MlString("event_at"),new MlString("remove_mouse"),new MlString("try_arrow"),new MlString("add_sink"),new MlString("add_wall"),new MlString("score_mouse_for"),new MlString("arrow_at"),new MlString("start"),new MlString("every_nth_frame"),new MlString("add_mouse"),new MlString("wall_at"),new MlString("add_arrow"),new MlString("add_spawner"),new MlString("update_score")],o=[0,new MlString("web.ml"),20,17],n=[0,4,2],m=[0,4,4],l=[0,1,1],k=[0,7,5],j=new MlString("game");function i(g){throw [0,a,g];}function a2(h){throw [0,b,h];}function bb(a3,a5){var a4=a3.getLen(),a6=a5.getLen(),a7=caml_create_string(a4+a6|0);caml_blit_string(a3,0,a7,0,a4);caml_blit_string(a5,0,a7,a4,a6);return a7;}function bc(a8){return caml_format_int(a1,a8);}function bd(ba){var a9=caml_ml_out_channels_list(0);for(;;){if(a9){var a_=a9[2];try {}catch(a$){}var a9=a_;continue;}return 0;}}caml_register_named_value(aY,bd);function bB(be){var bf=be,bg=0;for(;;){if(bf){var bh=bf[2],bi=[0,bf[1],bg],bf=bh,bg=bi;continue;}return bg;}}function bC(bl,bj){var bk=bj;for(;;){if(bk){var bn=bk[2];bm(bl,bk[1]);var bk=bn;continue;}return 0;}}function bD(bq,bo){var bp=bo;for(;;){if(bp){var bs=bp[2],br=bm(bq,bp[1]);if(br)return br;var bp=bs;continue;}return 0;}}function bR(bz){return bm(function(bt,bv){var bu=bt,bw=bv;for(;;){if(bw){var bx=bw[2],by=bw[1];if(bm(bz,by)){var bA=[0,by,bu],bu=bA,bw=bx;continue;}var bw=bx;continue;}return bB(bu);}},0);}function bQ(bE,bG){var bF=caml_create_string(bE);caml_fill_string(bF,0,bE,bG);return bF;}function bS(bJ,bH,bI){if(0<=bH&&0<=bI&&!((bJ.getLen()-bI|0)<bH)){var bK=caml_create_string(bI);caml_blit_string(bJ,bH,bK,0,bI);return bK;}return a2(aP);}function bT(bN,bM,bP,bO,bL){if(0<=bL&&0<=bM&&!((bN.getLen()-bL|0)<bM)&&0<=bO&&!((bP.getLen()-bL|0)<bO))return caml_blit_string(bN,bM,bP,bO,bL);return a2(aQ);}var bU=caml_sys_const_word_size(0),bV=caml_mul(bU/8|0,(1<<(bU-10|0))-1|0)-1|0,gR=248;function gQ(cD){function bX(bW){return bW?bW[5]:0;}function ce(bY,b4,b3,b0){var bZ=bX(bY),b1=bX(b0),b2=b1<=bZ?bZ+1|0:b1+1|0;return [0,bY,b4,b3,b0,b2];}function cv(b6,b5){return [0,0,b6,b5,0,1];}function cw(b7,cg,cf,b9){var b8=b7?b7[5]:0,b_=b9?b9[5]:0;if((b_+2|0)<b8){if(b7){var b$=b7[4],ca=b7[3],cb=b7[2],cc=b7[1],cd=bX(b$);if(cd<=bX(cc))return ce(cc,cb,ca,ce(b$,cg,cf,b9));if(b$){var cj=b$[3],ci=b$[2],ch=b$[1],ck=ce(b$[4],cg,cf,b9);return ce(ce(cc,cb,ca,ch),ci,cj,ck);}return a2(aK);}return a2(aJ);}if((b8+2|0)<b_){if(b9){var cl=b9[4],cm=b9[3],cn=b9[2],co=b9[1],cp=bX(co);if(cp<=bX(cl))return ce(ce(b7,cg,cf,co),cn,cm,cl);if(co){var cs=co[3],cr=co[2],cq=co[1],ct=ce(co[4],cn,cm,cl);return ce(ce(b7,cg,cf,cq),cr,cs,ct);}return a2(aI);}return a2(aH);}var cu=b_<=b8?b8+1|0:b_+1|0;return [0,b7,cg,cf,b9,cu];}var gJ=0;function gK(cx){return cx?0:1;}function cJ(cE,cI,cy){if(cy){var cz=cy[4],cA=cy[3],cB=cy[2],cC=cy[1],cH=cy[5],cG=cF(cD[1],cE,cB);return 0===cG?[0,cC,cE,cI,cz,cH]:0<=cG?cw(cC,cB,cA,cJ(cE,cI,cz)):cw(cJ(cE,cI,cC),cB,cA,cz);}return [0,0,cE,cI,0,1];}function gL(cM,cK){var cL=cK;for(;;){if(cL){var cQ=cL[4],cP=cL[3],cO=cL[1],cN=cF(cD[1],cM,cL[2]);if(0===cN)return cP;var cR=0<=cN?cQ:cO,cL=cR;continue;}throw [0,c];}}function gM(cU,cS){var cT=cS;for(;;){if(cT){var cX=cT[4],cW=cT[1],cV=cF(cD[1],cU,cT[2]),cY=0===cV?1:0;if(cY)return cY;var cZ=0<=cV?cX:cW,cT=cZ;continue;}return 0;}}function dj(c0){var c1=c0;for(;;){if(c1){var c2=c1[1];if(c2){var c1=c2;continue;}return [0,c1[2],c1[3]];}throw [0,c];}}function gN(c3){var c4=c3;for(;;){if(c4){var c5=c4[4],c6=c4[3],c7=c4[2];if(c5){var c4=c5;continue;}return [0,c7,c6];}throw [0,c];}}function c_(c8){if(c8){var c9=c8[1];if(c9){var db=c8[4],da=c8[3],c$=c8[2];return cw(c_(c9),c$,da,db);}return c8[4];}return a2(aO);}function dp(dh,dc){if(dc){var dd=dc[4],de=dc[3],df=dc[2],dg=dc[1],di=cF(cD[1],dh,df);if(0===di){if(dg)if(dd){var dk=dj(dd),dm=dk[2],dl=dk[1],dn=cw(dg,dl,dm,c_(dd));}else var dn=dg;else var dn=dd;return dn;}return 0<=di?cw(dg,df,de,dp(dh,dd)):cw(dp(dh,dg),df,de,dd);}return 0;}function ds(dt,dq){var dr=dq;for(;;){if(dr){var dw=dr[4],dv=dr[3],du=dr[2];ds(dt,dr[1]);cF(dt,du,dv);var dr=dw;continue;}return 0;}}function dy(dz,dx){if(dx){var dD=dx[5],dC=dx[4],dB=dx[3],dA=dx[2],dE=dy(dz,dx[1]),dF=bm(dz,dB);return [0,dE,dA,dF,dy(dz,dC),dD];}return 0;}function dI(dJ,dG){if(dG){var dH=dG[2],dM=dG[5],dL=dG[4],dK=dG[3],dN=dI(dJ,dG[1]),dO=cF(dJ,dH,dK);return [0,dN,dH,dO,dI(dJ,dL),dM];}return 0;}function dT(dU,dP,dR){var dQ=dP,dS=dR;for(;;){if(dQ){var dX=dQ[4],dW=dQ[3],dV=dQ[2],dZ=dY(dU,dV,dW,dT(dU,dQ[1],dS)),dQ=dX,dS=dZ;continue;}return dS;}}function d6(d2,d0){var d1=d0;for(;;){if(d1){var d5=d1[4],d4=d1[1],d3=cF(d2,d1[2],d1[3]);if(d3){var d7=d6(d2,d4);if(d7){var d1=d5;continue;}var d8=d7;}else var d8=d3;return d8;}return 1;}}function ee(d$,d9){var d_=d9;for(;;){if(d_){var ec=d_[4],eb=d_[1],ea=cF(d$,d_[2],d_[3]);if(ea)var ed=ea;else{var ef=ee(d$,eb);if(!ef){var d_=ec;continue;}var ed=ef;}return ed;}return 0;}}function eh(ej,ei,eg){if(eg){var em=eg[4],el=eg[3],ek=eg[2];return cw(eh(ej,ei,eg[1]),ek,el,em);}return cv(ej,ei);}function eo(eq,ep,en){if(en){var et=en[3],es=en[2],er=en[1];return cw(er,es,et,eo(eq,ep,en[4]));}return cv(eq,ep);}function ey(eu,eA,ez,ev){if(eu){if(ev){var ew=ev[5],ex=eu[5],eG=ev[4],eH=ev[3],eI=ev[2],eF=ev[1],eB=eu[4],eC=eu[3],eD=eu[2],eE=eu[1];return (ew+2|0)<ex?cw(eE,eD,eC,ey(eB,eA,ez,ev)):(ex+2|0)<ew?cw(ey(eu,eA,ez,eF),eI,eH,eG):ce(eu,eA,ez,ev);}return eo(eA,ez,eu);}return eh(eA,ez,ev);}function eS(eJ,eK){if(eJ){if(eK){var eL=dj(eK),eN=eL[2],eM=eL[1];return ey(eJ,eM,eN,c_(eK));}return eJ;}return eK;}function fj(eR,eQ,eO,eP){return eO?ey(eR,eQ,eO[1],eP):eS(eR,eP);}function e0(eY,eT){if(eT){var eU=eT[4],eV=eT[3],eW=eT[2],eX=eT[1],eZ=cF(cD[1],eY,eW);if(0===eZ)return [0,eX,[0,eV],eU];if(0<=eZ){var e1=e0(eY,eU),e3=e1[3],e2=e1[2];return [0,ey(eX,eW,eV,e1[1]),e2,e3];}var e4=e0(eY,eX),e6=e4[2],e5=e4[1];return [0,e5,e6,ey(e4[3],eW,eV,eU)];}return aN;}function fd(fe,e7,e9){if(e7){var e8=e7[2],fb=e7[5],fa=e7[4],e$=e7[3],e_=e7[1];if(bX(e9)<=fb){var fc=e0(e8,e9),fg=fc[2],ff=fc[1],fh=fd(fe,fa,fc[3]),fi=dY(fe,e8,[0,e$],fg);return fj(fd(fe,e_,ff),e8,fi,fh);}}else if(!e9)return 0;if(e9){var fk=e9[2],fo=e9[4],fn=e9[3],fm=e9[1],fl=e0(fk,e7),fq=fl[2],fp=fl[1],fr=fd(fe,fl[3],fo),fs=dY(fe,fk,fq,[0,fn]);return fj(fd(fe,fp,fm),fk,fs,fr);}throw [0,d,aM];}function fw(fx,ft){if(ft){var fu=ft[3],fv=ft[2],fz=ft[4],fy=fw(fx,ft[1]),fB=cF(fx,fv,fu),fA=fw(fx,fz);return fB?ey(fy,fv,fu,fA):eS(fy,fA);}return 0;}function fF(fG,fC){if(fC){var fD=fC[3],fE=fC[2],fI=fC[4],fH=fF(fG,fC[1]),fJ=fH[2],fK=fH[1],fM=cF(fG,fE,fD),fL=fF(fG,fI),fN=fL[2],fO=fL[1];if(fM){var fP=eS(fJ,fN);return [0,ey(fK,fE,fD,fO),fP];}var fQ=ey(fJ,fE,fD,fN);return [0,eS(fK,fO),fQ];}return aL;}function fX(fR,fT){var fS=fR,fU=fT;for(;;){if(fS){var fV=fS[1],fW=[0,fS[2],fS[3],fS[4],fU],fS=fV,fU=fW;continue;}return fU;}}function gO(f_,fZ,fY){var f0=fX(fY,0),f1=fX(fZ,0),f2=f0;for(;;){if(f1)if(f2){var f9=f2[4],f8=f2[3],f7=f2[2],f6=f1[4],f5=f1[3],f4=f1[2],f3=cF(cD[1],f1[1],f2[1]);if(0===f3){var f$=cF(f_,f4,f7);if(0===f$){var ga=fX(f8,f9),gb=fX(f5,f6),f1=gb,f2=ga;continue;}var gc=f$;}else var gc=f3;}else var gc=1;else var gc=f2?-1:0;return gc;}}function gP(gp,ge,gd){var gf=fX(gd,0),gg=fX(ge,0),gh=gf;for(;;){if(gg)if(gh){var gn=gh[4],gm=gh[3],gl=gh[2],gk=gg[4],gj=gg[3],gi=gg[2],go=0===cF(cD[1],gg[1],gh[1])?1:0;if(go){var gq=cF(gp,gi,gl);if(gq){var gr=fX(gm,gn),gs=fX(gj,gk),gg=gs,gh=gr;continue;}var gt=gq;}else var gt=go;var gu=gt;}else var gu=0;else var gu=gh?0:1;return gu;}}function gw(gv){if(gv){var gx=gv[1],gy=gw(gv[4]);return (gw(gx)+1|0)+gy|0;}return 0;}function gD(gz,gB){var gA=gz,gC=gB;for(;;){if(gC){var gG=gC[3],gF=gC[2],gE=gC[1],gH=[0,[0,gF,gG],gD(gA,gC[4])],gA=gH,gC=gE;continue;}return gA;}}return [0,gJ,gK,gM,cJ,cv,dp,fd,gO,gP,ds,dT,d6,ee,fw,fF,gw,function(gI){return gD(0,gI);},dj,gN,dj,e0,gL,dy,dI];}var g_=[0,aG];function g9(gS){var gT=1<=gS?gS:1,gU=bV<gT?bV:gT,gV=caml_create_string(gU);return [0,gV,0,gU,gV];}function g$(gW){return bS(gW[1],0,gW[2]);}function g3(gX,gZ){var gY=[0,gX[3]];for(;;){if(gY[1]<(gX[2]+gZ|0)){gY[1]=2*gY[1]|0;continue;}if(bV<gY[1])if((gX[2]+gZ|0)<=bV)gY[1]=bV;else i(aF);var g0=caml_create_string(gY[1]);bT(gX[1],0,g0,0,gX[2]);gX[1]=g0;gX[3]=gY[1];return 0;}}function ha(g1,g4){var g2=g1[2];if(g1[3]<=g2)g3(g1,1);g1[1].safeSet(g2,g4);g1[2]=g2+1|0;return 0;}function hb(g7,g5){var g6=g5.getLen(),g8=g7[2]+g6|0;if(g7[3]<g8)g3(g7,g6);bT(g5,0,g7[1],g7[2],g6);g7[2]=g8;return 0;}function hf(hc){return 0<=hc?hc:i(bb(ak,bc(hc)));}function hg(hd,he){return hf(hd+he|0);}var hh=bm(hg,1);function ho(hi){return bS(hi,0,hi.getLen());}function hq(hj,hk,hm){var hl=bb(an,bb(hj,ao)),hn=bb(am,bb(bc(hk),hl));return a2(bb(al,bb(bQ(1,hm),hn)));}function ie(hp,hs,hr){return hq(ho(hp),hs,hr);}function ig(ht){return a2(bb(ap,bb(ho(ht),aq)));}function hN(hu,hC,hE,hG){function hB(hv){if((hu.safeGet(hv)-48|0)<0||9<(hu.safeGet(hv)-48|0))return hv;var hw=hv+1|0;for(;;){var hx=hu.safeGet(hw);if(48<=hx){if(!(58<=hx)){var hz=hw+1|0,hw=hz;continue;}var hy=0;}else if(36===hx){var hA=hw+1|0,hy=1;}else var hy=0;if(!hy)var hA=hv;return hA;}}var hD=hB(hC+1|0),hF=g9((hE-hD|0)+10|0);ha(hF,37);var hH=hD,hI=bB(hG);for(;;){if(hH<=hE){var hJ=hu.safeGet(hH);if(42===hJ){if(hI){var hK=hI[2];hb(hF,bc(hI[1]));var hL=hB(hH+1|0),hH=hL,hI=hK;continue;}throw [0,d,ar];}ha(hF,hJ);var hM=hH+1|0,hH=hM;continue;}return g$(hF);}}function jH(hT,hR,hQ,hP,hO){var hS=hN(hR,hQ,hP,hO);if(78!==hT&&110!==hT)return hS;hS.safeSet(hS.getLen()-1|0,117);return hS;}function ih(h0,h_,ic,hU,ib){var hV=hU.getLen();function h$(hW,h9){var hX=40===hW?41:125;function h8(hY){var hZ=hY;for(;;){if(hV<=hZ)return bm(h0,hU);if(37===hU.safeGet(hZ)){var h1=hZ+1|0;if(hV<=h1)var h2=bm(h0,hU);else{var h3=hU.safeGet(h1),h4=h3-40|0;if(h4<0||1<h4){var h5=h4-83|0;if(h5<0||2<h5)var h6=1;else switch(h5){case 1:var h6=1;break;case 2:var h7=1,h6=0;break;default:var h7=0,h6=0;}if(h6){var h2=h8(h1+1|0),h7=2;}}else var h7=0===h4?0:1;switch(h7){case 1:var h2=h3===hX?h1+1|0:dY(h_,hU,h9,h3);break;case 2:break;default:var h2=h8(h$(h3,h1+1|0)+1|0);}}return h2;}var ia=hZ+1|0,hZ=ia;continue;}}return h8(h9);}return h$(ic,ib);}function iH(id){return dY(ih,ig,ie,id);}function iX(ii,iu,iE){var ij=ii.getLen()-1|0;function iF(ik){var il=ik;a:for(;;){if(il<ij){if(37===ii.safeGet(il)){var im=0,io=il+1|0;for(;;){if(ij<io)var ip=ig(ii);else{var iq=ii.safeGet(io);if(58<=iq){if(95===iq){var is=io+1|0,ir=1,im=ir,io=is;continue;}}else if(32<=iq)switch(iq-32|0){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 0:case 3:case 11:case 13:var it=io+1|0,io=it;continue;case 10:var iv=dY(iu,im,io,105),io=iv;continue;default:var iw=io+1|0,io=iw;continue;}var ix=io;c:for(;;){if(ij<ix)var iy=ig(ii);else{var iz=ii.safeGet(ix);if(126<=iz)var iA=0;else switch(iz){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var iy=dY(iu,im,ix,105),iA=1;break;case 69:case 70:case 71:case 101:case 102:case 103:var iy=dY(iu,im,ix,102),iA=1;break;case 33:case 37:case 44:case 64:var iy=ix+1|0,iA=1;break;case 83:case 91:case 115:var iy=dY(iu,im,ix,115),iA=1;break;case 97:case 114:case 116:var iy=dY(iu,im,ix,iz),iA=1;break;case 76:case 108:case 110:var iB=ix+1|0;if(ij<iB){var iy=dY(iu,im,ix,105),iA=1;}else{var iC=ii.safeGet(iB)-88|0;if(iC<0||32<iC)var iD=1;else switch(iC){case 0:case 12:case 17:case 23:case 29:case 32:var iy=cF(iE,dY(iu,im,ix,iz),105),iA=1,iD=0;break;default:var iD=1;}if(iD){var iy=dY(iu,im,ix,105),iA=1;}}break;case 67:case 99:var iy=dY(iu,im,ix,99),iA=1;break;case 66:case 98:var iy=dY(iu,im,ix,66),iA=1;break;case 41:case 125:var iy=dY(iu,im,ix,iz),iA=1;break;case 40:var iy=iF(dY(iu,im,ix,iz)),iA=1;break;case 123:var iG=dY(iu,im,ix,iz),iI=dY(iH,iz,ii,iG),iJ=iG;for(;;){if(iJ<(iI-2|0)){var iK=cF(iE,iJ,ii.safeGet(iJ)),iJ=iK;continue;}var iL=iI-1|0,ix=iL;continue c;}default:var iA=0;}if(!iA)var iy=ie(ii,ix,iz);}var ip=iy;break;}}var il=ip;continue a;}}var iM=il+1|0,il=iM;continue;}return il;}}iF(0);return 0;}function kW(iY){var iN=[0,0,0,0];function iW(iS,iT,iO){var iP=41!==iO?1:0,iQ=iP?125!==iO?1:0:iP;if(iQ){var iR=97===iO?2:1;if(114===iO)iN[3]=iN[3]+1|0;if(iS)iN[2]=iN[2]+iR|0;else iN[1]=iN[1]+iR|0;}return iT+1|0;}iX(iY,iW,function(iU,iV){return iU+1|0;});return iN[1];}function jD(iZ,i2,i0){var i1=iZ.safeGet(i0);if((i1-48|0)<0||9<(i1-48|0))return cF(i2,0,i0);var i3=i1-48|0,i4=i0+1|0;for(;;){var i5=iZ.safeGet(i4);if(48<=i5){if(!(58<=i5)){var i8=i4+1|0,i7=(10*i3|0)+(i5-48|0)|0,i3=i7,i4=i8;continue;}var i6=0;}else if(36===i5)if(0===i3){var i9=i(at),i6=1;}else{var i9=cF(i2,[0,hf(i3-1|0)],i4+1|0),i6=1;}else var i6=0;if(!i6)var i9=cF(i2,0,i0);return i9;}}function jy(i_,i$){return i_?i$:bm(hh,i$);}function jn(ja,jb){return ja?ja[1]:jb;}function mm(lf,jd,lr,jg,k1,lx,jc){var je=bm(jd,jc);function lg(jf){return cF(jg,je,jf);}function k0(jl,lw,jh,jq){var jk=jh.getLen();function kX(lo,ji){var jj=ji;for(;;){if(jk<=jj)return bm(jl,je);var jm=jh.safeGet(jj);if(37===jm){var ju=function(jp,jo){return caml_array_get(jq,jn(jp,jo));},jA=function(jC,jv,jx,jr){var js=jr;for(;;){var jt=jh.safeGet(js)-32|0;if(!(jt<0||25<jt))switch(jt){case 1:case 2:case 4:case 5:case 6:case 7:case 8:case 9:case 12:case 15:break;case 10:return jD(jh,function(jw,jB){var jz=[0,ju(jw,jv),jx];return jA(jC,jy(jw,jv),jz,jB);},js+1|0);default:var jE=js+1|0,js=jE;continue;}var jF=jh.safeGet(js);if(124<=jF)var jG=0;else switch(jF){case 78:case 88:case 100:case 105:case 111:case 117:case 120:var jI=ju(jC,jv),jJ=caml_format_int(jH(jF,jh,jj,js,jx),jI),jL=jK(jy(jC,jv),jJ,js+1|0),jG=1;break;case 69:case 71:case 101:case 102:case 103:var jM=ju(jC,jv),jN=caml_format_float(hN(jh,jj,js,jx),jM),jL=jK(jy(jC,jv),jN,js+1|0),jG=1;break;case 76:case 108:case 110:var jO=jh.safeGet(js+1|0)-88|0;if(jO<0||32<jO)var jP=1;else switch(jO){case 0:case 12:case 17:case 23:case 29:case 32:var jQ=js+1|0,jR=jF-108|0;if(jR<0||2<jR)var jS=0;else{switch(jR){case 1:var jS=0,jT=0;break;case 2:var jU=ju(jC,jv),jV=caml_format_int(hN(jh,jj,jQ,jx),jU),jT=1;break;default:var jW=ju(jC,jv),jV=caml_format_int(hN(jh,jj,jQ,jx),jW),jT=1;}if(jT){var jX=jV,jS=1;}}if(!jS){var jY=ju(jC,jv),jX=caml_int64_format(hN(jh,jj,jQ,jx),jY);}var jL=jK(jy(jC,jv),jX,jQ+1|0),jG=1,jP=0;break;default:var jP=1;}if(jP){var jZ=ju(jC,jv),j0=caml_format_int(jH(110,jh,jj,js,jx),jZ),jL=jK(jy(jC,jv),j0,js+1|0),jG=1;}break;case 37:case 64:var jL=jK(jv,bQ(1,jF),js+1|0),jG=1;break;case 83:case 115:var j1=ju(jC,jv);if(115===jF)var j2=j1;else{var j3=[0,0],j4=0,j5=j1.getLen()-1|0;if(!(j5<j4)){var j6=j4;for(;;){var j7=j1.safeGet(j6),j8=14<=j7?34===j7?1:92===j7?1:0:11<=j7?13<=j7?1:0:8<=j7?1:0,j9=j8?2:caml_is_printable(j7)?1:4;j3[1]=j3[1]+j9|0;var j_=j6+1|0;if(j5!==j6){var j6=j_;continue;}break;}}if(j3[1]===j1.getLen())var j$=j1;else{var ka=caml_create_string(j3[1]);j3[1]=0;var kb=0,kc=j1.getLen()-1|0;if(!(kc<kb)){var kd=kb;for(;;){var ke=j1.safeGet(kd),kf=ke-34|0;if(kf<0||58<kf)if(-20<=kf)var kg=1;else{switch(kf+34|0){case 8:ka.safeSet(j3[1],92);j3[1]+=1;ka.safeSet(j3[1],98);var kh=1;break;case 9:ka.safeSet(j3[1],92);j3[1]+=1;ka.safeSet(j3[1],116);var kh=1;break;case 10:ka.safeSet(j3[1],92);j3[1]+=1;ka.safeSet(j3[1],110);var kh=1;break;case 13:ka.safeSet(j3[1],92);j3[1]+=1;ka.safeSet(j3[1],114);var kh=1;break;default:var kg=1,kh=0;}if(kh)var kg=0;}else var kg=(kf-1|0)<0||56<(kf-1|0)?(ka.safeSet(j3[1],92),j3[1]+=1,ka.safeSet(j3[1],ke),0):1;if(kg)if(caml_is_printable(ke))ka.safeSet(j3[1],ke);else{ka.safeSet(j3[1],92);j3[1]+=1;ka.safeSet(j3[1],48+(ke/100|0)|0);j3[1]+=1;ka.safeSet(j3[1],48+((ke/10|0)%10|0)|0);j3[1]+=1;ka.safeSet(j3[1],48+(ke%10|0)|0);}j3[1]+=1;var ki=kd+1|0;if(kc!==kd){var kd=ki;continue;}break;}}var j$=ka;}var j2=bb(aA,bb(j$,aB));}if(js===(jj+1|0))var kj=j2;else{var kk=hN(jh,jj,js,jx);try {var kl=0,km=1;for(;;){if(kk.getLen()<=km)var kn=[0,0,kl];else{var ko=kk.safeGet(km);if(49<=ko)if(58<=ko)var kp=0;else{var kn=[0,caml_int_of_string(bS(kk,km,(kk.getLen()-km|0)-1|0)),kl],kp=1;}else{if(45===ko){var kr=km+1|0,kq=1,kl=kq,km=kr;continue;}var kp=0;}if(!kp){var ks=km+1|0,km=ks;continue;}}var kt=kn;break;}}catch(ku){if(ku[1]!==a)throw ku;var kt=hq(kk,0,115);}var kv=kt[1],kw=j2.getLen(),kx=0,kB=kt[2],kA=32;if(kv===kw&&0===kx){var ky=j2,kz=1;}else var kz=0;if(!kz)if(kv<=kw)var ky=bS(j2,kx,kw);else{var kC=bQ(kv,kA);if(kB)bT(j2,kx,kC,0,kw);else bT(j2,kx,kC,kv-kw|0,kw);var ky=kC;}var kj=ky;}var jL=jK(jy(jC,jv),kj,js+1|0),jG=1;break;case 67:case 99:var kD=ju(jC,jv);if(99===jF)var kE=bQ(1,kD);else{if(39===kD)var kF=aR;else if(92===kD)var kF=aS;else{if(14<=kD)var kG=0;else switch(kD){case 8:var kF=aW,kG=1;break;case 9:var kF=aV,kG=1;break;case 10:var kF=aU,kG=1;break;case 13:var kF=aT,kG=1;break;default:var kG=0;}if(!kG)if(caml_is_printable(kD)){var kH=caml_create_string(1);kH.safeSet(0,kD);var kF=kH;}else{var kI=caml_create_string(4);kI.safeSet(0,92);kI.safeSet(1,48+(kD/100|0)|0);kI.safeSet(2,48+((kD/10|0)%10|0)|0);kI.safeSet(3,48+(kD%10|0)|0);var kF=kI;}}var kE=bb(ay,bb(kF,az));}var jL=jK(jy(jC,jv),kE,js+1|0),jG=1;break;case 66:case 98:var kK=js+1|0,kJ=ju(jC,jv)?a0:aZ,jL=jK(jy(jC,jv),kJ,kK),jG=1;break;case 40:case 123:var kL=ju(jC,jv),kM=dY(iH,jF,jh,js+1|0);if(123===jF){var kN=g9(kL.getLen()),kR=function(kP,kO){ha(kN,kO);return kP+1|0;};iX(kL,function(kQ,kT,kS){if(kQ)hb(kN,as);else ha(kN,37);return kR(kT,kS);},kR);var kU=g$(kN),jL=jK(jy(jC,jv),kU,kM),jG=1;}else{var kV=jy(jC,jv),kY=hg(kW(kL),kV),jL=k0(function(kZ){return kX(kY,kM);},kV,kL,jq),jG=1;}break;case 33:bm(k1,je);var jL=kX(jv,js+1|0),jG=1;break;case 41:var jL=jK(jv,aE,js+1|0),jG=1;break;case 44:var jL=jK(jv,aD,js+1|0),jG=1;break;case 70:var k2=ju(jC,jv);if(0===jx)var k3=aC;else{var k4=hN(jh,jj,js,jx);if(70===jF)k4.safeSet(k4.getLen()-1|0,103);var k3=k4;}var k5=caml_classify_float(k2);if(3===k5)var k6=k2<0?aw:av;else if(4<=k5)var k6=ax;else{var k7=caml_format_float(k3,k2),k8=0,k9=k7.getLen();for(;;){if(k9<=k8)var k_=bb(k7,au);else{var k$=k7.safeGet(k8)-46|0,la=k$<0||23<k$?55===k$?1:0:(k$-1|0)<0||21<(k$-1|0)?1:0;if(!la){var lb=k8+1|0,k8=lb;continue;}var k_=k7;}var k6=k_;break;}}var jL=jK(jy(jC,jv),k6,js+1|0),jG=1;break;case 91:var jL=ie(jh,js,jF),jG=1;break;case 97:var lc=ju(jC,jv),ld=bm(hh,jn(jC,jv)),le=ju(0,ld),li=js+1|0,lh=jy(jC,ld);if(lf)lg(cF(lc,0,le));else cF(lc,je,le);var jL=kX(lh,li),jG=1;break;case 114:var jL=ie(jh,js,jF),jG=1;break;case 116:var lj=ju(jC,jv),ll=js+1|0,lk=jy(jC,jv);if(lf)lg(bm(lj,0));else bm(lj,je);var jL=kX(lk,ll),jG=1;break;default:var jG=0;}if(!jG)var jL=ie(jh,js,jF);return jL;}},lq=jj+1|0,ln=0;return jD(jh,function(lp,lm){return jA(lp,lo,ln,lm);},lq);}cF(lr,je,jm);var ls=jj+1|0,jj=ls;continue;}}function jK(lv,lt,lu){lg(lt);return kX(lv,lu);}return kX(lw,0);}var ly=cF(k0,lx,hf(0)),lz=kW(jc);if(lz<0||6<lz){var lM=function(lA,lG){if(lz<=lA){var lB=caml_make_vect(lz,0),lE=function(lC,lD){return caml_array_set(lB,(lz-lC|0)-1|0,lD);},lF=0,lH=lG;for(;;){if(lH){var lI=lH[2],lJ=lH[1];if(lI){lE(lF,lJ);var lK=lF+1|0,lF=lK,lH=lI;continue;}lE(lF,lJ);}return cF(ly,jc,lB);}}return function(lL){return lM(lA+1|0,[0,lL,lG]);};},lN=lM(0,0);}else switch(lz){case 1:var lN=function(lP){var lO=caml_make_vect(1,0);caml_array_set(lO,0,lP);return cF(ly,jc,lO);};break;case 2:var lN=function(lR,lS){var lQ=caml_make_vect(2,0);caml_array_set(lQ,0,lR);caml_array_set(lQ,1,lS);return cF(ly,jc,lQ);};break;case 3:var lN=function(lU,lV,lW){var lT=caml_make_vect(3,0);caml_array_set(lT,0,lU);caml_array_set(lT,1,lV);caml_array_set(lT,2,lW);return cF(ly,jc,lT);};break;case 4:var lN=function(lY,lZ,l0,l1){var lX=caml_make_vect(4,0);caml_array_set(lX,0,lY);caml_array_set(lX,1,lZ);caml_array_set(lX,2,l0);caml_array_set(lX,3,l1);return cF(ly,jc,lX);};break;case 5:var lN=function(l3,l4,l5,l6,l7){var l2=caml_make_vect(5,0);caml_array_set(l2,0,l3);caml_array_set(l2,1,l4);caml_array_set(l2,2,l5);caml_array_set(l2,3,l6);caml_array_set(l2,4,l7);return cF(ly,jc,l2);};break;case 6:var lN=function(l9,l_,l$,ma,mb,mc){var l8=caml_make_vect(6,0);caml_array_set(l8,0,l9);caml_array_set(l8,1,l_);caml_array_set(l8,2,l$);caml_array_set(l8,3,ma);caml_array_set(l8,4,mb);caml_array_set(l8,5,mc);return cF(ly,jc,l8);};break;default:var lN=cF(ly,jc,[0]);}return lN;}function ml(md){return g9(2*md.getLen()|0);}function mi(mg,me){var mf=g$(me);me[2]=0;return bm(mg,mf);}function mq(mh){var mk=bm(mi,mh);return mn(mm,1,ml,ha,hb,function(mj){return 0;},mk);}function mr(mp){return cF(mq,function(mo){return mo;},mp);}var ms=[0,0];function mw(mt){mt[2]=(mt[2]+1|0)%55|0;var mu=caml_array_get(mt[1],mt[2]),mv=(caml_array_get(mt[1],(mt[2]+24|0)%55|0)+(mu^mu>>>25&31)|0)&1073741823;caml_array_set(mt[1],mt[2],mv);return mv;}32===bU;var mx=[0,aj.slice(),0],my=[0,0];caml_register_named_value(ah,my);var mJ=2;function mI(mB){var mz=[0,0],mA=0,mC=mB.getLen()-1|0;if(!(mC<mA)){var mD=mA;for(;;){mz[1]=(223*mz[1]|0)+mB.safeGet(mD)|0;var mE=mD+1|0;if(mC!==mD){var mD=mE;continue;}break;}}mz[1]=mz[1]&((1<<31)-1|0);var mF=1073741823<mz[1]?mz[1]-(1<<31)|0:mz[1];return mF;}var mK=gQ([0,function(mH,mG){return caml_string_compare(mH,mG);}]),mN=gQ([0,function(mM,mL){return caml_string_compare(mM,mL);}]),mQ=gQ([0,function(mP,mO){return caml_int_compare(mP,mO);}]),mR=caml_obj_block(0,0),mU=[0,0];function mT(mS){return 2<mS?mT((mS+1|0)/2|0)*2|0:mS;}function na(mV){mU[1]+=1;var mW=mV.length-1,mX=caml_make_vect((mW*2|0)+2|0,mR);caml_array_set(mX,0,mW);caml_array_set(mX,1,(caml_mul(mT(mW),bU)/8|0)-1|0);var mY=0,mZ=mW-1|0;if(!(mZ<mY)){var m0=mY;for(;;){caml_array_set(mX,(m0*2|0)+3|0,caml_array_get(mV,m0));var m1=m0+1|0;if(mZ!==m0){var m0=m1;continue;}break;}}return [0,mJ,mX,mN[1],mQ[1],0,0,mK[1],0];}function nb(m2,m4){var m3=m2[2].length-1,m5=m3<m4?1:0;if(m5){var m6=caml_make_vect(m4,mR),m7=0,m8=0,m9=m2[2],m_=0<=m3?0<=m8?(m9.length-1-m3|0)<m8?0:0<=m7?(m6.length-1-m3|0)<m7?0:(caml_array_blit(m9,m8,m6,m7,m3),1):0:0:0;if(!m_)a2(aX);m2[2]=m6;var m$=0;}else var m$=m5;return m$;}var nc=[0,0],nl=[0,0];function nj(nd){var ne=nd[2].length-1;nb(nd,ne+1|0);return ne;}function nD(nf,ng){try {var nh=cF(mN[22],ng,nf[3]);}catch(ni){if(ni[1]===c){var nk=nj(nf);nf[3]=dY(mN[4],ng,nk,nf[3]);nf[4]=dY(mQ[4],nk,1,nf[4]);return nk;}throw ni;}return nh;}function pD(nm,nn,no){nl[1]+=1;return cF(mQ[22],nn,nm[4])?(nb(nm,nn+1|0),caml_array_set(nm[2],nn,no)):(nm[6]=[0,[0,nn,no],nm[6]],0);}function nJ(np,nq){try {var nr=cF(mK[22],nq,np[7]);}catch(ns){if(ns[1]===c){var nt=np[1];np[1]=nt+1|0;if(caml_string_notequal(nq,ai))np[7]=dY(mK[4],nq,nt,np[7]);return nt;}throw ns;}return nr;}function pE(nE,nu,nx){var nv=caml_equal(nu,0)?[0]:nu,nw=nv.length-1,ny=nx.length-1,nz=caml_make_vect(nw+ny|0,0),nA=0,nB=nw-1|0;if(!(nB<nA)){var nC=nA;for(;;){caml_array_set(nz,nC,nD(nE,caml_array_get(nv,nC)));var nF=nC+1|0;if(nB!==nC){var nC=nF;continue;}break;}}var nG=0,nH=ny-1|0;if(!(nH<nG)){var nI=nG;for(;;){caml_array_set(nz,nI+nw|0,nJ(nE,caml_array_get(nx,nI)));var nK=nI+1|0;if(nH!==nI){var nI=nK;continue;}break;}}return nz;}function pF(nL,n0){if(nL===0)var nM=na([0]);else{var nN=nL.length-1;if(0===nN)var nO=[0];else{var nP=caml_make_vect(nN,mI(nL[0+1])),nQ=1,nR=nN-1|0;if(!(nR<nQ)){var nS=nQ;for(;;){nP[nS+1]=mI(nL[nS+1]);var nT=nS+1|0;if(nR!==nS){var nS=nT;continue;}break;}}var nO=nP;}var nU=na(nO),nV=0,nW=nL.length-1-1|0;if(!(nW<nV)){var nX=nV;for(;;){var nY=(nX*2|0)+2|0;nU[3]=dY(mN[4],nL[nX+1],nY,nU[3]);nU[4]=dY(mQ[4],nY,1,nU[4]);var nZ=nX+1|0;if(nW!==nX){var nX=nZ;continue;}break;}}var nM=nU;}var n1=bm(n0,nM);nc[1]=(nc[1]+nM[1]|0)-1|0;nM[8]=bB(nM[8]);nb(nM,3+caml_div(caml_array_get(nM[2],1)*16|0,bU)|0);return [0,bm(n1,0),n0,n1,0];}function pG(n2,n3){if(n2)return n2;var n4=caml_obj_block(gR,n3[1]);n4[0+1]=n3[2];var n5=my[1];n4[1+1]=n5;my[1]=n5+1|0;return n4;}function pl(n6){var n7=nj(n6);if(0===(n7%2|0)||(2+caml_div(caml_array_get(n6[2],1)*16|0,bU)|0)<n7)var n8=0;else{var n9=nj(n6),n8=1;}if(!n8)var n9=n7;caml_array_set(n6[2],n9,0);return n9;}function pH(pm,n_){var n$=[0,0],oa=n_.length-1;for(;;){if(n$[1]<oa){var od=caml_array_get(n_,n$[1]),oc=function(ob){n$[1]+=1;return caml_array_get(n_,n$[1]);},oe=oc(0);if(typeof oe==="number")switch(oe){case 1:var og=oc(0),oh=function(og){return function(of){return of[og+1];};}(og);break;case 2:var oi=oc(0),ok=oc(0),oh=function(oi,ok){return function(oj){return oj[oi+1][ok+1];};}(oi,ok);break;case 3:var om=oc(0),oh=function(om){return function(ol){return bm(ol[1][om+1],ol);};}(om);break;case 4:var oo=oc(0),oh=function(oo){return function(on,op){on[oo+1]=op;return 0;};}(oo);break;case 5:var oq=oc(0),or=oc(0),oh=function(oq,or){return function(os){return bm(oq,or);};}(oq,or);break;case 6:var ot=oc(0),ov=oc(0),oh=function(ot,ov){return function(ou){return bm(ot,ou[ov+1]);};}(ot,ov);break;case 7:var ow=oc(0),ox=oc(0),oz=oc(0),oh=function(ow,ox,oz){return function(oy){return bm(ow,oy[ox+1][oz+1]);};}(ow,ox,oz);break;case 8:var oA=oc(0),oC=oc(0),oh=function(oA,oC){return function(oB){return bm(oA,bm(oB[1][oC+1],oB));};}(oA,oC);break;case 9:var oD=oc(0),oE=oc(0),oF=oc(0),oh=function(oD,oE,oF){return function(oG){return cF(oD,oE,oF);};}(oD,oE,oF);break;case 10:var oH=oc(0),oI=oc(0),oK=oc(0),oh=function(oH,oI,oK){return function(oJ){return cF(oH,oI,oJ[oK+1]);};}(oH,oI,oK);break;case 11:var oL=oc(0),oM=oc(0),oN=oc(0),oP=oc(0),oh=function(oL,oM,oN,oP){return function(oO){return cF(oL,oM,oO[oN+1][oP+1]);};}(oL,oM,oN,oP);break;case 12:var oQ=oc(0),oR=oc(0),oT=oc(0),oh=function(oQ,oR,oT){return function(oS){return cF(oQ,oR,bm(oS[1][oT+1],oS));};}(oQ,oR,oT);break;case 13:var oU=oc(0),oV=oc(0),oX=oc(0),oh=function(oU,oV,oX){return function(oW){return cF(oU,oW[oV+1],oX);};}(oU,oV,oX);break;case 14:var oY=oc(0),oZ=oc(0),o0=oc(0),o2=oc(0),oh=function(oY,oZ,o0,o2){return function(o1){return cF(oY,o1[oZ+1][o0+1],o2);};}(oY,oZ,o0,o2);break;case 15:var o3=oc(0),o4=oc(0),o6=oc(0),oh=function(o3,o4,o6){return function(o5){return cF(o3,bm(o5[1][o4+1],o5),o6);};}(o3,o4,o6);break;case 16:var o7=oc(0),o9=oc(0),oh=function(o7,o9){return function(o8){return cF(o8[1][o7+1],o8,o9);};}(o7,o9);break;case 17:var o_=oc(0),pa=oc(0),oh=function(o_,pa){return function(o$){return cF(o$[1][o_+1],o$,o$[pa+1]);};}(o_,pa);break;case 18:var pb=oc(0),pc=oc(0),pe=oc(0),oh=function(pb,pc,pe){return function(pd){return cF(pd[1][pb+1],pd,pd[pc+1][pe+1]);};}(pb,pc,pe);break;case 19:var pf=oc(0),ph=oc(0),oh=function(pf,ph){return function(pg){var pi=bm(pg[1][ph+1],pg);return cF(pg[1][pf+1],pg,pi);};}(pf,ph);break;case 20:var pk=oc(0),pj=oc(0);pl(pm);var oh=function(pk,pj){return function(pn){return bm(caml_get_public_method(pj,pk),pj);};}(pk,pj);break;case 21:var po=oc(0),pp=oc(0);pl(pm);var oh=function(po,pp){return function(pq){var pr=pq[pp+1];return bm(caml_get_public_method(pr,po),pr);};}(po,pp);break;case 22:var ps=oc(0),pt=oc(0),pu=oc(0);pl(pm);var oh=function(ps,pt,pu){return function(pv){var pw=pv[pt+1][pu+1];return bm(caml_get_public_method(pw,ps),pw);};}(ps,pt,pu);break;case 23:var px=oc(0),py=oc(0);pl(pm);var oh=function(px,py){return function(pz){var pA=bm(pz[1][py+1],pz);return bm(caml_get_public_method(pA,px),pA);};}(px,py);break;default:var pB=oc(0),oh=function(pB){return function(pC){return pB;};}(pB);}else var oh=oe;pD(pm,od,oh);n$[1]+=1;continue;}return 0;}}var pN=null,pM=undefined,pL=true,pK=false,pJ=Array;function pO(pI){return pI instanceof pJ?0:[0,new MlWrappedString(pI.toString())];}ms[1]=[0,pO,ms[1]];function pY(pP,pQ){pP.appendChild(pQ);return 0;}function pZ(pR,pS){pR.removeChild(pS);return 0;}function p0(pU){return caml_js_wrap_callback(function(pT){if(pT){var pV=bm(pU,pT);if(!(pV|0))pT.preventDefault();return pV;}var pW=event,pX=bm(pU,pW);if(!(pX|0))pW.returnValue=pX;return pX;});}var p1=this,p2=p1.document;this.HTMLElement===pM;function p5(p3){return p3.toString();}function ql(p7,p8){function p6(p4){return p5(cF(mr,aa,60*p4));}var p9=p7.style;p9.left=p6(p8[1]);var p_=p7.style;return p_.top=p6(p8[2]);}function qm(qb,p$){switch(p$){case 1:var qa=ad;break;case 2:var qa=ac;break;case 3:var qa=ab;break;default:var qa=ae;}return bb(qb,qa);}function qh(qf,qc,qd){var qe=qc?bb(qd,bb(af,qc[1])):qd;return qf.className=p5(qe);}function qn(qj,qi){var qg=p2.createElement(ag.toString());qh(qg,qj,qi);return qg;}function qo(qk){switch(qk){case 1:return 2;case 2:return 0;case 3:return 1;default:return 3;}}var qp=[0,$];function rc(qq){return qq+0.5|0;}var rV=pF(T,function(qr){var qs=nJ(qr,Y),qt=nJ(qr,X),qu=nJ(qr,W),qv=pE(qr,V,U),qw=qv[1],qx=qv[2],qy=qv[3],qz=qv[4],qA=qv[5],qB=qv[6],qC=qv[8],qD=qv[9],qE=qv[10],qF=qv[11],rl=qv[7];function rm(qG,qH,qI){pZ(qG[qt+1],qG[qD+1]);dY(caml_get_public_method(qH,-272850366),qH,qI,qG[qs+1]);return cF(caml_get_public_method(qH,-1025145686),qH,qG);}function rn(qJ,qM){bm(qJ[1][qz+1],qJ);var qK=bm(qJ[1][qC+1],qJ);if(qK){var qL=qK[1],qO=qN(caml_get_public_method(qM,-1059049672),qM,qL[1],qL[2],qJ[qF+1]);if(qO){var qP=qO[1];return typeof qP==="number"?bm(qJ[1][qy+1],qJ):0===qP[0]?cF(qJ[1][qx+1],qJ,qP[1]):dY(qJ[1][qB+1],qJ,qM,qP[1]);}var qQ=qO;}else var qQ=qK;return qQ;}function ro(qR){var qS=qR[qE+1],qT=qS[2],qU=qS[1],qV=0.05;switch(qR[qF+1]){case 1:var qW=[0,qU,qT+qV];break;case 2:var qW=[0,qU-qV,qT];break;case 3:var qW=[0,qU+qV,qT];break;default:var qW=[0,qU,qT-qV];}return cF(qR[1][qA+1],qR,qW);}function rp(qX){var qY=qX[qE+1],qZ=caml_modf_float(qY[1]+1),q0=qZ[1],q1=caml_modf_float(qY[2]+1),q2=q1[1],q3=qZ[2]-1|0,q4=q1[2]-1|0;function q7(q5){return q5<0.5?1:0;}function q8(q6){return 0.5<=q6?1:0;}switch(qX[qF+1]){case 1:if(q7(q2))return [0,[0,q3,q4]];break;case 2:if(q8(q0))return [0,[0,q3+1|0,q4]];break;case 3:if(q7(q0))return [0,[0,q3,q4]];break;default:if(q8(q2))return [0,[0,q3,q4+1|0]];}return 0;}function rq(q9){var q_=qo(q9[qF+1]);return cF(q9[1][qx+1],q9,q_);}function rr(q$,ra){q$[qF+1]=ra;bm(q$[1][qw+1],q$);if(2<=q$[qF+1]){var rb=q$[qE+1],rd=rc(rb[2]),re=[0,rb[1],rd];}else{var rf=q$[qE+1],rg=rf[2],re=[0,rc(rf[1]),rg];}q$[qE+1]=re;return 0;}function rs(rh){var ri=qm(rh[qu+1],rh[qF+1]);return qh(rh[qD+1],[0,ri],rh[qu+1]);}pH(qr,[0,qA,function(rj,rk){ql(rj[qD+1],rk);rj[qE+1]=rk;return 0;},qw,rs,qx,rr,qy,rq,qC,rp,qz,ro,rl,rn,qB,rm]);return function(rB,rz,rt,ry,rx,rv){var ru=rt?_:Z,rw=qn([0,qm(ru,rv)],ru);ql(rw,rx);pY(ry,rw);var rA=pG(rz,qr);rA[qu+1]=ru;rA[qt+1]=ry;rA[qs+1]=rt;rA[qD+1]=rw;rA[qE+1]=rx;rA[qF+1]=rv;return rA;};}),r9=pF(e,function(rC){var rD=pE(rC,e,Q),rE=rD[3],rF=rD[4],rN=rD[1],rM=rD[2];pD(rC,rN,function(rI,rH,rG,rK){var rJ=caml_equal(rI[rE+1],[0,rH,rG]),rL=rJ?caml_equal(rI[rF+1],rK):rJ;return rL;});return function(rU,rS,rR,rQ,rO){var rP=qn([0,qm(S,rO)],R);ql(rP,[0,rQ[1],rQ[2]]);pY(rR,rP);var rT=pG(rS,rC);rT[rM+1]=rP;rT[rE+1]=rQ;rT[rF+1]=rO;return rT;};}),sq=pF(f,function(rW){var rX=pE(rW,f,O),rY=rX[2],r2=rX[1];pD(rW,r2,function(r1,r0,rZ){return caml_equal(r1[rY+1],[0,r0,rZ]);});return function(r8,r6,r5,r4){var r3=qn(0,P);ql(r3,[0,r4[1],r4[2]]);pY(r5,r3);var r7=pG(r6,rW);r7[rY+1]=r4;return r7;};}),sQ=pF(J,function(r_){var r$=nJ(r_,M),sa=nJ(r_,L),sh=nD(r_,K);pD(r_,sh,function(sd,sf){return dY(caml_get_public_method(sf,165136748),sf,10,function(sg){var sb=1073741824,sc=mw(mx),se=(sc/sb+mw(mx))/sb*1<0.05?1:0;return qN(caml_get_public_method(sf,198975047),sf,se,sd[sa+1],sd[r$+1]);});});return function(sp,sm,sl,sj,so){var si=qn(0,N),sk=[0,sj[1],sj[2]];ql(si,sk);pY(sl,si);var sn=pG(sm,r_);sn[sa+1]=sk;sn[r$+1]=so;return sn;};}),tX=pF(B,function(sr){var ss=nJ(sr,E),st=pE(sr,C,D),su=st[5],sv=st[6],sw=st[7],sE=st[1],sD=st[2],sC=st[3],sB=st[4];function sF(sy,sx){return caml_equal(sy[su+1],[0,sx[1],sx[2]]);}function sI(sz){sz[sw+1]=qo(sz[sw+1]);var sA=[0,qm(G,sz[sw+1])];return qh(sz[sv+1],sA,F);}var sH=1;pH(sr,[0,sB,function(sG){return pZ(sG[ss+1],sG[sv+1]);},sC,sH,sw,sE,sI,sD,sF]);return function(sP,sM,sL,sO,sJ){var sK=qn([0,qm(I,sJ)],H);pY(sL,sK);var sN=pG(sM,sr);sN[ss+1]=sL;sN[su+1]=sO;sN[sv+1]=sK;sN[sw+1]=sJ;return sN;};}),vh=pF(p,function(sR){var sS=nJ(sR,s),sT=pE(sR,q,r),sU=sT[1],sV=sT[2],sW=sT[3],sX=sT[9],sY=sT[10],sZ=sT[15],s0=sT[16],s1=sT[17],s2=sT[18],s3=sT[19],s4=sT[20],s5=sT[21],s6=sT[22],s7=sT[23],uH=sT[4],uG=sT[5],uF=sT[6],uE=sT[7],uD=sT[8],uC=sT[11],uB=sT[12],uA=sT[13],uz=sT[14];function uI(s_,s9,s8,tc){var s$=cF(s_[1][sX+1],s_,[0,s9,s8]);if(s$){var ta=s$[1],tb=[0,[0,bm(caml_get_public_method(ta,4996429),ta)]];}else var tb=s$;var td=qN(s_[1][sU+1],s_,s9,s8,tc);if(td)var te=td;else{switch(tc){case 1:var tf=7===s8?1:0;break;case 2:var tf=0===s9?1:0;break;case 3:var tf=7===s9?1:0;break;default:var tf=0===s8?1:0;}var te=tf;}var tg=te?u:te,ti=s_[s4+1],tj=bD(function(th){return dY(caml_get_public_method(th,-1050747544),th,s9,s8);},ti),tk=tj?t:tj,tl=[0,tg,[0,tb,[0,tk,0]]];for(;;){if(tl){var tm=tl[1];if(!tm){var to=tl[2],tl=to;continue;}var tn=tm;}else var tn=tl;return tn;}}function uJ(tq,tp){var tr=tq[s7+1],ts=[0,0],tw=tp[2],tx=tp[1];try {if(0<tr[1]){var tt=tr[2],tu=tt[2];for(;;){var tv=tu[1];if(cF(caml_get_public_method(tv,-1050747544),tv,[0,tx,tw])){ts[1]=[0,tv];throw [0,qp];}if(tu!==tt){var ty=tu[2],tu=ty;continue;}break;}}}catch(tz){if(tz[1]!==qp)throw tz;}return ts[1];}function uK(tA,tE,tD,tC){var tF=tA[s1+1];return bD(function(tB){return qN(caml_get_public_method(tB,-1050747544),tB,tE,tD,tC);},tF);}function uL(tG,tH,tJ){var tI=0===caml_mod(tG[s5+1],tH)?1:0;return tI?bm(tJ,0):tI;}function uM(tK){var tM=16;return p1.setInterval(caml_js_wrap_callback(function(tL){tK[s5+1]=tK[s5+1]+1|0;return bm(tK[1][sY+1],tK);}),tM);}function uN(tN){var tP=tN[s3+1];bC(function(tO){return cF(caml_get_public_method(tO,-1066301935),tO,tN);},tP);var tR=tN[s2+1];return bC(function(tQ){return cF(caml_get_public_method(tQ,-1066301935),tQ,tN);},tR);}function uO(tS,tW,tT){var tU=cF(tS[1][sX+1],tS,tT);if(tU){var tV=tU[1];return bm(caml_get_public_method(tV,-855250051),tV);}return dY(tS[1][sZ+1],tS,tW,tT);}function uP(t1,tZ,tY){var t0=qN(tX[1],0,tZ,tY,0),t2=t1[s7+1];if(0===t2[1]){var t3=[];caml_update_dummy(t3,[0,t0,t3]);t2[1]=1;t2[2]=t3;}else{var t4=t2[2],t5=[0,t0,t4[2]];t2[1]=t2[1]+1|0;t4[2]=t5;t2[2]=t5;}var t6=4<t1[s7+1][1]?1:0;if(t6){var t7=t1[s7+1];if(0===t7[1])throw [0,g_];t7[1]=t7[1]-1|0;var t8=t7[2],t9=t8[2];if(t9===t8)t7[2]=0;else t8[2]=t9[2];var t_=t9[1];return bm(caml_get_public_method(t_,-266379949),t_);}return t6;}function uQ(t$,ua){var ub=dY(sq[1],0,t$[s0+1],ua);t$[s4+1]=[0,ub,t$[s4+1]];return 0;}function uR(uc,ue,ud){var uf=qN(sQ[1],0,uc[s0+1],ue,ud);uc[s3+1]=[0,uf,uc[s3+1]];return 0;}function uS(ug,ui,uh){var uj=qN(r9[1],0,ug[s0+1],ui,uh);ug[s1+1]=[0,uj,ug[s1+1]];return 0;}function uT(uk,ul){var un=uk[s2+1];uk[s2+1]=cF(bR,function(um){return caml_notequal(um,ul);},un);return 0;}function uU(up,uq,uo){if(uo)up[s6+1]=up[s6+1]/2|0;else up[s6+1]=up[s6+1]+1|0;return bm(up[1][sV+1],up);}function uV(ur){var us=ur[sS+1];return us.innerHTML=p5(cF(mr,v,ur[s6+1]));}pH(sR,[0,uz,function(ut,uw,uv,uu){var uy=ux(rV[1],0,uw,ut[s0+1],uv,uu);ut[s2+1]=[0,uy,ut[s2+1]];return 0;},sV,uV,uG,uU,uF,uT,uC,uS,uB,uR,uA,uQ,sZ,uP,sW,uO,sY,uN,uH,uM,uE,uL,sU,uK,sX,uJ,uD,uI]);function u_(u5){var uW=0,uX=7;if(!(uX<uW)){var uY=uW;for(;;){var uZ=qn(0,z),u0=0,u1=7;if(!(u1<u0)){var u2=u0;for(;;){var u3=0===((u2+uY|0)%2|0)?y:x,u4=qn([0,u3],w);u4.onclick=p0(function(uY,u2,u4){return function(u6){dY(u5[1][sW+1],u5,u4,[0,u2,uY]);return pL;};}(uY,u2,u4));u4.onmousedown=p0(function(u7){return pK;});pY(uZ,u4);var u8=u2+1|0;if(u1!==u2){var u2=u8;continue;}break;}}pY(u5[s0+1],uZ);var u9=uY+1|0;if(uX!==uY){var uY=u9;continue;}break;}}pY(u5[s0+1],u5[sS+1]);return bm(u5[1][sV+1],u5);}sR[8]=[0,u_,sR[8]];return function(vg,u$,vc){var vb=qn(0,A),va=pG(u$,sR);va[sS+1]=vb;va[s0+1]=vc;va[s1+1]=0;va[s2+1]=0;va[s3+1]=0;va[s4+1]=0;va[s5+1]=0;va[s6+1]=0;va[s7+1]=[0,0,0];if(!u$){var vd=sR[8];if(0!==vd){var ve=vd;for(;;){if(ve){var vf=ve[2];bm(ve[1],va);var ve=vf;continue;}break;}}}return va;};}),vi=p2.getElementById(p5(j));if(vi==pN)throw [0,d,o];var vj=cF(vh[1],0,vi);dY(caml_get_public_method(vj,-399298776),vj,n,3);dY(caml_get_public_method(vj,-399298776),vj,m,1);dY(caml_get_public_method(vj,811208714),vj,l,3);cF(caml_get_public_method(vj,-443258767),vj,k);bm(caml_get_public_method(vj,67859554),vj);bd(0);return;}());
