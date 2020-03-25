
function generarTablaAsistencia() {

  //Funcion de Prueba
  //copiarDocumento();

  let tamanioTabla=8;

  // // Obtener la referencia del elemento body
  let tabla = document.getElementsByTagName("table")[0];

  let tblHead = document.createElement("thead");
  let tblBody = document.createElement("tbody");
  let tblFoot = document.createElement("tfoot");
  tblHead.setAttribute("id", "tHead");
  tblBody.setAttribute("id", "tBody");
  tblFoot.setAttribute("id", "tFoot");

    // Crea la fila de la thead
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

      celda.appendChild(textoCelda);
      hilera.appendChild(celda);
    }

    //Asignar valores iniciales
    let columnas=hilera.querySelectorAll("th");
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

     columnas[3].textContent="Fecha Puesto";
     columnas[3].style.textAlign = "center";
     columnas[3].style.verticalAlign = "middle";
     columnas[3].style.padding = "3px";

     columnas[4].textContent="Hora Ingreso";
     columnas[4].style.textAlign = "center";
     columnas[4].style.verticalAlign = "middle";
     columnas[4].style.padding = "3px";
     columnas[4].setAttribute("id", "tipoHora");

     columnas[5].textContent="Hora Registrada";
     columnas[5].style.textAlign = "center";
     columnas[5].style.verticalAlign = "middle";
     columnas[5].style.padding = "3px";

     columnas[6].textContent="Personal";
     columnas[6].style.textAlign = "center";
     columnas[6].style.verticalAlign = "middle";
     columnas[6].style.padding = "3px";

     columnas[7].textContent="Estado";
     columnas[7].style.textAlign = "center";
     columnas[7].style.verticalAlign = "middle";
     columnas[7].style.padding = "3px";

    // agrega la hilera al final de la tabla (al final del elemento tblbody)
    tblHead.appendChild(hilera);

  // posiciona el <tbody> debajo del elemento <table>
  tabla.appendChild(tblHead);
  tabla.appendChild(tblBody);
  // tabla.appendChild(tblFoot);
}

function cargarPuestosAsistencia(){

  limpiarTabla();

  if(validarFormulario2()){

    bloquearBoton();

    let nombreCliente = document.getElementById("selectClientes2").value;
    let nombreObjetivo = document.getElementById("selectObjetivos2").value;

    let idCliente="";
    let idObjetivo="";

    if(nombreCliente=="Todos"){

      db.collection("clientes").where("vigente","==",true)
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
              cargarAsistenciaObjetivos(doc.data().nombreCliente,doc.id);
              //Se tuvo que armar una funcion por afuera del querySnapshot porque al nombre cliente, se le insertaba otro distinto al que correspondia
              //sin coincidir por la velocidad de las busquedas asincronicas
            });
        });

    } else {

      db.collection("clientes").where("nombreCliente","==",nombreCliente)
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
              idCliente=doc.id;
              nombreCliente=doc.data().nombreCliente;

              if(nombreObjetivo=="Todos"){

                db.collection("clientes").doc(idCliente).collection("objetivos").where("vigente","==",true)
                .get()
                .then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                      cargarAsistencia(nombreCliente,doc.data().nombreObjetivo,idCliente,doc.id);
                    });
                });

              } else {

                db.collection("clientes").doc(idCliente).collection("objetivos").where("nombreObjetivo","==",nombreObjetivo)
                .get()
                .then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                      cargarAsistencia(nombreCliente,nombreObjetivo,idCliente,doc.id);
                    });
                });
              }
            });
        });
    }

} else {
  desbloquearBoton();
}

desbloquearBoton();

}

