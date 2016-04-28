/* globals
---------------------------------------------------------------------*/
var transparent = new Color(0, 0);
var center = new Point(view.bounds.center);
var template, deck;
var deckster = {
    height: 300,
    width: 100,
    xSymmetry: true
};

init();

/* init
---------------------------------------------------------------------*/
function init() {
    newTemplate(deckster.width, deckster.height);
    // newDeck1(deckster.width, deckster.height);
    // newDeck2(deckster.width, deckster.height);
    newDeck3(deckster.width, deckster.height);
}

/* draw grid?
---------------------------------------------------------------------*/
// var gridDist = 50;
// var gridDivs = 8;
// var lines = [];
// for (var i = 0; i < view.size.width; i + gridDist) {
//  lines[i] = new Path.Line({
//      from: [i, 0],
//      to: [i, view.height],
//      strokeColor: 'black'
//  });
// }

/* draw template
---------------------------------------------------------------------*/
function newTemplate(w, h) {
    template = new Path.Rectangle(view.center, [w, h]);
    template.name = 'template';
    template.position = center;
    template.strokeColor = 'red';
    template.fillColor = transparent;

    template.insertSegment(0, center + [0, h / 2]);
    template.insertSegment(2, center + [-w / 2, h / 4]);
    template.insertSegment(3, center + [-w / 2, 0]);
    template.insertSegment(4, center + [-w / 2, -h / 4]);
    template.insertSegment(6, center + [0, -h / 2]);
    template.insertSegment(8, center + [w / 2, -h / 4]);
    template.insertSegment(9, center + [w / 2, 0]);
    template.insertSegment(10, center + [w / 2, h / 4]);
    // template.smooth();

    // toggle selection onClick event
    template.onClick = function(event) {
        this.selected = true;
    };
}

/* draw deck – method 1: clone and randomly shift each point from the template
---------------------------------------------------------------------*/
function newDeck1(w, h) {
    deck = template.clone();
    deck.name = 'deck';
    deck.strokeColor = 'blue';
    deck.fillColor = new Color(0, 1, 0, 0.5);
    for (var i = 0; i < deck.segments.length; i++)
        deck.segments[i].point += new Point(getRandom(-w / 8, w / 8), getRandom(-h / 8, h / 8));
    deck.position = center;

    // toggle selection on click
    deck.onClick = function(event) {
        this.selected = true;
        // this.smooth();
    };
}

/* draw deck – method 2: draw half a path and reflect along y-axis
---------------------------------------------------------------------*/

function newDeck2(w, h) {
    deck = new Path();
    deck.name = 'deck';
    deck.strokeColor = 'blue';
    deck.fillColor = new Color(0, 1, 0, 0.5);

    deck.add(center + [0, h / 2]);
    deck.add(center + [-w / 2, h / 2]);
    deck.add(center + [-w / 2, h / 4]);
    deck.add(center + [-w / 2, 0]);
    deck.add(center + [-w / 2, -h / 4]);
    deck.add(center + [-w / 2, -h / 2]);
    deck.add(center + [0, -h / 2]);

    for (var i = 0; i < deck.segments.length; i++) {
        if (i === 0 || i === deck.segments.length - 1) // don't shift the tip of the tail or nose in the x direction
            deck.segments[i].point += new Point(0, getRandom(-h / 8, h / 8));
        else
            deck.segments[i].point += new Point(getRandom(-w / 8, w / 8), getRandom(-h / 8, h / 8));
    }

    var rightSide = deck.clone();
    rightSide.scale(-1, 1, rightSide.bounds.topRight);
    deck.join(rightSide);
    deck.position = center;

    // toggle selection on click
    deck.onClick = function(event) {
        this.selected = true;
        // this.smooth();
    };
}


/* draw deck – method 3: draw a path w/ or w/o symmetry
---------------------------------------------------------------------*/

