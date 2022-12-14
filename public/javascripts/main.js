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
    let razlog = document.getElementById("razlog");
    let tarifa = document.getElementById("kilometrina");
    let datum = new Date().toLocaleDateString("sl-SI");
    let dodatniStroski = document.getElementById("dodatniStroski");
    let slika = document.getElementById("slika");

    let slikeUrl = [];

    //add a event listener to the slika file input, that will display the names of all files in the input with the id slikeContainer and load the files into the array slikeUrl using the FileReader API. Also add a button to remove the file from the input and the array.
    slika.addEventListener("change", function(){
        let slikeContainer = document.getElementById("slikeContainer");
        slikeContainer.innerHTML = "";
        for(let i = 0; i < slika.files.length; i++){
            let li = document.createElement("li");
            li.innerHTML = slika.files[i].name;
            let button = document.createElement("button");
            button.innerHTML = "X";
            button.addEventListener("click", function(){
                slika.files = [...slika.files.slice(0, i), ...slika.files.slice(i+1)];
                slikeUrl = [...slikeUrl.slice(0, i), ...slikeUrl.slice(i+1)];
                slikeContainer.removeChild(li);
            });
            li.appendChild(button);
            slikeContainer.appendChild(li);
            let reader = new FileReader();
            reader.onload = function(e){
                slikeUrl.push(e.target.result);
            }
            /* reader.readAsDataURL(slika.files[i]); */
            reader.readAsArrayBuffer(slika.files[i]);
        }
        console.log(slikeUrl);
    });



    //check the local storage for the value tarifa and set the value of the input with id kilometrina to that value if it exists.
    if(localStorage.getItem("tarifa") != null){
        tarifa.value = localStorage.getItem("tarifa");
    }else {
        tarifa.value = tarifa.value;
    }
    tarifa.addEventListener("change", function(){
        localStorage.setItem("tarifa", tarifa.value);
    });

    displayRelacije();
    
    function logit(){
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
                li.innerHTML = lokacije[od] + " <---> " + lokacije[doo] + " " + distanceMatrix[od][doo];
                totalDistance += distanceMatrix[od][doo];
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
                let tempRelacije = new Set;
                relacije.forEach(function(relacija){
                    let relacijaObj = JSON.parse(relacija);
                    let od = relacijaObj.od;
                    let doo = relacijaObj.do;
                    tempRelacije.add(od);
                    tempRelacije.add(doo);
                });
                let out = pdfform().transform(rawPdf, {
                    "Datum": [datum],
                    "Potuje": [potuje.value],
                    "Odhod": [odhod.value],
                    "Prihod": [prihod.value],
                    "Tarifa": [tarifa.value],
                    "Trajanje": [Math.floor((new Date(prihod.value) - new Date(odhod.value)) / 1000 / 60 / 60) + "h " + Math.floor((new Date(prihod.value) - new Date(odhod.value)) / 1000 / 60 % 60) + "min"],
                    "Kilometri": [totalDistance],
                    "StNaloga": [stNaloga],
                    "KoncnoIzplacilo": [(Math.round(totalDistance * tarifa.value * 100) / 100) + parseInt(dodatniStroski.value)],
                    "SkupajKilometrina": [Math.round(totalDistance * tarifa.value * 100) / 100],
                    "DodatniStroski": [dodatniStroski.value],
                    //Take all the numbers in tempRelacije and get the coresponding names from lokacije and join them with a /.
                    "Relacija": [new Array(...tempRelacije).map(function(relacija){
                        return lokacije[relacija];
                    }).join(' / ')],
                    "Razlog": [razlog.value]

                });
                let secondOut = await PDFLib.PDFDocument.load(out);
                //for each file in slikeUrl, add a page to the pdf, load the image, and add it to the page.
                for(let i = 0; i < slikeUrl.length; i++){
                    let page = secondOut.addPage();
                    //load the image depending on the type of the file.
                    let img = await secondOut.embedJpg(slikeUrl[i]);
                    /* let img = await secondOut.embedPng(slikeUrl[i]); */
                    let { width, height } = page.getSize();

                    if(img.width > img.height){//landscape
                        //draw the image on the page, with the width of the page and the height of the image scaled to the width of the page.
                        page.drawImage(img, {
                            x: 0,
                            y: 0,
                            width: width,
                            height: img.height * (width / img.width)
                        });
                    }else {//portrait
                        //draw the image on the page, with the height of the page and the width of the image scaled to the height of the page.
                        page.drawImage(img, {
                            x: 0,
                            y: 0,
                            width: img.width * (height / img.height),
                            height: height
                    });
                    }
                    
                }
                //ad a page to the pdf
                //let page = secondOut.addPage();
                //ad a image to the page
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