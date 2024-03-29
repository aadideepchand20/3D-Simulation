let sliderFOV = document.getElementById("fov");
let file = document.getElementById("inputFile");
let output = document.getElementById("output")

let cubeTris = [[{x:0 ,y:0 ,z:0, r:255, g:0, b:0}, {x:0 ,y:1 ,z:0, r:0, g:255, b:0}, {x:1 ,y:1 ,z:0, r:255, g:255, b:0}],
                  [{x:0 ,y:0 ,z:0, r:255, g:0, b:0}, {x:1 ,y:1 ,z:0, r:255, g:255, b:0}, {x:1 ,y:0 ,z:0, r:255, g:0, b:255}],

                  [{x:1 ,y:0 ,z:0, r:255, g:0, b:0}, {x:1 ,y:1 ,z:0, r:0, g:255, b:0}, {x:1 ,y:1 ,z:1, r:255, g:255, b:0}],
                  [{x:1 ,y:0 ,z:0, r:255, g:0, b:0}, {x:1 ,y:1 ,z:1, r:255, g:255, b:0}, {x:1 ,y:0 ,z:1, r:255, g:0, b:255}],

                  [{x:1 ,y:0 ,z:1, r:255, g:0, b:0}, {x:1 ,y:1 ,z:1, r:0, g:255, b:0}, {x:0 ,y:1 ,z:1, r:255, g:255, b:0}],
                  [{x:1 ,y:0 ,z:1, r:255, g:0, b:0}, {x:0 ,y:1 ,z:1, r:255, g:255, b:0}, {x:0 ,y:0 ,z:1, r:0, g:0, b:255}],

                  [{x:0 ,y:0 ,z:1, r:255, g:0, b:0}, {x:0 ,y:1 ,z:1, r:0, g:255, b:0}, {x:0 ,y:1 ,z:0, r:255, g:255, b:0}],
                  [{x:0 ,y:0 ,z:1, r:255, g:0, b:0}, {x:0 ,y:1 ,z:0, r:255, g:255, b:0}, {x:0 ,y:0 ,z:0, r:0, g:0, b:255}],

                  [{x:0 ,y:1 ,z:0, r:255, g:0, b:0}, {x:0 ,y:1 ,z:1, r:0, g:255, b:0}, {x:1 ,y:1 ,z:1, r:255, g:255, b:0}],
                  [{x:0 ,y:1 ,z:0, r:255, g:0, b:0}, {x:1 ,y:1 ,z:1, r:255, g:255, b:0}, {x:1 ,y:1 ,z:0, r:0, g:0, b:255}],

                  [{x:1 ,y:0 ,z:1, r:255, g:0, b:0}, {x:0 ,y:0 ,z:1, r:0, g:255, b:0}, {x:0 ,y:0 ,z:0, r:255, g:255, b:0}],
                  [{x:1 ,y:0 ,z:1, r:255, g:0, b:0}, {x:0 ,y:0 ,z:0, r:255, g:255, b:0}, {x:1 ,y:0 ,z:0, r:0, g:0, b:255}]]
                  
let pause = false;

let angleX = toRadians(90);
let angleY = toRadians(30);
let angleZ = 0;

var canvas;
var ctx;
var myObject = [];
var count = 0;

function onStart () {
  createCanvas(800, 600, "myCanvas");
  setActiveCanvas("myCanvas");
  angleY += toRadians(5);
  angleX += toRadians(4);
  angleZ += toRadians(6);
  clearScreen();
  draw3DPolygon(cubeTris,{x: angleX, y: angleY, z: angleZ} ,{x: 0, y: 0, z: 5});
}

function onUpdate () {
  angleY += toRadians(5);
  angleX += toRadians(4);
  angleZ += toRadians(6);
  clearScreen();
  draw3DPolygon(cubeTris,{x: angleX, y: angleY, z: angleZ} ,{x: 0, y: 0, z: 5});
}

sliderFOV.oninput = function() {
  changeFov(this.value);
}

file.onchange = function() {
  myObject = getOBJData(file.files[0]);
  clearScreen();
  draw3DPolygon(myObject,{x: toRadians(90), y: angleY, z: angleZ} ,{x: 0, y: 8, z: 10});
  pause = true;
  createCanvas(800, 600, "myCanvas2");
  setActiveCanvas("myCanvas2");
}