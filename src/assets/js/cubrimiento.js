// Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyAWKQiKjfXHDuQXI50vIAp8PmEJ8ONNzmQ",
    authDomain: "presentismoapp.firebaseapp.com",
    databaseURL: "https://presentismoapp.firebaseio.com",
    projectId: "presentismoapp",
    storageBucket: "presentismoapp.appspot.com",
    messagingSenderId: "1088772290092",
    appId: "1:1088772290092:web:5bf56ca11a22c852b34389"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);


// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();
var storageRef = firebase.storage().ref();

var primerDiaGlobal="";
var ultimoDiaGlobal="";

function mostrarCubrimiento(){

  let nombreCliente = document.getElementById("selectClientes").value;
  let nombreObjetivo = document.getElementById("selectObjetivos").value;
  let visual = $("input:radio[name=tipo-mes]:checked").val();

  let primerDia="";
  let ultimoDia="";

  let datePickerValue = $("#datetimepicker9").find("input").val();
  let sep = datePickerValue.indexOf("/");
  let month = parseInt(datePickerValue.substr(0,sep));
  let year = parseInt(datePickerValue.substr(sep+1,4));

  if(visual == "mensual" && datePickerValue!=""){
    primerDia = new Date(year,(month-1),1);
    ultimoDia = new Date(year,month,0);
  } else if(visual == "dias25" && datePickerValue!=""){
    primerDia = new Date(year, (month-1)-1, 26);
    ultimoDia = new Date(year, (month-1), 25);
  }

  if(validarFormulario()){

    primerDiaGlobal = primerDia;
    ultimoDiaGlobal = ultimoDia;

    loaderStateCubrimiento();
    eliminarContenidoPanel();

   var promiseCubrimiento = new Promise(function(resolve,reject){

     if(nombreCliente=="Todos"){

       const promises = [];

       db.collection("clientes").where("vigente","==",true)
         .get()
         .then(function(querySnapshot) {
           let idClienteTable=1;
             querySnapshot.forEach(function(doc) {
               let nomCliente = doc.data().nombreCliente;
               let idCliente = doc.id;
               let razonSocial = doc.data().razonSocial;
               // Se tuvo que armar una funcion por afuera del querySnapshot porque al nombre cliente, se le insertaba otro distinto al que correspondia
               // sin coincidir por la velocidad de las busquedas asincronicas
               cargarCubrimientoObjetivos(idCliente,nomCliente,primerDia,ultimoDia,idClienteTable,razonSocial)
               .then(function() {
                 resolve();
               })
               .catch(function() {
                 console.log("Error al cargar la funcion cargarCubrimientoObjetivos");
                 reject();
               });
               idClienteTable++;
             });
         });

     } else {

       db.collection("clientes").where("nombreCliente","==",nombreCliente)
         .get()
         .then(function(querySnapshot) {
             querySnapshot.forEach(function(doc) {
               let idCliente=doc.id;
               let nomCliente=doc.data().nombreCliente;
               let razonSocial = doc.data().razonSocial;

               if(nombreObjetivo=="Todos"){

                 const promises = [];

                 db.collection("clientes").doc(idCliente).collection("objetivos").where("vigente","==",true)
                 .orderBy("nombreObjetivo","asc")
                 .get()
                 .then(function(querySnapshot) {
                   let idTable=1;
                     querySnapshot.forEach(function(doc) {
                       let idObjetivo=doc.id;
                       let nomObjetivo=doc.data().nombreObjetivo;
                       promises.push( generaTabla(primerDia,ultimoDia,nomCliente,nomObjetivo,razonSocial,idTable) );
                       promises.push( cargarCobertura(idCliente,idObjetivo,primerDia,ultimoDia,idTable) );
                       promises.push( cargarCubrimiento(idCliente,idObjetivo,primerDia,ultimoDia,idTable) );
                       razonSocial="";
                       idTable++;
                     });
                     Promise.all(promises)
                     .then(function() {
                       resolve();
                     })
                     .catch(function(error) {
                       console.log("Error al querer cargar funciones iniciales",error);
                       reject();
                     });
                 });

               } else {

                 const promises = [];

                 db.collection("clientes").doc(idCliente).collection("objetivos").where("nombreObjetivo","==",nombreObjetivo)
                 .get()
                 .then(function(querySnapshot) {
                   let idTable=1;
                     querySnapshot.forEach(function(doc) {
                       let idObjetivo=doc.id;
                       let nomObjetivo=doc.data().nombreObjetivo;
                       promises.push( generaTabla(primerDia,ultimoDia,nomCliente,nomObjetivo,razonSocial,idTable) );
                       promises.push( cargarCobertura(idCliente,idObjetivo,primerDia,ultimoDia,idTable) );
                       promises.push( cargarCubrimiento(idCliente,idObjetivo,primerDia,ultimoDia,idTable) );
                       razonSocial="";
                     });
                     Promise.all(promises)
                     .then(function(result) {
                       resolve(result);
                     })
                     .catch(function(error) {
                       reject(error);
                     });
                 });
              }
             });
         });
     }

   });

   //Ejecuto la Promesa
   promiseCubrimiento.then(function(result) {
     $("#panelPlantilla").show();
     loaderStateFinishCubrimiento();
   }, function(error) {
     loaderStateFinishCubrimiento();
   });
  }

}

function cargarCubrimientoObjetivos(idCliente,nomCliente,primerDia,ultimoDia,idClienteTable,razonSocial){

  return new Promise(function(resolve, reject) {

    const promises = [];
    db.collection("clientes").doc(idCliente).collection("objetivos").where("vigente","==",true)
    .get()
    .then(function(querySnapshot) {
      let idTable=1;
        querySnapshot.forEach(function(doc) {
          let idObjetivo=doc.id;
          let nomObjetivo=doc.data().nombreObjetivo;
          promises.push( generaTabla(primerDia,ultimoDia,nomCliente,nomObjetivo,razonSocial,idClienteTable+"-"+idTable) );
          promises.push( cargarCobertura(idCliente,idObjetivo,primerDia,ultimoDia,idClienteTable+"-"+idTable) );
          promises.push( cargarCubrimiento(idCliente,idObjetivo,primerDia,ultimoDia,idClienteTable+"-"+idTable) );
          razonSocial="";
          idTable++;
        });
        Promise.all(promises)
        .then(function() {
          resolve();
        })
        .catch(function() {
          console.log("Error al cargar las funciones iniciales de la funcion cargarCubrimientoObjetivos");
          reject();
        });
    });

  });

}

function cargarCubrimiento(idCliente,idObjetivo,fechaInicial,fechaFinal,idTable){

  return new Promise(function(resolve,reject) {

    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
    .where("fecha",">=",fechaInicial).where("fecha","<=",fechaFinal).orderBy("fecha")
    .get()
    .then(function(querySnapshot) {
        const promises = []; //Creo el array de promesas a ejecutar
        if (querySnapshot.empty) {
          // Si no se ecuentran fechas en este rango no carga nada
        } else {
          querySnapshot.forEach(function(doc){
            idDia = doc.id;
            promises.push(cargarHorasDiarias(idCliente,idObjetivo,idDia,fechaInicial,fechaFinal,idTable));
          });
        }
        Promise.all(promises)
        .then(function() {
          resolve();
        })
        .catch(function() {
          reject();
        });
    })
    .catch(function(error) {
        console.log("Error getting document:", error);
        reject();
    });

    });

}

