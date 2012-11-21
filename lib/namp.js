/**
 * namp - Not another markdown parser (https://github.com/gjtorikian/namp)
 * Copyright (c) 2011-2012, Garen Torikian. (MIT Licensed)
 */

;(function() {

var hljs = require('highlight.js');

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  lheading: /^([^\n]+)\n *(=|-){3,} *\n*/,
  blockquote: /^( *>[^\n]+(\n[^\n]+)*\n*)+/,
  list: /^( *)(bull) [^\0]+?(?:hr|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment|closed|closing) *(?:\n{2,}|\s*$)/,
  html_closed: /^ *(?:closed) *(?:\n{2,}|\s*$)/,
  def: /^ *\[([^\]]+)\]: *([^\s]+)(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  paragraph: /^([^\n]+\n?(?!body))+\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', /\n+(?=(?: *[-*_]){3,} *(?:\n+|$))/)
  ();

block.html = replace(block.html)
  ('comment', /<!--[^\0]*?-->/)
  ('closed', /<(tag)[^\0]+?<\/\1>/)
  ('closing', /<tag(?!:\/|@)\b(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, tag())
  ();

block.html_closed = replace(block.html_closed)
  ('closed', /<(tag)([^\0]+?)<\/\1>/)
  (/tag/g, tag())
  (); 

block.paragraph = (function() {
  var paragraph = block.paragraph.source
    , body = [];

  (function push(rule) {
    rule = block[rule] ? block[rule].source : rule;
    body.push(rule.replace(/(^|[^\[])\^/g, '$1'));
    return push;
  })
  ('hr')
  ('heading')
  ('lheading')
  ('blockquote')
  ('<' + tag() + '[\\s>]')
  ('def');

  return new
    RegExp(paragraph.replace('body', body.join('|')));
})();

block.normal = {
  fences: block.fences,
  paragraph: block.paragraph
};

block.gfm = {
  fences: /^ *``` *([\w\-]+)?(,\s*demo)? *\n([^\0]+?)\s*``` *(?:\n+|$)/,
  paragraph: /^/
};

block.namp = {
  alerts: /^Note: |^Tip: |^Warning: /,
  note: /^Note:\s+(([^\n]+\n?(?!body))+\n*)/,
  tip: /^Tip:\s+(([^\n]+\n?(?!body))+\n*)/,
  warning: /^Warning:\s+(([^\n]+\n?(?!body))+\n*)/
}

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!' + block.gfm.fences.source.replace(/(^|[^\[])\^/g, '$1') + '|')
  ();

documentMeta = /^(\w+): (.+)\n/;


/**
 * Block Lexer
 */

block.lexer = function(src) {
  var tokens = [];

  tokens.links = {};

  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ');

  return block.token(src, tokens, true);
};

block.token = function(src, tokens, top) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , item
    , space
    , i
    , l
    , firstBlock = false;

  while (src) {
      
    // add doc metadata
    if (!firstBlock && (cap = documentMeta.exec(src))) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        tokens.push({
          type: 'metadata',
          key: cap[1],
          value: cap[2]
        });
      }
      continue;
    }
    
    // newline
    if (cap = block.newline.exec(src)) {
      firstBlock = true;
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = block.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      tokens.push({
        type: 'code',
        text: !options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = block.fences.exec(src)) {
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'code',
        lang: cap[1],
        demo: cap[2],
        text: cap[3]
      });
      continue;
    }

    // heading
    if (cap = block.heading.exec(src)) {
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // lheading
    if (cap = block.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = block.hr.exec(src)) {
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = block.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      block.token(cap, tokens, top);

      tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = block.list.exec(src)) {
      src = src.substring(cap[0].length);

      tokens.push({
        type: 'list_start',
        ordered: isFinite(cap[2])
      });

      // Get each top-level item.
      cap = cap[0].match(block.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item[item.length-1] === '\n';
          if (!loose) loose = next;
        }

        tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        block.token(item, tokens);

        tokens.push({
          type: 'list_item_end'
        });
      }

      tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html_closed
    if (cap = block.html_closed.exec(src)) {
      var atts = cap[2].substring(0,cap[2].indexOf(">"));
      if (/markdown\s*=\s*('|"){0,1}1('|"){0,1}/.test(atts)) {
          var inner = cap[2].substring(atts.length+1);
          src = src.substring(cap[0].length);
          tokens.push({
            type: 'html', pre: cap[1]==='pre', text: "<"+cap[1]+atts+">"
          });
          block.token(inner,tokens,false);
          tokens.push({
              type: 'html', pre: cap[1]==='pre', text: "</"+cap[1]+">"
          });
          continue;
      }
    }
    
    // html
    if (cap = block.html.exec(src)) {
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'html',
        pre: cap[1] === 'pre',
        text: cap[0]
      });
      continue;
    }

    // def
    if (top && (cap = block.def.exec(src))) {
      src = src.substring(cap[0].length);
      tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // top-level paragraph
    if (top && !block.paragraph.exec(block.namp.alerts) && (cap = block.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'paragraph',
        text: cap[0]
      });
      continue;
    }

    // namp: Note:
    if (top && (cap = block.namp.note.exec(src))) {
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'note',
        text: cap[1]
      });
      continue;
    }

    // namp: Tip:
    if (top && (cap = block.namp.tip.exec(src))) {
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'tip',
        text: cap[1]
      });
      continue;
    }

        // namp: Warning:
    if (top && (cap = block.namp.warning.exec(src))) {
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'warning',
        text: cap[1]
      });
      continue;
    }

    // text
    if (cap = block.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }
  }

  return tokens;
};

