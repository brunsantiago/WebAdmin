
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
     columnas[0].innerHTML='<a style="cursor:pointer;" class="text-nowrap" >Cliente<i class="fas fa-arrows-alt-v sort-icon" ></i></a>';
     columnas[0].style.textAlign = "center";
     columnas[0].style.verticalAlign = "middle";
     columnas[0].style.padding = "3px";
     columnas[0].setAttribute('onclick', 'sortTable(0,"str","tBody")');

     columnas[1].innerHTML='<a style="cursor:pointer;" class="text-nowrap" >Objetivo<i class="fas fa-arrows-alt-v sort-icon" ></i></a>';
     columnas[1].style.textAlign = "center";
     columnas[1].style.verticalAlign = "middle";
     columnas[1].style.padding = "3px";
     columnas[1].setAttribute('onclick', 'sortTable(1,"str","tBody")');

     columnas[2].innerHTML='<a style="cursor:pointer;" class="text-nowrap" >Puesto<i class="fas fa-arrows-alt-v sort-icon" ></i></a>';
     columnas[2].style.textAlign = "center";
     columnas[2].style.verticalAlign = "middle";
     columnas[2].style.padding = "3px";
     columnas[2].setAttribute('onclick', 'sortTable(2,"str","tBody")');

     columnas[3].innerHTML='<a style="cursor:pointer;" class="text-nowrap" >Fecha Puesto<i class="fas fa-arrows-alt-v sort-icon" ></i></a>';
     columnas[3].style.textAlign = "center";
     columnas[3].style.verticalAlign = "middle";
     columnas[3].style.padding = "3px";
     columnas[3].setAttribute('onclick', 'sortTable(3,"str","tBody")');

     columnas[4].innerHTML='<a style="cursor:pointer;" class="text-nowrap" >Hora Ingreso<i class="fas fa-arrows-alt-v sort-icon" ></i></a>';
     columnas[4].style.textAlign = "center";
     columnas[4].style.verticalAlign = "middle";
     columnas[4].style.padding = "3px";
     columnas[4].setAttribute("id", "tipoHora");
     columnas[4].setAttribute('onclick', 'sortTable(4,"str","tBody")');

     columnas[5].innerHTML='<a style="cursor:pointer;" class="text-nowrap" >Hora Registrada<i class="fas fa-arrows-alt-v sort-icon" ></i></a>';
     columnas[5].style.textAlign = "center";
     columnas[5].style.verticalAlign = "middle";
     columnas[5].style.padding = "3px";
     columnas[5].setAttribute('onclick', 'sortTable(5,"str","tBody")');

     columnas[6].innerHTML='<a style="cursor:pointer;" class="text-nowrap" >Personal<i class="fas fa-arrows-alt-v sort-icon" ></i></a>';
     columnas[6].style.textAlign = "center";
     columnas[6].style.verticalAlign = "middle";
     columnas[6].style.padding = "3px";
     columnas[6].setAttribute('onclick', 'sortTable(6,"str","tBody")');

     columnas[7].innerHTML='<a style="cursor:pointer;" class="text-nowrap" >Estado<i class="fas fa-arrows-alt-v sort-icon" ></i></a>';
     columnas[7].style.textAlign = "center";
     columnas[7].style.verticalAlign = "middle";
     columnas[7].style.padding = "3px";
     columnas[7].setAttribute('onclick', 'sortTable(7,"str","tBody")');

    // agrega la hilera al final de la tabla (al final del elemento tblbody)
    tblHead.appendChild(hilera);

  // posiciona el <tbody> debajo del elemento <table>
  tabla.appendChild(tblHead);
  tabla.appendChild(tblBody);
  // tabla.appendChild(tblFoot);
}

