/* globals
---------------------------------------------------------------------*/
var transparent = new Color(0, 0);
var center = new Point(view.bounds.center);
var template, deck;
var deckster = {
    height: 300,
    width: 100
};

init();

/* init
---------------------------------------------------------------------*/
function init() {
    newTemplate(deckster.width, deckster.height);
    // newDeck1();
    newDeck2(deckster.width, deckster.height);
    exportLayer = new Layer([deck]);
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

/* draw deck – method 1: clone and modify the template
---------------------------------------------------------------------*/
function newDeck1() {
    deck = template.clone();
    deck.name = 'deck';
    deck.strokeColor = 'blue';
    deck.fillColor = new Color(0, 1, 0, 0.5);
    for (var i = 0; i < deck.segments.length; i++) {
        if (i === 0 || i === deck.segments.length / 2) // don't shift the tip of the tail or nose in the x direction
            deck.segments[i].point += new Point(0, getRandom(-37.5, 37.5));
        else
            deck.segments[i].point += new Point(getRandom(-25, 25), getRandom(-37.5, 37.5));
    }
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


/* GUI
=====================================================================*/
/* smooth button
---------------------------------------------------------------------*/
var smooth_t = new PointText({
    content: 'smooth?',
    point: view.bounds.bottomCenter + [0, -100],
    justification: 'center',
    fontSize: 18,
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
    point: view.bounds.bottomCenter + [0, -40],
    justification: 'center',
    fontSize: 18,
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

/* smooth button
---------------------------------------------------------------------*/
smooth_btn.onClick = function(event) {
    deck.smooth();
    smooth_t.content = 'smoothed!';
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

/* download button
---------------------------------------------------------------------*/
download_btn.onClick = function(event) {
    downloadAsSVG();
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
function downloadAsSVG(fileName) {
    if (!fileName) {
        fileName = "deckster.svg";
    }
    var target = project.activeLayer.children['deck'];
    var svg = '<svg x="0" y="0" width="800" height="800" version="1.1" xmlns="http://www.w3.org/2000/svg">' + target.exportSVG({ asString: true }) + '</svg>';
    var url = "data:image/svg+xml;utf8," + encodeURIComponent(svg);

    var blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    saveAs(blob, fileName);
}

// returns a random number between min (inclusive) and max (exclusive)
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}
