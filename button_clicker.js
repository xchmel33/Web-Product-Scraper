function expand(){
/** 
	Usage:
	1. click on element that you desire to click multiple times
	2. configure number of clicks and interval between clicks
	3. run this script as snippet
*/
    let button = document.activeElement;
    let intervalID;
    let maxClicks = 7; 			//! configure
	let intervalTime = 1000; 	//! configure

    if (!intervalID) {
        intervalID = setInterval(function () {
            button.click();
            maxClicks--;
            console.log('clicks todo:', maxClicks)
        }, 1000);
    }

    button.addEventListener("click", function (){
       if (button.display === 'none' || maxClicks <= 0){
           clearInterval(intervalID)
       }
    });
}

expand();
