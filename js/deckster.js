/* globals
=====================================================================*/
var center = new Point(view.bounds.center);
var grid, blank, deck, holes, dims;
var deckster = {
    height: 27, // inches
    width: 9, // inches
    wheelBase: 15, // inches
    xSymmetry: true,
    isSmooth: false,
    hitOptions: {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 5
    }
};
deckster.scalar = 400 / deckster.height; // pixels : inches
deckster.height *= deckster.scalar;
deckster.width *= deckster.scalar;
deckster.wheelBase *= deckster.scalar;

init();

/* init
---------------------------------------------------------------------*/
function init() {
    grid = newGrid(50);
    blank = newBlank(deckster.width, deckster.height);
    deck = newDeck(deckster.width, deckster.height);
    // displayDims(deck);
}

/* draw grid
---------------------------------------------------------------------*/
function newGrid(interval, color) {
    var g = new Group();
    g.name = 'grid';

    var gDist = 50; // default distance between grid lines
    if (interval) gDist = interval;

    var gColor = new Color(0, 0, 255, 0.25); // default color
    if (color) gColor = new Color(color);

    // create x lines
    for (var i = 1; i * gDist < view.size.width; i++) {
        var dX = i * gDist;
        var lineX = new Path.Line({
            from: [dX, 0],
            to: [dX, view.bounds.height],
            strokeColor: gColor,
            dashArray: [5, 5]
        });
        g.addChild(lineX);
    }
    // create y lines
    for (var j = 1; j * gDist < view.size.height; j++) {
        var dY = j * gDist;
        var lineY = new Path.Line({
            from: [0, dY],
            to: [view.bounds.width, dY],
            strokeColor: gColor,
            dashArray: [5, 5]
        });
        g.addChild(lineY);
    }

    return g;
}

/* draw blank
---------------------------------------------------------------------*/
function newBlank(w, h) {
    var b = new Path.Rectangle({
        name: 'blank',
        position: center,
        size: [w, h],
        strokeColor: 'red',
        fill: 'none'
    });

    b.insertSegment(0, center + [0, h / 2]);
    b.insertSegment(2, center + [-w / 2, h / 4]);
    b.insertSegment(3, center + [-w / 2, 0]);
    b.insertSegment(4, center + [-w / 2, -h / 4]);
    b.insertSegment(6, center + [0, -h / 2]);
    b.insertSegment(8, center + [w / 2, -h / 4]);
    b.insertSegment(9, center + [w / 2, 0]);
    b.insertSegment(10, center + [w / 2, h / 4]);

    return b;
}

/* draw deck
---------------------------------------------------------------------*/
function newDeck(w, h) {
    var d = new Path({
        name: 'deck',
        strokeColor: 'black',
        fillColor: new Color(0, 1, 0, 0.5)
    });

    // draw the left side of the deck
    d.add(center + [0, h / 2]);
    d.add(center + [-w / 2, h / 2]);
    d.add(center + [-w / 2, h / 4]);
    d.add(center + [-w / 2, 0]);
    d.add(center + [-w / 2, -h / 4]);
    d.add(center + [-w / 2, -h / 2]);
    d.add(center + [0, -h / 2]);

    if (deckster.xSymmetry) {
        // randomly shift each point on the left side of deck
        for (var i = 0; i < d.segments.length; i++) {
            if (i === 0) // don't shift the bottom point in the x direction or beyond the blank
                d.segments[i].point += new Point(0, -getRandom(0, h / 8));
            else if (i === 1) // don't shift the bottom right point beyond the blank
                d.segments[i].point += new Point(getRandom(0, w / 4), -getRandom(0, h / 8));
            else if (i === d.segments.length - 2) // don't shift the top left point beyond the blank
                d.segments[i].point += new Point(getRandom(0, w / 4), getRandom(0, h / 8));
            else if (i === d.segments.length - 1) // don't shift the top point in the x direction or beyond the blank
                d.segments[i].point += new Point(0, getRandom(0, h / 8));
            else
                d.segments[i].point += new Point(getRandom(0, w / 4), getRandom(-h / 8, h / 8));
        }
        // reflect along y-axis
        var rightSide = d.clone();
        rightSide.scale(-1, 1, rightSide.bounds.topRight);
        d.join(rightSide);
    } else {
        // draw the right side of the deck
        d.add(center + [w / 2, -h / 2]);
        d.add(center + [w / 2, -h / 4]);
        d.add(center + [w / 2, 0]);
        d.add(center + [w / 2, h / 4]);
        d.add(center + [w / 2, h / 2]);
        d.closePath();

        // randomly shift each point on the deck
        for (var i = 0; i < d.segments.length; i++)
            d.segments[i].point += new Point(getRandom(-w / 8, w / 8), getRandom(-h / 8, h / 8));

        // if not inside the blank, scale to fit
        if (!d.isInside(blank.bounds)) {
            var scalarX = w / d.bounds.width;
            var scalarY = h / d.bounds.height;
            d.scale(scalarX, scalarY);
        }
    }
    d.position = center;

    holes = newMountHoles(deckster.wheelBase);
    // if (holes.bounds.height < d.bounds.height) {
    //     holes.pivot = holes.bounds.bottomCenter;
    //     // holes.position = d.bounds.bottomCenter - [0, getRandom(0.75, 1) * (20 * deckster.scalar - deckster.wheelBase)];
    //     holes.position = d.bounds.bottomCenter - [0, (20 * deckster.scalar - deckster.wheelBase)];
    // }
    // d.subtract(holes);

    dims = displayDims(d);

    return d;
}