function cargarAsistencia(nombreCliente,nombreObjetivo,idCliente,idObjetivo){

  let numeroDia = 6; // 06 - Sabado
  let numeroDiaAnterior = restarNumeroDia(numeroDia);
  let fechaActual = new Date(2020,2,14);
  let fechaAyer = fechaAyerDate(fechaActual);
  let horaActual = new Date(2020,2,14,13,20,20);

  let horaDesde = $("#datetimepicker1").find("input").val();
  let horaHasta = $("#datetimepicker2").find("input").val();
  let ingresosChecked = $("input[name=radio-group]:checked").val();

  let idEsquema="";
  let idFechaTemporal="";


//BUSQUEDA DE PUESTOS COMUNES DEL ESQUEMA "VIGENTE"
db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
.where("vigente","==",true)
.get()
.then(function(querySnapshot) {
    if (querySnapshot.empty) {
      // Si NO hay esquema vigente ingresa aca y no hace nada
    } else {
      // Si hay esquema vigente ingresa aca
      querySnapshot.forEach(function(doc) {
        //Antes de recorrer el esquema verifico que el mismo este vigente
        if(fechaEsquemaVigente(doc.data().fechaHastaTime)){
          idEsquema=doc.id;
          let fechaDesdeEsquema=doc.data().fechaDesdeTime.toDate();
          let fechaHastaEsquema=doc.data().fechaHastaTime.toDate();

          // Busco el numero de dia dentro del esquema
            db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento").doc(idEsquema)
            .collection("esquema").where("documentData.numeroDia","==",numeroDia)
              .get()
              .then(function(querySnapshot) {
                if (querySnapshot.empty) {
                  // Si NO hay un dia dentro del esquema entra aca
                } else {
                  querySnapshot.forEach(function(doc) {
                    let docObject = doc.data();
                    for (var fieldName in docObject) {
                      if (fieldName=="documentData"){
                      }else {
                        let dia = docObject[fieldName];
                        if(ingresosChecked=="ingreso"){ // Si se chequea ingresos ingresa aca
                          if(dentroRangoHoras(dia.ingresoPuesto,horaDesde,horaHasta)){
                            cargarCoberturaIngresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaActual,dia.nombrePuesto,dia.nombreTurno,dia.ingresoPuesto,horaActual);
                          }
                        }else if(ingresosChecked=="egreso"){
                          // Si esta dentro del rango de horas y no es turno noche ingresa aca
                          if(dentroRangoHoras(dia.egresoPuesto,horaDesde,horaHasta) && dia.turnoNoche!=true){
                            cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaActual,dia.nombrePuesto,dia.nombreTurno,dia.egresoPuesto,horaActual);
                          }
                        }

                      }
                    }
                  });
                }
              });

          // Busco el numero de dia anterior dentro del esquema si ingresosCheked igual a egresos
            if(ingresosChecked=="egreso"){
              if(fechaDentroEsquema(fechaAyer,fechaDesdeEsquema,fechaHastaEsquema)){
                //Si la fecha de Ayer esta dentro del esquema vigente busco solamente los turnos nocturnos
                db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento").doc(idEsquema)
                .collection("esquema").where("documentData.numeroDia","==",numeroDiaAnterior).where("documentData.turnoNoche","==",true)
                .get()
                .then(function(querySnapshot) {
                  if (querySnapshot.empty) {
                    // Si NO hay un dia dentro del esquema entra aca
                  } else {
                    querySnapshot.forEach(function(doc) {
                      let docObject = doc.data();
                      for (var fieldName in docObject) {
                        if (fieldName=="documentData"){
                        } else {
                          let dia = docObject[fieldName];
                            // Si esta dentro del rango de horas y es turno noche ingresa aca
                            if(dentroRangoHoras(dia.egresoPuesto,horaDesde,horaHasta) && dia.turnoNoche==true){
                              cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaAyer,dia.nombrePuesto,dia.nombreTurno,dia.egresoPuesto,horaActual);
                            }
                        }
                      }
                    });
                  }
                });
              } else {
                // Si la fecha del dia anterior no esta dentro del esquema vigente
                // entonces tengo que buscar la fecha en otro esquema
                let idEsquemaAnterior="";
                db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
                .where("fechaHastaTime","==",fechaAyer)
                .get()
                .then(function(querySnapshot) {
                  if(querySnapshot.empty){
                    // Si no la encuentra es poque la fecha de ayer no esta en ningun esquema
                  } else {
                    querySnapshot.forEach(function(doc) {
                      // Busco el numero de dia dentro del esquema
                      idEsquemaAnterior=doc.id;
                        db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento").doc(idEsquemaAnterior)
                        .collection("esquema").where("documentData.numeroDia","==",numeroDiaAnterior).where("documentData.turnoNoche","==",true)
                          .get()
                          .then(function(querySnapshot) {
                            if (querySnapshot.empty) {
                              // Si NO hay un dia dentro del esquema entra aca
                            } else {
                              querySnapshot.forEach(function(doc) {
                                let docObject = doc.data();
                                for (var fieldName in docObject) {
                                  if (fieldName=="documentData"){
                                  } else {
                                    let dia = docObject[fieldName];
                                      // Si esta dentro del rango de horas y no es turno noche ingresa aca
                                      if(dentroRangoHoras(dia.egresoPuesto,horaDesde,horaHasta) && dia.turnoNoche==true){
                                        cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaAyer,dia.nombrePuesto,dia.nombreTurno,dia.egresoPuesto,horaActual);
                                      }
                                  }
                                }
                              });
                            }
                          });
                    });

                  }

                });

              }

            }


        } else {
          // Si el esquema no esta vigente entonces modifico el estado
          // y muestro en pantalla que no hay esquema vigente
          console.log("El esquema del Objetivo seleccionado no esta vigente");
        }
      });
    }
    $("#panelResultado").show(); // Mostrar mensaje si NO hay resultados
    desbloquearBoton();
  }).catch(function(error) {
      console.log("Error getting document:", error);
  }); // FIN DE BUSQUEDA DE PUESTOS COMUNES DEL ESQUEMA "VIGENTE"

  //BUSQUEDA DE PUESTOS ESPECIALES O TEMPORALES PARA LA FECHA SELECCIONADA
  db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("temporales")
  .where("documentData.fecha",">=",fechaAyer).where("documentData.fecha","<=",fechaActual)
  .get()
  .then(function(querySnapshot) {
      if (querySnapshot.empty) {
        // Si NO hay puesto especial ingresa aca
      } else {
        // Si hay puesto especial ingresa aca
        querySnapshot.forEach(function(doc) {
          idFechaTemporal=doc.id;
             db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("temporales")
              .doc(idFechaTemporal)
              .get()
              .then(function(doc) {
                  let docObject = doc.data();
                  let docFecha = (doc.data().documentData.fecha).toDate();
                  for (var fieldName in docObject) {
                    if (fieldName=="documentData"){
                    }else {
                      let dia = docObject[fieldName];
                      if(ingresosChecked=="ingreso" && docFecha.getTime()==fechaActual.getTime()){
                        if(dentroRangoHoras(dia.ingresoPuesto,horaDesde,horaHasta)){
                          cargarCoberturaIngresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,docFecha,dia.nombrePuesto,dia.nombreTurno,dia.ingresoPuesto,horaActual);
                        }
                      }else if (ingresosChecked=="egreso"){
                        if (docFecha.getTime()==fechaActual.getTime()) {
                        	if(dentroRangoHoras(dia.egresoPuesto,horaDesde,horaHasta) && dia.turnoNoche!=true){ // Cargo todos los turnos que no sean turno noche
                            cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,docFecha,dia.nombrePuesto,dia.nombreTurno,dia.egresoPuesto,horaActual);
                        	}
                        } else if (docFecha.getTime()==fechaAyer.getTime()) {
                        	if(dentroRangoHoras(dia.egresoPuesto,horaDesde,horaHasta) && dia.turnoNoche==true){ // Cargo solamente los turnos noche del dia anterior
                            cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,docFecha,dia.nombrePuesto,dia.nombreTurno,dia.egresoPuesto,horaActual);
                        	}
                        }
                      }
                    }
                  }
              });
        });
      }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    }); // FIN DE BUSQUEDA DE PUESTOS ESPECIALES O TEMPORALES PARA LA FECHA SELECCIONADA

}

