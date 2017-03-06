//Declare the colors you will be using with color code
var Colors = {
  red: 0xf25346;
  white: 0xd8d0d1;
  brown: 0x59332e;
  pink: 0xF5986E;
  brownDark: 0x23190f;
  blue: 0x68c3c0;
}

window.addEventListener('load', init, false);

//All main functions will be placed inside here.
function init() {
  //set up the scene, the camera, and the renderer
  createScene();


  //add the lights
  createLights();

  //add the objects
  createPlane();
  createSea();
  createSky();

  //start a loop that will update the objects' positions
  // and render the scene from each frame
  loop();

}

//The scene, the camera, and the renderer are created in the createScene function

//declare createScene variables
var scene, camera, fieldOfView, asepctRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container;

function createScene() {
  //Get the width and height of the screen,
  //Use them to set up the aspect ratio of the camera,
  //and the size of the renderer
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  // Create the scene
  scene = new THREE.Scene();

  //Add a fog effect to the scene; same color as the
  //background color used in the style sheet.
  scene.fog = new THREE.Fog(0x551A8B, 100, 950);

  //Create the camera
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;

  camera = new THREE.PerspectiveCamera(
    fieldOfView, aspectRatio, nearPlane, farPlane
  );

  //Set the position of the camera
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 100;

  // Create the renderer
  renderer = new THREE.WebGLRenderer({
    //Allow transparency to show the gradient background
    //we defined in the CSS
    alpha: true;

    //Activate the anti-aliasing, this is less performant, but as our project is low-poly based, it should be fine.
    antialias: true;
  });

  //Defiine the size of the renderer; in this case it
  //will fill the entire scene
  renderer.setSize(WIDTH, HEIGHT);

  //Enable shadow rendering
  renderer.shadowMap.enable = true;

  //Add the DOM element of the renderer to the
  //container we created in the HTML
  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  //Listen to the screen, if the user resizes it
  //we have to updatethe camera and the renderer size
  window.addEventListener('resize', handleWindowResize, false);

  function handleWindowResize() {
    //update the height and width of the renderer and of the camera.
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatric();
  }
}
