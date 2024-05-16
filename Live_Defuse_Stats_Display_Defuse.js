document.addEventListener("DOMContentLoaded", () => {
    console.log("Script loaded and running");

    // Add a simple element to verify the script runs
    const testElement = document.createElement('div');
    testElement.textContent = "Hello, this is a test.";
    testElement.style.position = 'fixed';
    testElement.style.top = '10px';
    testElement.style.left = '10px';
    testElement.style.backgroundColor = 'yellow';
    testElement.style.padding = '10px';
    document.body.appendChild(testElement);
    
    console.log("Test element added to the page");
});
