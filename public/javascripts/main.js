let distanceMatrix = [
    [0, 4.4, 0.2, 35, 14.7, 13.5, 3, 11.8, 3.7, 2.9],
    [4.4, 0, 4.6, 32, 21.8, 4.7, 2.1, 5.2, 5.9, 2],
    [0.2, 4.6, 0, 35.2, 14.9, 13.7, 3.2, 12, 3.9, 3.1],
    [35, 32, 35.2, 0, 40.6, 19.1, 25.1, 23, 25.8, 26.1],
    [14.7, 21.8, 14.9, 40.6, 0, 19, 18.4, 21.6, 17.6, 11.4],
    [13.5, 4.7, 13.7, 19.1, 19, 0, 5.1, 7.4, 7.8, 5],
    [3, 2.1, 3.2, 25.1, 18.4, 5.1, 0, 4.8, 2.8, 5],
    [11.8, 5.2, 12, 23, 21.6, 7.4, 4.8, 0, 5.3, 5.8],
    [3.7, 5.9, 3.9, 25.8, 17.6, 7.8, 2.8, 5.3, 0, 4.1],
    [2.9, 2, 3.1, 26.1, 11.4, 5, 5, 5.8, 4.1, 0]
]

let lokacije = [
    "Laboratorij",
    "Dr Marolt",
    "Dr Olujić",
    "Dental market",
    "dr. Marič",
    "Dentalia",
    "Prodent",
    "Primadent",
    "Sanolabor",
    "dr. Velkavrh"
]

let stNaloga = 1;
let relacije = new Set();



