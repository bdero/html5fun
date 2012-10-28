/**
 *
 * @source: https://github.com/CheeseKeg/html5fun/blob/master/projects/pointertrail/pointerTrail.js
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2012  Brandon T. DeRosier
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

function Follower(gs, startX, startY, radius, divisor) {
    var x = startX;
    var y = startY;
    var color = "#ff0";

    this.update = function() {
        x += (gs.pointerPosition[0] - x)/divisor;
        y += (gs.pointerPosition[1] - y)/divisor;
    }

    this.draw = function(c) {
        c.beginPath();
        c.arc(x, y, radius, 0, 2*Math.PI, false);
        c.lineWidth = 2;
        c.strokeStyle = "#fff";
        c.stroke();
    }
}

function Background(gs) {
    this.draw = function(c) {
        gs.background("#000");
    }
}

function PulseGenerator(gs) {
    var previousPointerDown = false;

    this.update = function() {
        if (gs.pointerDown && !previousPointerDown) {
            gs.addEntity(new Pulse(gs, gs.pointerPosition));
        }

        previousPointerDown = gs.pointerDown
    }
}

function Pulse(gs, position) {
    this.size = 1;
    this.position = position;

    this.update = function() {
        this.size += 1;

        if (this.size > 60) {
            gs.delEntity(this);
        }
    }

    this.draw = function(c) {
        for (var i = 1; i <= 3; i++) {
            c.beginPath();
            c.arc(this.position[0], this.position[1], this.size*i*(Math.random())+1, 0, 2*Math.PI, false);
            c.lineWidth = (1.0 - this.size/60.0)*10;
            c.strokeStyle = "#d00";
            c.stroke();
        }
    }
}

function startGame() {
    var gs = new JSGameSoup("surface", 30);
    gs.addEntity(new Background(gs));
    gs.addEntity(new PulseGenerator(gs));
    for (var i = 0; i < 20; i++) {
        gs.addEntity(new Follower(gs, gs.width/2, gs.height/2, 50 - 2*i, i*0.5 + 1));
    }
    gs.launch();
}