function cargarHorasDiarias(idCliente,idObjetivo,idDia,fechaInicial,fechaFinal,idTable){

  return new Promise(function(resolve, reject) {

  db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
  .doc(idDia).collection("puestos")
  .get()
  .then(function(querySnapshot) {
    const promises = []; //Creo el array de promesas a ejecutar
    if (querySnapshot.empty) {
      // Si no se ecuentran la fecha
    } else {
      querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        let puesto = doc.data();
        //No cargar hasta que no tenga hora de egreso
        // if (puesto.horaEgreso.length>0){
          promises.push(cargarHorasPersonal(idCliente,idObjetivo,puesto,fechaInicial,fechaFinal,idTable,idDia));
        // }
      });
    } // fin else

    Promise.all(promises)
    .then(function() {
      resolve();
    })
    .catch(function() {
      reject();
    });

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

    db.collection("users").where("idPersonal","==",idPersonal)
    .get()
    .then(function(querySnapshot) {
        if (querySnapshot.empty) {
          console.log("No such document!");
          reject();
        } else {
          querySnapshot.forEach(function(doc) {
          columnaNombre.textContent = doc.data().nombre;
          resolve();
          });
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
        reject();
    });
  });
}

function posicionTabla(fechaCarga,fechaInicial){
  // Se pasa una fecha de consulta junto con la fecha desde donde
  // inicia la tabla hasta la fecha donde termina y devuelve la posicion
  var cantColIni=2; // Cantidad de Columnas Iniciales
  resultado = cantidadDeDias(fechaInicial,fechaCarga) + cantColIni;
  return resultado;
}

function cargarHorasPersonal(idCliente,idObjetivo,puesto,fechaInicial,fechaFinal,idTable,idDia){

  return new Promise(function(resolve,reject){

  // obtenemos todas las filas del tbody y generamos un "Array de Filas" en la variable filas.
	let tBody = document.getElementById("tBody-"+idTable);
  let filas = tBody.querySelectorAll("tr");
  let encontrado=false;
  let horas = "";
  let difHoras = "0:00";

  if (puesto.horaEgreso!=""){

  let ingresoReal = new Date( Date.parse(puesto.fechaIngreso+"T"+puesto.horaIngreso+":00") );
  let egresoReal = new Date( Date.parse(puesto.fechaEgreso+"T"+puesto.horaEgreso+":00") );
  let ingresoPuesto = new Date( Date.parse(puesto.fechaPuesto+"T"+puesto.ingresoPuesto+":00") );
  let egresoPuesto = new Date( Date.parse(puesto.fechaPuesto+"T"+puesto.egresoPuesto+":00") );
  if(compararHorasString(puesto.ingresoPuesto,puesto.egresoPuesto)==-1){
    egresoPuesto = new Date( egresoPuesto.getTime() + 24*60*60*1000 ); // La fecha de salida del puesto es un dia posterior
  }

  let ingresoParam = ingresoParametrizado(ingresoPuesto,ingresoReal);
  let egresoParam = egresoParametrizado(ingresoPuesto,egresoPuesto,egresoReal);

  difHoras = totalHoras(ingresoParam,egresoParam);

  let horaIngresoParam = componerHorasDate(ingresoParam);
  let horaEgresoParam = componerHorasDate(egresoParam);

  }

  horas = difHoras;

  let fechaPuesto = new Date(Date.parse(puesto.fechaPuesto+"T"+"00:00:00"));
  let posDia = posicionTabla(fechaPuesto,fechaInicial)-1; //Agregado -1 para corregir diferencia

  let filaNro = 1;
	// recorremos cada una de las filas
	filas.forEach(function(e) {
			// Obtenemos las columnas de la fila recorrida y posiciono la busqueda del legajo en el primer elemento.
			//TODO Ver si existe una funcion que devuelva la primera columna.
			let columnas=e.querySelectorAll("td");
      let variosPuestos=false;

			if (columnas[0].textContent==puesto.idPersonal){
          let idCell = idTable+""+filaNro+""+posDia;
          let totalHoras = columnas[posDia].textContent;
          if ( totalHoras.length>0){
            variosPuestos=true;
            columnas[posDia].style.fontWeight = "bold";
              if (puesto.estado=="ver"){
                  columnas[posDia].setAttribute("estado", "ver");
              } else if(puesto.estado=="mod"){
              	  columnas[posDia].style.color="#265a88";
                  columnas[posDia].setAttribute("estado", "mod");
              } else {
                  columnas[posDia].style.color="#c23321";
                  columnas[posDia].setAttribute("estado", "no-ver");
              }
          } else if (puesto.estado=="mod"){
        	  columnas[posDia].style.color="#265a88";
            columnas[posDia].setAttribute("estado", "mod");
          } else if (puesto.horaEgreso==""){
            columnas[posDia].style.color="#c23321";
            columnas[posDia].setAttribute("estado", "no-ver");
          } else if (puesto.estado=="no-ver"){
            columnas[posDia].style.color="#c23321";
            columnas[posDia].setAttribute("estado", "no-ver");
          } else if (puesto.estado=="ver"){
            columnas[posDia].setAttribute("estado", "ver");
          }
          columnas[posDia].setAttribute("id", idCell);
          columnas[posDia].onclick = function () {
            mostrarModalDetalleDia(idCliente,idObjetivo,idDia,puesto,variosPuestos,idCell,idTable);
          };
  				columnas[posDia].textContent= sumarHoras(totalHoras,horas);
          columnas[posDia].style.textAlign = "center";
          encontrado=true;
          // Se agrega un dia mas porque tiene horario internacional
          actualizarTotales(fechaPuesto.getDate(),horas,puesto.idPersonal,idTable);
          resolve(); //Si se actualizan correctamente las horas de un Legajo ya cargado devuelve resolve()
			}
      filaNro++;
	});

	if(!encontrado){
	   crearFilaNueva(idCliente,idObjetivo,idDia,puesto,horas,fechaInicial,fechaFinal,idTable)
     .then(function(){
       resolve(); //Si la funcion crearFilaNueva funciona correctamente se devuelve resolve()
     })
     .catch(function() {
       reject();
     });
  }

  });

}

function crearFilaNueva(idCliente,idObjetivo,idDia,puesto,horas,fechaInicial,fechaFinal,idTable) {

  return new Promise(function(resolve,reject){

    let cantidadColumnasFijas=3;
    let cantidadDias=cantidadDeDias(fechaInicial,fechaFinal);
    let tamanioTabla=cantidadDias+cantidadColumnasFijas;
    let fechaPuesto = new Date( Date.parse(puesto.fechaPuesto+"T"+"00:00:00"));
    let posDia = posicionTabla(fechaPuesto,fechaInicial)-1; //Agregado -1 para corregir diferencia
    let variosPuestos=false;

		let tBody = document.getElementById("tBody-"+idTable);
    let row = tBody.insertRow();
    let idCell = idTable+""+tBody.rows.length+""+posDia;

		//Rellenar con celdas vacias la fila
		for (var i = 0; i < tamanioTabla; i++) {
			var celda = row.insertCell();
		}

		//Asignar valores iniciales
		var columnas=row.querySelectorAll("td");
		 columnas[0].textContent=puesto.idPersonal;
     columnas[0].style.textAlign = "right";
     columnas[1].style.textAlign = "left";
		 columnas[posDia].textContent=horas;
     columnas[posDia].style.textAlign = "center";
     if (puesto.estado=="mod"){
         columnas[posDia].style.color="#265a88";
         columnas[posDia].setAttribute("estado", "mod");
     } else if (puesto.horaEgreso==""){
       columnas[posDia].style.color="#c23321";
       columnas[posDia].setAttribute("estado", "no-ver");
     } else if (puesto.estado=="no-ver"){
       columnas[posDia].style.color="#c23321";
       columnas[posDia].setAttribute("estado", "no-ver");
     } else if (puesto.estado=="ver"){
       columnas[posDia].setAttribute("estado", "ver");
     }
     columnas[posDia].setAttribute("id", idCell);
     columnas[posDia].onclick = function () {
       mostrarModalDetalleDia(idCliente,idObjetivo,idDia,puesto,variosPuestos,idCell,idTable);
     };
     //Genera la clase totalHs del Legajo y la inicializa en cero
     columnas[tamanioTabla-1].className="ltotalHs"+puesto.idPersonal;
     columnas[tamanioTabla-1].textContent="0:00";
     columnas[tamanioTabla-1].style.textAlign = "right";
     // Se agrega un dia mas porque tiene horario internacional
     actualizarTotales(fechaPuesto.getDate(),horas,puesto.idPersonal,idTable);

     //Busca el nombre en la BD segun el nroLegajo y lo carga en la Tabla
     devolverNombre(puesto.idPersonal,columnas[1])
     .then(function(){
       resolve(); //Si la funcion devolverNombre funciona correctamente se devuelve resolve()
     })
     .catch(function() {
       console.log("Error al intentar devolver el Nombre");
       reject();
     });

  });

}

function generaTabla(primerDia,ultimoDia,nomCliente,nomObjetivo,razonSocial,idTable) {

  return new Promise(function(resolve,reject){

  clonarTabla(idTable);

  $("#cliente-titulo-"+idTable).text(nomCliente);
  $("#objetivo-titulo-"+idTable).text(nomObjetivo);

  if(razonSocial==""){
    $("#razon-social-"+idTable).hide();
  } else {
    $("#razon-social-"+idTable+" h3").text(razonSocial);
    $("#razon-social-"+idTable).show();
  }

  let fechaGT = new Date(primerDia.getTime());

  let cantidadColumnasFijas=3;
  let cantidadDias=cantidadDeDias(primerDia,ultimoDia);
  let tamanioTabla=cantidadDias+cantidadColumnasFijas;

  // Obtener la referencia del elemento body
  let tabla = document.getElementById("table-"+idTable);

  // Crea un elemento <table> y un elemento <tbody>
  //var tabla   = document.createElement("table");
  let tblHead = document.createElement("thead");
  let tblBody = document.createElement("tbody");
  let tblFoot = document.createElement("tfoot");
  tblHead.setAttribute("id", "tHead");
  tblBody.setAttribute("id", "tBody-"+idTable);
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
     columnas[0].innerHTML='<a style="cursor:pointer;" class="text-nowrap" >Legajo<i class="fas fa-arrows-alt-v sort-icon" ></i></a>';
     columnas[0].style.textAlign = "center";
     columnas[0].style.verticalAlign = "middle";
     columnas[0].rowSpan="2";
     columnas[0].style.padding = "6px";
     columnas[0].setAttribute('onclick', 'sortTable(0,"int","tBody-'+idTable+'")');
     columnas[1].innerHTML='<a style="cursor:pointer;" class="text-nowrap" >Nombre y Apellido<i class="fas fa-arrows-alt-v sort-icon" ></i></a>';
     columnas[1].style.textAlign = "center";
     columnas[1].style.verticalAlign = "middle";
     columnas[1].rowSpan="2";
     columnas[1].style.padding = "6px";
     columnas[1].setAttribute('onclick', 'sortTable(1,"str","tBody-'+idTable+'")' );
     columnas[tamanioTabla-1].textContent="Total Hs";
     columnas[tamanioTabla-1].style.textAlign = "center";
     columnas[tamanioTabla-1].style.verticalAlign = "middle";
     columnas[tamanioTabla-1].rowSpan="2";
     columnas[tamanioTabla-1].style.padding ="6px";

    // agrega la hilera al final de la tabla (al final del elemento tblbody)
    tblHead.appendChild(hilera);
  }

  // Crea las celdas del thead DIAS DE LA SEMANA
  fechaGT = new Date(primerDia.getTime()); // Se reinician la fecha a la inicial
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
  fechaGT = new Date(primerDia.getTime()); // Se reinicia la fecha a la inicial
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
  fechaGT = new Date(primerDia.getTime()); // Se reinicia la fecha a la inicial
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
  fechaGT = new Date(primerDia.getTime()); // Se reinicia la fecha a la inicial
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

  resolve();

  });

}

