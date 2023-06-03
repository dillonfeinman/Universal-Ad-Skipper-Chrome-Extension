// Function to create the overlay and button
function createOverlay(videoElement) {
  // Create the overlay container
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  
  videoElement.skipper = true;

  // Create the button
  const button = document.createElement("button");
  button.innerText = "Skip";

  // Append the button to the overlay container
  overlay.appendChild(button);

  // Append the overlay container to the video element's parent
  videoElement.parentNode.appendChild(overlay);

  // Position the overlay on top of the video element
  const videoRect = videoElement.getBoundingClientRect();
  overlay.style.top = `0px`;
  overlay.style.left = `0px`;
  overlay.style.width = `10px`;
  overlay.style.height = `5px`;
  overlay.style.opacity = "0.7"; // Adjust the opacity as desired
  overlay.style.zIndex = "9999";

  // Add click event listener to the button
  button.addEventListener("click", () => {
    // Skip to the end of the video
    if(videoElement.currentTime+15 > videoElement.duration){
      videoElement.currentTime = videoElement.duration-1;
    } else {
      videoElement.currentTime = videoElement.currentTime+15;
    }
  });

  // Make the overlay draggable
  let isDragging = false;
  let mouseX = 0;
  let mouseY = 0;

  button.addEventListener("mousedown", (event) => {
    isDragging = true;
    mouseX = event.clientX - overlay.offsetLeft;
    mouseY = event.clientY - overlay.offsetTop;
  });

  document.addEventListener("mousemove", (event) => {
    if (isDragging) {
      const newX = event.clientX - mouseX;
      const newY = event.clientY - mouseY;
      overlay.style.left = `${newX}px`;
      overlay.style.top = `${newY}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // videoElement.addEventListener("ended", () => {
  //   overlay.remove();
  // });

}

function deleteOverlay(target) {
  // Find the overlay element based on the target
  const overlay = target.parentNode;

  // Remove the overlay element from its parent
  overlay.parentNode.removeChild(overlay);
}

function createMutationObserver() {
  // Create a new MutationObserver instance
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      const target = mutation.target;

      // Check if the mutation is on an audio or video element
      if (target.tagName === "AUDIO" || target.tagName === "VIDEO") {
        // Check if the src attribute changed
        if (mutation.attributeName === "src" || mutation.attributeName === "currentSrc") {
          // Handle the change in src or currentSrc
          console.log("src or currentSrc changed:", target.src, target.currentSrc);
          createOverlay(target);
          // Replace 'console.log' with your desired logic or function call
        }
      }
    });
  });

  // Configure and start observing the desired mutations
  const config = {
    attributes: true,
    attributeFilter: ["src", "currentSrc"],
    subtree: true,
  };

  observer.observe(document, config);

  // Return the observer instance
  return observer;
}

function getShadow(parent) {
  let result = [];
  function getChild(parent) {
    if (parent.firstElementChild) {
      var child = parent.firstElementChild;
      do {
        result.push(child);
        getChild(child);
        if (child.shadowRoot) {
          result.push(getShadow(child.shadowRoot));
        }
        child = child.nextElementSibling;
      } while (child);
    }
  }
  getChild(parent);
  return result.flat(Infinity);
}

function createMutationObserver2() {
  var observer = new MutationObserver(function (mutations) {
    // Process the DOM nodes lazily
    requestIdleCallback(
      (_) => {
        mutations.forEach(function (mutation) {
          switch (mutation.type) {
            case "childList":
              mutation.addedNodes.forEach(function (node) {
                if (typeof node === "function") return;
                if (node === document.documentElement) {
      
                  
                  return;
                }
                checkForVideo(node, node.parentNode || mutation.target, true);
              });
              mutation.removedNodes.forEach(function (node) {
                if (typeof node === "function") return;
                checkForVideo(node, node.parentNode || mutation.target, false);
              });
              break;
            case "attributes":
              // if (
              //   (mutation.target.attributes["aria-hidden"] &&
              //   mutation.target.attributes["aria-hidden"].value == "false")
              //   || mutation.target.nodeName === 'APPLE-TV-PLUS-PLAYER'
              // ) {
              //   var flattenedNodes = getShadow(document.body);
              //   var nodes = flattenedNodes.filter(
              //     (x) => x.tagName == "VIDEO"
              //   );
              //   for (let node of nodes) {
              //     // only add vsc the first time for the apple-tv case (the attribute change is triggered every time you click the vsc)
              //     if (node.skipper && mutation.target.nodeName === 'APPLE-TV-PLUS-PLAYER')
              //       continue;
              //     if (node.skipper)
              //       node.skipper.remove();
              //     checkForVideo(node, node.parentNode || mutation.target, true);
              //   }
              // }
              break;
          }
        });
      },
      { timeout: 1000 }
    );
  });
  observer.observe(document, {
    attributeFilter: ["aria-hidden", "data-focus-method"],
    childList: true,
    subtree: true
  });
  return observer;
}

function initializeVideos() {
  // Check if video elements exist on the page
  const videoElements = document.querySelectorAll("video");

  if (videoElements.length > 0) {
    // Create overlay for each video element
    videoElements.forEach((videoElement) => {
      createOverlay(videoElement);
    });
  }
}

function checkForVideo(node, parent, added) {
  // Only proceed with supposed removal if node is missing from DOM
  if (!added && document.body.contains(node)) {
    return;
  }
  if (
    node.nodeName === "VIDEO" ||
    (node.nodeName === "AUDIO")
  ) {
    if (added) {
      console.log("Found video");
      if(!node.skipper){
        createOverlay(node);
        vidElem = node;
      }
    } else {
      console.log("Delete");
      deleteOverlay(node);
      
    }
  } else if (node.children != undefined) {
    for (var i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      checkForVideo(child, child.parentNode || parent, added);
    }
  }
}
function checkForAd(node, parent, added) {
  if (!added && document.body.contains(node)){
    return;
  }
  if (node.classList[j].includes("ad") || node.classList[j].includes("countdown")) {
    if(added){
      console.log("Found ad");
    }
  }

}

function findTime(node) {
  
}

function createAdMutationObserver() {
  const observer = new MutationObserver((mutationsList) => {
    // Iterate through each mutation
    for (let mutation of mutationsList) {
      // Check if any added nodes have the desired class names
      if (mutation.type === "childList") {
        const addedNodes = mutation.addedNodes;
        const removedNodes = mutation.removedNodes;
        for (let i = 0; i < addedNodes.length; i++) {
          const node = addedNodes[i];
          for(let j = 0; j < node.classList.length; j++) {
            if (node.classList[j].includes("ad") && (node.classList[j].includes("countdown") || node.classList[j].includes("time"))) {
              // vidElem.playbackRate = 16.0;
              // vidElem.play();
              // if(node.currentTime+15 > node.duration){
              //   node.currentTime = node.duration-1;
              // } else {
              //   node.currentTime = node.currentTime+15;
              // }
              console.log("Ad or countdown element appeared:", node);
              isAd = true;
            }   
          }
        }
        for (let i = 0; i < removedNodes.length; i++) {
          const removedNode = removedNodes[i];
          for (let j = 0; j < removedNode.classList.length; j++) {
            if (
              removedNode.classList[j].includes("countdown")
              || 
              removedNode.classList[j].includes("time")
            ) {
              console.log("Ad or countdown element disappeared:", removedNode);
              isAd = false;
              // Perform action for the disappearance of the element
              // vidElem.playbackRate = 1.0;
              // vidElem.play();
            }
          }
        }
      }
    }
  });
  observer.observe(document, { childList: true, subtree: true });
}

function createStringMutationObserver(callback) {
  const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
      if (mutation.type === "characterData") {
        const changedString = mutation.target.textContent;
        callback(changedString);
      }
    }
  });

  observer.observe(document.documentElement, { characterData: true, subtree: true });
}

var vidElem = null;

var previousInt = null;

var isAd = false;

let isLockAcquired = false; // Lock flag

const acquireLock = () => {
  // Wait until the lock is released
  return new Promise(resolve => {
    const checkLock = () => {
      if (!isLockAcquired) {
        isLockAcquired = true;
        resolve();
      } else {
        setTimeout(checkLock, 10);
      }
    };
    checkLock();
  });
};

const releaseLock = () => {
  isLockAcquired = false;
};

// initializeVideos();
createAdMutationObserver();
createMutationObserver2(); //find vidElem

//if countingdown skip amount of time
createStringMutationObserver((changedString) => {
  
  let changedStringParsed = changedString.replace(/[^0-9]/g, '');
 
  if(parseInt(changedStringParsed) != NaN){
    console.log(changedStringParsed);
    if(previousInt >= parseInt(changedStringParsed)) {
      acquireLock().then(() => {
        if(isAd)
          vidElem.currentTime = vidElem.currentTime + parseInt(changedStringParsed/2);
        releaseLock();
      })
    }
    previousInt = parseInt(changedStringParsed)
    console.log(previousInt);
  }
});