function cargarPuestosAsistencia(button){

  limpiarTabla();

  if(validarFormulario2()){

    loaderState();

    let nombreCliente = document.getElementById("selectClientes2").value;
    let nombreObjetivo = document.getElementById("selectObjetivos2").value;
    let tipoAsistencia = button.value;

    let numeroDia = 6; // 06 - Sabado
    let numeroDiaAnterior = restarNumeroDia(numeroDia);
    let fechaActual = new Date(2020,2,14,0,0,0,0); // 14/03/2020
    let fechaAyer = fechaAyerDate(fechaActual);
    let horaActual = new Date(2020,2,14,13,20,20,0);

    let horaDesde = $("#datetimepicker1").find("input").val();
    let horaHasta = $("#datetimepicker2").find("input").val();

    if(tipoAsistencia=="ingreso"){
      document.getElementById("col-opciones").className = "col-md-9";
      $("input[name='checkbox-ingreso']").prop("checked", true);
      $("#titulo-control").text("CONTROL DE INGRESOS");
      $("#visualizar-egreso").hide();
      $("#visualizar-ingreso").show();
      $("#col-referencias").show();
    } else {
      document.getElementById("col-opciones").className = "col-md-9";
      $("input[name='checkbox-egreso']").prop("checked", true);
      $("#titulo-control").text("CONTROL DE EGRESOS");
      $("#visualizar-ingreso").hide();
      $("#visualizar-egreso").show();
      $("#col-referencias").show();
    }

    let idCliente="";
    let idObjetivo="";

    var promiseAsistencia = new Promise(function(resolve,reject){

      if(nombreCliente=="Todos"){

        const promises = [];

        db.collection("clientes").where("vigente","==",true)
          .get()
          .then(function(querySnapshot) {
              querySnapshot.forEach(function(doc) {
                promises.push( cargarAsistenciaObjetivos(doc.data().nombreCliente,doc.id,fechaAyer,fechaActual,horaActual,horaDesde,horaHasta,numeroDia,tipoAsistencia) );
                //Se tuvo que armar una funcion por afuera del querySnapshot porque al nombre cliente, se le insertaba otro distinto al que correspondia
                //sin coincidir por la velocidad de las busquedas asincronicas
              });
              Promise.all(promises)
              .then(function(result) {
                resolve();
              })
              .catch(function(err) {
                reject();
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

                  const promises = [];

                  db.collection("clientes").doc(idCliente).collection("objetivos").where("vigente","==",true)
                  .get()
                  .then(function(querySnapshot) {
                      querySnapshot.forEach(function(doc) {
                        promises.push( cargarAsistencia(nombreCliente,doc.data().nombreObjetivo,idCliente,doc.id,numeroDia,fechaActual,horaActual,horaDesde,horaHasta,tipoAsistencia) );
                        promises.push( cargarAsistenciaEspeciales(idCliente,doc.id,nombreCliente,doc.data().nombreObjetivo,fechaActual,horaActual,horaDesde,horaHasta,tipoAsistencia) );
                      });
                      Promise.all(promises)
                      .then(function(result) {
                        resolve();
                      })
                      .catch(function(err) {
                        reject();
                      });
                  });

                } else {

                  const promises = [];

                  db.collection("clientes").doc(idCliente).collection("objetivos").where("nombreObjetivo","==",nombreObjetivo)
                  .get()
                  .then(function(querySnapshot) {
                      querySnapshot.forEach(function(doc) {
                        promises.push( cargarAsistencia(nombreCliente,nombreObjetivo,idCliente,doc.id,numeroDia,fechaActual,horaActual,horaDesde,horaHasta,tipoAsistencia) );
                        promises.push( cargarAsistenciaEspeciales(idCliente,doc.id,nombreCliente,nombreObjetivo,fechaActual,horaActual,horaDesde,horaHasta,tipoAsistencia) );
                      });
                      Promise.all(promises)
                      .then(function(result) {
                        resolve();
                      })
                      .catch(function(err) {
                        reject();
                      });
                  });

                }
              });
          });
      }

    });

    // Ejecuto la Promisa
    promiseAsistencia.then(function(result) {
      console.log("SE EJECUTARON TODAS LAS PROMESAS");
      loaderStateFinish();
    }, function(err) {
      console.log(err);
    });

  } //Validar Fomulario Cliente - Objetivo



}