function cantidadDeDias(fechaInicial,fechaFinal){
	var fechaini = fechaInicial;
	var fechafin = fechaFinal;

	var diasdif = fechafin.getTime()-fechaini.getTime();
	var contdias = Math.round(diasdif/(1000*60*60*24)+1); //borrado+1
	return contdias;
}

function eliminarContenidoPanel(){
  $("#espacio-resultados").empty();
}

function listadoClientesCubrimiento(){
  let listadoClientes = [];
  db.collection("clientes")
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
          listadoClientes.push(doc.data().nombreCliente);
      });
      desplegableClientesCubrimiento(listadoClientes);
    });
}

function desplegableClientesCubrimiento(listadoClientes){
  let selectClientes = document.getElementById('selectClientes');
  selectClientes.options.add(new Option("Todos"));
  for(var i = 0; i < listadoClientes.length; i++){
    selectClientes.options.add(new Option(listadoClientes[i]));
  }
}

function listadoObjetivosCubrimiento(){

  let listadoObjetivos = [];
  let nombreCliente = document.getElementById("selectClientes").value;

  if(nombreCliente=="Todos"){
    let selectObjetivos = document.getElementById("selectObjetivos");
    clearOptionsFast("selectObjetivos");
    selectObjetivos.options.add(new Option("Todos"));
  }else{
    db.collection("clientes").where("nombreCliente","==",nombreCliente)
      .get()
      .then(function(querySnapshot) {
        if(querySnapshot.empty){
          desplegableObjetivosCubrimiento(listadoObjetivos);
        }else{
          querySnapshot.forEach(function(doc) {
              db.collection("clientes").doc(doc.id).collection("objetivos")
              .get()
              .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                      listadoObjetivos.push(doc.data().nombreObjetivo);
                });
                desplegableObjetivosCubrimiento(listadoObjetivos);
              });
          })
        }
      });
  }
}