function cargarAsistenciaObjetivos(nombreCliente,idCliente){
  db.collection("clientes").doc(idCliente).collection("objetivos").where("vigente","==",true)
  .get()
  .then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        //let idObjetivo=doc.id;
        //let nombreObjetivo=doc.data().nombreObjetivo;
        cargarAsistencia(nombreCliente,doc.data().nombreObjetivo,idCliente,doc.id);
      });
  });
}

function cargarCoberturaIngresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaActual,nombrePuesto,nombreTurno,ingresoPuesto,horaActual){

document.getElementById("tipoHora").innerHTML = "Hora Ingreso";

db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
.where("fecha","==",fechaActual)
.get()
.then(function(querySnapshot) {
    if (querySnapshot.empty) {
      // Si NO hay un puesto cargado para esta fecha
      cargarTurnoAsistenciaIngresosVacio(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,ingresoPuesto,fechaActual,horaActual);
    } else {
      // Si hay un puesto para esa fecha
      querySnapshot.forEach(function(doc) {
        let idFecha=doc.id;
        db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura").doc(idFecha).collection("puestos")
        .where("nombrePuesto","==",nombrePuesto).where("ingresoPuesto","==",ingresoPuesto)
        .get()
        .then(function(querySnapshot) {
            if (querySnapshot.empty) {
              // Si NO hay un puesto cargado que coincida con el nombrePuesto e ingresoPuesto
              cargarTurnoAsistenciaIngresosVacio(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,ingresoPuesto,fechaActual,horaActual);
            } else {
              // Si hay un puesto cargado que coincida con el nombrePuesto e ingresoPuesto recorro el resultado
              querySnapshot.forEach(function(doc) {
                let idPersonal=doc.data().idPersonal;
                let horaIngreso=doc.data().horaIngreso;

                let fechaIngreso=doc.data().fechaIngreso; // VER DE UNIFICAR POR OBJETO DATE
                let fechaPuesto=doc.data().fechaPuesto; // VER DE UNIFICAR POR OBJETO DATE

                db.collection("users")
                .where("idPersonal","==",idPersonal)
                .get()
                .then(function(querySnapshot) {
                    if (querySnapshot.empty) {
                      // Si NO se encuentra el usuario se procede a la carga del turno con el nombre vacio
                      cargarTurnoAsistenciaIngresos(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,ingresoPuesto,horaIngreso,"",fechaIngreso,fechaPuesto);
                    } else {
                      //Si se encuentra el nombre se procede a la carga completa del turno
                      querySnapshot.forEach(function(doc) {
                        cargarTurnoAsistenciaIngresos(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,ingresoPuesto,horaIngreso,doc.data().nombre,fechaIngreso,fechaPuesto);
                      });
                    }
                });
              });
            }
          }).catch(function(error) {
              console.log("Error al obtener una fecha de cobertura:", error);
          });
      });
    }
  }).catch(function(error) {
      console.log("Error al obtener una fecha de cobertura:", error);
  });
}

function cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaActual,nombrePuesto,nombreTurno,egresoPuesto,horaActual){

document.getElementById("tipoHora").innerHTML = "Hora Egreso";

db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
.where("fecha","==",fechaActual)
.get()
.then(function(querySnapshot) {
    if (querySnapshot.empty) {
      // Si NO hay ningun puesto cargado para esta fecha
      cargarTurnoAsistenciaEgresosVacio(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,egresoPuesto,fechaActual);
    } else {
      // Si hay un puesto para esa fecha
      querySnapshot.forEach(function(doc) {
        let idFecha=doc.id;
        db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura").doc(idFecha).collection("puestos")
        .where("nombrePuesto","==",nombrePuesto).where("egresoPuesto","==",egresoPuesto)
        .get()
        .then(function(querySnapshot) {
            if (querySnapshot.empty) {
              // Si NO hay un puesto cargado que coincida con el nombrePuesto y egresoPuesto
              cargarTurnoAsistenciaEgresosVacio(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,egresoPuesto,fechaActual);
            } else {
              // Si hay un puesto cargado que coincida con el nombrePuesto y egresoPuesto recorro el resultado
              querySnapshot.forEach(function(doc) {

                let idPersonal=doc.data().idPersonal;
                let horaEgreso=doc.data().horaEgreso;
                let fechaEgreso=doc.data().fechaEgreso; // VER DE UNIFICAR POR OBJETO DATE
                let fechaPuesto=doc.data().fechaPuesto; // VER DE UNIFICAR POR OBJETO DATE
                let turnoNoche=doc.data().turnoNoche;

                //Busqueda de nombre segun idPersonal
                db.collection("users")
                .where("idPersonal","==",idPersonal)
                .get()
                .then(function(querySnapshot) {
                    if (querySnapshot.empty) {
                      // Si NO se encuentra el usuario se procede a la carga del turno con el nombre vacio
                      cargarTurnoAsistenciaEgresos(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,egresoPuesto,horaEgreso,"Sin Identificar",fechaEgreso,fechaPuesto,horaActual,turnoNoche);
                    } else {
                      //Si se encuentra el nombre se procede a la carga completa del turno
                      querySnapshot.forEach(function(doc) {
                        cargarTurnoAsistenciaEgresos(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,egresoPuesto,horaEgreso,doc.data().nombre,fechaEgreso,fechaPuesto,horaActual,turnoNoche);
                      });
                    }
                });
              });
            }
          }).catch(function(error) {
              console.log("Error al obtener una fecha de cobertura:", error);
          });
      });
    }
  }).catch(function(error) {
      console.log("Error al obtener una fecha de cobertura:", error);
  });
}