/**
 * Inline Processing
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>~])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[^\0]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)(<\d+,\s*\d+>)?/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([^\0]+?)__(?!_)|^\*\*([^\0]+?)\*\*(?!\*)/,
  em: /^\b_((?:__|[^\0])+?)_\b|^\*((?:\*\*|[^\0])+?)\*(?!\*)/,
  code: /^(`+)([^\0]*?[^`])\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  text: /^[^\0]+?(?=[\\<!\[_*`~]| {2,}\n|$)/
};

inline._linkInside = /(?:\[[^\]]*\]|[^\]]|\](?=[^\[]*\]))*/;
inline._linkHref = /\s*<?([^\s]*?)>?(?:\s+['"]([^\0]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._linkInside)
  ('href', inline._linkHref)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._linkInside)
  ();

inline.normal = {
  url: inline.url,
  strong: inline.strong,
  em: inline.em,
  text: inline.text
};

inline.pedantic = {
  strong: /^__(?=\S)([^\0]*?\S)__(?!_)|^\*\*(?=\S)([^\0]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([^\0]*?\S)_(?!_)|^\*(?=\S)([^\0]*?\S)\*(?!\*)/
};

inline.gfm = {
  url: /^(https?:\/\/[^\s]+[^.,:;"')\]\s])/,
  text: /^[^\0]+?(?=[\\<!\[_*`~]|https?:\/\/| {2,}\n|$)/
};

inline.namp = {
  strikethrough: /^(~~)([^\0]*?[^~])\1(?!~~)/,
  maruku: /^\{:\s*((?:\\\}|[^\}])*)\s*\}/,
  keys: /^\[\[keys:\s+([^\0\]]+)\]\]/,
  menu: /^\[\[menu:\s+([^\0\]]+)\]\]/
}


var keyDescribe = {
  "⇧": {
        "text": "Shift",
        "unicode": "&#x21E7;"
       },
  "⌘": {
        "text": "Command",
        "unicode": "&#x2318;"
       }, 
  "⌥": {
        "text": "Option",
        "unicode": "&#x2325;"
       },
  "⎋": {
        "text": "Escape",
        "unicode": "&#x238B;"
       },
  "↑": {
        "text": "Up",
        "unicode": "&uarr;"
       },
  "→": {
        "text": "Right",
        "unicode": "&rarr;"
       }, 
  "↓": {
        "text": "Down",
        "unicode": "&darr;"
       },
  "←": {
        "text": "Left",
        "unicode": "&larr;"
       },
  "⌃": {
        "text": "Ctrl",
        "unicode": "&#708;"
       },
  "⌫": {
        "text": "Backspace",
        "unicode": "&#9003;"
       }
};

/**
 * Inline Lexer
 */

inline.lexer = function(src) {
  var out = ''
    , links = tokens.links
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = inline.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = inline.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1][6] === ':'
          ? mangle(cap[1].substring(7))
          : mangle(cap[1]);
        href = mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += '<a href="'
        + href
        + '">'
        + text
        + '</a>';
      continue;
    }

    // url (gfm)
    if (cap = inline.url.exec(src)) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += '<a href="'
        + href
        + '">'
        + text
        + '</a>';
      continue;
    }

    // tag
    if (cap = inline.tag.exec(src)) {
      src = src.substring(cap[0].length);
      out += options.sanitize
        ? escape(cap[0])
        : cap[0];
      continue;
    }

    // link
    if (cap = inline.link.exec(src)) {
      src = src.substring(cap[0].length);
      out += outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      continue;
    }

    // namp: menus
    if (cap = inline.namp.menu.exec(src)) {
      src = src.substring(cap[0].length);
      
      var menus = cap[1].split(",");
      menus = menus.map(function(menu) {
          // em
          if (cap = inline.em.exec(menu)) {
            return '<em><strong>'
              + inline.lexer(cap[2] || cap[1]).trim()
              + '</strong></em>';
          }

          // code
          if (cap = inline.code.exec(src)) {
            return '<code><strong>'
              + escape(cap[2], true).trim()
              + '</strong></code>';
          }

          return "<strong>" + menu.trim() + "</strong>";
      });

      out += '<span class="menucascade">'
        + '<span class="menuitem">' + menus.join("</span><span class='menudivider'> <strong>&gt;</strong> </span><span class='menuitem'>")
        + '</span></span>';
      continue;
    }

    // namp: keys
    if (cap = inline.namp.keys.exec(src)) {
      src = src.substring(cap[0].length);

      var title = cap[1].split("-");
      cap[1] = cap[1].split("-");
      
      title = title.map(function(char) {
         return keyDescribe[char] !== undefined ? keyDescribe[char].text : char
      });
      
      cap[1] = cap[1].map(function(char) {
         return keyDescribe[char] !== undefined ? keyDescribe[char].unicode : char
      });
    
      out += '<kbd class="keyboard-key nowrap"><abbr title="' + title.join("-") + '">'
        + cap[1].join("-")
        + '</abbr></kbd>';
      continue;
    }
    
    // reflink, nolink
    if ((cap = inline.reflink.exec(src))
        || (cap = inline.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0][0];
        src = cap[0].substring(1) + src;
        continue;
      }
      out += outputLink(cap, link);
      continue;
    }

    // strong
    if (cap = inline.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<strong>'
        + inline.lexer(cap[2] || cap[1])
        + '</strong>';
      continue;
    }

    // em
    if (cap = inline.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<em>'
        + inline.lexer(cap[2] || cap[1])
        + '</em>';
      continue;
    }

    // code
    if (cap = inline.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<code>'
        + escape(cap[2], true)
        + '</code>';
      continue;
    }

    // br
    if (cap = inline.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<br>';
      continue;
    }

    // namp: strikethrough
    if (cap = inline.namp.strikethrough.exec(src)) {
      src = src.substring(cap[0].length);
      out += '<del>'
        + escape(cap[2], true)
        + '</del>';
      continue;
    }

    // text
    if (cap = inline.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += escape(cap[0]);
      continue;
    }
  }

  return out;
};

function outputLink(cap, link) {
  if (cap[0][0] !== '!') {
    return '<a href="'
      + escape(link.href)
      + '"'
      + (link.title
      ? ' title="'
      + escape(link.title)
      + '"'
      : '')
      + '>'
      + inline.lexer(cap[1])
      + '</a>';
  } else {
    if (cap[4] !== undefined) {
      var dim = cap[4].split(",");
      var width = dim[0].slice(1);
      var height = dim[1].slice(0, dim[1].length - 1);
    }

    return '<img src="'
      + escape(link.href)
      + '" alt="'
      + escape(cap[1])
      + '"'
      + (link.title
      ? ' title="'
      + escape(link.title)
      + '"'
      : '')
      + ' width="' + (width || '')
      + '" height="' + (height || '')
      + '">';
  }
}

/**
 * Parsing
 */

var tokens
  , token;

function next() {
  return token = tokens.pop();
}

function tok(metadata) {
  switch (token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return '<hr>\n';
    }
    case 'heading': {
      return '<h'
        + token.depth
        + '>'
        + inline.lexer(token.text)
        + '</h'
        + token.depth
        + '>\n';
    }
    case 'code': {
      if (options.highlight) {
        token.code = options.highlight(token.text, token.lang);
        if (token.code != null && token.code !== token.text) {
          token.escaped = true;
          token.text = token.code;
        }
        if (!token.escaped) 
          token.text = escape(token.text, true);
      }
      else if (token.lang && token.lang !== "no-highlight" && token.demo === undefined) {
        token.lang = token.lang === "html" ? "xml" : token.lang;
        token.text = hljs.highlight(token.lang, token.text).value;
      }
      else if (!token.lang)
        token.text = hljs.highlightAuto(token.text).value;
      // intentionally skip 'no-highlight'

      if (token.demo !== undefined)
        return '<div class="demo language-' + token.lang + '">' + token.text + '</div>';

      var pretag = '<pre>';

      return pretag + '<code'
        + (token.lang
        ? ' class="language-'
        + token.lang
        + '"'
        : '')
        + '>'
        + token.text
        + '</code></pre>\n';
    }
    case 'blockquote_start': {
      var body = '';

      while (next().type !== 'blockquote_end') {
        body += tok(metadata);
      }

      return '<blockquote>\n'
        + body
        + '</blockquote>\n';
    }
    case 'list_start': {
      var type = token.ordered ? 'ol' : 'ul'
        , body = '';

      while (next().type !== 'list_end') {
        body += tok(metadata);
      }

      return '<'
        + type
        + '>\n'
        + body
        + '</'
        + type
        + '>\n';
    }
    case 'list_item_start': {
      var body = '';

      while (next().type !== 'list_item_end') {
        body += token.type === 'text'
          ? parseText()
          : tok(metadata);
      }

      return '<li>'
        + body
        + '</li>\n';
    }
    case 'loose_item_start': {
      var body = '';

      while (next().type !== 'list_item_end') {
        body += tok(metadata);
      }

      return '<li>'
        + body
        + '</li>\n';
    }
    case 'html': {
      if (options.sanitize) {
        return inline.lexer(token.text);
      }
      return !token.pre && !options.pedantic
        ? inline.lexer(token.text)
        : token.text;
    }
    case 'paragraph': {
      return '<p>'
        + inline.lexer(token.text)
        + '</p>\n';
    }
    case 'metadata': {
        metadata[token.key] = token.value;
        return '';
    }
    case 'note': {
      return '<div class="alert alert-success">'
        + '<h4 class="alert-heading">Note: </h4>'
        + inline.lexer(token.text)
        + '</div>\n';
    }
    case 'tip': {
      return '<div class="alert alert-info">'
        + '<h4 class="alert-heading">Tip: </h4>'
        + inline.lexer(token.text)
        + '</div>\n';
    }
    case 'warning': {
      return '<div class="alert alert-block">'
        + '<h4 class="alert-heading">Warning: </h4>'
        + inline.lexer(token.text)
        + '</div>\n';
    }
    case 'text': {
      return '<p>'
        + parseText()
        + '</p>\n';
    }
  }
}

function parseText() {
  var body = token.text
    , top;

  while ((top = tokens[tokens.length-1])
         && top.type === 'text') {
    body += '\n' + next().text;
  }

  return inline.lexer(body);
}

function parse(src) {
  tokens = src.reverse();

  var out = '';
  var metadata = {};

  while (next()) {
    out += tok(metadata);
  }

  tokens = null;
  token = null;
  
  return [out, metadata];
}

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function mangle(text) {
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
}

function tag() {
  var tag = '(?!(?:'
    + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
    + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
    + '|span|br|wbr|ins|del|img)\\b)\\w+';

  return tag;
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    regex = regex.replace(name, val.source || val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

/**
 * Marked
 */

function namp(src, opt) {
  setOptions(opt);
  var parsedReturn = parse(block.lexer(src));
  return { html: parsedReturn[0], metadata: parsedReturn[1] };
}

/**
 * Options
 */

var options
  , defaults;

function setOptions(opt) {
  if (!opt) opt = defaults;
  if (options === opt) return;
  options = opt;

  block.fences = block.gfm.fences;
  block.paragraph = block.gfm.paragraph;
  inline.text = inline.gfm.text;
  inline.url = inline.gfm.url;

  if (options.pedantic) {
    inline.em = inline.pedantic.em;
    inline.strong = inline.pedantic.strong;
  } else {
    inline.em = inline.normal.em;
    inline.strong = inline.normal.strong;
  }
}

namp.options =
namp.setOptions = function(opt) {
  defaults = opt;
  setOptions(opt);
  return namp;
};

namp.setOptions({
  namp: true,
  pedantic: false,
  sanitize: false,
  preHighlight: true,
  preHighlightOriginals: false,
  highlight: null,
});

/**
 * Expose
 */

namp.parser = function(src, opt) {
  setOptions(opt);
  return parse(src);
};

namp.lexer = function(src, opt) {
  setOptions(opt);
  return block.lexer(src);
};

namp.parse = namp;

if (typeof module !== 'undefined') {
  module.exports = namp;
} else {
  this.namp = namp;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());