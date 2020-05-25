let lines = [];
let sprites = [];
let mapDots = [];
let index = 0; //is needed, so the line doesn’t check against itself
let dotID = 0;
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
    createCanvas(windowWidth, windowHeight, P2D);
    cursor(CROSS);

    mapImage.loadPixels();
    let imageRes = 1;
    for (let x = 0; x < mapImage.width; x += imageRes) {
        for (let y = 0; y < mapImage.height; y += imageRes) {

            let pixelIndex = (x + y * mapImage.width) * 4;
            let imageColor = int(brightness(color(mapImage.pixels[pixelIndex])));

            let chance = random(1);
            //black pixels on map
            if (imageColor <= 10 && chance < 0.6) {
                let dotX = floor(map(x, 0, mapImage.width, 0, width));
                let dotY = floor(map(y, 0, mapImage.height, 0, height));
                dotID++;
                mapDots.push(new Dot(dotX, dotY, imageRes, dotID));
            }
        }
    }

    //create new lines until limit is reached
    for (let i = 0; i < limit; i++) {

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

        lines.push(new Line(random(width), random(height), i, direction));
        direction = "random";
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
        imageMode(CORNERS);
        tint(255, 50);
        image(mapImage, 0, 0, width, height);
    }

    lines.forEach((line, index) => {
        line.update();
        line.hitsSprite(sprites);
        line.intersects(lines);
        line.edges();
        line.show(index);
    })

    mapDots.forEach(dot => {
        dot.show();
    })

    sprites.forEach((sprite, index) => {
        sprite.overlap(sprites);
        sprite.pumping(index);
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
    //console.log(direction);
}


function Dot(x, y, detail, id) {
    this.loc = createVector(x, y);
    this.angleDice = round(random(4));
    this.rareLengthDice = random(1);

    //set direction of small lines
    if (this.angleDice == 0) {
        this.randomAngle = radians(270);
    }
    if (this.angleDice == 1) {
        this.randomAngle = radians(90);
    }
    if (this.angleDice == 2) {
        this.randomAngle = radians(0);
    }
    if (this.angleDice == 3) {
        this.randomAngle = radians(180);
    }

    this.detail = detail;

    //some rare lines are longer and random
    if (this.rareLengthDice < 0.002) {
        this.offLength = random(this.detail * width / 4);
        this.offSet = p5.Vector.fromAngle(this.randomAngle, this.offLength);
    }
    //normal lines
    else {
        this.offLength = random(this.detail * 16);
        this.offSet = p5.Vector.fromAngle(this.randomAngle, this.offLength);
    }

    this.id = id;
    this.sw = int(random(1, 2));

    this.show = function () {
        stroke('#71E4FB');
        strokeWeight(this.sw);
        strokeCap(PROJECT);
        line(this.loc.x, this.loc.y, this.loc.x + this.offSet.x, this.loc.y + this.offSet.y);
    }
}

function Sprite(x, y, id, size) {
    this.location = createVector(x, y);
    this.id = id;
    this.size = size;
    this.sprite = int(random(spriteImages.length));

    this.pumping = function (i) {
        this.size = map(noise(frameCount * 0.01, i), 0, 1, 0, 40);
    }

    this.show = function () {

        //buffer zone around sprite
        noStroke();
        fill('#6500F9');
        ellipse(this.location.x, this.location.y, this.size * 1.5, this.size * 1.5);

        imageMode(CENTER);
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
    this.finalColor = '#71E4FB'
    //this.randomSW = int(random(2, 4)); //random strokeWeight
    this.randomSW = 1; //random strokeWeight

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
                this.color = this.finalColor;
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
                        this.color = this.finalColor;
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
            this.color = this.finalColor;
        }

        if (this.end.x > width || this.end.y > height || this.end.x < 0 || this.end.y < 0) {
            this.endMove.mult(0);
            this.color = this.finalColor;
        }

    }
}