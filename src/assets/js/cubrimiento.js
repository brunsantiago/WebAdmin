firebase.initializeApp({
  apiKey: "AIzaSyAWKQiKjfXHDuQXI50vIAp8PmEJ8ONNzmQ",
  authDomain: "presentismoapp.firebaseapp.com",
  projectId: "presentismoapp"
});

// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

function mostrarCubrimiento(visual,date,range){
  let primerDia="";
  let ultimoDia="";
  let idCliente="";
  let idObjetivo="";
  if(visual == "mensual" && date!=""){
    primerDia = new Date(date.getFullYear(), date.getMonth(), 1);
    ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  } else if(visual == "dias25" && date!=""){
    primerDia = new Date(date.getFullYear(), date.getMonth()-1, 26);
    ultimoDia = new Date(date.getFullYear(), date.getMonth(), 25);
  }

  if(validarFormulario()){

    let nombreCliente = document.getElementById("selectClientes").value;
    let nombreObjetivo = document.getElementById("selectObjetivos").value;

    $("#clienteTitulo").text(nombreCliente);
    $("#objetivoTitulo").text(nombreObjetivo);

    db.collection("clientes").where("nombreCliente","==",nombreCliente)
      .get()
      .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            idCliente=doc.id;

              db.collection("clientes").doc(idCliente).collection("objetivos").where("nombreObjetivo","==",nombreObjetivo)
              .get()
              .then(function(querySnapshot) {
                  querySnapshot.forEach(function(doc) {
                    idObjetivo=doc.id;
                    generaTabla(primerDia,ultimoDia);
                    cargarCobertura(idCliente,idObjetivo,primerDia,ultimoDia);
                    cargaInicial(idCliente,idObjetivo,primerDia,ultimoDia);

                    //document.getElementById('panelPlantilla').style.visibility='visible';
                    $("#panelPlantilla").show();

                  });
              });
         })
      });

  } else{
    $("#panelPlantilla").hide();
  }

}

function cargaInicial(idCliente,idObjetivo,fechaInicial,fechaFinal){

  let promise = new Promise(function(resolve, reject) {

  db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
  .where("fecha",">=",fechaInicial).where("fecha","<=",fechaFinal).orderBy("fecha")
  .get()
  .then(function(querySnapshot) {
      const promises = []; //Creo el array de promesas a ejecutar
      if (querySnapshot.empty) {
        // Si no se ecuentran fechas en este rango no carga nada
      } else {
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          idDia = doc.id;
          //cargarHorasDiarias(cliente,"TIENDA 143",idDia,fechaInicial,fechaFinal);
          promises.push(cargarHorasDiarias(idCliente,idObjetivo,idDia,fechaInicial,fechaFinal));
        });
      } // fin else
      //resolve("Carga Inicial Finalizada");
      Promise.all(promises)
      .then(value => resolve())
      .catch(error => reject(Error("Se ha producido un error al ejecutar todas las Promesas cargarHorasDiarias")));
    })
    .catch(function(error) {
        console.log("Error getting document:", error);
        reject();
    });

  });

  //Ejecuto la promesa
  promise.then(function(result) {
    //console.log(result); // "Carga Inicial Finalizada..."
    cargarBotones();
  }, function(err) {
    //console.log(err); // Error: "It broke"
  });

}

function cargarBotones(){
  //$("#miTabla").tableExport();
  $("#miTabla").tableExport({
    //formats: ['xlsx', 'csv', 'txt'],
    formats: ['xlsx'],
    bootstrap: true
  });

}

