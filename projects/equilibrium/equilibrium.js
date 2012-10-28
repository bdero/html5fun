/**
 *
 * @source: https://github.com/CheeseKeg/html5fun/blob/master/projects/equilibrium/equilibrium.js
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

function Middle(gs, priority, position, startRadius) {
    this.position = position;

    this.radius = startRadius;
    this.drawRadius = startRadius;

    this.update = function() {
        this.drawRadius += (this.radius - this.drawRadius)/3;
    }

    this.draw = function(c) {
        c.beginPath();
        c.arc(this.position[0], this.position[1], this.drawRadius, 0, 2*Math.PI, false);
        c.fillStyle = "#f00";
        c.fill();
    }
}

function Roid(gs, priority, world, startRadius, startDirection, startMagnitude, rotateSpeed, divisor) {
    this.priority = priority;

    this.direction = startDirection;
    this.magnitude = startMagnitude;
    this.radius = startRadius;

    this.GetPosition = function() {
        return [world.middle.position[0] + this.magnitude*Math.sin(this.direction), world.middle.position[1] + this.magnitude*Math.cos(this.direction)];
    }

    this.Absorbed = function(absorbing) {
        var distance = gs.distance(this.GetPosition(), absorbing.position);

        // Collision detection
        var radiusCollision = (this.radius + absorbing.radius) - distance;
        if (radiusCollision > this.radius) {
            radiusCollision = this.radius;
        }
        if (radiusCollision > absorbing.radius) {
            radiusCollision = absorbing.radius;
        }
        if (radiusCollision > 0) {
            this.radius -= 2*radiusCollision;
            absorbing.radius += radiusCollision;
        }
    }

    this.update = function() {
        //var position = this.GetPosition();
        var distance = gs.distance(this.GetPosition(), world.middle.position);
        
        // Position update
        this.magnitude -= distance/divisor;
        this.direction += rotateSpeed*world.forceMultiplier*(1 - this.magnitude/world.maxDistance);
        //console.log(distance);

        this.Absorbed(world.player);
        this.Absorbed(world.middle);

        // Self removal
        if (this.radius < 1) {
            gs.delEntity(this);
        }
    }

    this.draw = function(c) {
        var position = this.GetPosition();
        c.beginPath();
        c.arc(position[0], position[1], this.radius, 0, 2*Math.PI, false);
        c.fillStyle = "#999";
        c.fill();
    }
}

function Player(gs, priority, world, startRadius) {
    this.priority = priority;

    this.position = gs.pointerPosition;
    this.radius = startRadius;
    this.drawRadius = startRadius;

    this.update = function() {
        this.position = gs.pointerPosition;

        var distance = gs.distance(this.position, world.middle.position);

        // Middle collision
        var radiusCollision = (this.radius + world.middle.radius) - distance;
        if (radiusCollision > this.radius) {
            radiusCollision = this.radius;
        }
        if (radiusCollision > world.middle.radius) {
            radiusCollision = world.middle.radius;
        }
        if (radiusCollision > 0) {
            this.radius -= radiusCollision;
            world.middle.radius -= radiusCollision;
            world.score.Add(radiusCollision);
        }

        this.drawRadius += (this.radius - this.drawRadius)/3;
    }

    this.draw = function(c) {
        c.beginPath();
        c.arc(this.position[0], this.position[1], this.drawRadius, 0, 2*Math.PI, false);
        c.fillStyle = "#0f0";
        c.fill();
    }
}

function Score(gs, priority) {
    this.priority = priority;

    this.score = 0;
    this.level = 0;
    this.levelScore = 0;
    this.levelPercent = 0;
    this.levelDrawPercent = 0;
    this.maxLevelScore = 100;
    this.color = "#963";

    this.Add = function(score) {
        this.score += score;
        this.levelScore += score;
    }

    this.update = function() {
        if (this.levelScore > this.maxLevelScore) {
            this.levelScore -= this.maxLevelScore;
            this.maxLevelScore *= 2;
            this.level++;
        }

        this.levelPercent = this.levelScore/this.maxLevelScore;
        this.levelDrawPercent += (this.levelPercent - this.levelDrawPercent)/3;
    }

    this.draw = function(c) {
        c.fillStyle = "#333";
        var backOffset = 10;
        var barOffset = 3;
        var barHeight = 4;
        var totalBarWidth = gs.width - 2*backOffset - 2*barOffset;
        c.fillRect(backOffset, backOffset, gs.width - 2*backOffset, barHeight + 2*barOffset);
        c.fillStyle = this.color;
        c.fillRect(backOffset + barOffset, backOffset + barOffset, totalBarWidth*this.levelDrawPercent, barHeight);
    }
}

function World(gs) {
    this.score;
    this.middle;
    this.player;
    this.forceMultiplier;
    this.time;
    this.nextTime;
    this.maxDistance;

    this.init = function() {
        this.score = gs.addEntity(new Score(gs, 3));
        this.middle = gs.addEntity(new Middle(gs, 2, [gs.width/2, gs.height/2], 10));
        this.player = gs.addEntity(new Player(gs, 1, this, 10));
        this.forceMultipler = 0;
        this.time = 0;
        this.nextTime = 0;
        this.maxDistance = gs.distance([0, 0], this.middle.position);
    }

    this.AddRoid = function() {
        var radius = 2 + 3*Math.random()
        gs.addEntity(new Roid(gs, 0, this, radius, 2*Math.PI*Math.random(), this.maxDistance + radius, Math.PI/50/radius + Math.PI/50*Math.random(), 30 + 20*Math.random()));
    }

    this.update = function() {
        // Game restart
        if (this.middle.radius < 1 || this.player.radius < 1) {
            restartGame(gs);
        }

        this.time++;
        this.forceMultiplier = Math.sin(this.time/250.0);

        if (this.nextTime <= this.time) {
            this.AddRoid();
            this.nextTime = this.time + Math.floor(5*Math.random());
        }
    }

    this.draw = function(c) {
        gs.background("#000");
    }
}

function restartGame(gs) {
    gs.clearEntities();
    gs.addEntity(new World(gs))
}

function startGame() {
    var gs = new JSGameSoup("surface", 30);
    restartGame(gs);
    gs.launch();
}