function cargarAsistencia(nombreCliente,nombreObjetivo,idCliente,idObjetivo,numeroDia,fechaActual,horaActual,horaDesde,horaHasta,tipoAsistencia){

  return new Promise(function(resolve,reject){

  let numeroDiaAnterior = restarNumeroDia(numeroDia);
  let fechaAyer = fechaAyerDate(fechaActual);

  //BUSQUEDA DE PUESTOS COMUNES DEL ESQUEMA "VIGENTE"
  db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
  .where("estado","==","VIGENTE")
  .get()
  .then(function(querySnapshot) {
      if (querySnapshot.empty) {
        // Si NO hay esquema vigente ingresa aca y no hace nada
        resolve();
      } else {
        // Si hay esquema vigente ingresa aca
        const promises = [];
        querySnapshot.forEach(function(doc) {
          //Antes de recorrer el esquema verifico que el mismo este vigente
          if(fechaEsquemaVigente(doc.data().fechaHasta)){
            let idEsquema=doc.id;
            let fechaDesdeEsquema=doc.data().fechaDesde.toDate();
            let fechaHastaEsquema=doc.data().fechaHasta.toDate();
              // Busco el numero de dia dentro del esquema
              promises.push( cargarAsistenciaEsquema(idCliente,idObjetivo,idEsquema,numeroDia,horaDesde,horaHasta,nombreCliente,nombreObjetivo,fechaActual,horaActual,tipoAsistencia) );
              if(tipoAsistencia=="egreso"){
              // Busco el numero de dia anterior dentro del esquema si tipoAsistencia igual a egreso
              promises.push( cargarAsistenciaDiaAnterior(idCliente,idObjetivo,idEsquema,numeroDiaAnterior,horaDesde,horaHasta,nombreCliente,nombreObjetivo,fechaAyer,horaActual,fechaDesdeEsquema,fechaHastaEsquema) );
              }
            } else {
              // Si el esquema no esta vigente entonces modifico el estado
              // y muestro en pantalla que no hay esquema vigente
              console.log("El esquema del Objetivo "+doc.id+" no esta vigente");
              promises.push(reject());
            }

        });
        Promise.all(promises)
        .then(function(result) {
          resolve();
        })
        .catch(function(err) {
          reject();
        });
      }
      $("#panelResultado").show(); // Mostrar mensaje si NO hay resultados
    }).catch(function(error) {
        console.log("Error getting document:", error);
        reject();
    }); // FIN DE BUSQUEDA DE PUESTOS COMUNES DEL ESQUEMA "VIGENTE"

  });

}

function cargarAsistenciaEspeciales(idCliente,idObjetivo,nombreCliente,nombreObjetivo,fechaActual,horaActual,horaDesde,horaHasta,tipoAsistencia){

  return new Promise(function(resolve,reject){

  let fechaAyer = fechaAyerDate(fechaActual);

  //BUSQUEDA DE PUESTOS ESPECIALES O TEMPORALES PARA LA FECHA SELECCIONADA
  db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("temporales")
  .where("documentData.fecha",">=",fechaAyer).where("documentData.fecha","<=",fechaActual)
  .get()
  .then(function(querySnapshot) {
      if (querySnapshot.empty) {
        // Si NO hay puesto especial ingresa aca
        resolve();
      } else {
        // Si hay puesto especial ingresa aca
        const promises = [];

        querySnapshot.forEach(function(doc) {
          // let idFechaTemporal=doc.id;
          //    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("temporales")
          //     .doc(idFechaTemporal)
          //     .get()
          //     .then(function(doc) {
          let docObject = doc.data();
          let docFecha = (doc.data().documentData.fecha).toDate();
          for (var fieldName in docObject) {
            if (fieldName=="documentData"){
            }else {
              let dia = docObject[fieldName];
              if(tipoAsistencia=="ingreso" && docFecha.getTime()==fechaActual.getTime()){
                if(dentroRangoHoras(dia.ingresoPuesto,horaDesde,horaHasta)){
                  promises.push( cargarCoberturaIngresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,docFecha,dia.nombrePuesto,dia.nombreTurno,dia.ingresoPuesto,horaActual) );
                }
              }else if (tipoAsistencia=="egreso"){
                if (docFecha.getTime()==fechaActual.getTime()) {
                  if(dentroRangoHoras(dia.egresoPuesto,horaDesde,horaHasta) && dia.turnoNoche!=true){ // Cargo todos los turnos que no sean turno noche
                    promises.push( cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,docFecha,dia.nombrePuesto,dia.nombreTurno,dia.ingresoPuesto,dia.egresoPuesto,horaActual) );
                  }
                } else if (docFecha.getTime()==fechaAyer.getTime()) {
                  if(dentroRangoHoras(dia.egresoPuesto,horaDesde,horaHasta) && dia.turnoNoche==true){ // Cargo solamente los turnos noche del dia anterior
                    promises.push( cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,docFecha,dia.nombrePuesto,dia.nombreTurno,dia.ingresoPuesto,dia.egresoPuesto,horaActual) );
                  }
                }
              }
            }
          }
              // });
        });

        Promise.all(promises)
        .then(function(result) {
          resolve();
        })
        .catch(function(err) {
          reject();
        });

      }
    }).catch(function(error) {
        console.log("Error getting document:", error);
        reject();
    }); // FIN DE BUSQUEDA DE PUESTOS ESPECIALES O TEMPORALES PARA LA FECHA SELECCIONADA

  });

}