function cargarHorasDiarias(cliente,objetivo,idDia,fechaInicial,fechaFinal){
  // Return a new promise.
  return new Promise(function(resolve, reject) {

  db.collection("clientes").doc(cliente).collection("objetivos").doc(objetivo).collection("cobertura")
  .doc(idDia).collection("puestos")
  .get()
  .then(function(querySnapshot) {
    const promises = []; //Creo el array de promesas a ejecutar
    if (querySnapshot.empty) {
      // Si no se ecuentran la fecha
    } else {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        let puesto = doc.data();
        //No cargar hasta que no tenga hora de egreso
        if (puesto.horaEgreso.length>0){
          //cargarHorasPersonal(puesto,fechaInicial,fechaFinal);
          promises.push(cargarHorasPersonal(puesto,fechaInicial,fechaFinal));
        }
      });
    } // fin else
    //resolve(); // Una vez finalizada la carga de horas del Personal del idDia pasado como parametro retorna "resolve()"
    Promise.all(promises)
    .then(value => resolve())
    .catch(error => reject(Error("Se ha producido un error al ejecutar todas las Promesas CargaHorasPersonal")));
    })
    .catch(function(error) {
        console.log("Error getting document:", error);
        reject();
    });

  });
}

function devolverNombre(idPersonal,columnaNombre) {
  // Return a new promise.
  return new Promise(function(resolve,reject) {

  var docRef = db.collection("users").doc(idPersonal);
    docRef.get()
    .then(function(doc) {
        if (doc.exists) {
          columnaNombre.textContent = doc.data().nombre;
          //console.log("Se creo una fila nueva del siguiente personal: "+doc.data().nombre);
          resolve();
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
            reject();
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
        reject();
    });

  });
}

function cargarNombrePersonal(nroLegajo) {
var docRef = db.collection("users").doc(nroLegajo);
  docRef.get()
  .then(function(doc) {
      if (doc.exists) {
          $('#nombrePersonal').html("   "+doc.data().nombre);
      } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });
}

function posicionTabla(fechaCarga,fechaInicial){
  // Se pasa una fecha de consulta junto con la fecha desde donde
  // inicia la tabla hasta la fecha donde termina y devuelve la posicion
  var cantColIni=2; // Cantidad de Columnas Iniciales
  resultado = cantidadDeDias(fechaInicial,fechaCarga) + cantColIni;
  return resultado;
}

function cargarHorasPersonal(puesto,fechaInicial,fechaFinal){

return new Promise(function(resolve,reject){
	// obtenemos todas las filas del tbody y generamos un "Array de Filas" en la variable filas.
	let filas=document.querySelectorAll("#miTabla tbody tr");

  let ingresoReal = new Date( Date.parse(puesto.fechaIngreso+"T"+puesto.horaIngreso+":00") );
  let egresoReal = new Date( Date.parse(puesto.fechaEgreso+"T"+puesto.horaEgreso+":00") );
  let ingresoPuesto = new Date( Date.parse(puesto.fechaPuesto+"T"+puesto.ingresoPuesto+":00") );
  let egresoPuesto = new Date( Date.parse(puesto.fechaPuesto+"T"+puesto.egresoPuesto+":00") );
  if(puesto.turnoNoche){
    egresoPuesto = new Date( egresoPuesto.getTime() + 24*60*60*1000 ); // La fecha de salida del puesto es un dia posterior
  }

  let ingresoParam = ingresoParametrizado(ingresoPuesto,ingresoReal);
  let egresoParam = egresoParametrizado(egresoPuesto,egresoReal);


  let difHoras = totalHoras(ingresoParam,egresoParam);
  let horaIngresoParam = componerHorasDate(ingresoParam);
  let horaEgresoParam = componerHorasDate(egresoParam);

	let encontrado=false;
  let horas = "";

  var fechaPuesto = new Date(Date.parse(puesto.fechaPuesto+"T"+"00:00:00"));

  let posDia = posicionTabla(fechaPuesto,fechaInicial)-1; //Agregado -1 para corregir diferencia

  horas = difHoras;

	// recorremos cada una de las filas
	filas.forEach(function(e) {
			// Obtenemos las columnas de la fila recorrida y posiciono la busqueda del legajo en el primer elemento.
			//TODO Ver si existe una funcion que devuelva la primera columna.
			let columnas=e.querySelectorAll("td");

			if (columnas[0].textContent==puesto.idPersonal){
          let totalHoras = columnas[posDia].textContent;
  				columnas[posDia].textContent= sumarHoras(totalHoras,horas);
          columnas[posDia].style.textAlign = "center";
          columnas[posDia].setAttribute("data-toggle", "modal");
          columnas[posDia].setAttribute("data-target", "#myModal");
          columnas[posDia].addEventListener("click", function(){
           mostrarModal(puesto.idPersonal,horas,puesto.nombrePuesto,puesto.ingresoPuesto,puesto.egresoPuesto,puesto.horaIngreso,puesto.horaEgreso,horaIngresoParam,horaEgresoParam);
           cargarNombrePersonal(puesto.idPersonal);
          });
          encontrado=true;
          // Se agrega un dia mas porque tiene horario internacional
          actualizarTotales(fechaPuesto.getDate(),horas,puesto.idPersonal);
          resolve(); //Si se actualizan correctamente las horas de un Legajo ya cargado devuleve resolve()
			}
	});

	if(!encontrado){
	   crearFilaNueva(puesto.idPersonal,puesto.fechaPuesto,horas,puesto.nombrePuesto,puesto.ingresoPuesto,puesto.egresoPuesto,puesto.horaIngreso,puesto.horaEgreso,horaIngresoParam,horaEgresoParam,fechaInicial,fechaFinal)
     .then(function(){
       resolve(); //Si la funcion crearFilaNueva funciona correctamente se devuelve resolve()
     })
     .catch(function(error) {
         console.log("Error al crear una fila nueva", error);
         reject();
     });
  }

  });
}

function crearFilaNueva(nroLegajo,fechaCarga,horas,nombrePuesto,ingresoPuesto,egresoPuesto,ingresoReal,egresoReal,ingresoParam,egresoParam,fechaInicial,fechaFinal) {

return new Promise(function(resolve,reject){

    var cantidadColumnasFijas=3;
    var cantidadDias=cantidadDeDias(fechaInicial,fechaFinal);
    var tamanioTabla=cantidadDias+cantidadColumnasFijas;
    //var diaCarga = new Date(fechaCarga);
    let fechaPuesto = new Date( Date.parse(fechaCarga+"T"+"00:00:00"));
    //console.log("Dia Carga 2: "+diaCarga);
    var posDia = posicionTabla(fechaPuesto,fechaInicial)-1; //Agregado -1 para corregir diferencia

		var tBody = document.getElementById("tBody");
    var row = tBody.insertRow();

		//Rellenar con celdas vacias la fila
		for (var i = 0; i < tamanioTabla; i++) {
			var celda = row.insertCell();
		}

		//Asignar valores iniciales
		var columnas=row.querySelectorAll("td");
		 columnas[0].textContent=nroLegajo;
     columnas[0].style.textAlign = "right";
     columnas[1].style.textAlign = "left";
		 columnas[posDia].textContent=horas;
     columnas[posDia].style.textAlign = "center";
     columnas[posDia].setAttribute("data-toggle", "modal");
     columnas[posDia].setAttribute("data-target", "#myModal");
     columnas[posDia].addEventListener("click", function(){
      mostrarModal(nroLegajo,horas,nombrePuesto,ingresoPuesto,egresoPuesto,ingresoReal,egresoReal,ingresoParam,egresoParam);
      cargarNombrePersonal(nroLegajo);
     });

     //Genera la clase totalHs del Legajo y la inicializa en cero
     columnas[tamanioTabla-1].className="ltotalHs"+nroLegajo;
     columnas[tamanioTabla-1].textContent="0:00";
     columnas[tamanioTabla-1].style.textAlign = "right";
     // Se agrega un dia mas porque tiene horario internacional
     actualizarTotales(fechaPuesto.getDate(),horas,nroLegajo);

     //Busca el nombre en la BD segun el nroLegajo y lo carga en la Tabla
     devolverNombre(nroLegajo,columnas[1])
     .then(function(){
       resolve(); //Si la funcion devolverNombre funciona correctamente se devuelve resolve()
     })
     .catch(function(error) {
         console.log("Error al intentar devolver el Nombre", error);
         reject();
     });

     });
}

function recargar(){
      var Table = document.getElementById("tBody");
      Table.innerHTML = "";
      cargaInicial();
}

function generaTabla(fecha1,fecha2) {

  let fechaGT = new Date(fecha1.getTime());

  let cantidadColumnasFijas=3;
  let cantidadDias=cantidadDeDias(fecha1,fecha2);
  let tamanioTabla=cantidadDias+cantidadColumnasFijas;

  // Obtener la referencia del elemento body
  let tabla = document.getElementsByTagName("table")[0];

  // Crea un elemento <table> y un elemento <tbody>
  //var tabla   = document.createElement("table");
  let tblHead = document.createElement("thead");
  let tblBody = document.createElement("tbody");
  let tblFoot = document.createElement("tfoot");
  tblHead.setAttribute("id", "tHead");
  tblBody.setAttribute("id", "tBody");
  tblFoot.setAttribute("id", "tFoot");

  // Crea las celdas del thead NUMEROS DEL DIA
  for (var i = 0; i < 1; i++) {
    // Crea las hileras de la tabla
    let hilera = document.createElement("tr");
    let textoCelda;
    for (var j = 0; j < tamanioTabla; j++) {
      // Crea un elemento <td> y un nodo de texto, haz que el nodo de
      // texto sea el contenido de <td>, ubica el elemento <td> al final
      // de la hilera de la tabla
      let celda = document.createElement("th");
      celda.style.textAlign = "center";
      celda.style.padding = "1px";
      textoCelda = document.createTextNode("");
      if(j>1 && j<tamanioTabla-1) celda.style.borderBottom = "none";
      if(j>1){
        textoCelda = document.createTextNode(fechaGT.getDate());
        fechaGT.setDate(fechaGT.getDate()+1);
      }

      celda.appendChild(textoCelda);
      hilera.appendChild(celda);
    }

    //Asignar valores iniciales
    let columnas=hilera.querySelectorAll("th");
     columnas[0].textContent="Legajo";
     columnas[0].style.textAlign = "center";
     columnas[0].style.verticalAlign = "middle";
     columnas[0].rowSpan="2";
     columnas[0].style.padding = "3px";
     columnas[1].textContent="Nombre y Apellido";
     columnas[1].style.textAlign = "center";
     columnas[1].style.verticalAlign = "middle";
     columnas[1].rowSpan="2";
     // columnas[2].textContent="Puesto";
     // columnas[2].style.textAlign = "center";
     // columnas[2].style.verticalAlign = "middle";
     // columnas[2].rowSpan="2";
     // columnas[2].style.padding = "3px";
     columnas[tamanioTabla-1].textContent="Total Hs";
     columnas[tamanioTabla-1].style.textAlign = "center";
     columnas[tamanioTabla-1].style.verticalAlign = "middle";
     columnas[tamanioTabla-1].rowSpan="2";
     columnas[tamanioTabla-1].style.padding = "3px";

    // agrega la hilera al final de la tabla (al final del elemento tblbody)
    tblHead.appendChild(hilera);
  }


  // Crea las celdas del thead DIAS DE LA SEMANA
  fechaGT = new Date(fecha1.getTime()); // Se reinician la fecha a la inicial
  for (var i = 0; i < 1; i++) {
    // Crea las hileras de la tabla
    let hilera = document.createElement("tr");

    for (var j = 0; j < cantidadDias; j++) {
      // Crea un elemento <td> y un nodo de texto, haz que el nodo de
      // texto sea el contenido de <td>, ubica el elemento <td> al final
      // de la hilera de la tabla
      let celda = document.createElement("th");
      celda.className="sdia"+fechaGT.getDate();
      celda.style.color = "#265a88";
      celda.style.fontSize = "10px";
      celda.style.textAlign = "center";
      celda.style.padding = "1px";
      textoCelda = document.createTextNode(fechaGT.getDate());
      fechaGT.setDate(fechaGT.getDate()+1);
      celda.appendChild(textoCelda);
      hilera.appendChild(celda);
    }
    // agrega la hilera al final de la tabla (al final del elemento tblbody)
    tblHead.appendChild(hilera);
  }


  // Crea las celdas del tfoot HORAS A LIQUIDAR
  fechaGT = new Date(fecha1.getTime()); // Se reinicia la fecha a la inicial
  for (var i = 0; i < 1; i++) {
    // Crea las hileras de la tabla
    var hilera = document.createElement("tr");

    for (var j = 0; j < tamanioTabla-1; j++) {
      // Crea un elemento <td> y un nodo de texto, haz que el nodo de
      // texto sea el contenido de <td>, ubica el elemento <td> al final
      // de la hilera de la tabla
      var celda = document.createElement("th");
      celda.style.textAlign = "center";
      celda.style.padding = "2px";
      if (j>0) {
        celda.className="ldia"+fechaGT.getDate();
        fechaGT.setDate(fechaGT.getDate()+1);
      }
      var textoCelda = document.createTextNode("0:00");
      celda.appendChild(textoCelda);
      hilera.appendChild(celda);
    }
    //Asignar valores iniciales
    var columnas=hilera.querySelectorAll("th");
     columnas[0].textContent="Horas a Liquidar";
     columnas[0].colSpan="2";
     columnas[tamanioTabla-2].className="ltotalHs";
     columnas[tamanioTabla-2].style.textAlign = "right";
    // agrega la hilera al final de la tabla (al final del elemento tblbody)
    tblFoot.appendChild(hilera);
  }

  // Crea las celdas del tfoot HORAS A FACTURAR
  fechaGT = new Date(fecha1.getTime()); // Se reinicia la fecha a la inicial
  for (var i = 0; i < 1; i++) {
    // Crea las hileras de la tabla
    var hilera = document.createElement("tr");

    for (var j = 0; j < tamanioTabla-1; j++) {
      // Crea un elemento <td> y un nodo de texto, haz que el nodo de
      // texto sea el contenido de <td>, ubica el elemento <td> al final
      // de la hilera de la tabla
      var celda = document.createElement("th");
      celda.style.textAlign = "center";
      celda.style.color = "#265a88";
      celda.style.padding = "2px";
      if (j>0) {
        celda.className="fdia"+fechaGT.getDate();
        fechaGT.setDate(fechaGT.getDate()+1);
      }
      var textoCelda = document.createTextNode("0:00");
      celda.appendChild(textoCelda);
      hilera.appendChild(celda);
    }
    //Asignar valores iniciales
    var columnas=hilera.querySelectorAll("th");
     columnas[0].textContent="Horas a Facturar";
     columnas[0].colSpan="2";
     columnas[tamanioTabla-2].className="ftotalHs";
     columnas[tamanioTabla-2].style.textAlign = "right";
    // agrega la hilera al final de la tabla (al final del elemento tblbody)
    tblFoot.appendChild(hilera);
  }

  // Crea las celdas del tfoot DIFERENCIA DE HORAS
  fechaGT = new Date(fecha1.getTime()); // Se reinicia la fecha a la inicial
  for (var i = 0; i < 1; i++) {
    // Crea las hileras de la tabla
    var hilera = document.createElement("tr");

    for (var j = 0; j < tamanioTabla-1; j++) {
      // Crea un elemento <td> y un nodo de texto, haz que el nodo de
      // texto sea el contenido de <td>, ubica el elemento <td> al final
      // de la hilera de la tabla
      var celda = document.createElement("th");
      celda.style.textAlign = "center";
      celda.style.color = "#3c763d";
      celda.style.padding = "2px";
      if (j>0) {
        celda.className="ddia"+fechaGT.getDate();
        //console.log("HORAS DIFERENCIAS: "+j+" "+fechaGT.getDate());
        fechaGT.setDate(fechaGT.getDate()+1);
      }
      var textoCelda = document.createTextNode("0:00");
      celda.appendChild(textoCelda);
      hilera.appendChild(celda);
    }
    //Asignar valores iniciales
    var columnas=hilera.querySelectorAll("th");
     columnas[0].textContent="Diferencia de Horas";
     columnas[0].colSpan="2";
     columnas[tamanioTabla-2].className="dtotalHs";
     columnas[tamanioTabla-2].style.textAlign = "right";
    // agrega la hilera al final de la tabla (al final del elemento tblbody)
    tblFoot.appendChild(hilera);
  }

  // posiciona el <tbody> debajo del elemento <table>
  tabla.appendChild(tblHead);
  tabla.appendChild(tblBody);
  tabla.appendChild(tblFoot);
}

function cantidadDeDias(fechaInicial,fechaFinal){
	var fechaini = fechaInicial;
	var fechafin = fechaFinal;

	var diasdif = fechafin.getTime()-fechaini.getTime();
	var contdias = Math.round(diasdif/(1000*60*60*24)+1); //borrado+1
	return contdias;
}

function eliminarContenidoTabla(){
  if(miTabla.rows.length>0){
    var parent = document.getElementById("miTabla");
    var tHead = document.getElementById("tHead");
    var tBody = document.getElementById("tBody");
    var tFoot = document.getElementById("tFoot");
    parent.removeChild(tFoot);
    parent.removeChild(tBody);
    parent.removeChild(tHead);
  }
  $("#miTabla").tableExport().remove();
}

function cargarListadoClientes(){
  var listadoClientes = [];
  db.collection("clientes")
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        // if (doc.exists){
          let nombreCliente = doc.data().nombreCliente;
          listadoClientes.push(nombreCliente);
        // }
      });
      cargarDesplegableClientes(listadoClientes);
    });
}