/* draw mount holes
---------------------------------------------------------------------*/
function newMountHoles(wheelBase) {
    var mountWidth = 1.625 * deckster.scalar;
    var mountHeight = 2.125 * deckster.scalar;
    var holeRadius = 0.10 * deckster.scalar;

    var mountRect = new Path.Rectangle(center, [mountWidth, mountHeight]);
    var hole_topLeft = new Path.Circle(mountRect.bounds.topLeft, holeRadius);
    var hole_topRight = new Path.Circle(mountRect.bounds.topRight, holeRadius);
    var hole_bottomLeft = new Path.Circle(mountRect.bounds.bottomLeft, holeRadius);
    var hole_bottomRight = new Path.Circle(mountRect.bounds.bottomRight, holeRadius);

    var mount_top = new Group({
        name: 'mount_top',
        children: [hole_topLeft, hole_topRight, hole_bottomLeft, hole_bottomRight],
        position: center - [0, (wheelBase + mountHeight) / 2]
    });
    var mount_bottom = mount_top.clone();
    mount_bottom.name = 'mount_bottom';
    mount_bottom.position = center + [0, (wheelBase + mountHeight) / 2];

    mountGroup = new Group({
        name: 'mount_group',
        children: [mount_top, mount_bottom],
        fillColor: 'white',
        strokeColor: 'black'
    });

    return mountGroup;
}

/* draw height / width dimensions
---------------------------------------------------------------------*/
function displayDims(item) {
    // remove any old dims for this item
    if (project.activeLayer.children['dims_' + item.name])
        project.activeLayer.children['dims_' + item.name].remove();

    var widthInInches = truncateDecimals(item.bounds.width / deckster.scalar, 2) + ' in';
    var heightInInches = truncateDecimals(item.bounds.height / deckster.scalar, 2) + ' in';

    var widthLine = new Path.Line({
        from: item.bounds.bottomLeft + [0, 50],
        to: item.bounds.bottomRight + [0, 50],
        strokeColor: 'red'
    });

    var heightLine = new Path.Line({
        from: item.bounds.topLeft + [-50, 0],
        to: item.bounds.bottomLeft + [-50, 0],
        strokeColor: 'red'
    });

    var widthHandles = newHandles(widthLine);
    var heightHandles = newHandles(heightLine);

    var width_t = new PointText({
        content: widthInInches,
        point: widthLine.bounds.bottomCenter + [0, 35],
        justification: 'center',
        fontSize: 20,
        fillColor: 'red'
    });

    var height_t = new PointText({
        content: heightInInches,
        point: heightLine.bounds.leftCenter + [-25, 0],
        justification: 'right',
        fontSize: 20,
        fillColor: 'red'
    });

    var dimsGroup = new Group({
        name: 'dims_' + item.name,
        children: [widthLine, heightLine, widthHandles, heightHandles, widthHandles, width_t, height_t]
    });

    return dimsGroup;
}