function cargarAsistenciaEsquema(idCliente,idObjetivo,idEsquema,numeroDia,horaDesde,horaHasta,nombreCliente,nombreObjetivo,fechaActual,horaActual,tipoAsistencia){

  return new Promise(function(resolve,reject){
    // Busco el numero de dia dentro del esquema
    console.log(idObjetivo);
    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento").doc(idEsquema)
    .collection("esquema").where("documentData.numeroDia","==",numeroDia)
      .get()
      .then(function(querySnapshot) {
        if (querySnapshot.empty) {
          // Si NO hay un dia dentro del esquema entra aca
          resolve();
        } else {
          querySnapshot.forEach(function(doc) {
            let docObject = doc.data();
            for (let fieldName in docObject) {
              if (fieldName=="documentData"){
              } else {
                let dia = docObject[fieldName];
                if(tipoAsistencia=="ingreso"){ // Si se chequea ingresos
                  if(dentroRangoHoras(dia.ingresoPuesto,horaDesde,horaHasta)){
                    cargarCoberturaIngresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaActual,dia.nombrePuesto,dia.nombreTurno,dia.ingresoPuesto,horaActual)
                    .then(function(){ resolve(); })
                    .catch(function(error){ resolve(error); });
                  }
                }else if(tipoAsistencia=="egreso"){ // Si esta dentro del rango de horas y no es turno noche
                  if(dentroRangoHoras(dia.egresoPuesto,horaDesde,horaHasta) && dia.turnoNoche!=true){
                    cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaActual,dia.nombrePuesto,dia.nombreTurno,dia.ingresoPuesto,dia.egresoPuesto,horaActual)
                    .then(function(){ resolve(); })
                    .catch(function(error){ resolve(error); });
                  }
                }
              }
            }
          });
        }
      })
      .catch(function(error){
        console.log("Error al querer obtener dia numero: "+numeroDia,error);
        reject();
      });

  });

}

function cargarAsistenciaDiaAnterior(idCliente,idObjetivo,idEsquema,numeroDiaAnterior,horaDesde,horaHasta,nombreCliente,nombreObjetivo,fechaAyer,horaActual,fechaDesdeEsquema,fechaHastaEsquema){
// Busco el numero de dia anterior dentro del esquema si ingresosCheked igual a egresos
return new Promise(function(resolve,reject){

  if(fechaDentroEsquema(fechaAyer,fechaDesdeEsquema,fechaHastaEsquema)){
    //Si la fecha de Ayer esta dentro del esquema vigente busco solamente los turnos nocturnos
    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento").doc(idEsquema)
    .collection("esquema").where("documentData.numeroDia","==",numeroDiaAnterior).where("documentData.turnoNoche","==",true)
    .get()
    .then(function(querySnapshot) {
      if (querySnapshot.empty) {
        // Si NO hay un dia dentro del esquema entra aca
        resolve();
      } else {
        querySnapshot.forEach(function(doc) {
          let docObject = doc.data();
          for (var fieldName in docObject) {
            if (fieldName=="documentData"){
            } else {
              let dia = docObject[fieldName];
                // Si esta dentro del rango de horas y es turno noche ingresa aca
                if(dentroRangoHoras(dia.egresoPuesto,horaDesde,horaHasta) && dia.turnoNoche==true){
                  cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaAyer,dia.nombrePuesto,dia.nombreTurno,dia.ingresoPuesto,dia.egresoPuesto,horaActual)
                  .then(function(){ resolve(); })
                  .catch(function(error){ resolve(error); });
                }
            }
          }
        });
      }
    });

  } else {
    // Si la fecha del dia anterior no esta dentro del esquema vigente entonces tengo que buscar la fecha en otro esquema
    let idEsquemaAnterior="";
    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
    .where("fechaHasta","==",fechaAyer)
    .get()
    .then(function(querySnapshot) {
      if(querySnapshot.empty){
        // Si no la encuentra es poque la fecha de ayer no esta en ningun esquema
        resolve();
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
                  resolve();
                } else {
                  querySnapshot.forEach(function(doc) {
                    let docObject = doc.data();
                    for (var fieldName in docObject) {
                      if (fieldName=="documentData"){
                      } else {
                        let dia = docObject[fieldName];
                          // Si esta dentro del rango de horas y no es turno noche ingresa aca
                          if(dentroRangoHoras(dia.egresoPuesto,horaDesde,horaHasta) && dia.turnoNoche==true){
                            cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaAyer,dia.nombrePuesto,dia.nombreTurno,dia.ingresoPuesto,dia.egresoPuesto,horaActual)
                            .then(function(){ resolve(); })
                            .catch(function(error){ resolve(error); });
                          }
                      }
                    }
                  });
                }
              })
              .catch(function(error) {
                  console.log("Error getting document:", error);
                  reject();
              });
        });
      }
    })
    .catch(function(error) {
        console.log("Error getting document:", error);
        reject();
    });
  }

});

}