function cargarDesplegableClientes(listadoClientes){
  let selectClientes = document.getElementById('selectClientes');
  for(var i = 0; i < listadoClientes.length; i++){
    var option = listadoClientes[i];
    selectClientes.options.add( new Option(option) );
  }
}

function cargarListadoObjetivos(){

  var listadoObjetivos = [];
  var nombreCliente = document.getElementById("selectClientes").value;

  db.collection("clientes").where("nombreCliente","==",nombreCliente)
    .get()
    .then(function(querySnapshot) {
      if(querySnapshot.empty){
        console.log("No se econtro el Cliente");
        cargarDesplegableObjetivos(listadoObjetivos);
      }else{
        querySnapshot.forEach(function(doc) {
          idCliente=doc.id;
            db.collection("clientes").doc(idCliente).collection("objetivos")
            .get()
            .then(function(querySnapshot) {
              querySnapshot.forEach(function(doc) {
                if (doc.exists){
                  let nombreObjetivo = doc.data().nombreObjetivo;
                  listadoObjetivos.push(nombreObjetivo);
                }
                });
                cargarDesplegableObjetivos(listadoObjetivos);
            });
       })
      }

    });

}

function cargarDesplegableObjetivos(listadoObjetivos){
  var selectObjetivos = document.getElementById('selectObjetivos');

  while (selectObjetivos.length > 1) {
    selectObjetivos.remove(1);
  }

  // selectObjetivos.options.add( new Option("Todos") );

  for(var i = 0; i < listadoObjetivos.length; i++){
    let option = listadoObjetivos[i];
    selectObjetivos.options.add( new Option(option) );
  }
}

