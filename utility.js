//UTILITY LIBRARY
//Functions to compute dot products, cross products, matrix multiplication and more



//ANGLE UTILITIES
function toDegrees (angle) {
  return angle * (180 / Math.PI);
}
function toRadians (angle) {
  return angle * (Math.PI / 180);
}



//VECTOR UTILITIES
function addVector(vec1, vec2) {
  return {x: vec1.x+vec2.x, y: vec1.y+vec2.y, z: vec1.z+vec2.z}
}
function subtractVector(vec1, vec2) {
  return {x: vec1.x-vec2.x, y: vec1.y-vec2.y, z: vec1.z-vec2.z}
}
function multiplyVector(vec1, val) {
  return {x: vec1.x*val, y: vec1.y*val, z: vec1.z*val}
}
function divideVector(vec1, val) {
  return {x: vec1.x/val, y: vec1.y/val, z: vec1.z/val}
}
function dotProduct(vec1, vec2) {
  return (vec1.x*vec2.x)+(vec1.y*vec2.y)+(vec1.z*vec2.z);
}
function vectorLength(vec1) {
  return Math.sqrt(dotProduct(vec1,vec1));
}
function vectorNormalise(vec1) {
  var normaliser = vectorLength(vec1);
  return {x: vec1.x/normaliser, y: vec1.y/normaliser, z: vec1.z/normaliser};
}



//RENDERING UTILITIES
function drawTriangle (points, fill, colour, canvas, ctx) {
  if (canvas.getContext) {
    //Draws triangle on canvas
    ctx.beginPath();
    ctx.moveTo(points[0].x * (canvas.width/2), points[0].y * (canvas.height/2));
    ctx.lineTo(points[1].x * (canvas.width/2), points[1].y * (canvas.height/2));
    ctx.lineTo(points[2].x * (canvas.width/2), points[2].y * (canvas.height/2));
    ctx.closePath();
    if(fill == 0) {
      //Fills the triangle with the appropriate shade
      var fillColour = String("rgb(" + colour.r + "," + colour.g + "," + colour.b + ")");
      ctx.fillStyle = fillColour
      ctx.fill();
    } else {
      //Draws the triangle edge instead of filling it
      ctx.stroke();
    }
  }
}
function getColour (dotProduct) {
  //Adjusts dot product
  dotProduct = Math.round(10 * dotProduct);
  //Checks which value to return
  switch(10 - dotProduct) {
    case 0: 
      return 1;
      break;
    case 1: 
      return 0.9;
      break;
    case 2: 
      return 0.8;
      break;
    case 3: 
      return 0.7;
      break;
    case 4: 
      return 0.6;
      break;
    case 5: 
      return 0.5;
      break;
    case 6: 
      return 0.4;
      break;
    case 7: 
      return 0.3;
      break;
    case 8: 
      return 0.2;
      break;
    case 9: 
      return 0.1;
      break;
  }
}

function translatePoint (point, axis, amount) {
  //Checks what axis to translate the point on
  if(axis == "x") {
    //Translates point relative to its previous position
    return {x: point.x + amount, y: point.y, z: point.z};
  } else if (axis == "y") {
    //Translates point relative to its previous position
    return {x: point.x, y: point.y + amount, z: point.z};
  } else if (axis == "z") {
    //Translates point relative to its previous position
    return {x: point.x, y: point.y, z: point.z + amount};
  } else {
    //Translates point relative to its previous position
    return point;
  }
}



//MATRIX UTILITIES
//Applies perspective projection matrix to turn the 3D points --> 2D points 
function perspectiveprojectionMatrix (point) {
  //Adds extra value to allow for matrix multiplication by 4x4
  point = {x: point.x, y: point.y, z: point.z, m: 1};
  //Perspective Matrix
  var matrix = [[aspectratio * fovRad,0,0,0],
                [0,fovRad,0,0],
                [0,0,fFar / (fFar - fNear),1],
                [0,0,(-(fFar) * fNear) / (fFar - fNear),0]]
  //Calculates new x value
  var x = (point.x * matrix[0][0]) + (point.y * matrix[1][0]) + (point.z * matrix[2][0]) + (point.m * matrix[3][0]);
  //Calculates new y value
  var y = (point.x * matrix[0][1]) + (point.y * matrix[1][1]) + (point.z * matrix[2][1]) + (point.m * matrix[3][1]);
  //Calculates new z value
  var z = (point.x * matrix[0][2]) + (point.y * matrix[1][2]) + (point.z * matrix[2][2]) + (point.m * matrix[3][2]);
  //Calculates 'w' value
  var w = (point.x * matrix[0][3]) + (point.y * matrix[1][3]) + (point.z * matrix[2][3]) + (point.m * matrix[3][3]);

  //Checks whethe to normalise new points
  if(w != 0) {
    //Normalises the new points
    return {x: x/w, y: y/w, z: z/w}; 
  } else {
    return {x: x, y: y, z: z};
  }
}
function rotationXMatrix (point, angle) {
  //Rotation X Matrix
  var matrix = [[1,0,0],
                [0, Math.cos(angle), Math.sin(angle)],
                [0, -(Math.sin(angle)), Math.cos(angle)]]
  //Calculates new x value
  var x = (point.x * matrix[0][0]) + (point.y * matrix[1][0]) + (point.z * matrix[2][0]);
  //Calculates new y value
  var y = (point.x * matrix[0][1]) + (point.y * matrix[1][1]) + (point.z * matrix[2][1]);
  //Calculates new z value
  var z = (point.x * matrix[0][2]) + (point.y * matrix[1][2]) + (point.z * matrix[2][2]);
  return {x: x, y: y, z: z};
}
function rotationYMatrix (point, angle) {
  //Rotation Y Matrix
  var matrix = [[Math.cos(angle),0,Math.sin(angle)],
                [0,1,0],
                [-(Math.sin(angle)),0,Math.cos(angle)]]
  //Calculates new x value
  var x = (point.x * matrix[0][0]) + (point.y * matrix[1][0]) + (point.z * matrix[2][0]);
  //Calculates new y value
  var y = (point.x * matrix[0][1]) + (point.y * matrix[1][1]) + (point.z * matrix[2][1]);
  //Calculates new z value
  var z = (point.x * matrix[0][2]) + (point.y * matrix[1][2]) + (point.z * matrix[2][2]);
  return {x: x, y: y, z: z};
}
function rotationZMatrix (point, angle) {
  //Rotation Z Matrix
  var matrix = [[Math.cos(angle),Math.sin(angle), 0],
                [-(Math.sin(angle)), Math.cos(angle), 0],
                [0,0,1]]
  //Calculates new x value
  var x = (point.x * matrix[0][0]) + (point.y * matrix[1][0]) + (point.z * matrix[2][0]);
  //Calculates new y value
  var y = (point.x * matrix[0][1]) + (point.y * matrix[1][1]) + (point.z * matrix[2][1]);
  //Calculates new z value
  var z = (point.x * matrix[0][2]) + (point.y * matrix[1][2]) + (point.z * matrix[2][2]);
  return {x: x, y: y, z: z};
}