function cargarAsistenciaObjetivos(nombreCliente,idCliente,fechaAyer,fechaActual,horaActual,horaDesde,horaHasta,numeroDia,tipoAsistencia){

  return new Promise(function(resolve, reject) {

    const promises = [];
    db.collection("clientes").doc(idCliente).collection("objetivos").where("vigente","==",true)
    .get()
    .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          promises.push( cargarAsistencia(nombreCliente,doc.data().nombreObjetivo,idCliente,doc.id,numeroDia,fechaActual,horaActual,horaDesde,horaHasta,tipoAsistencia) );
          promises.push( cargarAsistenciaEspeciales(idCliente,doc.id,nombreCliente,doc.data().nombreObjetivo,fechaActual,horaActual,horaDesde,horaHasta,tipoAsistencia) );
        });
        Promise.all(promises)
        .then(function(result) {
          resolve();
        })
        .catch(function(err) {
          reject();
        });
    });

  });

}

function cargarCoberturaIngresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaActual,nombrePuesto,nombreTurno,ingresoPuesto,horaActual){

  return new Promise(function(resolve,reject){

    document.getElementById("tipoHora").innerHTML ='<a style="cursor:pointer;" class="text-nowrap" >Hora Ingreso<i class="fas fa-arrows-alt-v sort-icon" ></i></a>';

    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
    .where("fecha","==",fechaActual)
    .get()
    .then(function(querySnapshot) {
        if (querySnapshot.empty) {
          // Si NO hay un puesto cargado para esta fecha
          cargarTurnoAsistenciaIngresosVacio(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,ingresoPuesto,fechaActual,horaActual);
          resolve();
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
                  resolve();
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
                          cargarTurnoAsistenciaIngresos(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,ingresoPuesto,horaIngreso,"Sin Identificar",fechaIngreso,fechaPuesto);
                          resolve();
                        } else {
                          //Si se encuentra el nombre se procede a la carga completa del turno
                          querySnapshot.forEach(function(doc) {
                            cargarTurnoAsistenciaIngresos(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,ingresoPuesto,horaIngreso,doc.data().nombre,fechaIngreso,fechaPuesto);
                            resolve();
                          });
                        }
                    });
                  });
                }
              }).catch(function(error) {
                  console.log("Error al obtener una fecha de cobertura:", error);
                  reject();
              });
          });
        }
      }).catch(function(error) {
          console.log("Error al obtener una fecha de cobertura:", error);
          reject();
      });
  });


}

function cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaActual,nombrePuesto,nombreTurno,ingresoPuesto,egresoPuesto,horaActual){
//fecha Actual es igual a la fecha del puesto a cargar, esta si puede variar al ingresar como parametro cuando se analiza el dia anterior fechaAyer
  return new Promise(function(resolve,reject){
    document.getElementById("tipoHora").innerHTML ='<a style="cursor:pointer;" class="text-nowrap" >Hora Egreso<i class="fas fa-arrows-alt-v sort-icon" ></i></a>';

    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
    .where("fecha","==",fechaActual)
    .get()
    .then(function(querySnapshot) {
        if (querySnapshot.empty) {
          // Si NO hay ningun puesto cargado para esta fecha
          cargarTurnoAsistenciaEgresosVacio(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,ingresoPuesto,egresoPuesto,fechaActual,horaActual);
          resolve();
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
                  cargarTurnoAsistenciaEgresosVacio(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,ingresoPuesto,egresoPuesto,fechaActual,horaActual);
                  resolve();
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
                          resolve();
                        } else {
                          //Si se encuentra el nombre se procede a la carga completa del turno
                          querySnapshot.forEach(function(doc) {
                            cargarTurnoAsistenciaEgresos(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,egresoPuesto,horaEgreso,doc.data().nombre,fechaEgreso,fechaPuesto,horaActual,turnoNoche);
                            resolve();
                          });
                        }
                    });
                  });
                }
              }).catch(function(error) {
                  console.log("Error al obtener una fecha de cobertura:", error);
                  reject();
              });
          });
        }
      }).catch(function(error) {
          console.log("Error al obtener una fecha de cobertura:", error);
          reject();
      });

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

  row.setAttribute("name", "grupo-cubierto");

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
     row.setAttribute("name", "grupo-cubierto-tarde");
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

  fechaPuesto.setHours(horas,minutos,0,0);

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
     row.setAttribute("name", "grupo-descubierto-ingreso");
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
     row.setAttribute("name", "grupo-no-iniciado-ingreso");
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

  row.setAttribute("name", "grupo-cerrado");

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
     row.setAttribute("name", "grupo-cierre-anticipado");
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
     row.setAttribute("name", "grupo-no-cerrado");
   }

   if (estado=="Cubriendose"){
     columnas[0].style.color="#3498DB";
     columnas[3].style.color="#3498DB";
     columnas[1].style.color="#3498DB";
     columnas[2].style.color="#3498DB";
     columnas[4].style.color="#3498DB";
     columnas[5].style.color="#3498DB";
     columnas[6].style.color="#3498DB";
     columnas[7].style.color="#3498DB";
     row.setAttribute("name", "grupo-cubriendose");
   }


}

function cargarTurnoAsistenciaEgresosVacio(nombreCliente,nombreObjetivo,nombrePuesto,nombreTurno,ingresoPuesto,egresoPuesto,fechaPuesto,horaActual){

  let estado="Descubierto";

  var cantidadColumnasFijas=8;
  var tamanioTabla=cantidadColumnasFijas;

  let sepHr = ingresoPuesto.indexOf(":");
  let horas = parseInt(ingresoPuesto.substr(0,sepHr));
  let minutos = parseInt(ingresoPuesto.substr(sepHr+1,2));

  let horaPuesto = (new Date(fechaPuesto.getTime()).setHours(horas,minutos,0,0));

  if(horaPuesto>horaActual){
    estado="No Iniciado";
  }

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
  columnas[4].textContent=egresoPuesto;
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
     row.setAttribute("name", "grupo-descubierto-egreso");
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
     row.setAttribute("name", "grupo-no-iniciado-egreso");
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

function listadoClientesAsistencia(){
  let listadoClientes = [];
  db.collection("clientes")
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
          listadoClientes.push(doc.data().nombreCliente);
      });
      desplegableClientesAsistencia(listadoClientes);
    });
}

function desplegableClientesAsistencia(listadoClientes){
  let selectClientes = document.getElementById('selectClientes2');
  selectClientes.options.add(new Option("Todos"));
  for(var i = 0; i < listadoClientes.length; i++){
    selectClientes.options.add(new Option(listadoClientes[i]));
  }
}

function listadoObjetivosAsistencia(){

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
          desplegableObjetivosAsistencia(listadoObjetivos);
        }else{
          querySnapshot.forEach(function(doc) {
            //idCliente=doc.id;
              db.collection("clientes").doc(doc.id).collection("objetivos")
              .get()
              .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                      listadoObjetivos.push(doc.data().nombreObjetivo);
                });
                desplegableObjetivosAsistencia(listadoObjetivos);
              });
          })
        }
      });
  }
}