window.onload = function(){
    //get the stNaloga from local storage
    if(localStorage.getItem("stNaloga") != null){
        stNaloga = localStorage.getItem("stNaloga");
    }else {
        stNaloga = 1;
    }
    let od = document.getElementById("od");
    let doo = document.getElementById("do");
    let totalDistance = 0;

    document.getElementById("dodajRelacijo").addEventListener("click", logit);
    document.getElementById("shrani").addEventListener("click", shraniPdf);

    let potuje = document.getElementById("voznik");
    let relacija = document.getElementById("relacijeContainer");
    let odhod = document.getElementById("zacetek");
    let prihod = document.getElementById("konec");
    let DP = document.getElementById("dostavaProtetike");
    let PP = document.getElementById("prevzemProtetike");
    let NM = document.getElementById("nabavaMateriala");
    let DD = document.getElementById("dostavaDokumentov");
    let tarifa = 0.43;
    let datum = new Date().toLocaleDateString("sl-SI");
    
    function logit(){
        console.log("Trying to add relacija");
        if(od.value == doo.value) {
            return;
        }else if(od.value > doo.value){
            relacije.add(JSON.stringify({od: doo.value, do: od.value}));
        }else {
            relacije.add(JSON.stringify({od: od.value, do: doo.value}));
        }
        //select the od value to be the same as the do value, and the do value to be the defaullt blank value.
        od.value = doo.value;
        doo.value = "-";
        displayRelacije();
    }

    function displayRelacije() {
        //for each pair of nubers od and do in the set relacije, get the coresponding names from lokacije and append them to the list located in the html as the child of the div with id relacijeContainer.
        //also append the double of the distance between the two locations from the distanceMatrix to the list.
        // also give each li element a button to remove it from the set, give some margin to the left of the button. If the set is empty, display a message that there are no relacije.
        //if the set is not empty display the total distance of all relacije as the last element of the list.
        let relacijeContainer = document.getElementById("relacijeContainer");
        relacijeContainer.innerHTML = "";
        let ul = document.createElement("ul");
        relacijeContainer.appendChild(ul);
        totalDistance = 0;
        if(relacije.size == 0){
            let li = document.createElement("li");
            li.innerHTML = "Ni relacij";
            ul.appendChild(li);
        }else{
            relacije.forEach(function(relacija){
                let li = document.createElement("li");
                let relacijaObj = JSON.parse(relacija);
                let od = relacijaObj.od;
                let doo = relacijaObj.do;
                li.innerHTML = lokacije[od] + " <---> " + lokacije[doo] + " " + distanceMatrix[od][doo] * 2;
                totalDistance += distanceMatrix[od][doo] * 2;
                totalDistance = Math.round(totalDistance * 100) / 100;
                let button = document.createElement("button");
                button.innerHTML = "Odstrani";
                button.setAttribute("style", "margin-left: 10px");
                button.addEventListener("click", function(){
                    relacije.delete(relacija);
                    displayRelacije();
                });
                li.appendChild(button);
                ul.appendChild(li);
            });
            let li = document.createElement("li");
            li.innerHTML = "Skupna razdalja: " + totalDistance;
            ul.appendChild(li);
        }
    }

    async function shraniPdf(){
        let url = "pdf/PotniNalog.pdf";
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = async function() {
			if (this.status == 200) {
				let rawPdf = this.response;
                let tempRazlog = "";
                console.log("RELACIJE: " + new Array(...relacije).join(' '));
                if(DP.checked) tempRazlog += "Dostava protetike  ";
                if(PP.checked) tempRazlog += "Dobava protetike  ";
                if(NM.checked) tempRazlog += "Nabava materiala  ";
                if(DD.checked) tempRazlog += "Dostava dokumentov  ";
                let tempRelacije = new Set;
                relacije.forEach(function(relacija){
                    let relacijaObj = JSON.parse(relacija);
                    let od = relacijaObj.od;
                    let doo = relacijaObj.do;
                    tempRelacije.add(od);
                    tempRelacije.add(doo);
                });
                console.log("Trenutni datum je: " + datum);
                console.log("Tranutni stNaloga je: " + stNaloga);
                let out = pdfform().transform(rawPdf, {
                    "Datum": [datum],
                    "Potuje": [potuje.value],
                    "Odhod": [odhod.value],
                    "Prihod": [prihod.value],
                    "Tarifa": [tarifa],
                    "Trajanje": [Math.floor((new Date(prihod.value) - new Date(odhod.value)) / 1000 / 60 / 60) + "h " + Math.floor((new Date(prihod.value) - new Date(odhod.value)) / 1000 / 60 % 60) + "min"],
                    "Kilometri": [totalDistance],
                    "StNaloga": [stNaloga],
                    "KoncnoIzplacilo": [Math.round(totalDistance * tarifa * 100) / 100],
                    "SkupajKilometrina": [Math.round(totalDistance * tarifa * 100) / 100],
                    "DodatniStroski": [0],
                    //Take all the numbers in tempRelacije and get the coresponding names from lokacije and join them with a /.
                    "Relacija": [new Array(...tempRelacije).map(function(relacija){
                        return lokacije[relacija];
                    }).join(' / ')],
                    "Razlog": [tempRazlog]

                });
                let secondOut = await PDFLib.PDFDocument.load(out);
                //ad a page to the pdf
                let page = secondOut.addPage();
                //ad a image to the page
                /* var img = new Image();
                img.src = "images/image1.png"; */
                //save the pdf
                out = await secondOut.save();

                //Create a new blob with the pdf data and the type of the file. Name the file PotniNalog{{stNaloga}}/{{datum}}.pdf
                let blob = new Blob([out], {type: "application/pdf"});
                //Create a new a element and set its href to the blob url, and its download attribute to the name of the file. Click the a element to download the file and then remove it from the dom.
                let a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "PotniNalog" + stNaloga + "_" + ".pdf";
                /* a.download = "PotniNalog" + stNaloga + ".pdf"; */
                a.click();
                a.remove();
                stNaloga++;
                localStorage.setItem("stNaloga", stNaloga);
                //Reset the form to its default values.
                document.getElementById("potniNalogForm").reset();
                //Reset the relacije set and remove all the relacije from the list.
                relacije = new Set();
                displayRelacije();

			} else {
				alert("Napaka pri nalaganju PDF dokumenta.");
			}
		};

		xhr.send();
    }

}