Author: A noble spirit
Editors: Sacco and Vanzetti
Date: AD 1999, Day of Lavos

# Available Syntax

Here's a list of current syntax options. Notations are provided for PHP Extras syntax, Maruku syntax, GFM, and NAMP dialects. For most of these, you'll want to also check out the HTML source to see what's going on.

* * *

## PHRASE EMPHASIS
---------------
*italic*   **bold**  
_italic_   __bold__

## LINKS
---------------
Inline:
An [example](http://url.com/ "Title")

Reference-style labels (titles are optional):
An [example][id]. Then, anywhere  
else in the doc, define the link:

  [id]: http://example.com/  "Title"

## IMAGES
---------------
Inline (titles are optional):
![alt text](http://gfhiryuu.tripod.com/random/green_dragon_sprite.gif "Random image")

Reference-style:
![alt text][id2]

  [id2]: http://upload.wikimedia.org/wikipedia/en/math/b/8/b/b8b4326ebb88870f8cc97ab3f59a0867.png "Still, a random image"

## HEADERS
---------------

Header 1
========

Header 2
--------

atx-style (closing #'s are optional):

# Header 1 #

## Header 2 ##

###### Header 6

## LISTS
---------------
Ordered, without paragraphs:

1. Eggs
2. Milk
4. Cheese
3. Anything

Ordered, with paragraphs:

1. Eggs

  Preferrably brown

2. Milk

  Wait, I am lactose intolerant
5. Cheese
2. Wait, Cheese?

Unordered, with paragraphs:

*   A list item.

    With multiple paragraphs.

*   Bar

You can nest them:

*   Abacus
    * A tool
*   Banana
    1.  Fruit
    2.  Gorilla snack
        * (or, for monkeys)
    3. Yellow
*   Camel

## BLOCKQUOTES
---------------
> Email-style angle brackets
> are used for blockquotes.

> > And, they can be nested. 

> #### Headers in blockquotes
> 
> * You can quote a list.
> * Like this.
>   1. And nest one.


## CODE SPANS
---------------
`<code>` spans are delimited
by backticks.

You can include literal backticks
like `` `this` ``.

## PREFORMATTED CODE BLOCKS
---------------
Indent every line of a code block by at least 4 spaces or 1 tab.

This is a normal paragraph.

    This is a preformatted
    code block.


Code blocks can also be "fenced" by ` ``` ` (GitHub-Flavored-Markdown)

```
console.log("flock yeah!");
```

For extra awesome, add the name of a programming language to the first fence, in order to syntax highlight it.

```perl
var x = function () { 
  console.log("This actually has 'perl' as a tag!")
};
```

```ruby, demo
module Test

  def demo
    puts "This is testing the demo construction"
  end
```

```xml, demo
<a:chart width="500" height="400">
    <a:axis mode="2D" x1="-1" y1="-0.2" x2="15" y2="1.1">
        <a:style type="text/chartcss">
            plane{
                fill   : white;
                stroke : #ebebeb;
            };
            tiles{
                fill   : white;
                stroke : #ebebeb;
            };
        </a:style>
        <!-- startcontent -->
        <a:graph 
          mode      = "bar" 
          dataslice = "1X"
          series    = "0.1#a 0.4#b 0.3#c 0.7#d 0.1#a 0.6#b 0.2#c 0.6#d 0.5#a 0.9#b 1#c 0.9#d">
            <a:style type="text/chartcss">
                graph.a{fill:#c4df9b}
                graph.b{fill:#acd373}
                graph.c{fill:#8dc63f}
                graph.d{fill:#598527}
                graph{
                    fill      : #fff200;
                    notransit : 0.5;
                    stroke    : #406618;
                }
            </a:style>
        </a:graph>
        <!-- endcontent -->
    </a:axis>
</a:chart>
```

```javascript, demo
new apf.frame({
  htmlNode   : document.body,
  caption    : "Options",
  width      : 250,
  childNodes : [
    new apf.radiobutton({
      value : 1,
      data  : "Option 1"
    }),
    /* startcontent */
    new apf.radiobutton({
      value : 2,
      data  : "Option 2"
    }),
    new apf.radiobutton({
      value : 3,
      data  : "Option 3"
    }),
    /* endcontent */
    new apf.radiobutton({
      value : 4,
      data  : "Option 4"
    })
  ]
});

```
(Highlighting is enabled by default; you'll have to define your own CSS that matches the highlight-js notation, though, which this document does not do!)

## STRIKETHROUGH

Hey, this is ~~terrible~~ great!


## HORIZONTAL RULES
---------------
Three or more dashes or asterisks:

---

* * *

- - - -

## MANUAL LINE BREAKS
---------------
End a line with two or more spaces:

Roses are red,  
Violets are blue.

- - - - - - - - - - - - - - - - - - - -

## PUNCTUATION 

"check it out"
"

\"

`"should not curl"`

*"Wow"*

## TABLES (PHP Extras)
-----------------

|a |b |c
|:---|---|---
|1 |2 |3


|a |b |c
|:--|:--:|:--
|1 |2 (or _two_) |[3]{: .threeClass}
|4 |5 | 6
{: #demo test="true"}


x |y        |z
--|--|--
8 |9 |10
{: .table .table-striped .table-bordered .table-condensed}

Demonstrating alignment:

  right|left  | center
-----:|:-----|:------:
 0001 | 2 (or _two_)    | 003
   4  | 0005 |  6



## DEFINITION LISTS (PHP Extras)
(sadly, broken)
-----------------

Apple
:   Pomaceous fruit of plants of the genus Malus in the family Rosaceae.
  * List in dl
  * Another **item**
    * Wait, one more !  
  {: .listStyle}
: Okay, back to another dd.

Orange
:   The fruit of an evergreen tree of the genus Citrus.
```python
print "Testing yet again"
```  
    It's extremly hard to come up with make believe text.

Pomegranate
:   A deciduous shrub or small tree (Punica granatum), native to Asia and _widely cultivated_ for its edible fruit. 
Anyway, Blah blah blah.adsadsasd.

Term 1
:   This is a definition with two paragraphs. 
  Lorem ipsum dolor sit amet, consectetuer adipiscing elit. 
  Aliquam hendrerit mi posuere lectus.
:   Second definition for term 1, also wrapped in a paragraph
    because of the blank line preceding it. {: .test}   
{: #TestingIDHere}

## ATTRIBUTES (Maruku)  
{: #myid .myclass}

-----------------

Look _around_{: .class1} you! View [the source code!]{: .someclass .someclass2 vague="no"}
This whole area is covered in
attributes!
{: #bigBlock tutorial=yes}

Spans should be covered in `[ ]`, with the attribute list defined afterwards.

## AUTO-LINK
-----------------

<http://foo.com/>  
<mailto:foo@bar.com>

## ENCODING
-----------------

&amp; < "aaa" &

## Twitter Bootstrap tags

Note: This should be wrapped in a div that looks like this: `<div class='alert alert-success'>`. 

Tip: This should be wrapped in a div that looks like this: `<div class='alert alert-info'>`

Warning: And _this_ should be wrapped in a div like this: `<div class='alert alert-block'>`

These classes have to do with Twitter Bootstrap stylings for `Note: `, `Tip: `, and `Warning: `.

## INLINE HTML
-----------------

<p>
HTML _should_ be represented as is.<br>
<del>The <strong>quick brown fox</strong> jumps over the lazy dog.</del>
</p>

<div>
Regularly Markdown syntax ignored in HTML.  
[Google](http://www.google.co.jp/)
</div>


## Keybindings
-----------------


To have fun, press: [[keys: ⌃-⌥-Down]]. Or, you know, don't.

Note: [[keys: ⌃-K]]

[[keys: ⌘-X]]

_Your Name_, Setup, Develop, Stuff
## Menus
-----------------

Click [[menu: _Your Name_, Setup, Develop, Stuff]]. For Visualforce components, click [[menu: Blah, Setup, Develop, Components]].