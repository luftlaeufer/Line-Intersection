let lines = [];
let index = 0; //is needed, so the line doesn’t check against itself
let limit = 128; //max lines
let worldLimitX = window.innerWidth * 0.1;
let worldLimitY = window.innerHeight * 0.1;
var direction = "random";
let img;
let mapVisable = false;

function preload() {
    img = loadImage('map.png');
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight, P2D);
    canvas.parent('sketch-holder');
    strokeCap(SQUARE);
    cursor(CROSS);
}

function draw() {
    background(50);
    if (mapVisable) {
        image(img, 0, 0, width, height);
    }

    //create new lines until limit is reached
    /*     if (mouseIsPressed) {
            if (lines.length < limit) {
                index++;
                lines.push(new Line(mouseX, mouseY, index));
            }
        } */

    lines.forEach((line, index) => {
        line.update();
        line.intersects(lines);
        line.edges();
        line.show();
    });

}

function mousePressed() {
    index++;
    lines.push(new Line(mouseX, mouseY, index, direction));
}

function keyPressed() {
    switch (key) {
        case "1":
            direction = "horizontal"
            break;
        case "2":
            direction = "vertical"
            break;
        case "3":
            direction = "random"
            break;
        case "4":
            mapVisable = !mapVisable;
            break;
        case "5":
            save(`Image-${frameCount}.jpg`);
    }
    console.log(direction);
}

function Line(x, y, index, direction) {

    this.id = index;
    this.hit = true; // calculated intersection point from first Line-Line-hit

    this.start = createVector(x, y);
    this.end = createVector(x, y);

    if (direction == "random") {
        this.startMove = p5.Vector.random2D().mult(random(1, 2));
    }

    if (direction == "vertical") {
        this.startMove = createVector(0, 1);
    }
    if (direction == "horizontal") {
        this.startMove = createVector(1, 0);
    }

    // this.startMove = createVector(0, 1);
    this.endMove = this.startMove.copy();
    this.color = color(200, 200, 200);
    this.finalColor = random(170, 255);
    this.randomSW = random(2, 4); //random strokeWeight

    this.update = function () {
        this.start.add(this.startMove);
        this.end.sub(this.endMove);
    }

    this.intersects = function (otherLines) {

        for (let i = 0; i < otherLines.length; i++) {
            if (this.id != i) { //dont do the check if it is looking at itself

                this.hit = collideLineLine(this.start.x, this.start.y, this.end.x, this.end.y, otherLines[i].start.x, otherLines[i].start.y, otherLines[i].end.x, otherLines[i].end.y, this.hit); //colliding with anything?
                this.firstHit = collidePointLine(this.start.x, this.start.y, otherLines[i].start.x, otherLines[i].start.y, otherLines[i].end.x, otherLines[i].end.y); //start collision
                this.secondHit = collidePointLine(this.end.x, this.end.y, otherLines[i].start.x, otherLines[i].start.y, otherLines[i].end.x, otherLines[i].end.y); //end collision

                if (this.hit.x || this.hit.y) {

                    if (this.firstHit == true) {
                        this.startMove.mult(0); //stop the moving vector
                    }
                    if (this.secondHit == true) {
                        this.endMove.mult(0); //stop the moving vector
                        this.color = color(this.finalColor, 127, 0);
                    }
                }
            }
        }
    }
    this.show = function () {
        stroke(this.color);
        strokeWeight(this.randomSW);
        line(this.start.x, this.start.y, this.end.x, this.end.y);
    }

    this.edges = function () {

        if (this.start.x > width || this.start.y > height || this.start.x < 0 || this.start.y < 0) {
            this.startMove.mult(0);
            this.color = color(this.finalColor, 127, 0);
        }

        if (this.end.x > width || this.end.y > height || this.end.x < 0 || this.end.y < 0) {
            this.endMove.mult(0);
            this.color = color(this.finalColor, 127, 0);
        }

    }
}