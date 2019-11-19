
function initClickableRows() {
    var rows = document.querySelectorAll(".clickableRow");
    for (var i = 0; i < rows.length; i++) {
            rows[i].addEventListener("click", function () {
                    console.log(this.getAttribute("href"))
                    console.log(this.dataset)
                    if(this.dataset.preventbarba) {
                        window.location = this.getAttribute("href")
                    }
                    else {
                        barba.go(this.getAttribute("href"));
                    }
                        
                    
            })
    }
}