function cargarTurnoAsistenciaIngresos(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,ingresoPuesto,horaIngreso,nombre,fechaIngreso,fechaPuesto){

  let horaIngresoDate = new Date( Date.parse(fechaIngreso+"T"+horaIngreso+":00") );
  let ingresoPuestoDate = new Date( Date.parse(fechaPuesto+"T"+ingresoPuesto+":00") );
  let horaRegistrada = componerHorasDate(ingresoParametrizado(ingresoPuestoDate,horaIngresoDate));
  let estado="Cubierto";
  let cantidadColumnasFijas=8;
  let tamanioTabla=cantidadColumnasFijas;
  let options = {year: "numeric", month: "numeric", day: "numeric"};

  if(horaIngresoDate>ingresoPuestoDate){
    estado="Cubierto Tarde";
  }

  let tBody = document.getElementById("tBody");
  let row = tBody.insertRow();

  //Rellenar con celdas vacias la fila
  for (var i = 0; i < tamanioTabla; i++) {
    let celda = row.insertCell();
  }

  //Asignar valores iniciales
  var columnas=row.querySelectorAll("td");
   columnas[0].textContent=nombreCliente;
   columnas[0].style.textAlign = "center";
   columnas[1].textContent=nombreObjetivo;
   columnas[1].style.textAlign = "center";
   columnas[2].textContent=nombrePuesto+" - "+nombreTurno;
   columnas[2].style.textAlign = "left";
   columnas[3].textContent=ingresoPuestoDate.toLocaleDateString("es-ES",options);
   columnas[3].style.textAlign = "center";
   columnas[4].textContent=ingresoPuesto;
   columnas[4].style.textAlign = "center";
   columnas[5].textContent=horaRegistrada;
   columnas[5].style.textAlign = "center";
   columnas[6].textContent=nombre;
   columnas[6].style.textAlign = "left";
   columnas[7].textContent=estado;
   columnas[7].style.textAlign = "center";

   if (estado=="Cubierto Tarde"){
     columnas[0].style.color="#AD1457";
     columnas[2].style.color="#AD1457";
     columnas[1].style.color="#AD1457";
     columnas[3].style.color="#AD1457";
     columnas[4].style.color="#AD1457";
     columnas[5].style.color="#AD1457";
     columnas[6].style.color="#AD1457";
     columnas[7].style.color="#AD1457";
   }

}