/* draw handles for a line item
---------------------------------------------------------------------*/
function newHandles(line) {
    var handle1, handle2;
    if (line.bounds.width > line.bounds.height) { // handles along x-axis
        handle1 = new Path.Line({
            from: line.firstSegment.point + [0, -10],
            to: line.firstSegment.point + [0, 10],
            strokeColor: 'red'
        });
        handle2 = new Path.Line({
            from: line.lastSegment.point + [0, -10],
            to: line.lastSegment.point + [0, 10],
            strokeColor: 'red'
        });
    } else { // handles along y-axis
        handle1 = new Path.Line({
            from: line.firstSegment.point + [-10, 0],
            to: line.firstSegment.point + [10, 0],
            strokeColor: 'red'
        });
        handle2 = new Path.Line({
            from: line.lastSegment.point + [-10, 0],
            to: line.lastSegment.point + [10, 0],
            strokeColor: 'red'
        });
    }
    handleGroup = new Group([handle1, handle2]);

    return handleGroup;
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
    point: view.bounds.topLeft + [50, 120],
    justification: 'left',
    fontSize: 20,
    fillColor: 'black'
});
var smooth_bg = new Path.Rectangle(smooth_t.position, [smooth_t.bounds.width + 30, smooth_t.bounds.height + 10]);
smooth_bg.position = smooth_t.position;
if (deckster.isSmooth)
    smooth_bg.fillColor = new Color(0, 255, 0);
else
    smooth_bg.fillColor = new Color(255, 0, 0);
smooth_bg.strokeColor = 'black';
smooth_t.fillColor = 'black';

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
/* globals
---------------------------------------------------------------------*/
var segment, oppSegment, path;
var movePath = false;

function onMouseDown(event) {
    segment = path = null;
    var hitResult = project.hitTest(event.point, deckster.hitOptions);
    if (!hitResult || hitResult.item.name != 'deck')
        return;

    // if (event.modifiers.shift) {
    //     if (hitResult.type == 'segment') {
    //         if (hitResult.segment.hasHandles())
    //             hitResult.segment.clearHandles();
    //         else
    //             hitResult.segment.smooth({
    //                 type: 'continous',
    //                 from: -1,
    //                 to: 1
    //             });
    //     }
    //     return;
    // }

    if (hitResult) {
        path = hitResult.item;
        if (hitResult.type == 'segment') {
            segment = hitResult.segment;
            if (deckster.xSymmetry) {
                var index = segment.index;
                var oppIndex = path.segments.length - index;
                if (oppIndex === index) oppIndex = 0;
                if (index === 0) oppIndex = path.segments.length / 2;
                oppSegment = path.segments[oppIndex];
                // console.log(index, oppIndex);
            }
        }
        // else if (hitResult.type == 'stroke') {
        //     // add a segment to the path at hit location
        //     var location = hitResult.location;
        //     segment = path.insert(location.index + 1, event.point);
        //     if (deckster.isSmooth)
        //         path.smooth();
        // }
    }
    movePath = hitResult.type == 'fill';
    if (movePath)
        project.activeLayer.addChild(hitResult.item);
}

function onMouseMove(event) {
    project.activeLayer.selected = false;
    if (event.item && event.item.name == 'deck')
        event.item.selected = true;
}

function onMouseDrag(event) {
    if (segment) {
        if (deckster.xSymmetry) {
            if (segment.index === 0 || segment.index === path.segments.length / 2) { // top and bottom segments
                segment.point += event.delta * [0, 1];
            } else { // left/right segments
                segment.point += event.delta;
                oppSegment.point += event.delta * [-1, 1];
            }
        } else
            segment.point += event.delta;

        if (deckster.isSmooth)
            path.smooth();

        displayDims(deck);
    }
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
    holes.remove();
    deck = newDeck(deckster.width, deckster.height);
    if (deckster.isSmooth)
        deck.smooth();
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
    if (deckster.isSmooth) {
        deck.clearHandles();
        deckster.isSmooth = false;
    } else {
        deck.smooth();
        deckster.isSmooth = true;
    }
};
// hover state
smooth_btn.onMouseEnter = function(event) {
    smooth_bg.fillColor = 'black';
    smooth_bg.strokeColor = 'none';
    smooth_t.fillColor = 'white';
};
smooth_btn.onMouseLeave = function(event) {
    if (deckster.isSmooth)
        smooth_bg.fillColor = new Color(0, 255, 0);
    else
        smooth_bg.fillColor = new Color(255, 0, 0);
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

// via http://stackoverflow.com/questions/4912788/truncate-not-round-off-decimal-numbers-in-javascript
function truncateDecimals(num, digits) {
    var numS = num.toString(),
        decPos = numS.indexOf('.'),
        substrLength = decPos == -1 ? numS.length : 1 + decPos + digits,
        trimmedResult = numS.substr(0, substrLength),
        finalResult = isNaN(trimmedResult) ? 0 : trimmedResult;

    return parseFloat(finalResult);
}
