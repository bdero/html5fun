function Follower(gs, parent, radius, divisor) {
    this.position = [0, 0];
    this.color = "#fff";

    this.update = function() {
        this.position[0] += (parent.position[0] - this.position[0])/divisor;
        this.position[1] += (parent.position[1] - this.position[1])/divisor;
    }

    this.draw = function(c) {
        c.beginPath();
        c.arc(this.position[0], this.position[1], radius, 0, 2*Math.PI, false);
        c.lineWidth = 2;
        c.strokeStyle = this.color;
        c.stroke();
    }
}

function FollowerSet(gs, parent) {
    this.position = parent.position;
    this.followers = [];

    this.init = function() {
        for (var i = 0; i < 20; i++) {
            this.followers.push(gs.addEntity(new Follower(gs, this, 50 - 2*i, i*0.5 + 1)));
        }
    }
}

function CircleFollowerSet(gs, parent, startAngle, rotateSpeed, radius) {
    this.position = [0, 0];
    this.followerSet;
    var angle = startAngle;

    this.init = function() {
        this.followerSet = gs.addEntity(new FollowerSet(gs, this));
    }

    this.update = function() {
        angle += rotateSpeed;
        this.position[0] = parent.position[0] + radius*Math.sin(angle);
        this.position[1] = parent.position[1] + radius*Math.cos(angle);
    }
}

function PointerFollowerCollection(gs, amount, radius) {
    this.position = gs.pointerPosition;
    this.circleFollowerSets = [];

    this.init = function() {
        for (var i = 0; i < amount; i++) {
            this.circleFollowerSets.push(gs.addEntity(new CircleFollowerSet(gs, this, (i/amount)*2.0*Math.PI, Math.PI/15, radius)));
        }
    }

    this.update = function() {
        this.position = gs.pointerPosition;
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

        previousPointerDown = gs.pointerDown;
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
    gs.addEntity(new PointerFollowerCollection(gs, 5, 150));
    gs.launch();
}