function desplegableObjetivosAsistencia(listadoObjetivos){
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
  document.getElementsByName("btncargarAsistencia").disabled=true;
  loaderState();
}

function desbloquearBoton(){
  document.getElementsByName("btncargarAsistencia").disabled=false;
  loaderStateFinish();
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

function visualizarSegunTipo(){
  if($("#tipo-ingreso").is(':checked')){
    // $("input[name='checkbox-ingreso']").prop("checked", true);
    activarEstadosIngreso();
    // $("#visualizar-egreso").hide();
    // $("#visualizar-ingreso").show();
  }else if($("#tipo-egreso").is(':checked')){
    // $("input[name='checkbox-egreso']").prop("checked", true);
    activarEstadosEgreso();
    // $("#visualizar-ingreso").hide();
    // $("#visualizar-egreso").show();
  }
}

function activarEstadosIngreso(){
visualizarIngresoCubierto();
visualizarIngresoNoIniciado();
visualizarIngresoCubiertoTarde();
visualizarIngresoDescubierto();
}

function activarEstadosEgreso(){
  visualizarEgresoCerrado();
  visualizarEgresoNoIniciado();
  visualizarEgresoCierreAnticipado();
  visualizarEgresoCubriendose();
  visualizarEgresoNoCerrado();
  visualizarEgresoDescubierto();
}

function visualizarIngresoCubierto(){
  if( $("#ingreso-cubierto").is(':checked') ) {
    $("tr[name ='grupo-cubierto']").show();
  }else{
    $("tr[name ='grupo-cubierto']").hide();
  }
}

function visualizarIngresoNoIniciado(){
  if( $("#ingreso-no-iniciado").is(':checked') ) {
    $("tr[name ='grupo-no-iniciado-ingreso']").show();
  }else{
    $("tr[name ='grupo-no-iniciado-ingreso']").hide();
  }
}

function visualizarIngresoCubiertoTarde(){
  if( $("#ingreso-cubierto-tarde").is(':checked') ) {
    $("tr[name ='grupo-cubierto-tarde']").show();
  }else{
    $("tr[name ='grupo-cubierto-tarde']").hide();
  }
}

function visualizarIngresoDescubierto(){
  if( $("#ingreso-descubierto").is(':checked') ) {
    $("tr[name ='grupo-descubierto-ingreso']").show();
  }else{
    $("tr[name ='grupo-descubierto-ingreso']").hide();
  }
}

function visualizarEgresoCerrado(){
  if( $("#egreso-cerrado").is(':checked') ) {
    $("tr[name ='grupo-cerrado']").show();
  }else{
    $("tr[name ='grupo-cerrado']").hide();
  }
}

function visualizarEgresoNoIniciado(){
  if( $("#egreso-no-iniciado").is(':checked') ) {
    $("tr[name ='grupo-no-iniciado-egreso']").show();
  }else{
    $("tr[name ='grupo-no-iniciado-egreso']").hide();
  }
}

function visualizarEgresoCierreAnticipado(){
  if( $("#egreso-cierre-anticipado").is(':checked') ) {
    $("tr[name ='grupo-cierre-anticipado']").show();
  }else{
    $("tr[name ='grupo-cierre-anticipado']").hide();
  }
}

function visualizarEgresoCubriendose(){
  if( $("#egreso-cubriendose").is(':checked') ) {
    $("tr[name ='grupo-cubriendose']").show();
  }else{
    $("tr[name ='grupo-cubriendose']").hide();
  }
}

function visualizarEgresoNoCerrado(){
  if( $("#egreso-no-cerrado").is(':checked') ) {
    $("tr[name ='grupo-no-cerrado']").show();
  }else{
    $("tr[name ='grupo-no-cerrado']").hide();
  }
}

function visualizarEgresoDescubierto(){
  if( $("#egreso-descubierto").is(':checked') ) {
    $("tr[name ='grupo-descubierto-egreso']").show();
  }else{
    $("tr[name ='grupo-descubierto-egreso']").hide();
  }
}

function loaderState(){
  $("#loader-state").addClass("is-active");
}

function loaderStateFinish(){
  $("#loader-state").removeClass("is-active");
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
