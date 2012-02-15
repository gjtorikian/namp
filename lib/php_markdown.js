
exports.php_extras_obj = 
{

  dl: /^((?:[^\s:].*\n)+):\s+([^]+)$/,
}

exports.php_extras_token = function(cap, block, src, tokens)
{
    var next = function() {
      return token = tokens.pop();
    };

    if ( cap = src.match(block.dl) ) {
      console.log("cap: " + cap + "~");
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'dl',
        dt: cap[1],
        dd: cap[2]
      });
      return src;
    }

    return undefined;
}

exports.php_extras_tok = function(token)
{
    switch (token.type) {
      case 'dl': {
        if (token.dd.search(/^:/))
          token.dd = token.dd.split(":").map(function (element) { return '<dd>' + element + '</dd>'; }).join("");
        else
          token.dd = '<dd>' + token.dd + '</dd>';
        return '<dl><dt>'
          + token.dt
          + '</dt>'
          + token.dd 
          + '</dl>';
      }
      default:
        return undefined;
    }
}

/*
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'dl',
        dt: cap[1],
        dd: cap[2]
      });
      return true;
      */

