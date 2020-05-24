let lines = [];
let sprites = []
let index = 0; //is needed, so the line doesn’t check against itself
let limit = 128; //max lines
let spriteLimit = limit / 8;
let worldLimitX = window.innerWidth * 0.1;
let worldLimitY = window.innerHeight * 0.1;
var direction = "random";
let mapImage;
let mapVisable, showCircles = false;
let spriteImages = [];

function preload() {
    mapImage = loadImage('map.png');
    for (let i = 0; i < 5; i++) {
        let sprite_url = `sprites/sprite_${i}.png`;
        spriteImages[i] = loadImage(sprite_url);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    strokeCap(SQUARE);
    cursor(CROSS);

    mapImage.loadPixels();
    let imageRes = 2;
    for (let x = 0; x < mapImage.width; x += imageRes) {
        for (let y = 0; y < mapImage.height; y += imageRes) {

            let chance = random(1);

            if (chance < 0.5) {
                let pixelIndex = x + y * mapImage.width;
                let imageColor = brightness(color(mapImage.pixels[pixelIndex]));

                if (imageColor == 0) {

                    //create new lines until limit is reached
                    if (lines.length < limit) {

                        index++;

                        let directionDice = int(random(3));

                        if (directionDice == 0) {
                            direction = "horizontal";
                        }
                        if (directionDice == 1) {
                            direction = "vertical";
                        }
                        if (directionDice == 2) {
                            direction = "random"
                        }

                        //console.log(direction);
                        lines.push(new Line(random(width), random(height), index, direction));
                        direction = "random";

                    }
                }
            }
        }
    }

    // create sprites
    for (let i = 0; i < spriteLimit; i++) {
        let s = new Sprite(random(width), random(height), i, 20);
        sprites.push(s);
    }

}

function draw() {

    background("#6500F9");

    if (mapVisable) {
        image(mapImage, 0, 0, width, height);
    }

    lines.forEach((line, index) => {
        line.update();
        line.hitsSprite(sprites);
        line.intersects(lines);
        line.edges();
        line.show(index);
    })

    sprites.forEach(sprite => {
        sprite.overlap(sprites);
        sprite.show();
    })

}

function mousePressed() {
    index++;
    lines.push(new Line(mouseX, mouseY, index, direction));
}

function mouseWheel(event) {
    return false;
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
        case "s":
            save(`Image-${frameCount}.jpg`);
            break;
        case "c":
            showCircles = !showCircles;
            break;
    }
    console.log(direction);
}


function Sprite(x, y, id, size) {
    this.location = createVector(x, y);
    this.id = id;
    this.size = size;
    this.sprite = int(random(spriteImages.length));

    this.show = function () {
        image(spriteImages[this.sprite], this.location.x, this.location.y, this.size, this.size);
    }

    this.overlap = function (otherSprites) {
        for (let i = 0; i < otherSprites.length; i++) {
            if (this.id != i) {
                this.hit = collideCircleCircle(this.location.x, this.location.y, this.size * 2, otherSprites[i].location.x, otherSprites[i].location.y, otherSprites[i].size * 2);

                if (this.hit == true) {
                    this.location.x = random(width);
                    this.location.y = random(height);
                }
            }
        }
    }
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

    this.endMove = this.startMove.copy();
    this.color = random(255);
    this.finalColor = random(-50, 50);
    this.randomSW = int(random(2, 4)); //random strokeWeight

    this.update = function () {
        this.start.add(this.startMove);
        this.end.sub(this.endMove);
    }

    this.hitsSprite = function (sprites) {
        for (let i = 0; i < sprites.length; i++) {
            this.firstHit = collidePointEllipse(this.start.x, this.start.y, sprites[i].location.x, sprites[i].location.y, sprites[i].size * 2, sprites[i].size * 2);
            this.secondHit = collidePointEllipse(this.end.x, this.end.y, sprites[i].location.x, sprites[i].location.y, sprites[i].size * 2, sprites[i].size * 2);

            if (this.firstHit == true) {
                this.startMove.mult(0);
            }
            if (this.secondHit == true) {
                this.endMove.mult(0); //stop the moving vector
                this.color = color(107, 227 - this.finalColor, 251);
            }
        }
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
                        this.color = color(107, 227 - this.finalColor, 251);
                    }
                }
            }
        }
    }

    this.show = function (i) {
        stroke(this.color);
        let vibrate = map(noise(frameCount * 0.01, i), 0, 1, 0, mouseX * 0.1);

        if (showCircles) {
            noFill();
            ellipse(this.start.x, this.start.y, vibrate, vibrate);
        }

        strokeWeight(this.randomSW);
        line(this.start.x, this.start.y, this.end.x, this.end.y);

    }

    this.edges = function () {

        if (this.start.x > width || this.start.y > height || this.start.x < 0 || this.start.y < 0) {
            this.startMove.mult(0);
            this.color = color(107 - this.finalColor, 227, 251);
        }

        if (this.end.x > width || this.end.y > height || this.end.x < 0 || this.end.y < 0) {
            this.endMove.mult(0);
            this.color = color(107, 227, 251 - this.finalColor);
        }

    }
}