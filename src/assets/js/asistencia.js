var fechaDesde, fechaHasta, fechaPuesto;
var nombrePuestos = [];
var numeroDia;

function genera_tabla_asistencia() {

  fechaHasta = new Date();

  fechaDesde = new Date();
  fechaDesde.setHours(0,0,0);

  fechaPuesto = new Date();

  numeroDia=fechaPuesto.getUTCDay()+""; //+ "" forma de transformar un numero a String

  console.log("Fecha Desde: "+fechaDesde);

  console.log("Fecha Hasta: "+fechaHasta);

  var tamanioTabla=7;

  // // Obtener la referencia del elemento body
  var tabla = document.getElementsByTagName("table")[0];

  var tblHead = document.createElement("thead");
  var tblBody = document.createElement("tbody");
  var tblFoot = document.createElement("tfoot");
  tblHead.setAttribute("id", "tHead");
  tblBody.setAttribute("id", "tBody");
  tblFoot.setAttribute("id", "tFoot");

    // Crea la fila de la thead
    var hilera = document.createElement("tr");
    var textoCelda;
    for (var j = 0; j < tamanioTabla; j++) {
      // Crea un elemento <td> y un nodo de texto, haz que el nodo de
      // texto sea el contenido de <td>, ubica el elemento <td> al final
      // de la hilera de la tabla
      var celda = document.createElement("th");
      celda.style.textAlign = "center";
      celda.style.padding = "1px";
      textoCelda = document.createTextNode("");

      celda.appendChild(textoCelda);
      hilera.appendChild(celda);
    }

    //Asignar valores iniciales
    var columnas=hilera.querySelectorAll("th");
     columnas[0].textContent="Cliente";
     columnas[0].style.textAlign = "center";
     columnas[0].style.verticalAlign = "middle";
     columnas[0].style.padding = "3px";

     columnas[1].textContent="Objetivo";
     columnas[1].style.textAlign = "center";
     columnas[1].style.verticalAlign = "middle";
     columnas[1].style.padding = "3px";

     columnas[2].textContent="Puesto";
     columnas[2].style.textAlign = "center";
     columnas[2].style.verticalAlign = "middle";
     columnas[2].style.padding = "3px";

     columnas[3].textContent="Hora Ingreso";
     columnas[3].style.textAlign = "center";
     columnas[3].style.verticalAlign = "middle";
     columnas[3].style.padding = "3px";

     columnas[4].textContent="Hora Registrada";
     columnas[4].style.textAlign = "center";
     columnas[4].style.verticalAlign = "middle";
     columnas[4].style.padding = "3px";

     columnas[5].textContent="Personal";
     columnas[5].style.textAlign = "center";
     columnas[5].style.verticalAlign = "middle";
     columnas[5].style.padding = "3px";

     columnas[6].textContent="Estado";
     columnas[6].style.textAlign = "center";
     columnas[6].style.verticalAlign = "middle";
     columnas[6].style.padding = "3px";

    // agrega la hilera al final de la tabla (al final del elemento tblbody)
    tblHead.appendChild(hilera);


  // posiciona el <tbody> debajo del elemento <table>
  tabla.appendChild(tblHead);
  tabla.appendChild(tblBody);
  // tabla.appendChild(tblFoot);
}

function cargaInicialAsistencia(){

  db.collection("clientes").where("vigente", "==", true)
      .onSnapshot(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            cargarObjetivos(doc.id,doc.data().nombre);
          });
      });
}

function cargarObjetivos(idCliente,nombreCliente){
  db.collection("clientes").doc(idCliente).collection("objetivos").where("vigente", "==", true).orderBy("nombre")
      .onSnapshot(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            var idObjetivo = doc.id;
            var nombreObjetivo = doc.data().nombre;
            var idEsquemaActivo = doc.data().idEsquemaActivo;
            cargarPuestos(idCliente,nombreCliente,idObjetivo,nombreObjetivo,idEsquemaActivo);
          });
      });
}