function cargarTurnoAsistenciaIngresosVacio(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,ingresoPuesto,fechaPuesto,horaActual){

  let estado="Descubierto";
  let cantidadColumnasFijas=8;
  let tamanioTabla=cantidadColumnasFijas;
  let options = {year: "numeric", month: "numeric", day: "numeric"};
  let ingresoPuestoDate="";

  let sepHr = ingresoPuesto.indexOf(":");
  let horas = parseInt(ingresoPuesto.substr(0,sepHr));
  let minutos = parseInt(ingresoPuesto.substr(sepHr+1,2));

  fechaPuesto.setHours(horas,minutos,0);

  if(fechaPuesto>horaActual){
    estado="No Iniciado";
  }

  let tBody = document.getElementById("tBody");
  let row = tBody.insertRow();

  //Rellenar con celdas vacias la fila
  for (var i = 0; i < tamanioTabla; i++) {
    var celda = row.insertCell();
  }

  //Asignar valores iniciales
  var columnas=row.querySelectorAll("td");
  columnas[0].textContent=nombreCliente;
  columnas[0].style.textAlign = "center";
  columnas[1].textContent=nombreObjetivo;
  columnas[1].style.textAlign = "center";
  columnas[2].textContent=nombrePuesto+" - "+nombreTurno;
  columnas[2].style.textAlign = "left";
  columnas[3].textContent=fechaPuesto.toLocaleDateString("es-ES",options);
  columnas[3].style.textAlign = "center";
  columnas[4].textContent=ingresoPuesto;
  columnas[4].style.textAlign = "center";
  columnas[5].textContent="-";
  columnas[5].style.textAlign = "center";
  columnas[6].textContent="-";
  columnas[6].style.textAlign = "left";
  columnas[7].textContent=estado;
  columnas[7].style.textAlign = "center";

   if (estado=="Descubierto"){
     columnas[0].style.color="#FF6347";
     columnas[1].style.color="#FF6347";
     columnas[2].style.color="#FF6347";
     columnas[3].style.color="#FF6347";
     columnas[4].style.color="#FF6347";
     columnas[5].style.color="#FF6347";
     columnas[6].style.color="#FF6347";
     columnas[7].style.color="#FF6347";
   }

   if (estado=="No Iniciado"){
     columnas[0].style.color="#558B2F";
     columnas[3].style.color="#558B2F";
     columnas[1].style.color="#558B2F";
     columnas[2].style.color="#558B2F";
     columnas[4].style.color="#558B2F";
     columnas[5].style.color="#558B2F";
     columnas[6].style.color="#558B2F";
     columnas[7].style.color="#558B2F";
   }
}

function cargarTurnoAsistenciaEgresos(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,egresoPuesto,horaEgreso,nombre,fechaEgreso,fechaPuesto,horaActual,turnoNoche){

  let estado="Cerrado";
  let fechaPuestoDate="";
  let horaEgresoDate = "";
  let egresoPuestoDate = "";
  let egresoParametrizadoDate = "";
  let horaRegistrada = "-";

  fechaPuestoDate=new Date( Date.parse(fechaPuesto+"T00:00:00"));

  if (turnoNoche) { //Si el puesto es turno noche
    egresoPuestoDate = new Date( Date.parse(fechaPuesto+"T"+egresoPuesto+":00"));
    egresoPuestoDate.setDate(egresoPuestoDate.getDate()+1);
  }else{
    egresoPuestoDate = new Date( Date.parse(fechaPuesto+"T"+egresoPuesto+":00") );
  }


  if(horaEgreso!=""){ // Si la hora del puesto esta cargada y no es vacia
    horaEgresoDate = new Date( Date.parse(fechaEgreso+"T"+horaEgreso+":00") ); // Ver de generar objeto Date
    egresoParametrizadoDate = egresoParametrizado(egresoPuestoDate,horaEgresoDate)
    horaRegistrada = componerHorasDate(egresoParametrizadoDate);
    if(egresoParametrizadoDate<egresoPuestoDate){
      estado="Cierre Anticipado";
    }
  } else if (horaActual>egresoPuestoDate){
    estado="No Cerrado";
  } else if(horaActual<egresoPuestoDate){
    estado="Cubriendose"
  }

  //Faltaria chequear si es turno noche que pasa

  var cantidadColumnasFijas=8;
  var tamanioTabla=cantidadColumnasFijas;

  let options = {year: "numeric", month: "numeric", day: "numeric"};

  let tBody = document.getElementById("tBody");
  let row = tBody.insertRow();

  //Rellenar con celdas vacias la fila
  for (var i = 0; i < tamanioTabla; i++) {
    let celda = row.insertCell();
  }

  //Asignar valores iniciales
  var columnas=row.querySelectorAll("td");
   columnas[0].textContent=nombreCliente;
   columnas[0].style.textAlign = "center";
   columnas[1].textContent=nombreObjetivo;
   columnas[1].style.textAlign = "center";
   columnas[2].textContent=nombrePuesto+" - "+nombreTurno;
   columnas[2].style.textAlign = "left";
   columnas[3].textContent=fechaPuestoDate.toLocaleDateString("es-ES",options);
   columnas[3].style.textAlign = "center";
   columnas[4].textContent=egresoPuesto;
   columnas[4].style.textAlign = "center";
   columnas[5].textContent=horaRegistrada;
   columnas[5].style.textAlign = "center";
   columnas[6].textContent=nombre;
   columnas[6].style.textAlign = "left";
   columnas[7].textContent=estado;
   columnas[7].style.textAlign = "center";

   if (estado=="Cierre Anticipado"){
     columnas[0].style.color="#AD1457";
     columnas[2].style.color="#AD1457";
     columnas[1].style.color="#AD1457";
     columnas[3].style.color="#AD1457";
     columnas[4].style.color="#AD1457";
     columnas[5].style.color="#AD1457";
     columnas[6].style.color="#AD1457";
     columnas[7].style.color="#AD1457";
   }

   if (estado=="No Cerrado"){
     columnas[0].style.color="#76448A";
     columnas[2].style.color="#76448A";
     columnas[1].style.color="#76448A";
     columnas[3].style.color="#76448A";
     columnas[4].style.color="#76448A";
     columnas[5].style.color="#76448A";
     columnas[6].style.color="#76448A";
     columnas[7].style.color="#76448A";
   }

   if (estado=="Cubriendose"){
     columnas[0].style.color="#558B2F";
     columnas[3].style.color="#558B2F";
     columnas[1].style.color="#558B2F";
     columnas[2].style.color="#558B2F";
     columnas[4].style.color="#558B2F";
     columnas[5].style.color="#558B2F";
     columnas[6].style.color="#558B2F";
     columnas[7].style.color="#558B2F";
   }


}

