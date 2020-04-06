let lines = [];
let index = 0; //is needed, so the line doesn’t check against itself
let limit = 128; //max lines
let worldLimitX = window.innerWidth * 0.1;
let worldLimitY = window.innerHeight * 0.1;

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

    //create new lines until limit is reached
    if (lines.length < limit) {
        index++;
        lines.push(new Line(random(width), random(height), index));
    }

    lines.forEach((line, index) => {
        line.update();
        line.intersects(lines);
        line.edges();
        line.show();
    });

}

function mousePressed() {
    for (let i = 0; i < 2; i++) {
        index++;
        let shakeX = random(-10, 10);
        let shakeY = random(-10, 10);
        lines.push(new Line(mouseX + shakeX, mouseY + shakeY, index));
    }
}

function Line(x, y, index) {

    this.id = index;
    this.hit = true; // calculated intersection point from first Line-Line-hit

    this.start = createVector(x, y);
    this.end = createVector(x, y);
    this.startMove = p5.Vector.random2D().mult(random(1, 2));
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