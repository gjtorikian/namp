# Introduction

** IN THE MIDDLE OF A TRANSITION, NOT ALL FEATURES ARE FUNCITONAL YET **

This is **no**t **a**nother **m**arkdown **p**arser.

Well, okay, yes it is. But it handles a lot more than you're probably used to finding in just a single package. This generator can process Markdown files written in:

* [The standard Gruber syntax](http://daringfireball.net/projects/markdown/)
* [The GitHub Flavored Markdown syntax](http://github.github.com/github-flavored-markdown/) (including language-specific codeblock fences)
* [The PHP Markdown Extra syntax](http://michelf.com/projects/php-markdown/extra/) (**NOT YET SUPPORTED**)
* Supports [Maruku metadata](http://maruku.rubyforge.org/maruku.html#meta) (**NOT YET SUPPORTED**)

It also does some "non-traditional" work, too, that I find pretty damn useful:

* _Inline_ metadata support (something Maruku does not do). By this I mean you can add an ID to anything; for example, this format:  
 `Here is [a very special]{: #special .words1 .class1 lie=false} piece of text!`  
Produces this text:  
`<p>Here is <span id="special" class="words1 class1" lie="false">a very special</span> piece of text`  
Maruku only allowed you to do inline IDs for stylized text, like `code`, **strong**, or _emphasis_. Now, if you wrap your text in `[ ]` brackets, you can continue to add Maruku metadata syntax and expect it to work.(**NOT YET SUPPORTED**)
  
* Strikethroughs, using `~~`. For example, `This is a ~~strikethrough~~` turns into `This is a <del>strikethrough</del>`
* Tables, with support for `left`,`right`, and `center` alignment (**NOT YET SUPPORTED**)
* Conversion of `Note: `, `Tip: `, and `Warning: ` blocks into [Twitter Bootstrap alert blocks](http://twitter.github.com/bootstrap/components.html#alerts). Awesome!
* Build-time highlighting of `<pre>` code blocks. Enabled by default, see below for configuration instructions. (**NOT YET SUPPORTED**)

* Markdown wrapped in `<div marked="1">` is processed.

namp was forked from [marked](https://github.com/chjj/marked), which is a super-fast Markdown parser that handles all the standard GFM syntax.

For a demonstration of all the additional add-ons, take a look at the _/doc_ folder.

## Usage and Configuration

First, install from npm:

  npm install namp

Then, add the module via a `require()` statement, feed it a file, and let it go:

```javascript
var namp = require('namp');
var fs = require('fs');

fs.readFile("SYNTAX.md", "utf8", function (err, data) {
  if (!err) {
    var output = namp(data, {highlight: true } );
    fs.writeFileSync("SYNTAX.html", output.html);

    console.log("Finished! By the way, I found this metadata:\n" + console.log(output.metadata));
  }
});
```

That's it! Notice that the converter takes two parameters:

* `data`, the contents of the Markdown file
* `options`, an object containing the following properties:  
  - `highlight` enables build-time syntax highlighting for code blocks (this is `true` by default). This uses [the highlight.js processor](http://softwaremaniacs.org/soft/highlight/en/), so you'll still need to define your own CSS for colors

The result of the conversion is an object with two properties:

* `html`, the transformed HTML
* `metadata`, an object containing the document metadata values (`undefined` if there's none)

#### Document Metadata Handling

A special note must be made for the way document metadata blocks are handled. These are a list of arbitrary `Key: Value` mappings defined at the very start of a document. They are optional, but can be useful as content to be used in other locations. _doc/SYNTAX.md_ shows how you can define these properties.

Here's the original marked README:

# marked

A full-featured markdown parser and compiler, written in javascript.
Built for speed.

## Benchmarks

node v0.4.x

``` bash
$ node test --bench
marked completed in 12071ms.
showdown (reuse converter) completed in 27387ms.
showdown (new converter) completed in 75617ms.
markdown-js completed in 70069ms.
```

node v0.6.x

``` bash
$ node test --bench
marked completed in 6448ms.
marked (gfm) completed in 7357ms.
marked (pedantic) completed in 6092ms.
discount completed in 7314ms.
showdown (reuse converter) completed in 16018ms.
showdown (new converter) completed in 18234ms.
markdown-js completed in 24270ms.
```

__Marked is now faster than Discount, which is written in C.__

For those feeling skeptical: These benchmarks run the entire markdown test suite
1000 times. The test suite tests every feature. It doesn't cater to specific
aspects.

## Install

``` bash
$ npm install marked
```

## Another Javascript Markdown Parser

The point of marked was to create a markdown compiler where it was possible to
frequently parse huge chunks of markdown without having to worry about
caching the compiled output somehow...or blocking for an unnecesarily long time.

marked is very concise and still implements all markdown features. It is also
now fully compatible with the client-side.

marked more or less passes the official markdown test suite in its
entirety. This is important because a surprising number of markdown compilers
cannot pass more than a few tests. It was very difficult to get marked as
compliant as it is. It could have cut corners in several areas for the sake
of performance, but did not in order to be exactly what you expect in terms
of a markdown rendering. In fact, this is why marked could be considered at a
disadvantage in the benchmarks above.

Along with implementing every markdown feature, marked also implements
[GFM features](http://github.github.com/github-flavored-markdown/).

## Options

marked has 4 different switches which change behavior.

- __pedantic__: Conform to obscure parts of `markdown.pl` as much as possible.
  Don't fix any of the original markdown bugs or poor behavior.
- __gfm__: Enable github flavored markdown (enabled by default).
- __sanitize__: Sanitize the output. Ignore any HTML that has been input.
- __highlight__: A callback to highlight code blocks.

None of the above are mutually exclusive/inclusive.

## Usage

``` js
// Set default options
marked.setOptions({
  gfm: true,
  pedantic: false,
  sanitize: true,
  // callback for code highlighter
  highlight: function(code, lang) {
    if (lang === 'js') {
      return javascriptHighlighter(code);
    }
    return code;
  }
});
console.log(marked('i am using __markdown__.'));
```

You also have direct access to the lexer and parser if you so desire.

``` js
var tokens = marked.lexer(text);
console.log(marked.parser(tokens));
```

``` bash
$ node
> require('marked').lexer('> i am using marked.')
[ { type: 'blockquote_start' },
  { type: 'paragraph',
    text: 'i am using marked.' },
  { type: 'blockquote_end' },
  links: {} ]
```

## CLI

``` bash
$ marked -o hello.html
hello world
^D
$ cat hello.html
<p>hello world</p>
```

## License

Copyright (c) 2011-2012, Garen Torikian. (MIT License)

See LICENSE for more info.

Based mostly on Christopher Jeffrey (https://github.com/chjj/)