function cargarTurnoAsistenciaEgresosVacio(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,horaPuesto,fechaPuesto,tipo){

  let estado="Descubierto";

  var cantidadColumnasFijas=8;
  var tamanioTabla=cantidadColumnasFijas;

  let options = {year: "numeric", month: "numeric", day: "numeric"};

  var tBody = document.getElementById("tBody");
  var row = tBody.insertRow();

  //Rellenar con celdas vacias la fila
  for (var i = 0; i < tamanioTabla; i++) {
    var celda = row.insertCell();
  }

  //Asignar valores iniciales
  var columnas=row.querySelectorAll("td");
  columnas[0].textContent=nombreCliente;
  columnas[0].style.textAlign = "center";
  columnas[1].textContent=nombreObjetivo;
  columnas[1].style.textAlign = "center";
  columnas[2].textContent=nombrePuesto+" - "+nombreTurno;
  columnas[2].style.textAlign = "left";
  columnas[3].textContent=fechaPuesto.toLocaleDateString("es-ES",options);
  columnas[3].style.textAlign = "center";
  columnas[4].textContent=horaPuesto;
  columnas[4].style.textAlign = "center";
  columnas[5].textContent="-";
  columnas[5].style.textAlign = "center";
  columnas[6].textContent="-";
  columnas[6].style.textAlign = "left";
  columnas[7].textContent=estado;
  columnas[7].style.textAlign = "center";

   if (estado=="Descubierto"){
     columnas[0].style.color="#FF6347";
     columnas[1].style.color="#FF6347";
     columnas[2].style.color="#FF6347";
     columnas[3].style.color="#FF6347";
     columnas[4].style.color="#FF6347";
     columnas[5].style.color="#FF6347";
     columnas[6].style.color="#FF6347";
     columnas[7].style.color="#FF6347";
   }
}

function cargarBSDateTimePicker(){
  $('#datetimepicker1, #datetimepicker2').datetimepicker({
    format: 'HH:mm'
  });
}

function dentroRangoHoras(horaPuesto,horaDesde,horaHasta){
  let horaPuestoDate = new Date( Date.parse("2020-01-01T"+horaPuesto+":00") );
  let horaDesdeDate = new Date( Date.parse("2020-01-01T"+horaDesde+":00") );
  let horaHastaDate = new Date( Date.parse("2020-01-01T"+horaHasta+":00") );
  if( (horaPuestoDate.getTime() >= horaDesdeDate.getTime()) && (horaPuestoDate.getTime() <= horaHastaDate.getTime()) ){
    return true;
  } else {
    return false;
  }
}

function cargarListadoClientes2(){
  let listadoClientes = [];
  db.collection("clientes")
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
          listadoClientes.push(doc.data().nombreCliente);
      });
      cargarDesplegableClientes2(listadoClientes);
    });
}