function cargarPuestos(idCliente,nombreCliente,idObjetivo,nombreObjetivo,idEsquemaActivo){

  db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
    .doc("2018-07-18").collection("esquema").where("documentData.numeroDia","==",numeroDia)
    .onSnapshot(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            var count = Object.keys(doc.data()).length;
            for (i=1;i<count;i++){
              if(doc.data()[i]!=undefined){ //Recorremos todos los puestos del Objetivo
                let nombrePuesto = doc.data()[i].nombrePuesto;
                let ingresoPuesto = doc.data()[i].ingresoPuesto;
                rangoFechaPuesto(ingresoPuesto,nombrePuesto);
              }
            }
            obtenerCobertura(idCliente,nombreCliente,idObjetivo,nombreObjetivo);
        });
    }, function(error){
      console.log(nombreObjetivo);
    });
}

function rangoFechaPuesto(ingresoPuesto,nombrePuesto){

  var sepHrIng = ingresoPuesto.indexOf(":");
  var ingresoHoras = parseInt(ingresoPuesto.substr(0,sepHrIng));
  var ingresoMinutos = parseInt(ingresoPuesto.substr(sepHrIng+1,2));

  fechaPuesto.setHours(ingresoHoras,ingresoMinutos,0);

  if(fechaPuesto.getTime()>fechaDesde.getTime() && fechaPuesto.getTime()<fechaHasta.getTime()){
    puesto = {nbrPto:nombrePuesto,ingPto:ingresoPuesto,usado:false};
    nombrePuestos.push(puesto);
  }
}

function obtenerCobertura(idCliente,nombreCliente,idObjetivo,nombreObjetivo){

  db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
    .doc("2019-07-26").collection("puestos")
    .onSnapshot(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          nombrePuesto = doc.data().nombrePuesto;
          //Recorro el array de puestos de este objetivo y comparo contra los ingresos
          for (i=0;i<nombrePuestos.length;i++){
            if(nombrePuesto == nombrePuestos[i].nbrPto){
              crearFilaNuevaAsistencia(nombreCliente,nombreObjetivo,nombrePuestos[i].nbrPto,nombrePuestos[i].ingPto,doc.data().horaIngreso,"BRUN, Santiago","CUBIERTO");
              nombrePuestos[i].usado=true;
            }
          }
          for (i=0;i<nombrePuestos.length;i++){
            if(nombrePuestos[i].usado==false){
              crearFilaNuevaAsistencia(nombreCliente,nombreObjetivo,nombrePuestos[i].nbrPto,nombrePuestos[i].ingPto,"-","NO REGISTRADO","DESCUBIERTO");
              nombrePuestos[i].usado=true;
            }
          }

        });
    }, function(error){
      console.log(nombreObjetivo);
    });
}

function crearFilaNuevaAsistencia(cliente,objetivo,nombrePuesto,horaIngreso,horaRegistrada,personal,estado) {

    //eliminarTabla();

    var cantidadColumnasFijas=7;
    var tamanioTabla=cantidadColumnasFijas;

		var tBody = document.getElementById("tBody");
    var row = tBody.insertRow();

		//Rellenar con celdas vacias la fila
		for (var i = 0; i < tamanioTabla; i++) {
			var celda = row.insertCell();
		}

		//Asignar valores iniciales
		var columnas=row.querySelectorAll("td");
		 columnas[0].textContent=cliente;
     columnas[0].style.textAlign = "center";
		 columnas[1].textContent=objetivo;
     columnas[1].style.textAlign = "center";
     columnas[2].textContent=nombrePuesto;
     columnas[2].style.textAlign = "left";
     columnas[3].textContent=horaIngreso;
     columnas[3].style.textAlign = "center";
     columnas[4].textContent=horaRegistrada;
     columnas[4].style.textAlign = "center";
     columnas[5].textContent=personal;
     columnas[5].style.textAlign = "left";
     columnas[6].textContent=estado;
     columnas[6].style.textAlign = "center";

     if (estado=="DESCUBIERTO"){
       columnas[0].style.color="#FF6347";
       columnas[1].style.color="#FF6347";
       columnas[2].style.color="#FF6347";
       columnas[3].style.color="#FF6347";
       columnas[4].style.color="#FF6347";
       columnas[5].style.color="#FF6347";
       columnas[6].style.color="#FF6347";
     }

}

function eliminarTabla(){
  if(miTabla2.rows.length>0){
    var parent = document.getElementById("miTabla2");
    //var tHead = document.getElementById("tHead");
    var tBody = document.getElementById("tBody");
    //var tFoot = document.getElementById("tFoot");
    //parent.removeChild(tFoot);
    parent.removeChild(tBody);
    //parent.removeChild(tHead);
  }
}