function limpiarSelect(idSelect) {
   var select = document.getElementById(idSelect);
   while (select.length > 0) {
       select.remove(1);
   }
}

function esconder_div(div_id){
  if(document.getElementById(div_id)){
    document.getElementById(div_id).style.display = "none";
  }
  else{
    alert("no se encuentra id: "+div_id);
  }
}

function mostrar_div(div_id){
  if(document.getElementById(div_id)){
    document.getElementById(div_id).style.display = "block";
  }
  else{
    alert("no se encuentra id: "+div_id);
  }
}

function mostrarModal(nroLegajo,totalHoras,nombrePuesto,ingresoPuesto,egresoPuesto,ingresoReal,egresoReal,ingresoParam,egresoParam){
  $('#nroLegajo').html("   "+nroLegajo);
  $('#nombrePuesto').html("   "+nombrePuesto);
  $('#ingresoPuesto').html("   "+ingresoPuesto);
  $('#egresoPuesto').html("   "+egresoPuesto);
  $('#ingresoReal').html("   "+ingresoReal);
  $('#egresoReal').html("   "+egresoReal);
  $('#ingresoParam').html("   "+ingresoParam);
  $('#egresoParam').html("   "+egresoParam);
  $('#totalHoras').html("   "+totalHoras);
};

function createDateAsUTC(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
}