function cargarDesplegableClientes2(listadoClientes){
  let selectClientes = document.getElementById('selectClientes2');
  selectClientes.options.add(new Option("Todos"));
  for(var i = 0; i < listadoClientes.length; i++){
    selectClientes.options.add(new Option(listadoClientes[i]));
  }
}

function cargarListadoObjetivos2(){

  let listadoObjetivos = [];
  let nombreCliente = document.getElementById("selectClientes2").value;

  if(nombreCliente=="Todos"){
    let selectObjetivos = document.getElementById("selectObjetivos2");
    clearOptionsFast("selectObjetivos2");
    selectObjetivos.options.add(new Option("Todos"));
  }else{
    db.collection("clientes").where("nombreCliente","==",nombreCliente)
      .get()
      .then(function(querySnapshot) {
        if(querySnapshot.empty){
          cargarDesplegableObjetivos2(listadoObjetivos);
        }else{
          querySnapshot.forEach(function(doc) {
            //idCliente=doc.id;
              db.collection("clientes").doc(doc.id).collection("objetivos")
              .get()
              .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                      listadoObjetivos.push(doc.data().nombreObjetivo);
                });
                cargarDesplegableObjetivos2(listadoObjetivos);
              });
          })
        }
      });
  }
}

function cargarDesplegableObjetivos2(listadoObjetivos){
  let selectObjetivos = document.getElementById("selectObjetivos2");
  if(listadoObjetivos.length==0){
    clearOptionsFast("selectObjetivos2"); //Vacio las opciones del Select
    selectObjetivos.options.add(new Option("Sin Objetivos",0)); //Cargo que no tiene Objetivos
  } else if(listadoObjetivos.length>0){
      clearOptionsFast("selectObjetivos2"); //Vacio las opciones del Select
      selectObjetivos.options.add(new Option("Seleccione un Objetivo",0));
      selectObjetivos.options.add(new Option("Todos"));
      for(var i = 0; i < listadoObjetivos.length; i++){
        selectObjetivos.options.add(new Option(listadoObjetivos[i]));
      }
    }

}

function limpiarTabla(){
  $("#panelResultado").hide();
  $("#miTabla2 tbody tr").remove();
}

function fechaAyerDate(fechaDate){
  let DIA_EN_MILISEGUNDOS = 24 * 60 * 60 * 1000;
  let ayer = new Date(fechaDate.getTime() - DIA_EN_MILISEGUNDOS);
  return ayer;
}

function bloquearBoton(){
  document.getElementById("btncargarPuestosAsistencia").disabled=true;
}

function desbloquearBoton(){
  document.getElementById("btncargarPuestosAsistencia").disabled=false;
}

function restarNumeroDia(numeroDia){
  numeroDia--;
  if(numeroDia==-1){
    numeroDia=6;
  }
  return numeroDia;
}

function fechaDentroEsquema(fechaAVerificar,fechaDesdeEsquema,fechaHastaEsquema) {
  if (fechaAVerificar.getTime()>=fechaDesdeEsquema.getTime() && fechaAVerificar.getTime()<=fechaHastaEsquema.getTime()) {
    return true; //La fecha a verificar esta dentro del esquema
  } else {
    return false;//La fecha a verificar NO esta dentro del esquema
  }
}

function validarFormulario2(){
  if($("#selectClientes2 option:selected").val() == 0) {
    $('#select-validate').modal('show');
    return false;
  }else if($("#selectObjetivos2 option:selected").val() == 0) {
      // alert("Debe seleccionar un Objetivo");
      $('#select-validate').modal('show');
      return false;
  } else {
      return true;
  }
}

//Funciones de Prueba
function copiarDocumento(){
let docACopiar="";
  db.collection("clientes").doc("DIA").collection("objetivos").doc("TIENDA 143").collection("cobertura").doc("2020-03-14").collection("puestos")
  .doc("hYBqbPU5iRKJRneGoCbh")
  .get()
  .then(function(doc){
    docACopiar = doc.data();

    db.collection("clientes").doc("DIA").collection("objetivos").doc("TIENDA 143").collection("cobertura").doc("2020-03-13").collection("puestos")
    .add(docACopiar)
    .then(function(doc){
      console.log(doc.id);
    });
  });

}

function clearOptionsFast(id){
	document.getElementById(id).innerHTML = "";
}