function newDeck3(w, h) {
    deck = new Path();
    deck.name = 'deck';
    deck.strokeColor = 'blue';
    deck.fillColor = new Color(0, 1, 0, 0.5);

    // draw the left side of the deck
    deck.add(center + [0, h / 2]);
    deck.add(center + [-w / 2, h / 2]);
    deck.add(center + [-w / 2, h / 4]);
    deck.add(center + [-w / 2, 0]);
    deck.add(center + [-w / 2, -h / 4]);
    deck.add(center + [-w / 2, -h / 2]);
    deck.add(center + [0, -h / 2]);

    if (deckster.xSymmetry) {
        // randomly shift each point on the left side of deck
        for (var i = 0; i < deck.segments.length; i++) {
            if (i === 0 || i === deck.segments.length - 1) // don't shift the tip of the tail or nose in the x direction
                deck.segments[i].point += new Point(0, getRandom(-h / 8, h / 8));
            else
                deck.segments[i].point += new Point(getRandom(-w / 8, w / 8), getRandom(-h / 8, h / 8));
        }
        // reflect along y-axis
        var rightSide = deck.clone();
        rightSide.scale(-1, 1, rightSide.bounds.topRight);
        deck.join(rightSide);
    } else {
        // draw the right side of the deck
        deck.add(center + [w / 2, -h / 2]);
        deck.add(center + [w / 2, -h / 4]);
        deck.add(center + [w / 2, 0]);
        deck.add(center + [w / 2, h / 4]);
        deck.add(center + [w / 2, h / 2]);
        deck.closePath();
        // randomly shift each point on the deck
        for (var i = 0; i < deck.segments.length; i++)
            deck.segments[i].point += new Point(getRandom(-w / 8, w / 8), getRandom(-h / 8, h / 8));
    }

    deck.position = center;

    // toggle selection on click
    deck.onClick = function(event) {
        this.selected = true;
        // this.smooth();
    };
}


/* GUI
=====================================================================*/
/* xSymmetry button
---------------------------------------------------------------------*/
var xSymmetry_t = new PointText({
    content: 'x-symmetry',
    point: view.bounds.topLeft + [50, 55],
    justification: 'left',
    fontSize: 20,
    fillColor: 'black'
});
var xSymmetry_bg = new Path.Rectangle(xSymmetry_t.position, [xSymmetry_t.bounds.width + 30, xSymmetry_t.bounds.height + 10]);
xSymmetry_bg.position = xSymmetry_t.position;
if (deckster.xSymmetry)
    xSymmetry_bg.fillColor = new Color(0, 255, 0);
else
    xSymmetry_bg.fillColor = new Color(255, 0, 0);
xSymmetry_bg.strokeColor = 'black';
xSymmetry_bg.strokeWidth = 2;

var xSymmetry_btn = new Group([xSymmetry_bg, xSymmetry_t]);

/* newDeck button
---------------------------------------------------------------------*/
var newDeck_t = new PointText({
    content: 'new deck',
    point: view.bounds.bottomLeft + [90, -45],
    justification: 'center',
    fontSize: 20,
    fillColor: 'black'
});
var newDeck_bg = new Path.Rectangle(newDeck_t.position, [newDeck_t.bounds.width + 30, newDeck_t.bounds.height + 10]);
newDeck_bg.position = newDeck_t.position;
newDeck_bg.fillColor = 'white';
newDeck_bg.strokeColor = 'black';
newDeck_bg.strokeWidth = 2;

var newDeck_btn = new Group([newDeck_bg, newDeck_t]);

/* flip button
---------------------------------------------------------------------*/
var flip_t = new PointText({
    content: 'flip',
    point: view.bounds.bottomLeft + [195, -45],
    justification: 'left',
    fontSize: 20,
    fillColor: 'black'
});
var flip_bg = new Path.Rectangle(flip_t.position, [flip_t.bounds.width + 30, flip_t.bounds.height + 10]);
flip_bg.position = flip_t.position;
flip_bg.fillColor = 'white';
flip_bg.strokeColor = 'black';
flip_bg.strokeWidth = 2;

var flip_btn = new Group([flip_bg, flip_t]);

/* smooth button
---------------------------------------------------------------------*/
var smooth_t = new PointText({
    content: 'smooth',
    point: view.bounds.bottomLeft + [315, -45],
    justification: 'center',
    fontSize: 20,
    fillColor: 'black'
});
var smooth_bg = new Path.Rectangle(smooth_t.position, [smooth_t.bounds.width + 30, smooth_t.bounds.height + 10]);
smooth_bg.position = smooth_t.position;
smooth_bg.fillColor = 'white';
smooth_bg.strokeColor = 'black';
smooth_bg.strokeWidth = 2;

var smooth_btn = new Group([smooth_bg, smooth_t]);

/* download button
---------------------------------------------------------------------*/
var download_t = new PointText({
    content: 'download',
    point: view.bounds.bottomRight + [-50, -45],
    justification: 'right',
    fontSize: 20,
    fillColor: 'black'
});
var download_bg = new Path.Rectangle(download_t.position, [download_t.bounds.width + 30, download_t.bounds.height + 10]);
download_bg.position = download_t.position;
download_bg.fillColor = 'white';
download_bg.strokeColor = 'black';
download_bg.strokeWidth = 2;

var download_btn = new Group([download_bg, download_t]);

/* events
=====================================================================*/
function onMouseDown(event) {
    inspectPoint(event);
}