function desplegableObjetivosCubrimiento(listadoObjetivos){
  let selectObjetivos = document.getElementById("selectObjetivos");
  if(listadoObjetivos.length==0){
    clearOptionsFast("selectObjetivos"); //Vacio las opciones del Select
    selectObjetivos.options.add(new Option("Sin Objetivos",0)); //Cargo que no tiene Objetivos
  } else if(listadoObjetivos.length>0){
      clearOptionsFast("selectObjetivos"); //Vacio las opciones del Select
      selectObjetivos.options.add(new Option("Seleccione un Objetivo",0));
      selectObjetivos.options.add(new Option("Todos"));
      for(var i = 0; i < listadoObjetivos.length; i++){
        selectObjetivos.options.add(new Option(listadoObjetivos[i]));
      }
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

function cargarDateTimePicker9(){
  $('#datetimepicker9').datetimepicker({
      defaultDate: new Date(),
      locale: 'es',
      viewMode: 'years',
      useCurrent: true,
      format: 'MM/YYYY',
  });
}

function sortTable(n,type,idTable) {
  //type 'str' or 'int'
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;

  table = document.getElementById(idTable);
  switching = true;
  //Set the sorting direction to ascending:
  dir = "asc";

  /*Make a loop that will continue until no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /*Loop through all table rows (except the first, which contains table headers):*/
    for (i = 0; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare, one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      /*check if the two rows should switch place, based on the direction, asc or desc:*/
      if (dir == "asc") {
        if ((type=="str" && x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) || (type=="int" && parseFloat(x.innerHTML) > parseFloat(y.innerHTML))) {
          //if so, mark as a switch and break the loop:
          shouldSwitch= true;
          break;
        }
      } else if (dir == "desc") {
        if ((type=="str" && x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) || (type=="int" && parseFloat(x.innerHTML) < parseFloat(y.innerHTML))) {
          //if so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      //Each time a switch is done, increase this count by 1:
      switchcount ++;
    } else {
      /*If no switching has been done AND the direction is "asc", set the direction to "desc" and run the while loop again.*/
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}

function clonarTabla(idTable) {

  let containerClone = document.getElementById("container-clone");
  let clon = containerClone.cloneNode("container-clone");
  let containerIdName = "container-"+idTable;
  clon.id = containerIdName;

  let panelPlantilla = document.getElementById("espacio-resultados");
  panelPlantilla.appendChild(clon);

  $("#"+containerIdName).find("#table-clone").attr("id","table-"+idTable);
  $("#"+containerIdName).find("#razon-social").attr("id","razon-social-"+idTable);
  $("#"+containerIdName).find("#clienteTitulo").attr("id","cliente-titulo-"+idTable);
  $("#"+containerIdName).find("#objetivoTitulo").attr("id","objetivo-titulo-"+idTable);

  $("#"+containerIdName).show();

}

function loaderStateCubrimiento(){
  $("#loader-state-cubrimiento").addClass("is-active");
}

function loaderStateFinishCubrimiento(){
  $("#loader-state-cubrimiento").removeClass("is-active");
}

function cargarRangeSlider(){

  $("#slider-detalle").ionRangeSlider({
    grid: true,
    type: 'double',
    force_edges: true,
    drag_interval: true,
    step: 900000,
    prettify: function (num) {
    return moment(num).format('HH:mm');
    },
    onChange: function (data) {
    // Called every time handle position is changed
      let difHoras = totalHorasDetalle(new Date(data.from),new Date(data.to));
      $("#horasRegitradasDetalle").text(difHoras);
      document.getElementById('icon-informe').className = 'fas fa-angle-double-down open';
      $("#mostrarInforme").show(300);
      $("#variacion-horas").show(300);
      $("#penalizacionHora").hide(300);
      $("#penalizacionTurno").hide(300);
    },
    onUpdate: function (data) {
    // Called then slider is changed using Update public method
      let difHoras = totalHorasDetalle(new Date(data.from),new Date(data.to));
      $("#horasRegitradasDetalle").text(difHoras);
    },
  });

}

////////////////////////////////////////////////////////////////////////////////
// FUNCIONES MODAL DETALLE DIA
////////////////////////////////////////////////////////////////////////////////

function mostrarModalDetalleDia(idCliente,idObjetivo,idDia,turno,variosPuestos,idCell,idTable){

  clearOptionsFast("modal-body-detalle");
  clearOptionsFast("menu-detalle");
  clearOptionsFast("modal-footer-detalle");
  $("#nombreDetalleDia").text("");

  if(variosPuestos==false){
    let arrayTurnos = [];
    arrayTurnos.push(turno);
    cargarNombrePersonal(turno.idPersonal,"nombreDetalleDia");
    cargarFuncionesModal(idCliente,idObjetivo,idDia,idCell,arrayTurnos,idTable);
    generarPanel(turno,"0");
    $("#detalle-dia").modal("show");
  } else {
    //Si tiene mas de un puesto cargado en el dia tengo que recorrerlos y cargarlos
    cargarNombrePersonal(turno.idPersonal,"nombreDetalleDia");
    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
    .doc(idDia).collection("puestos").orderBy("horaIngreso","asc")
    .get()
    .then(function(querySnapshot) {
          if (querySnapshot.empty) {
            // Si no se ecuentran la fecha
          } else {
            let idPanel=0;
            let arrayTurnos = [];
            querySnapshot.forEach(function(doc) {
              let turnoDoc = doc.data();
              if (turnoDoc.idPersonal==turno.idPersonal){
                generarPanel(turnoDoc,idPanel);
                idPanel++;
                let turnoArray = {
                  idTurno: doc.id,
                  idPersonal: doc.data().idPersonal,
                  nombrePuesto: doc.data().nombrePuesto,
                  fechaPuesto: doc.data().fechaPuesto,
                  fechaIngreso: doc.data().fechaIngreso,
                  fechaEgreso: doc.data().fechaEgreso,
                  turnoNoche: doc.data().turnoNoche,
                  ingresoPuesto: doc.data().ingresoPuesto,
                  egresoPuesto: doc.data().egresoPuesto,
                  horaIngreso: doc.data().horaIngreso,
                  horaEgreso: doc.data().horaEgreso,
                  horasTurno: doc.data().horasTurno,
                  imagePath: doc.data().imagePath,
                  estado: doc.data().estado,
                }
                arrayTurnos.push(turnoArray);
              }
            });
            cargarFuncionesModal(idCliente,idObjetivo,idDia,idCell,arrayTurnos,idTable);
          }
          $("#detalle-dia").modal("show");
    })
    .catch(function(error) {
        console.log("Error getting document:", error);
    });
  }
}

function generarPanel(puesto,idPanel){

  clonarPanelDetalle(idPanel);

  cargarDatosTurnos(puesto,idPanel);

  cargarRangeSliderDetalleDia(puesto,idPanel);

}

function cargarNombrePersonal(nroLegajo,idElemento) {

  db.collection("users").where("idPersonal","==",nroLegajo)
  .get()
  .then(function(querySnapshot) {
      if (querySnapshot.empty) {
          console.log("No such document!");
      } else {
        querySnapshot.forEach(function(doc) {
          $("#"+idElemento).html("   "+doc.data().nombre);
        });
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });
}

function cargarDatosTurnos(puesto,idPanel){

  if(puesto.imagePath!=""){
    cargarImagen(puesto.imagePath+puesto.idPersonal+"_INGRESO.jpg","foto-ingreso-"+idPanel);
    if(puesto.horaEgreso!=""){
      cargarImagen(puesto.imagePath+puesto.idPersonal+"_EGRESO.jpg","foto-egreso-"+idPanel);
    } else{
      $("#foto-egreso-"+idPanel).css('background-image', 'url(assets/img/sin-foto.png)');
    }
  } else {
    cargarImagen(puesto.imagePathIngreso,"foto-ingreso-"+idPanel);
    cargarImagen(puesto.imagePathEgreso,"foto-egreso-"+idPanel);
  }


    let date = new Date();
    let horaIngreso = new Date().setHours(puesto.ingresoPuesto.split(":")[0],puesto.ingresoPuesto.split(":")[1],0,0);
    const tMRDesde = date.setHours(0,0,0,0); // Desde las 00:00
    const tMRHasta = date.setHours(5,59,59,999); // Hasta las 05:59
    const tMDesde = date.setHours(6,0,0,0); // Desde las 06:00
    const tMHasta = date.setHours(11,59,59,999); // Hasta las 11:59
    const tTDesde = date.setHours(12,0,0,0); // Desde las 12:00
    const tTHasta = date.setHours(18,59,59,999); // Hasta las 18:59
    const tNDesde = date.setHours(19,0,0,0); // Desde las 19:00
    const tNHasta = date.setHours(23,59,59,999); // Hasta las 23:59

    if(horaIngreso>=tMRDesde && horaIngreso<=tMRHasta){
      $("#tituloPuesto-"+idPanel).text(puesto.nombrePuesto+" - Turno Madrugada");
    } else if(horaIngreso>=tMDesde && horaIngreso<=tMHasta){
      $("#tituloPuesto-"+idPanel).text(puesto.nombrePuesto+" - Turno Mañana");
    } else if(horaIngreso>=tTDesde && horaIngreso<=tTHasta){
      $("#tituloPuesto-"+idPanel).text(puesto.nombrePuesto+" - Turno Tarde");
    } else if(horaIngreso>=tNDesde && horaIngreso<=tNHasta){
      $("#tituloPuesto-"+idPanel).text(puesto.nombrePuesto+" - Turno Noche");
    }

    $("#horaIngresoReal-"+idPanel).text(puesto.horaIngreso);
    if(puesto.horaEgreso.length>0){
      $("#horaEgresoReal-"+idPanel).text(puesto.horaEgreso);
      document.getElementById("horaEgresoReal-"+idPanel).style.fontSize = "25px";
    } else {
      $("#horaEgresoReal-"+idPanel).text("SIN CIERRE");
      document.getElementById("horaEgresoReal-"+idPanel).style.fontSize = "16px";
    }

    $("#horasTurnoDetalle-"+idPanel).text(puesto.horasTurno);

}

function cargarRangeSliderDetalleDia(puesto,idPanel){

  //Initialise range slider instance
  $("#slider-detalle-"+idPanel).ionRangeSlider({
  grid: true,
  type: 'double',
  force_edges: true,
  drag_interval: true,
  step: 900000,
  prettify: function (num) {
  return moment(num).format('HH:mm');
  },
  onChange: function (data) {
    // Called every time handle position is changed
    let oldFrom = $("#slider-detalle-"+idPanel).attr("from");
    let oldTo = $("#slider-detalle-"+idPanel).attr("to");
    let oldHours = $("#slider-detalle-"+idPanel).attr("hours");
    let from = new Date(data.from);
    let to = new Date(data.to);

    let difHoras = totalHorasDetalle(new Date(data.from),new Date(data.to));
    $("#horasRegitradasDetalle-"+idPanel).text(difHoras);

    if ( difHoras > oldHours ){
      document.getElementById('icon-informe-'+idPanel).className = 'fas fa-angle-double-down open';
      $("#mostrarInforme-"+idPanel).show(300);
      $("#variacion-horas-"+idPanel).show(300);
      $("#penalizacionHora-"+idPanel).hide(300);
      $("#penalizacionTurno-"+idPanel).hide(300);
      $("#variacion-horas-"+idPanel).removeClass("has-error");
      $("#variacion-horas-"+idPanel+" span").hide();
    } else if ( difHoras < oldHours ){
      document.getElementById('icon-informe-'+idPanel).className = 'fas fa-angle-double-down open';
      $("#mostrarInforme-"+idPanel).show(300);
      $("#variacion-horas-"+idPanel).hide(300);
      $("#penalizacionHora-"+idPanel).show(300);
      $("#penalizacionTurno-"+idPanel).hide(300);
      $("#penalizacionHora-"+idPanel).removeClass("has-error");
      $("#penalizacionHora-"+idPanel+" span").hide();
    } else {
      document.getElementById('icon-informe-'+idPanel).className = 'fas fa-angle-double-down';
      $("#mostrarInforme-"+idPanel).hide(300);
      $("#variacion-horas-"+idPanel).hide(300);
      $("#penalizacionHora-"+idPanel).hide(300);
      $("#penalizacionTurno-"+idPanel).hide(300);
    }

  },
  onUpdate: function (data) {
    // Called then slider is changed using Update public method
    let difHoras = totalHorasDetalle(new Date(data.from),new Date(data.to));
    $("#horasRegitradasDetalle-"+idPanel).text(difHoras);
  },
});

  // Save instance to variable
  let my_range = $("#slider-detalle-"+idPanel).data("ionRangeSlider");

  let fechaIngresoPuesto = new Date(puesto.fechaPuesto+"T"+puesto.ingresoPuesto+":00");
  let fechaEgresoPuesto = new Date(puesto.fechaPuesto+"T"+puesto.egresoPuesto+":00");
  if(compararHorasString(puesto.ingresoPuesto,puesto.egresoPuesto)==-1){
    fechaEgresoPuesto = new Date( fechaEgresoPuesto.getTime() + 24*60*60*1000 );
  }
  let fechaIngresoReal = new Date(puesto.fechaIngreso+"T"+puesto.horaIngreso+":00");

  let ingresoParam = ingresoParametrizado(fechaIngresoPuesto,fechaIngresoReal);
  let fechaEgresoReal="";
  let egresoParam="";

  if(puesto.horaEgreso==""){
    egresoParam = ingresoParam;
  }else{
    fechaEgresoReal = new Date(puesto.fechaEgreso+"T"+puesto.horaEgreso+":00");
    egresoParam = egresoParametrizado(fechaIngresoPuesto,fechaEgresoPuesto,fechaEgresoReal);
  }

  let difHoras = totalHorasDetalle(ingresoParam,egresoParam);

  $("#slider-detalle-"+idPanel).attr( "from", ingresoParam );
  $("#slider-detalle-"+idPanel).attr( "to", egresoParam );
  $("#slider-detalle-"+idPanel).attr( "hours", difHoras );

  // Update range slider content (this will change handles positions)
  my_range.update({
    min: fechaIngresoPuesto.valueOf(),
    max: fechaEgresoPuesto.valueOf(),
    from: ingresoParam.valueOf(),
    to: egresoParam.valueOf(),
    disable: false,
  });


  $("#horasRegitradasDetalle-"+idPanel).text(difHoras);

  $("#turnoOriginalDetalle-"+idPanel).click(function() {
    if(puesto.turnoOriginal==undefined || puesto.turnoOriginal=="" ){
      my_range.update({
        from: ingresoParam.valueOf(),
        to: egresoParam.valueOf(),
      });
      document.getElementById('icon-informe-'+idPanel).className = 'fas fa-angle-double-down';
      $("#mostrarInforme-"+idPanel).hide(300);
      $("#variacion-horas-"+idPanel).hide(300);
      $("#penalizacionHora-"+idPanel).hide(300);
      $("#penalizacionTurno-"+idPanel).hide(300);
      $("select[name=select-"+idPanel+"]").val("0");
      $("#comment-"+idPanel).val("");
    } else {

    }
  });

  $("#completarTurnoDetalle-"+idPanel).click(function() {
    my_range.update({
      from: ingresoParam.valueOf(),
      to: egresoParam.valueOf(),
    });
    document.getElementById('icon-informe-'+idPanel).className = 'fas fa-angle-double-down';
    $("#mostrarInforme-"+idPanel).hide(300);
    $("#variacion-horas-"+idPanel).hide(300);
    $("#penalizacionHora-"+idPanel).hide(300);
    $("#penalizacionTurno-"+idPanel).hide(300);
    $("select[name=select-"+idPanel+"]").val("0");
    $("#comment-"+idPanel).val("");
  });

  $("#turno-completo-"+idPanel).click(function() {
    my_range.update({
      from: fechaIngresoPuesto.valueOf(),
      to: fechaEgresoPuesto.valueOf(),
    });
    document.getElementById("icon-informe-"+idPanel).className = "fas fa-angle-double-down open";
    $("#mostrarInforme-"+idPanel).show(300);
    $("#variacion-horas-"+idPanel).show(300);
    $("#penalizacionHora-"+idPanel).hide(300);
    $("#penalizacionTurno-"+idPanel).hide(300);
    $("select[name=select-"+idPanel+"]").val("0");
    $("#comment-"+idPanel).val("");
  });

  $("#turno-inicio-"+idPanel).click(function() {
    my_range.update({
      from: fechaIngresoPuesto.valueOf(),
    });
    document.getElementById("icon-informe-"+idPanel).className = "fas fa-angle-double-down open";
    $("#mostrarInforme-"+idPanel).show(300);
    $("#variacion-horas-"+idPanel).show(300);
    $("#penalizacionHora-"+idPanel).hide(300);
    $("#penalizacionTurno-"+idPanel).hide(300);
    $("select[name=select-"+idPanel+"]").val("0");
    $("#comment-"+idPanel).val("");
  });

  $("#turno-final-"+idPanel).click(function() {
    my_range.update({
      to: fechaEgresoPuesto.valueOf(),
    });
    document.getElementById("icon-informe-"+idPanel).className = "fas fa-angle-double-down open";
    $("#mostrarInforme-"+idPanel).show(300);
    $("#variacion-horas-"+idPanel).show(300);
    $("#penalizacionHora-"+idPanel).hide(300);
    $("#penalizacionTurno-"+idPanel).hide(300);
    $("select[name=select-"+idPanel+"]").val("0");
    $("#comment-"+idPanel).val("");
  });

  $("#penalizarDetalle-"+idPanel).click(function() {
    my_range.update({
      from: ingresoParam.valueOf(),
      to: egresoParam.valueOf(),
    });
    document.getElementById('icon-informe-'+idPanel).className = 'fas fa-angle-double-down';
    $("#mostrarInforme-"+idPanel).hide(300);
    $("#variacion-horas-"+idPanel).hide(300);
    $("#penalizacionHora-"+idPanel).hide(300);
    $("#penalizacionTurno-"+idPanel).hide(300);
    $("select[name=select-"+idPanel+"]").val("0");
    $("#comment-"+idPanel).val("");
  });

  $("#descontar-hora-"+idPanel).click(function() {
    let horaMenos = new Date( egresoParam.getTime() - 1000 * 60 * 60 );
    if(horaMenos < ingresoParam){
      horaMenos = ingresoParam;
    }
    my_range.update({
      to: horaMenos.valueOf(),
    });
    $("select[name=select-"+idPanel+"]").val("0");
    $("#comment-"+idPanel).val("");
    let icon = document.getElementById("icon-informe-"+idPanel);
    icon.className = 'fas fa-angle-double-down open';
    $("#mostrarInforme-"+idPanel).show(300);
    $("#variacion-horas-"+idPanel).hide(300);
    $("#penalizacionTurno-"+idPanel).hide(300);
    $("#penalizacionHora-"+idPanel).show(300);
  });

  $("#descontar-turno-"+idPanel).click(function() {
    my_range.update({
      from: ingresoParam.valueOf(),
      to: ingresoParam.valueOf(),
    });
    $("select[name=select-"+idPanel+"]").val("0");
    $("#comment-"+idPanel).val("");
    let icon = document.getElementById("icon-informe-"+idPanel);
    icon.className = 'fas fa-angle-double-down open';
    $("#mostrarInforme-"+idPanel).show(300);
    $("#variacion-horas-"+idPanel).hide(300);
    $("#penalizacionHora-"+idPanel).hide(300);
    $("#penalizacionTurno-"+idPanel).show(300);
  });

  $("#icon-informe-"+idPanel).click(function() {
    let icon = document.getElementById("icon-informe-"+idPanel);
    let open = $("#icon-informe-"+idPanel).hasClass("open");
    if(open){
      icon.className = 'fas fa-angle-double-down';
      $("#mostrarInforme-"+idPanel).hide(300);
    }else{
      icon.className = 'fas fa-angle-double-down open';
      $("#mostrarInforme-"+idPanel).show(300);
    }
  });

  $("#boton-eliminar-turno-"+idPanel).click(function() {
    $("#card-contenedor-"+idPanel).hide(300);
    $("#horas-turno-detalle-"+idPanel).hide(300);
    $("#mostrar-botones-"+idPanel).hide(300);
    $("#mostrarInforme-"+idPanel).hide(300);
    $("#boton-eliminar-turno-"+idPanel).prop( "disabled", true );
    $("#boton-habilitar-turno-"+idPanel).prop( "disabled", false );
    document.getElementById('icon-informe-'+idPanel).className = 'fas fa-angle-double-down';
    my_range.update({
        from: ingresoParam.valueOf(),
        to: egresoParam.valueOf(),
        disable: true,
    });
    $("select[name=select-"+idPanel+"]").val("0");
    $("#comment-"+idPanel).val("");
    $("#variacion-horas-"+idPanel).hide();
    $("#penalizacionHora-"+idPanel).hide();
    $("#penalizacionTurno-"+idPanel).hide();
    $("#slider-detalle-"+idPanel).attr( "delete", "true" );
    $("#turno-eliminar-"+idPanel).show();
  });

  $("#boton-habilitar-turno-"+idPanel).click(function() {
    $("#card-contenedor-"+idPanel).show(300);
    $("#horas-turno-detalle-"+idPanel).show(300);
    $("#mostrar-botones-"+idPanel).show(300);
    $("#boton-eliminar-turno-"+idPanel).prop( "disabled", false );
    $("#boton-habilitar-turno-"+idPanel).prop( "disabled", true );
    $("#slider-detalle-"+idPanel).attr( "delete", false );
    $("#turno-eliminar-"+idPanel).hide();
    my_range.update({
        from: ingresoParam.valueOf(),
        to: egresoParam.valueOf(),
        disable: false,
    });
  });

  $("#sel-amp-horas-"+idPanel).change(function () {
    if ( $("#variacion-horas-"+idPanel).hasClass("has-error") && $("#sel-amp-horas-"+idPanel).val()!=0 ){
      $("#variacion-horas-"+idPanel).removeClass("has-error");
      $("#variacion-horas-"+idPanel+" span").hide();
    }
  });

  $("#sel-red-horas-"+idPanel).change(function (){
    if ( $("#penalizacionHora-"+idPanel).hasClass("has-error") && $("#sel-red-horas-"+idPanel).val()!=0 ){
      $("#penalizacionHora-"+idPanel).removeClass("has-error");
      $("#penalizacionHora-"+idPanel+" span").hide();
    }
  });

  $("#sel-eli-turno-"+idPanel).change(function (){
    if ( $("#penalizacionTurno-"+idPanel).hasClass("has-error") && $("#sel-eli-turno-"+idPanel).val()!=0 ){
      $("#penalizacionTurno-"+idPanel).removeClass("has-error");
      $("#penalizacionTurno-"+idPanel+" span").hide();
    }
  });

}

function totalHorasDetalle(ingresoParam2,egresoParam2){
  if(egresoParam2==""){
    return "00:00";
  }
  difMili = egresoParam2.getTime()-ingresoParam2.getTime();
  let horas = Math.floor(difMili/1000/60/60);
  let minutos = Math.floor(difMili/1000/60);
  minutos = minutos - horas*60;
  if (horas<10){horas="0"+horas;}
  if (minutos<10){minutos="0"+minutos;}
  return horas+":"+minutos;
}

function clonarPanelDetalle(idPanel) {

  //Se clona el elemento y se le cambia el id
  let panelClone = document.getElementById("panel-clone");
  let clon = panelClone.cloneNode("panel-clone");
  let panelIdName = "panel-"+idPanel;
  clon.id = panelIdName;

  //Se inserta el elemento clonado, debajo del ultimo elemento del padre
  let modalBody = document.getElementById("modal-body-detalle");
  modalBody.appendChild(clon);

  //Se modifican los id de cada elemento a utilizar
  $("#"+panelIdName).find("#tituloPuesto").attr("id","tituloPuesto-"+idPanel);
  $("#"+panelIdName).find("#horaIngresoReal").attr("id","horaIngresoReal-"+idPanel);
  $("#"+panelIdName).find("#horaEgresoReal").attr("id","horaEgresoReal-"+idPanel);
  $("#"+panelIdName).find("#turno-eliminar").attr("id","turno-eliminar-"+idPanel);
  $("#"+panelIdName).find("#horasTurnoDetalle").attr("id","horasTurnoDetalle-"+idPanel);
  $("#"+panelIdName).find("#horasRegitradasDetalle").attr("id","horasRegitradasDetalle-"+idPanel);
  $("#"+panelIdName).find("#completarTurnoDetalle").attr("id","completarTurnoDetalle-"+idPanel);
  $("#"+panelIdName).find("#turno-completo").attr("id","turno-completo-"+idPanel);
  $("#"+panelIdName).find("#turno-inicio").attr("id","turno-inicio-"+idPanel);
  $("#"+panelIdName).find("#turno-final").attr("id","turno-final-"+idPanel);
  $("#"+panelIdName).find("#mostrarInforme").attr("id","mostrarInforme-"+idPanel);
  $("#"+panelIdName).find("#variacion-horas").attr("id","variacion-horas-"+idPanel);
  $("#"+panelIdName).find("#penalizarDetalle").attr("id","penalizarDetalle-"+idPanel);
  $("#"+panelIdName).find("#penalizacionHora").attr("id","penalizacionHora-"+idPanel);
  $("#"+panelIdName).find("#penalizacionTurno").attr("id","penalizacionTurno-"+idPanel);
  $("#"+panelIdName).find("#turnoOriginalDetalle").attr("id","turnoOriginalDetalle-"+idPanel);
  $("#"+panelIdName).find("#boton-eliminar-turno").attr("id","boton-eliminar-turno-"+idPanel);
  $("#"+panelIdName).find("#card-contenedor").attr("id","card-contenedor-"+idPanel);
  $("#"+panelIdName).find("#horas-turno-detalle").attr("id","horas-turno-detalle-"+idPanel);
  $("#"+panelIdName).find("#mostrar-botones").attr("id","mostrar-botones-"+idPanel);
  $("#"+panelIdName).find("#boton-eliminar-turno").attr("id","boton-eliminar-turno-"+idPanel);
  $("#"+panelIdName).find("#boton-habilitar-turno").attr("id","boton-habilitar-turno-"+idPanel);
  $("#"+panelIdName).find("#boton-habilitar-turno").attr("id","boton-habilitar-turno-"+idPanel);
  $("#"+panelIdName).find("#icon-informe").attr("id","icon-informe-"+idPanel);
  $("#"+panelIdName).find("#slider-detalle").attr("id","slider-detalle-"+idPanel);
  $("#"+panelIdName).find("#descontar-hora").attr("id","descontar-hora-"+idPanel);
  $("#"+panelIdName).find("#descontar-turno").attr("id","descontar-turno-"+idPanel);
  $("#"+panelIdName).find("#sel-amp-horas").attr("id","sel-amp-horas-"+idPanel);
  $("#"+panelIdName).find("#sel-red-horas").attr("id","sel-red-horas-"+idPanel);
  $("#"+panelIdName).find("#sel-eli-turno").attr("id","sel-eli-turno-"+idPanel);
  $("#"+panelIdName).find("#comment").attr("id","comment-"+idPanel);
  $("#"+panelIdName).find("#foto-ingreso").attr("id","foto-ingreso-"+idPanel);
  $("#"+panelIdName).find("#foto-egreso").attr("id","foto-egreso-"+idPanel);

  $("#"+panelIdName).find("select[name=select]").attr("name","select-"+idPanel);


  $("#"+panelIdName).show();

}

function cargarFuncionesModal(idCliente,idObjetivo,idDia,idCell,arrayTurnos,idTable){

  let arrayTurnosMod = [];

  let celda = document.getElementById(idCell);

  //Se clona el elemento y se le cambia el id
  let dropdownClone = document.getElementById("dropdown-clone");
  let clon = dropdownClone.cloneNode("dropdown-clone");
  let dropdownIdName = "dropdown-"+idCell;
  clon.id = dropdownIdName;

  //Se inserta el elemento clonado, debajo del ultimo elemento del padre
  let menuDetalle = document.getElementById("menu-detalle");
  menuDetalle.appendChild(clon);

 //Se modifican los id de cada elemento a utilizar
  $("#"+dropdownIdName).find("#confirmar-verificacion").attr("id","confirmar-verificacion-"+idCell);
  $("#"+dropdownIdName).find("#deshabilitar-verificacion").attr("id","deshabilitar-verificacion-"+idCell);
  $("#"+dropdownIdName).find("#unificar-turno").attr("id","unificar-turno-"+idCell);
  $("#"+dropdownIdName).find("#estado-detalle").attr("id","estado-detalle-"+idCell);

  $("#"+dropdownIdName).show();

  if(celda.getAttribute("estado")=="no-ver"){
    $("#estado-detalle-"+idCell).text("No Verificado");
    document.getElementById("estado-detalle-"+idCell).className = "label label-danger";
    document.getElementById("deshabilitar-verificacion-"+idCell).className = "disabled";
    if(arrayTurnos.length==1){
      document.getElementById("unificar-turno-"+idCell).className = "disabled";
    }
  } else if (celda.getAttribute("estado")=="ver"){
    $("#estado-detalle-"+idCell).text("Verificado");
    document.getElementById("estado-detalle-"+idCell).className = "label label-success";
    document.getElementById("confirmar-verificacion-"+idCell).className = "disabled";
    if(arrayTurnos.length==1){
      document.getElementById("unificar-turno-"+idCell).className = "disabled";
    }
  } else if (celda.getAttribute("estado")=="mod"){
    $("#estado-detalle-"+idCell).text("Modificado");
    document.getElementById("estado-detalle-"+idCell).className = "label label-primary";
    document.getElementById("confirmar-verificacion-"+idCell).className = "disabled";
    document.getElementById("deshabilitar-verificacion-"+idCell).className = "disabled";
    if(arrayTurnos.length==1){
      document.getElementById("unificar-turno-"+idCell).className = "disabled";
    }
  } else {
    $("#estado-detalle-"+idCell).text("");
    document.getElementById("estado-detalle-"+idCell).className = "";
    document.getElementById("confirmar-verificacion-"+idCell).className = "disabled";
    document.getElementById("deshabilitar-verificacion-"+idCell).className = "disabled";
    document.getElementById("unificar-turno-"+idCell).className = "disabled";
  }

  $("#confirmar-verificacion-"+idCell).click(function() {
    $("#estado-detalle-"+idCell).text("Verificado");
    document.getElementById("estado-detalle-"+idCell).className = "label label-success";
    document.getElementById("confirmar-verificacion-"+idCell).className = "disabled";
    document.getElementById("deshabilitar-verificacion-"+idCell).className = "";
    cambiarEstadoArray(arrayTurnos,"ver");
  });

  $("#deshabilitar-verificacion-"+idCell).click(function() {
    $("#estado-detalle-"+idCell).text("No Verificado");
    document.getElementById("estado-detalle-"+idCell).className = "label label-danger";
    document.getElementById("deshabilitar-verificacion-"+idCell).className = "disabled";
    document.getElementById("confirmar-verificacion-"+idCell).className = "";
    cambiarEstadoArray(arrayTurnos,"no-ver");
  });

 $("#unificar-turno-"+idCell).click(function() {
    arrayTurnos.forEach(function(turno){
      let encontrado=false;
        for (let turnoMod of arrayTurnosMod) {
          if(turno.nombrePuesto == turnoMod.nombrePuesto && turno.ingresoPuesto == turnoMod.ingresoPuesto){
            turnoMod.arrayId.push(turno.idTurno);
            turnoMod.count++;
            turnoMod.imagePath="";
            let imagePathIngreso="";
            let imagePathEgreso="";
            let turnoModhoraEgreso="";

            let turnohoraIngreso = new Date( Date.parse(turno.fechaIngreso+"T"+turno.horaIngreso+":00") );
            let turnohoraEgreso = new Date( Date.parse(turno.fechaEgreso+"T"+turno.horaEgreso+":00") );
            let turnoModhoraIngreso = new Date( Date.parse(turnoMod.fechaIngreso+"T"+turnoMod.horaIngreso+":00") );
            if(turnoMod.horaEgreso!=""){
              turnoModhoraEgreso = new Date( Date.parse(turnoMod.fechaEgreso+"T"+turnoMod.horaEgreso+":00") );
            }
            // Compara Hora Ingreso
            if(turnoModhoraIngreso > turnohoraIngreso){
              turnoMod.horaIngreso=turno.horaIngreso;
              turnoMod.fechaIngreso=turno.fechaIngreso;
              turnoMod.imagePathIngreso=turno.imagePath+turno.idPersonal+"_INGRESO.jpg";
            }
            // Compara Hora Egreso REVISAR QUE PASA CUANDO turnoMod.horaEgreso es =="VACIA"
            if(turno.horaEgreso==""){
                if(turnoModhoraEgreso < turnohoraIngreso){
                  turnoMod.horaEgreso=turno.horaIngreso;
                  turnoMod.fechaEgreso=turno.fechaIngreso;
                  turnoMod.imagePathEgreso=turno.imagePath+turno.idPersonal+"_INGRESO.jpg";
                  console.log("Entro a ",  turnoMod.imagePathEgreso);
                }
            } else if(turnoModhoraEgreso < turnohoraEgreso || turnoMod.horaEgreso=="") {
              console.log();
              turnoMod.horaEgreso=turno.horaEgreso;
              turnoMod.fechaEgreso=turno.fechaEgreso;
              turnoMod.imagePathEgreso=turno.imagePath+turno.idPersonal+"_EGRESO.jpg";
            }
            encontrado=true;
            break;
         }
       }
       if(encontrado==false){
          turno.arrayId = [turno.idTurno];
          turno.estado = "mod";
          turno.count = 1;
          turno.imagePathIngreso=turno.imagePath+turno.idPersonal+"_INGRESO.jpg";
          if(turno.horaEgreso!=""){
            turno.imagePathEgreso=turno.imagePath+turno.idPersonal+"_EGRESO.jpg";
          }
          arrayTurnosMod.push(turno);
       }
   });

    //Mostrar Turnos Unificados y no Unificados
    if( arrayTurnosMod.length == 1){
      let variosPuestos = false;
      mostrarTurnosProcesados(idCliente,idObjetivo,idDia,arrayTurnosMod,variosPuestos,idCell,idTable);
      //Poner en disaabled Unificar Turnos
    } else {
      let variosPuestos = true;
      mostrarTurnosProcesados(idCliente,idObjetivo,idDia,arrayTurnosMod,variosPuestos,idCell,idTable);
      //Poner en disaabled Unificar Turnos
    }

  });

  //SECTION FOOTER
  //Se clona el elemento y se le cambia el id
  let footerClone = document.getElementById("footer-clone");
  let clonFooter = footerClone.cloneNode("footer-clone");
  let footerIdName = "footer-"+idCell;
  clonFooter.id = footerIdName;

  //Se inserta el elemento clonado, debajo del ultimo elemento del padre
  let footerDetalle = document.getElementById("modal-footer-detalle");
  footerDetalle.appendChild(clonFooter);

  //Se modifican los id de cada elemento a utilizar
   $("#"+footerIdName).find("#guardar-cambios-detalle").attr("id","guardar-cambios-detalle-"+idCell);

   $("#"+footerIdName).show();

   $("#guardar-cambios-detalle-"+idCell).click(function() {
     $("#guardar-cambios-detalle-"+idCell).attr("disabled", true);
     guardarCambiosDetalle(idCliente,idObjetivo,idDia,idCell,arrayTurnos,idTable);

   });

}

function cambiarEstadoArray(arrayTurnos,estado){
  console.log("El array de turnos antes de cambiar de estado");
  console.log(arrayTurnos);
  for (i=0;i<arrayTurnos.length;i++){
    arrayTurnos[i].estado = estado;
    arrayTurnos[i].changed = true;
  }
}

function guardarCambiosDetalle(idCliente,idObjetivo,idDia,idCell,arrayTurnos,idTable){

  let errorMessage=false;

  for (let i=0 ; i < arrayTurnos.length ; i++){

    let slider = $("#slider-detalle-"+i).data("ionRangeSlider");
    let from = new Date(slider.result.from);
    let to = new Date(slider.result.to);
    let oldFrom = $("#slider-detalle-"+i).attr("from");
    let oldTo = $("#slider-detalle-"+i).attr("to");
    let oldHours = $("#slider-detalle-"+i).attr("hours");
    let delTurno = $("#slider-detalle-"+i).attr("delete");
    let comment = $("#comment-"+i).val();
    let difHoras = totalHorasDetalle(from,to);

    if (delTurno == "true"){
      arrayTurnos[i].delete = true;
    } else if (oldHours < difHoras){

      let oldData = {}

      if(arrayTurnos[i].oldData){
        oldData = {
          oldFrom : arrayTurnos[i].oldData.oldFrom,
          oldTo : arrayTurnos[i].oldData.oldTo,
        }
      } else {
        oldData = {
          oldFrom : oldFrom,
          oldTo : oldTo,
        }
      }

      // Ampliacion de Horas
      if( $("#sel-amp-horas-"+i).val() != 0) {

        if(oldFrom!=from){
          arrayTurnos[i].horaIngreso = getHoursStr(from);
          arrayTurnos[i].fechaIngreso = getDateStr(from);
        }
        if(oldTo!=to){
          arrayTurnos[i].horaEgreso = getHoursStr(to);
          arrayTurnos[i].fechaEgreso = getDateStr(to);
        }
        oldData.motive = $("#sel-amp-horas-"+i+" option:selected").text();
        if(comment!=""){
          oldData.comment = $("#comment-"+i).val();
        }
        oldData.idOper = "1";
        arrayTurnos[i].oldData = oldData;
        arrayTurnos[i].estado = "mod";
        arrayTurnos[i].changed = true;


      } else {
        errorMessage=true;
        document.getElementById("icon-informe-"+i).className = "fas fa-angle-double-down open";
        $("#mostrarInforme-"+i).show(300);
        $("#variacion-horas-"+i).show(300);
        $("#penalizacionHora-"+i).hide(300);
        $("#penalizacionTurno-"+i).hide(300);
        $("#variacion-horas-"+i).addClass("has-error");
        $("#variacion-horas-"+i+" span").show(300);
      }

    } else if (oldHours > difHoras){

      let oldData = {}

      if(arrayTurnos[i].oldData){
        oldData = {
          oldFrom : arrayTurnos[i].oldData.oldFrom,
          oldTo : arrayTurnos[i].oldData.oldTo,
        }
      } else {
        oldData = {
          oldFrom : oldFrom,
          oldTo : oldTo,
        }
      }

      if (oldFrom == from && oldFrom == to){
        // Descuento de Turno
        if( $("#sel-eli-turno-"+i).val() != 0 || $("#sel-red-horas-"+i).val() != 0) {
          if(oldFrom!=from){
            arrayTurnos[i].horaIngreso = getHoursStr(from);
            arrayTurnos[i].fechaIngreso = getDateStr(from);
          }
          if(oldTo!=to){
            arrayTurnos[i].horaEgreso = getHoursStr(to);
            arrayTurnos[i].fechaEgreso = getDateStr(to);
          }
          if ($("#sel-eli-turno-"+i).text()!=""){
            oldData.motive = $("#sel-eli-turno-"+i+" option:selected").text();
          } else {
            oldData.motive = $("#sel-red-horas-"+i+" option:selected").text();
          }
          if(comment!=""){
            oldData.comment = $("#comment-"+i).val();
          }
          oldData.idOper = "1";
          arrayTurnos[i].oldData = oldData;
          arrayTurnos[i].estado = "mod";
          arrayTurnos[i].changed = true;

        } else {
          errorMessage=true;
          document.getElementById("icon-informe-"+i).className = "fas fa-angle-double-down open";
          $("#mostrarInforme-"+i).show(300);
          $("#variacion-horas-"+i).hide(300);
          $("#penalizacionHora-"+i).hide(300);
          $("#penalizacionTurno-"+i).show(300);
          $("#penalizacionTurno-"+i).addClass("has-error");
          $("#penalizacionTurno-"+i+" span").show(300);
        }

      } else {
        // Reduccion de Horas
        if( $("#sel-red-horas-"+i).val() != 0) {

        if(oldFrom!=from){
          arrayTurnos[i].horaIngreso = getHoursStr(from);
          arrayTurnos[i].fechaIngreso = getDateStr(from);
        }
        if(oldTo!=to){
          arrayTurnos[i].horaEgreso = getHoursStr(to);
          arrayTurnos[i].fechaEgreso = getDateStr(to);
        }
        oldData.motive = $("#sel-red-horas-"+i+" option:selected").text();
        if(comment!=""){
          oldData.comment = $("#comment-"+i).val();
        }
        oldData.idOper = "1";
        arrayTurnos[i].oldData = oldData;
        arrayTurnos[i].estado = "mod";
        arrayTurnos[i].changed = true;

        } else {
          errorMessage=true;
          document.getElementById("icon-informe-"+i).className = "fas fa-angle-double-down open";
          $("#mostrarInforme-"+i).show(300);
          $("#variacion-horas-"+i).hide(300);
          $("#penalizacionHora-"+i).show(300);
          $("#penalizacionTurno-"+i).hide(300);
          $("#penalizacionHora-"+i).addClass("has-error");
          $("#penalizacionHora-"+i+" span").show(300);
        }

      }

    }

  } // End For

  if (errorMessage){
    Swal.fire({
      icon: 'error',
      title: 'Falta completar motivos',
      text: 'Por favor complete los motivos faltantes',
    })
    $("#guardar-cambios-detalle-"+idCell).attr("disabled", false);
  } else {
    loaderStateCubrimiento();
    procesarCambiosDetalle(idCliente,idObjetivo,idDia,arrayTurnos)
    .then(function(){
      recargarTabla(idTable);
      cargarCobertura(idCliente,idObjetivo,primerDiaGlobal,ultimoDiaGlobal,idTable);
      cargarCubrimiento(idCliente,idObjetivo,primerDiaGlobal,ultimoDiaGlobal,idTable);
      Swal.fire({
        icon: 'success',
        title: 'Cambios guardados correctamente',
        showConfirmButton: false,
        timer: 1500
      })
      clearOptionsFast("modal-body-detalle");
      clearOptionsFast("menu-detalle");
      clearOptionsFast("modal-footer-detalle");
      $("#nombreDetalleDia").text("");
      $("#detalle-dia").modal("hide");
      loaderStateFinishCubrimiento();
      $("#guardar-cambios-detalle-"+idCell).attr("disabled", false);
    })
    .catch(function(err){
      console.log(err);
      $("#guardar-cambios-detalle-"+idCell).attr("disabled", false);
      loaderStateFinishCubrimiento();
    })

  }

}

function procesarCambiosDetalle(idCliente,idObjetivo,idDia,arrayTurnos){

  return new Promise(function(resolve,reject){

    arrayTurnos.forEach(function(turno){

      if(turno.delete){
        if(turno.arrayId != undefined){
          eliminarArrayId(idCliente,idObjetivo,idDia,turno)
          .then(function(){
            eliminarTurnoDB(idCliente,idObjetivo,idDia,turno,turno.idTurno)
            .then(function(){
              resolve();
            });
          })
        } else {
          eliminarTurnoDB(idCliente,idObjetivo,idDia,turno,turno.idTurno)
          .then(function(){
            resolve();
          });
        }
      } else if (turno.count > 1){
        cargarTurnoDB(idCliente,idObjetivo,idDia,turno)
        .then(function(turno){
          eliminarArrayId(idCliente,idObjetivo,idDia,turno)
          .then(function(){
            resolve();
          })
        })
      } else if (turno.changed){
        cargarTurnoMod(idCliente,idObjetivo,idDia,turno)
        .then(function(){
          resolve();
        });
      } else {
        resolve();
      }

    });

  });

}

function eliminarArrayId(idCliente,idObjetivo,idDia,turno){

  return new Promise(function(resolve,reject){

    let promises = [];

    turno.arrayId.forEach(function(idTurno){
      promises.push( eliminarTurnoDB(idCliente,idObjetivo,idDia,turno,idTurno) );
    });

    Promise.all(promises)
    .then(function(){
      resolve();
    })
    .catch(function(){
      reject();
    })

  });

}

function recargarTabla(idTable){

  return new Promise(function(resolve,reject){

  let primerDia = primerDiaGlobal;
  let ultimoDia = ultimoDiaGlobal;

  clearOptionsFast("table-"+idTable);

  let fechaGT = new Date(primerDia.getTime());

  let cantidadColumnasFijas=3;
  let cantidadDias=cantidadDeDias(primerDia,ultimoDia);
  let tamanioTabla=cantidadDias+cantidadColumnasFijas;

  // Obtener la referencia del elemento table
  let tabla = document.getElementById("table-"+idTable);

  // Crea los elementos que componen el <table>
  let tblHead = document.createElement("thead");
  let tblBody = document.createElement("tbody");
  let tblFoot = document.createElement("tfoot");
  tblHead.setAttribute("id", "tHead");
  tblBody.setAttribute("id", "tBody-"+idTable);
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
     columnas[0].innerHTML='<a style="cursor:pointer;" class="text-nowrap" >Legajo<i class="fas fa-arrows-alt-v sort-icon" ></i></a>';
     columnas[0].style.textAlign = "center";
     columnas[0].style.verticalAlign = "middle";
     columnas[0].rowSpan="2";
     columnas[0].style.padding = "6px";
     columnas[0].setAttribute('onclick', 'sortTable(0,"int","tBody-'+idTable+'")');
     columnas[1].innerHTML='<a style="cursor:pointer;" class="text-nowrap" >Nombre y Apellido<i class="fas fa-arrows-alt-v sort-icon" ></i></a>';
     columnas[1].style.textAlign = "center";
     columnas[1].style.verticalAlign = "middle";
     columnas[1].rowSpan="2";
     columnas[1].style.padding = "6px";
     columnas[1].setAttribute('onclick', 'sortTable(1,"str","tBody-'+idTable+'")' );
     columnas[tamanioTabla-1].textContent="Total Hs";
     columnas[tamanioTabla-1].style.textAlign = "center";
     columnas[tamanioTabla-1].style.verticalAlign = "middle";
     columnas[tamanioTabla-1].rowSpan="2";
     columnas[tamanioTabla-1].style.padding ="6px";

    // agrega la hilera al final de la tabla (al final del elemento tblbody)
    tblHead.appendChild(hilera);
  }

  // Crea las celdas del thead DIAS DE LA SEMANA
  fechaGT = new Date(primerDia.getTime()); // Se reinician la fecha a la inicial
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
  fechaGT = new Date(primerDia.getTime()); // Se reinicia la fecha a la inicial
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
  fechaGT = new Date(primerDia.getTime()); // Se reinicia la fecha a la inicial
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
  fechaGT = new Date(primerDia.getTime()); // Se reinicia la fecha a la inicial
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

  resolve();

  });

}

function cargarTurnoMod(idCliente,idObjetivo,idDia,turno){

  return new Promise(function(resolve,reject){

    let nuevoTurno = {
      idPersonal: turno.idPersonal,
      nombrePuesto: turno.nombrePuesto,
      fechaPuesto: turno.fechaPuesto,
      fechaIngreso: turno.fechaIngreso,
      fechaEgreso: turno.fechaEgreso,
      turnoNoche: turno.turnoNoche,
      ingresoPuesto: turno.ingresoPuesto,
      egresoPuesto: turno.egresoPuesto,
      horaIngreso: turno.horaIngreso,
      horaEgreso: turno.horaEgreso,
      horasTurno: turno.horasTurno,
      imagePath: turno.imagePath,
      estado: turno.estado,
    }

    if(turno.oldData!=undefined){
      nuevoTurno.oldData = turno.oldData;
    }

    if(turno.idTurno==undefined){

      db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
      .doc(idDia).collection("puestos").where("idPersonal","==",turno.idPersonal)
      .get()
      .then(function(querySnapshot){
        if(querySnapshot.empty){
          console.log("No se encontro el idPersonal");
          reject();
        } else {
           querySnapshot.forEach(function(doc) {
             if(turno.imagePath==doc.data().imagePath){
                doc.ref.set(nuevoTurno);
                console.log("Turno modificado correctamente");
                resolve();
             }
           });
         }
      })
      .catch(function(error) {
          console.error("Error delete document: ", error);
          reject();
      });

    } else {
      db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
      .doc(idDia).collection("puestos").doc(turno.idTurno)
      .set(nuevoTurno)
      .then(function(doc) {
        console.log("Turno cargado con exito");
        resolve();
      }).catch(function(error) {
        console.error("Error added document: ", error);
        reject();
      });
    }
  });

}

function cargarTurnoDB(idCliente,idObjetivo,idDia,turno){

  return new Promise(function(resolve,reject){
    let imagePathNuevo = idCliente+"/"+idObjetivo+"/CAPTURAS/"+turno.fechaPuesto+"/";
    let nuevoTurno = {
      idPersonal: turno.idPersonal,
      nombrePuesto: turno.nombrePuesto,
      fechaPuesto: turno.fechaPuesto,
      fechaIngreso: turno.fechaIngreso,
      fechaEgreso: turno.fechaEgreso,
      turnoNoche: turno.turnoNoche,
      ingresoPuesto: turno.ingresoPuesto,
      egresoPuesto: turno.egresoPuesto,
      horaIngreso: turno.horaIngreso,
      horaEgreso: turno.horaEgreso,
      horasTurno: turno.horasTurno,
      estado: turno.estado,
    }

    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
    .doc(idDia).collection("puestos")
    .add(nuevoTurno)
    .then(function(doc) {
        imagePathNuevo = imagePathNuevo+doc.id+"/";
        db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
        .doc(idDia).collection("puestos").doc(doc.id)
        .set({ imagePath : imagePathNuevo }, { merge: true })
        .then(function(doc) {

          let promises = [];
           promises.push( moveFirebaseFile(turno.imagePathIngreso, imagePathNuevo+turno.idPersonal+"_INGRESO.jpg") );
           promises.push( moveFirebaseFile(turno.imagePathEgreso, imagePathNuevo+turno.idPersonal+"_EGRESO.jpg") );
           Promise.all(promises)
           .then(function() {
             resolve(turno);
           })
           .catch(function(error) {
             console.log("Error al querer mover las imagenes",error);
             reject();
           });

        })
        .catch(function(error) {
            console.error("Error setted document: ", error);
            reject(error)
        });
    }).catch(function(error) {
        console.error("Error added document: ", error);
        reject(error);
    });
  });

}

function eliminarTurnoDB(idCliente,idObjetivo,idDia,turno,idTurno){

  return new Promise(function(resolve,reject){

    if(idTurno==undefined){

      let imagePathEliminar = idCliente+"/"+idObjetivo+"/CAPTURAS/"+turno.fechaPuesto+"/";

      db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
      .doc(idDia).collection("puestos").where("idPersonal","==",turno.idPersonal)
      .get()
      .then(function(querySnapshot){
        if(querySnapshot.empty){
          console.log("No se encontro el idPersonal");
          reject();
        } else {
           querySnapshot.forEach(function(doc) {
             doc.ref.delete();
             deleteFolderContents(imagePathEliminar+doc.id);
             resolve();
           });
         }
      })
      .catch(function(error) {
          console.error("Error delete document: ", error);
          reject();
      });

    } else {
      let imagePathEliminar = idCliente+"/"+idObjetivo+"/CAPTURAS/"+turno.fechaPuesto+"/"+idTurno;
      db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
      .doc(idDia).collection("puestos").doc(idTurno)
      .delete()
      .then(function() {
          deleteFolderContents(imagePathEliminar);
          console.log("Document successfully deleted!");
          resolve();
      }).catch(function(error) {
          console.error("Error removing document: ", error);
          reject()
      });

    }
  });

}

function mostrarTurnosProcesados(idCliente,idObjetivo,idDia,arrayTurnosMod,variosPuestos,idCell,idTable){

  console.log("Array a Unificados");
  console.log(arrayTurnosMod);

  clearOptionsFast("modal-body-detalle");
  clearOptionsFast("menu-detalle");
  clearOptionsFast("modal-footer-detalle");
  $("#nombreDetalleDia").text("");

  if(variosPuestos==false){
    cargarNombrePersonal(arrayTurnosMod[0].idPersonal,"nombreDetalleDia");
    cargarFuncionesModal(idCliente,idObjetivo,idDia,idCell,arrayTurnosMod,idTable);
    generarPanel(arrayTurnosMod[0],"0");
  } else {
    cargarNombrePersonal(arrayTurnosMod[0].idPersonal,"nombreDetalleDia");
    let idPanel=0;
    arrayTurnosMod.forEach(function(turno) {
      generarPanel(turno,idPanel);
      idPanel++;
    });
    cargarFuncionesModal(idCliente,idObjetivo,idDia,idCell,arrayTurnosMod,idTable);
  }
}

////////////////////////////////////////////////////////////////////////////////
// END FUNCIONES MODAL DETALLE DIA
////////////////////////////////////////////////////////////////////////////////

function cargarImagen(imagePath,idImage){
  let imageRef = storageRef.child(imagePath);
  imageRef.getDownloadURL()
  .then(function(url) {
    $("#"+idImage).css("background", "url("+url+")");
    $("#"+idImage).css("background-size", "cover");
  }).catch(function(error) {
    // console.log("Error al cargar imagen",error);
    $("#"+idImage).css("background", "url(/assets/img/sin-foto.png)");
    $("#"+idImage).css("background-size", "cover");
  });
}

function moveFirebaseFile(currentPath, destinationPath) {
  return new Promise(function(resolve,reject){
    let oldRef = storageRef.child(currentPath);
    let newRef = storageRef.child(destinationPath);
    // This can be downloaded directly:
    oldRef.getDownloadURL()
    .then(function(url) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function(event) {
        var blob = xhr.response;
        blob = blob.slice(0, blob.size, "image/jpeg")
        newRef.put(blob).then(function(snapshot) {
        console.log('Imagen movida correctamente');
        resolve();
        });
      };
      xhr.open('GET', url);
      xhr.send();

      // Or inserted into an <img> element:
      // var img = document.getElementById('imagen-prueba');
      // img.src = url;
    })
    .catch(function(error){
      console.log('Error moving File');
      reject();
    })
  });
}

function deleteFolderContents(pathDelete) {
  const ref = firebase.storage().ref(pathDelete);
  ref.listAll()
    .then(dir => {
      dir.items.forEach(fileRef => {
        this.deleteFile(ref.fullPath, fileRef.name);
      });
      dir.prefixes.forEach(folderRef => {
        this.deleteFolderContents(folderRef.fullPath);
      })
    })
    .catch(error => {
      console.log(error);
    });
}

function deleteFile(pathToFile, fileName) {
  const ref = firebase.storage().ref(pathToFile);
  const childRef = ref.child(fileName);
  childRef.delete();
}

function getHoursStr(date){
  return addZero(date.getHours())+":"+addZero(date.getMinutes());
}

function getDateStr(date){
  return date.getFullYear()+"-"+addZero(date.getMonth()+1)+"-"+addZero(date.getDate());
}

function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function vaciarTabla(idTable){
  var elmtTable = document.getElementById("tBody-"+idTable);
  var tableRows = elmtTable.getElementsByTagName('tr');
  var rowCount = tableRows.length;

  for (var x=rowCount-1; x>=0; x--) {
        elmtTable.removeChild(tableRows[x]);
  }
}