/* xSymmetry button
---------------------------------------------------------------------*/
xSymmetry_btn.onClick = function(event) {
    deckster.xSymmetry = !deckster.xSymmetry;
};
// hover state
xSymmetry_btn.onMouseEnter = function(event) {
    xSymmetry_bg.fillColor = 'black';
    xSymmetry_bg.strokeColor = 'none';
    xSymmetry_t.fillColor = 'white';
};
xSymmetry_btn.onMouseLeave = function(event) {
    if (deckster.xSymmetry)
        xSymmetry_bg.fillColor = new Color(0, 255, 0);
    else
        xSymmetry_bg.fillColor = new Color(255, 0, 0);
    xSymmetry_bg.strokeColor = 'black';
    xSymmetry_t.fillColor = 'black';
};

/* newDeck button
---------------------------------------------------------------------*/
newDeck_btn.onClick = function(event) {
    deck.remove();
    smooth_t.content = 'smooth?';
    newDeck3(deckster.width, deckster.height);
};
// hover state
newDeck_btn.onMouseEnter = function(event) {
    newDeck_bg.fillColor = 'black';
    newDeck_bg.strokeColor = 'none';
    newDeck_t.fillColor = 'white';
};
newDeck_btn.onMouseLeave = function(event) {
    newDeck_bg.fillColor = 'white';
    newDeck_bg.strokeColor = 'black';
    newDeck_t.fillColor = 'black';
};

/* smooth button
---------------------------------------------------------------------*/
smooth_btn.onClick = function(event) {
    if (deck.hasHandles()) {
        deck.clearHandles();
        smooth_t.content = 'smooth?';
    } else {
        deck.smooth();
        smooth_t.content = 'unsmooth';
    }
};
// hover state
smooth_btn.onMouseEnter = function(event) {
    smooth_bg.fillColor = 'black';
    smooth_bg.strokeColor = 'none';
    smooth_t.fillColor = 'white';
};
smooth_btn.onMouseLeave = function(event) {
    smooth_bg.fillColor = 'white';
    smooth_bg.strokeColor = 'black';
    smooth_t.fillColor = 'black';
};

/* flip button
---------------------------------------------------------------------*/
flip_btn.onClick = function(event) {
    deck.scale(1, -1, center);
};
// hover state
flip_btn.onMouseEnter = function(event) {
    flip_bg.fillColor = 'black';
    flip_bg.strokeColor = 'none';
    flip_t.fillColor = 'white';
};
flip_btn.onMouseLeave = function(event) {
    flip_bg.fillColor = 'white';
    flip_bg.strokeColor = 'black';
    flip_t.fillColor = 'black';
};

/* download button
---------------------------------------------------------------------*/
download_btn.onClick = function(event) {
    downloadAsSVG('deck');
};
// hover state
download_btn.onMouseEnter = function(event) {
    download_bg.fillColor = 'black';
    download_bg.strokeColor = 'none';
    download_t.fillColor = 'white';
};
download_btn.onMouseLeave = function(event) {
    download_bg.fillColor = 'white';
    download_bg.strokeColor = 'black';
    download_t.fillColor = 'black';
};

/* functions
---------------------------------------------------------------------*/
// log the properties of matching point(s) in active layer and/or select targeted item(s)
function inspectPoint(event) {
    var children = project.activeLayer.children;
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var foundPoint = false;

        if (child.className == 'Path') { // only search for points in path items
            for (var j = 0; j < child.segments.length && !foundPoint; j++) {
                // console.log("checking children[" + i + "].segments[" + j + "]");
                if (child.segments[j].point.isClose(event.point, 5)) {
                    var clickedPoint = child.segments[j].point;
                    clickedPoint.selected = !clickedPoint.selected;
                    if (clickedPoint.selected)
                        console.log("children[" + i + "].segments[" + j + "]: " + clickedPoint);
                    foundPoint = true;
                }
            }
        }
        if (event.point.isInside(view.bounds) && !event.point.isInside(child.bounds))
            child.selected = false;
    }
}

// save SVG from paper.js as a file via FileSaver.js
function downloadAsSVG(itemID) {
    var target, fileName;
    if (!itemID) {
        target = project.activeLayer.children['deck'];
        fileName = 'deck.svg';
    } else {
        target = project.activeLayer.children[itemID];
        fileName = itemID + '.svg';
    }
    var svg = '<svg x="0" y="0" width="800" height="800" version="1.1" xmlns="http://www.w3.org/2000/svg">' + target.exportSVG({ asString: true }) + '</svg>';
    var blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });

    saveAs(blob, fileName);
}

// returns a random number between min (inclusive) and max (exclusive)
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}
