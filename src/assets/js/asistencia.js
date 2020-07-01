
var arrayPuestosAsistencia = [];
var unsubscribersIngresos = [];
var unsubscribersEgresos = [];
var unsubscribersFechaIngresos = [];
var unsubscribersFechaEgresos = [];

function cargarPuestosAsistencia(button){

  limpiarTabla();

  arrayPuestosAsistencia = [];
  tipoAsistencia="";

  if(validarFormularioAsistencia()){

    loaderState();

    verificarEstados();

    let nombreCliente = document.getElementById("selectCliente").value;
    let nombreObjetivo = document.getElementById("selectObjetivo").value;
    tipoAsistencia = button.value;
    $("#asistenciaTable").data("type", button.value );

    unsubscribersIngresos.forEach(unsubscriber => unsubscriber());
    unsubscribersEgresos.forEach(unsubscriber => unsubscriber());
    unsubscribersFechaIngresos.forEach(unsubscriber => unsubscriber());
    unsubscribersFechaEgresos.forEach(unsubscriber => unsubscriber());

    let horaActual = new Date();
    let fechaActual = new Date((new Date()).setHours(0,0,0,0));
    let fechaAyer = fechaAyerDate(fechaActual);
    let numeroDia = horaActual.getDay();
    let numeroDiaAnterior = restarNumeroDia(numeroDia);

    $("#asistenciaTable").data("currentTime", horaActual );
    ultimaActualizacion(horaActual);
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

      if(nombreCliente=="TODOS"){

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
                reject(err);
              });
          });

      } else {

        db.collection("clientes").where("nombreCliente","==",nombreCliente)
          .get()
          .then(function(querySnapshot) {
              querySnapshot.forEach(function(doc) {
                idCliente=doc.id;
                nombreCliente=doc.data().nombreCliente;

                if(nombreObjetivo=="TODOS"){

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
                        reject(err);
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
                        reject(err);
                      });
                  });

                }
              });
          });
      }

    });

    // Ejecuto la Promesa
    promiseAsistencia.then(function(result) {
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
              promises.push(reject("Error"));
            }

        });
        Promise.all(promises)
        .then(function(result) {
          resolve();
        })
        .catch(function(err) {
          reject(err);
        });
      }
      $("#panelResultado").show(); // Mostrar mensaje si NO hay resultados
    }).catch(function(error) {
        console.log("Error getting document:", error);
        reject(error);
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
          let docObject = doc.data();
          let docFecha = (doc.data().documentData.fecha).toDate();
          for (var fieldName in docObject) {
            if (fieldName=="documentData"){
            }else {
              let puesto = docObject[fieldName];
              if(tipoAsistencia=="ingreso" && docFecha.getTime()==fechaActual.getTime()){
                if(dentroRangoHoras(puesto.ingresoPuesto,horaDesde,horaHasta)){
                  promises.push( cargarCoberturaIngresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,docFecha,puesto,horaActual) );
                }
              }else if (tipoAsistencia=="egreso"){
                if (docFecha.getTime()==fechaActual.getTime()) {
                  if(dentroRangoHoras(puesto.egresoPuesto,horaDesde,horaHasta) && puesto.turnoNoche!=true){ // Cargo todos los turnos que no sean turno noche
                    promises.push( cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,docFecha,puesto,horaActual) );
                  }
                } else if (docFecha.getTime()==fechaAyer.getTime()) {
                  if(dentroRangoHoras(puesto.egresoPuesto,horaDesde,horaHasta) && puesto.turnoNoche==true){ // Cargo solamente los turnos noche del dia anterior
                    promises.push( cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,docFecha,puesto,horaActual) );
                  }
                }
              }
            }
          }
        });
        Promise.all(promises)
        .then(function(result) {
          resolve();
        })
        .catch(function(err) {
          reject(err);
        });
      }
    }).catch(function(error) {
        console.log("Error getting document:", error);
        reject(error);
    }); // FIN DE BUSQUEDA DE PUESTOS ESPECIALES O TEMPORALES PARA LA FECHA SELECCIONADA

  });

}

function cargarAsistenciaEsquema(idCliente,idObjetivo,idEsquema,numeroDia,horaDesde,horaHasta,nombreCliente,nombreObjetivo,fechaActual,horaActual,tipoAsistencia){

  return new Promise(function(resolve,reject){
    // Busco el numero de dia dentro del esquema
    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento").doc(idEsquema)
    .collection("esquema").where("documentData.numeroDia","==",numeroDia)
      .get()
      .then(function(querySnapshot) {
        if (querySnapshot.empty) {
          // Si NO hay un dia dentro del esquema entra aca
          resolve();
        } else {
          let promises = [];
          querySnapshot.forEach(function(doc) {
            let docObject = doc.data();
            let count = 0;
            for (let fieldName in docObject) {
              if (fieldName=="documentData"){
              } else {
                let puesto = docObject[fieldName];
                if(tipoAsistencia=="ingreso"){ // Si se chequea ingresos
                  if(dentroRangoHoras(puesto.ingresoPuesto,horaDesde,horaHasta)){
                    promises.push( cargarCoberturaIngresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaActual,puesto,horaActual));
                  }
                }else if(tipoAsistencia=="egreso"){ // Si esta dentro del rango de horas y no es turno noche
                  if(dentroRangoHoras(puesto.egresoPuesto,horaDesde,horaHasta) && puesto.turnoNoche!=true){
                    promises.push( cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaActual,puesto,horaActual));
                  }
                }
              }
            }
          });
          Promise.all(promises)
          .then(function(){
            resolve();
          })
          .catch(function(err){
            reject(err);
          });
        }
      })
      .catch(function(error){
        console.log("Error al querer obtener dia numero: "+numeroDia,error);
        reject(error);
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
        let promises = [];
        querySnapshot.forEach(function(doc) {
          let docObject = doc.data();
          for (var fieldName in docObject) {
            if (fieldName=="documentData"){
            } else {
              let puesto = docObject[fieldName];
                // Si esta dentro del rango de horas y es turno noche ingresa aca
                if(dentroRangoHoras(puesto.egresoPuesto,horaDesde,horaHasta) && puesto.turnoNoche==true){
                  promises.push( cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaAyer,puesto,horaActual) );
                }
            }
          }
        });
        Promise.all(promises)
        .then(function(result) {
          resolve();
        })
        .catch(function(err) {
          reject(err);
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
                  let promises = [];
                  querySnapshot.forEach(function(doc) {
                    let docObject = doc.data();
                    for (var fieldName in docObject) {
                      if (fieldName=="documentData"){
                      } else {
                        let puesto = docObject[fieldName];
                          // Si esta dentro del rango de horas y no es turno noche ingresa aca
                          if(dentroRangoHoras(puesto.egresoPuesto,horaDesde,horaHasta) && puesto.turnoNoche==true){
                            promises.push( cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaAyer,puesto,horaActual) )
                          }
                      }
                    }
                  });
                  Promise.all(promises)
                  .then(function(result) {
                    resolve();
                  })
                  .catch(function(err) {
                    reject(err);
                  });
                }
              })
              .catch(function(error) {
                  console.log("Error getting document:", error);
                  reject(error);
              });
        });
      }
    })
    .catch(function(error) {
        console.log("Error getting document:", error);
        reject(error);
    });
  }

});

}

function cargarAsistenciaObjetivos(nombreCliente,idCliente,fechaAyer,fechaActual,horaActual,horaDesde,horaHasta,numeroDia,tipoAsistencia){

  return new Promise(function(resolve, reject) {

    db.collection("clientes").doc(idCliente).collection("objetivos").where("vigente","==",true)
    .get()
    .then(function(querySnapshot) {
        const promises = [];
        querySnapshot.forEach(function(doc) {
          promises.push( cargarAsistencia(nombreCliente,doc.data().nombreObjetivo,idCliente,doc.id,numeroDia,fechaActual,horaActual,horaDesde,horaHasta,tipoAsistencia) );
          promises.push( cargarAsistenciaEspeciales(idCliente,doc.id,nombreCliente,doc.data().nombreObjetivo,fechaActual,horaActual,horaDesde,horaHasta,tipoAsistencia) );
        });
        Promise.all(promises)
        .then(function(result) {
          resolve();
        })
        .catch(function(err) {
          reject(err);
        });
    });

  });

}

function cargarCoberturaIngresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaActual,puesto,horaActual){

  return new Promise(function(resolve,reject){

    let unsubscribeFechaIngreso = db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
    .where("fecha","==",fechaActual)
    .onSnapshot(function(querySnapshot) {
     let empty = true;
     // Si hay un puesto para esa fecha
     querySnapshot.forEach(function(doc) {
        empty=false;
        let idFecha=doc.id;
        let unsubscribeIngreso = db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura").doc(idFecha).collection("puestos")
        .where("nombrePuesto","==",puesto.nombrePuesto).where("ingresoPuesto","==",puesto.ingresoPuesto)
        .onSnapshot(function(querySnapshot) {
            let momentoActual = new Date();
            ultimaActualizacion(momentoActual);
            let empty = true;
            querySnapshot.docChanges().forEach(function(change) {
              empty=false;
                if (change.type === "added") {
                    let cubrimiento = change.doc.data();
                    cubrimiento.id = change.doc.id;
                    cargarTurnoAsistenciaIngresos(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,cubrimiento,"add");
                }
                if (change.type === "modified") {
                    let cubrimiento = change.doc.data();
                    cubrimiento.id = change.doc.id;
                    cargarTurnoAsistenciaIngresos(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,cubrimiento,"mod");
                }
                if (change.type === "removed") {
                    remRow(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,change.doc.id,fechaActual,momentoActual);
                }
            });
            if (querySnapshot.empty && empty==true) {
              // Si NO hay un puesto cargado que coincida con el nombrePuesto e ingresoPuesto
              cargarTurnoAsistenciaIngresosVacio(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,fechaActual,horaActual)
              .then(function(){
                resolve();
              });
            }
            resolve();
        });
        unsubscribersIngresos.push(unsubscribeIngreso);
      });
      if (querySnapshot.empty && empty==true) {
        // Si NO hay un puesto cargado para esta fecha
        cargarTurnoAsistenciaIngresosVacio(idCliente,idObjetivo,"",nombreCliente,nombreObjetivo,puesto,fechaActual,horaActual)
        .then(function(){
          resolve();
        });
      }
      resolve();
    });
    unsubscribersFechaIngresos.push(unsubscribeFechaIngreso);
  });

}

function cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaActual,puesto,horaActual){

  //fecha Actual es igual a la fecha del puesto a cargar, esta si puede variar al ingresar como parametro cuando se analiza el dia anterior fechaAyer
  return new Promise(function(resolve,reject){

    let unsubscribeFechaEgreso = db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
    .where("fecha","==",fechaActual)
    .onSnapshot(function(querySnapshot) {
      let empty = true;
      // Si hay un puesto para esa fecha
      querySnapshot.forEach(function(doc) {
        empty=false;
        let idFecha=doc.id;
        let unsubscribeEgreso = db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura").doc(idFecha).collection("puestos")
        .where("nombrePuesto","==",puesto.nombrePuesto).where("egresoPuesto","==",puesto.egresoPuesto)
        .onSnapshot(function(querySnapshot) {
            let momentoActual = new Date();
            ultimaActualizacion(momentoActual);
            let empty = true;
            querySnapshot.docChanges().forEach(function(change) {
              empty=false;
                if (change.type === "added") {
                    let cubrimiento = change.doc.data();
                    cubrimiento.id = change.doc.id;
                    cargarTurnoAsistenciaEgresos(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,cubrimiento,horaActual,"add");
                }
                if (change.type === "modified") {
                    let cubrimiento = change.doc.data();
                    cubrimiento.id = change.doc.id;
                    cargarTurnoAsistenciaEgresos(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,cubrimiento,horaActual,"mod");
                }
                if (change.type === "removed") {
                    remRowEgresos(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,change.doc.id,fechaActual,momentoActual);
                }
            });
            if (querySnapshot.empty && empty==true) {
              // Si NO hay un puesto cargado que coincida con el nombrePuesto e ingresoPuesto
              cargarTurnoAsistenciaEgresosVacio(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,fechaActual,horaActual)
              .then(function(){
                resolve();
              });
            }
            resolve();
        });
        unsubscribersEgresos.push(unsubscribeEgreso);
      });
      if (querySnapshot.empty && empty==true) {
        // Si NO hay ningun puesto cargado para esta fecha
        cargarTurnoAsistenciaEgresosVacio(idCliente,idObjetivo,"",nombreCliente,nombreObjetivo,puesto,fechaActual,horaActual)
        .then(function(){
          resolve();
        });
      }
      resolve();
    });
    unsubscribersFechaEgresos.push(unsubscribeFechaEgreso);
  });

}

function cargarTurnoAsistenciaIngresos(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,cubrimiento,tipo){

  return new Promise(function(resolve,reject){

    let ingresoPuestoDate = new Date( Date.parse(cubrimiento.fechaPuesto+"T"+puesto.ingresoPuesto+":00") );
    let egresoPuestoDate = new Date( Date.parse(cubrimiento.fechaPuesto+"T"+puesto.egresoPuesto+":00") );
    let horaIngresoDate = new Date( Date.parse(cubrimiento.fechaIngreso+"T"+cubrimiento.horaIngreso+":00") );
    let horaRegistradaIngreso = componerHorasDate(ingresoParametrizado(ingresoPuestoDate,horaIngresoDate));
    if (puesto.turnoNoche) { //Si el puesto es turno noche
      egresoPuestoDate.setDate(egresoPuestoDate.getDate()+1);
    }

    let horaRegistradaEgreso = "-";
    let estado="ingreso-cubierto";
    let options = {year: "numeric", month: "numeric", day: "numeric"};

    if(cubrimiento.horaEgreso!="" && cubrimiento.horaEgreso!=undefined){ // Si la hora del puesto esta cargada y no es vacia
      let horaEgresoDate = new Date( Date.parse(cubrimiento.fechaEgreso+"T"+cubrimiento.horaEgreso+":00") ); // Ver de generar objeto Date
      let egresoParametrizadoDate = egresoParametrizado(ingresoPuestoDate,egresoPuestoDate,horaEgresoDate)
      horaRegistradaEgreso = componerHorasDate(egresoParametrizadoDate);
    }

    if(horaIngresoDate>ingresoPuestoDate){
      estado="ingreso-cubierto-tarde";
    }

     let rowData = {
       nc : nombreCliente,
       no : nombreObjetivo,
       pu : puesto.nombrePuesto+" - "+puesto.nombreTurno,
       fe : ingresoPuestoDate.toLocaleDateString("es-ES",options),
       ip : puesto.ingresoPuesto,
       hi : horaRegistradaIngreso,
       ep : puesto.egresoPuesto,
       he : horaRegistradaEgreso,
       es : estado,
       ex : { ic : cubrimiento.id,
              ip : cubrimiento.idPersonal,
              hir : cubrimiento.horaIngreso,
              her : cubrimiento.horaEgreso,
              np : cubrimiento.nombrePuesto,
              nt : puesto.nombreTurno,
              ph : cubrimiento.imagePath,
              ht : cubrimiento.horasTurno,
              fp : cubrimiento.fechaPuesto,
              fi : cubrimiento.fechaIngreso,
              fe : cubrimiento.fechaEgreso,
              idc : idCliente,
              ido : idObjetivo,
              idf : idFecha,
            },
     }

     if(cubrimiento.estado!=undefined){
       rowData.ex.est = cubrimiento.estado;
     }

     devolverPersonal(cubrimiento.idPersonal)
     .then(function(result){
       rowData.pe=result;
       if(tipo=="add"){
         addRow(rowData);
       }else{
         modRow(rowData);
       }
       resolve();
     })
     .catch(function(result){
       rowData.pe="No Identificado";
       if(tipo=="add"){
         addRow(rowData);
       }else{
         modRow(rowData);
       }
       resolve();
     });

  });

}

function cargarTurnoAsistenciaIngresosVacio(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,fechaPuesto,horaActual){

  return new Promise(function(resolve,reject){
    let estado="ingreso-descubierto";
    let options = {year: "numeric", month: "numeric", day: "numeric"};
    let ingresoPuestoDate="";

    let sepHr = puesto.ingresoPuesto.indexOf(":");
    let horas = parseInt(puesto.ingresoPuesto.substr(0,sepHr));
    let minutos = parseInt(puesto.ingresoPuesto.substr(sepHr+1,2));

    fechaPuesto.setHours(horas,minutos,0,0);

    if(fechaPuesto>horaActual){
      estado="ingreso-no-iniciado";
    }

     let rowData = {
       nc : nombreCliente,
       no : nombreObjetivo,
       pu : puesto.nombrePuesto+" - "+puesto.nombreTurno,
       fe : fechaPuesto.toLocaleDateString("es-ES",options),
       ip : puesto.ingresoPuesto,
       hi : "-",
       ep : puesto.egresoPuesto,
       he : "-",
       pe : "-",
       es : estado,
       ex : {
              np : puesto.nombrePuesto,
              nt : puesto.nombreTurno,
              ht : puesto.horasTurno,
              fp : getDateStr(fechaPuesto),
              tn : puesto.turnoNoche,
              idc : idCliente,
              ido : idObjetivo,
              idf : idFecha,
            },
     }

     addRow(rowData);
     resolve();
  });

}

function cargarTurnoAsistenciaEgresos(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,cubrimiento,horaActual,tipo){

  return new Promise(function(resolve,reject){

  let estado="egreso-cerrado";
  let fechaPuestoDate="";
  let egresoPuestoDate = "";
  let horaRegistradaEgreso = "-";
  let options = {year: "numeric", month: "numeric", day: "numeric"};
  let horaIngresoDate = new Date( Date.parse(cubrimiento.fechaIngreso+"T"+cubrimiento.horaIngreso+":00") );
  let ingresoPuestoDate = new Date( Date.parse(cubrimiento.fechaPuesto+"T"+puesto.ingresoPuesto+":00") );
  let horaRegistradaIngreso = componerHorasDate(ingresoParametrizado(ingresoPuestoDate,horaIngresoDate));

  fechaPuestoDate=new Date( Date.parse(cubrimiento.fechaPuesto+"T00:00:00"));

  if (puesto.turnoNoche) { //Si el puesto es turno noche
    egresoPuestoDate = new Date( Date.parse(cubrimiento.fechaPuesto+"T"+puesto.egresoPuesto+":00"));
    egresoPuestoDate.setDate(egresoPuestoDate.getDate()+1);
  }else{
    egresoPuestoDate = new Date( Date.parse(cubrimiento.fechaPuesto+"T"+puesto.egresoPuesto+":00") );
  }

  if(cubrimiento.horaEgreso!="" && cubrimiento.horaEgreso!=undefined){ // Si la hora del puesto esta cargada y no es vacia
    let horaEgresoDate = new Date( Date.parse(cubrimiento.fechaEgreso+"T"+cubrimiento.horaEgreso+":00") ); // Ver de generar objeto Date
    let egresoParametrizadoDate = egresoParametrizado(ingresoPuestoDate,egresoPuestoDate,horaEgresoDate)
    horaRegistradaEgreso = componerHorasDate(egresoParametrizadoDate);
    if(egresoParametrizadoDate<egresoPuestoDate){
      estado="egreso-cierre-anticipado";
    }
  } else if (horaActual>egresoPuestoDate){
    estado="egreso-no-cerrado";
  } else if(horaActual<egresoPuestoDate){
    estado="egreso-cubriendose"
  }

   let rowData = {
     nc : nombreCliente,
     no : nombreObjetivo,
     pu : puesto.nombrePuesto+" - "+puesto.nombreTurno,
     fe : fechaPuestoDate.toLocaleDateString("es-ES",options),
     ip : puesto.ingresoPuesto,
     hi : horaRegistradaIngreso,
     ep : puesto.egresoPuesto,
     he : horaRegistradaEgreso,
     es : estado,
     ex : { ic : cubrimiento.id,
            ip : cubrimiento.idPersonal,
            hir : cubrimiento.horaIngreso,
            her : cubrimiento.horaEgreso,
            np : cubrimiento.nombrePuesto,
            nt : puesto.nombreTurno,
            ph : cubrimiento.imagePath,
            ht : cubrimiento.horasTurno,
            fp : cubrimiento.fechaPuesto,
            fi : cubrimiento.fechaIngreso,
            fe : cubrimiento.fechaEgreso,
            tn : cubrimiento.turnoNoche,
            idc : idCliente,
            ido : idObjetivo,
            idf : idFecha,
          },
   }

   if(cubrimiento.estado!=undefined){
     rowData.ex.est = cubrimiento.estado;
   }

   devolverPersonal(cubrimiento.idPersonal)
   .then(function(result){
     rowData.pe=result;
     if(tipo=="add"){
       addRow(rowData);
     }else{
       modRow(rowData);
     }
     resolve();
   })
   .catch(function(result){
     rowData.pe="No Identificado";
     if(tipo=="add"){
       addRow(rowData);
     }else{
       modRow(rowData);
     }
     resolve();
   });

  });

}

function cargarTurnoAsistenciaEgresosVacio(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,fechaPuesto,horaActual){

  return new Promise(function(resolve,reject){
    let estado="egreso-descubierto";
    let sepHr = puesto.ingresoPuesto.indexOf(":");
    let horas = parseInt(puesto.ingresoPuesto.substr(0,sepHr));
    let minutos = parseInt(puesto.ingresoPuesto.substr(sepHr+1,2));
    let horaPuesto = (new Date(fechaPuesto.getTime()).setHours(horas,minutos,0,0));
    let options = {year: "numeric", month: "numeric", day: "numeric"};

    if(horaPuesto>horaActual){
      estado="egreso-no-iniciado";
    }

     let rowData = {
       nc : nombreCliente,
       no : nombreObjetivo,
       pu : puesto.nombrePuesto+" - "+puesto.nombreTurno,
       fe : fechaPuesto.toLocaleDateString("es-ES",options),
       ip : puesto.ingresoPuesto,
       hi : "-",
       ep : puesto.egresoPuesto,
       he : "-",
       pe : "-",
       es : estado,
       ex : {
              np : puesto.nombrePuesto,
              nt : puesto.nombreTurno,
              ht : puesto.horasTurno,
              fp : getDateStr(fechaPuesto),
              tn : puesto.turnoNoche,
              idc : idCliente,
              ido : idObjetivo,
              idf : idFecha,
            },
     }

     addRow(rowData);
     resolve();
  });

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
  let selectClientes = document.getElementById('selectCliente');
  selectClientes.options.add(new Option("Todos"));
  for(var i = 0; i < listadoClientes.length; i++){
    selectClientes.options.add(new Option(listadoClientes[i]));
  }
}

function listadoObjetivosAsistencia(){

  let listadoObjetivos = [];
  let nombreCliente = document.getElementById("selectCliente").value;

  if(nombreCliente=="Todos"){
    let selectObjetivos = document.getElementById("selectObjetivo");
    clearOptionsFast("selectObjetivo");
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
  let selectObjetivos = document.getElementById("selectObjetivo");
  if(listadoObjetivos.length==0){
    clearOptionsFast("selectObjetivo"); //Vacio las opciones del Select
    selectObjetivos.options.add(new Option("Sin Objetivos",0)); //Cargo que no tiene Objetivos
  } else if(listadoObjetivos.length>0){
      clearOptionsFast("selectObjetivo"); //Vacio las opciones del Select
      selectObjetivos.options.add(new Option("Seleccione un Objetivo",0));
      selectObjetivos.options.add(new Option("Todos"));
      for(var i = 0; i < listadoObjetivos.length; i++){
        selectObjetivos.options.add(new Option(listadoObjetivos[i]));
      }
    }
}

function limpiarTabla(){
  table = $("#asistenciaTable").DataTable();
  table.clear();
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

function validarFormularioAsistencia(){
  if($("#selectCliente option:selected").val() == 0) {
    $('#select-validate').modal('show');
    return false;
  }else if($("#selectObjetivo option:selected").val() == 0) {
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

function actualizarAsistenciaTabla(){
  table = $("#asistenciaTable").DataTable();
  table.draw();
}

function loaderState(){
  $("#loader-state").addClass("is-active");
}

function loaderStateFinish(){
  $("#loader-state").removeClass("is-active");
}

function inicializarFuncionesControl(){
  listadoClientesClient("dataListClient",true);
  cargarBSDateTimePicker();
  enforcingValueDataList();
  cargarCubrimientoAsistencia();
  inicializarModalTurno();
}

function cargarCubrimientoAsistencia(){

  let table="";

  if ( $.fn.dataTable.isDataTable("#asistenciaTable") ) {
    table = $("#asistenciaTable").DataTable();
    table.clear();
  }
  else {
    table = $("#asistenciaTable").DataTable({
      //order: [[ 0, "asc" ],[ 1, "asc" ],[ 2, "asc" ]],
      orderFixed: [[ 0, "asc" ],[ 1, "asc" ],[ 4, "asc" ],[ 2, "asc" ]],
      paging: true,
      searching: true,
      ordering:  true,
      info: true,
      columns: [
          { data: 'nc' },
          { data: 'no' },
          { data: 'pu' },
          { data: 'fe' },
          { data: 'ip' },
          { data: 'hi' },
          { data: 'ep' },
          { data: 'he' },
          { data: 'pe' },
          {
              data: 'es',
              render: function ( data, type, row ) {
                if(data=="ingreso-descubierto"){
                  return '<span class="label" style="background-color:#FF6347;">Descubierto</span>';
                } else if (data=="ingreso-no-iniciado"){
                  return '<span class="label" style="background-color:#558B2F;">No Iniciado</span>';
                } else if (data=="ingreso-cubierto-tarde"){
                  return '<span class="label" style="background-color:#AD1457;">Cubierto Tarde</span>';
                } else if (data=="ingreso-cubierto"){
                  return '<span class="label" style="background-color:#34495E;">Cubierto</span>';
                } else if (data=="egreso-cerrado"){
                  return '<span class="label" style="background-color:#34495E;">Cerrado</span>';
                } else if (data=="egreso-cierre-anticipado"){
                  return '<span class="label" style="background-color:#AD1457;">Cierre Anticipado</span>';
                } else if (data=="egreso-cubriendose"){
                  return '<span class="label" style="background-color:#3498DB;">Cubriendose</span>';
                } else if (data=="egreso-no-cerrado"){
                  return '<span class="label" style="background-color:#76448A;">No Cerrado</span>';
                } else if (data=="egreso-descubierto"){
                  return '<span class="label" style="background-color:#FF6347;">Descubierto</span>';
                } else if (data=="egreso-no-iniciado"){
                  return '<span class="label" style="background-color:#558B2F;">No Iniciado</span>';
                }
              }
          },
          {
              data: 'ex',
              render: function ( data, type, row ) {
                  return "<span class='editar' style='color:black; cursor:pointer'><i class='fas fa-eye'></i></span>";
              }

          }
      ],
      columnDefs: [{ //Centro el contenido de las n últimas columnas
          className: "text-center", "targets": [0,1,2,3,4,5,6,7,9,10]
      }],
      language: {
          search: "Buscar:",
          lengthMenu: "Mostrar _MENU_  Turnos",
          zeroRecords: "No se encontraron resultados",
          info: "Mostrando de _START_ a _END_ de _TOTAL_ Turnos",
          infoEmpty: "Sin turnos cargados",
          infoFiltered: "(_MAX_ Turnos totales)",
          paginate: {
              first: "Primero",
              last: "Ultimo",
              next: "Siguiente",
              previous: "Anterior",
          },
      },
      initComplete: function () {
        $.fn.dataTable.ext.search.push(
            function( settings, data, dataIndex, rowData, counter ) {

                if(rowData.es=="ingreso-descubierto"){
                  if( $("#ingreso-descubierto").is(':checked')){
                    return true;
                  }else{
                    return false;
                  }
                }else if(rowData.es=="ingreso-no-iniciado"){
                  if( $("#ingreso-no-iniciado").is(':checked')) {
                    return true;
                  }else{
                    return false;
                  }
                }else if(rowData.es=="ingreso-cubierto-tarde"){
                  if( $("#ingreso-cubierto-tarde").is(':checked')) {
                    return true;
                  }else{
                    return false;
                  }
                }else if(rowData.es=="ingreso-cubierto"){
                  if( $("#ingreso-cubierto").is(':checked')) {
                    return true;
                  }else{
                    return false;
                  }
                }else if(rowData.es=="egreso-descubierto"){
                  if( $("#egreso-descubierto").is(':checked')){
                    return true;
                  }else{
                    return false;
                  }
                }else if(rowData.es=="egreso-cerrado"){
                  if( $("#egreso-cerrado").is(':checked')) {
                    return true;
                  }else{
                    return false;
                  }
                }else if(rowData.es=="egreso-no-iniciado"){
                  if( $("#egreso-no-iniciado").is(':checked')) {
                    return true;
                  }else{
                    return false;
                  }
                }else if(rowData.es=="egreso-cierre-anticipado"){
                  if( $("#egreso-cierre-anticipado").is(':checked')) {
                    return true;
                  }else{
                    return false;
                  }
                }else if(rowData.es=="egreso-cubriendose"){
                  if( $("#egreso-cubriendose").is(':checked')) {
                    return true;
                  }else{
                    return false;
                  }
                }else if(rowData.es=="egreso-no-cerrado"){
                  if( $("#egreso-no-cerrado").is(':checked')) {
                    return true;
                  }else{
                    return false;
                  }
                }

            }
        );
      },
    });
  }

  $('#asistenciaTable tbody').off('click', 'span.editar');

  $('#asistenciaTable tbody').on('click', 'span.editar', function () {
    let row = $(this);
    let rowData = table.row(row.parents("tr")).data();
    if(rowData.es.includes('descubierto')){
      mostrarTurnoAsistencia(rowData,row);
    }else if(rowData.es.includes('no-iniciado')){
      mostrarTurnoAsistencia(rowData,row);
    } else {
      mostrarTurnoAsistencia(rowData,row);
    }
  });

}

function addRow(rowData){

    let table = $("#asistenciaTable").DataTable();
    let rowToDelete = table.rows( function ( idx, data, node ) {
            if(data.nc==rowData.nc && data.no==rowData.no && data.pu==rowData.pu && data.es.includes('descubierto') ||
               data.nc==rowData.nc && data.no==rowData.no && data.pu==rowData.pu && data.es.includes('no-iniciado')
             ){
               return true;
             }else{
               return false;
             }
        }).remove().draw();
    let currentRow = table.row.add(rowData).draw();
    let row = currentRow.node();
    if(rowData.ex.ic!="" && rowData.ex.ic!=undefined){
      $(row).attr('id',rowData.ex.ic);
    }
    if(rowData.es.includes('descubierto')){
      $(row).addClass("grupo-descubierto");
    } else if (rowData.es.includes('no-iniciado')){
      $(row).addClass("grupo-no-iniciado");
    } else if (rowData.es=="ingreso-cubierto-tarde"){
      $(row).addClass("grupo-cubierto-tarde");
    } else if (rowData.es=="ingreso-cubierto"){
      $(row).addClass("grupo-cubierto");
    } else if (rowData.es=="egreso-cerrado"){
      $(row).addClass("grupo-cerrado");
    } else if (rowData.es=="egreso-cierre-anticipado"){
      $(row).addClass("grupo-cierre-anticipado");
    } else if (rowData.es=="egreso-cubriendose"){
      $(row).addClass("grupo-cubriendose");
    } else if (rowData.es=="egreso-no-cerrado"){
      $(row).addClass("grupo-no-cerrado");
    }

    $(row).addClass("highlight_add",3000,"swing",function(){
      $(row).removeClass("highlight_add");
    });

}

function modRow(rowData){
  table = $("#asistenciaTable").DataTable();
  let currentRow = table.row("#"+rowData.ex.ic).data(rowData).draw();
  let row = currentRow.node();
  row.classList.remove("grupo-descubierto", "grupo-no-iniciado" , "grupo-cubierto-tarde" , "grupo-cubierto" , "grupo-cerrado" , "grupo-cierre-anticipado" , "grupo-cubriendose" , "grupo-no-cerrado" );
  if(rowData.es.includes('descubierto')){
    $(row).addClass("grupo-descubierto");
  } else if (rowData.es.includes('no-iniciado')){
    $(row).addClass("grupo-no-iniciado");
  } else if (rowData.es=="ingreso-cubierto-tarde"){
    $(row).addClass("grupo-cubierto-tarde");
  } else if (rowData.es=="ingreso-cubierto"){
    $(row).addClass("grupo-cubierto");
  } else if (rowData.es=="egreso-cerrado"){
    $(row).addClass("grupo-cerrado");
  } else if (rowData.es=="egreso-cierre-anticipado"){
    $(row).addClass("grupo-cierre-anticipado");
  } else if (rowData.es=="egreso-cubriendose"){
    $(row).addClass("grupo-cubriendose");
  } else if (rowData.es=="egreso-no-cerrado"){
    $(row).addClass("grupo-no-cerrado");
  }

  $(row).addClass("highlight_mod",3000,"swing",function(){
    $(row).removeClass("highlight_mod");
  });

}

function remRow(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,idCubrimiento,fechaPuesto,horaActual){

  return new Promise(function(resolve,reject){
    let estado="ingreso-descubierto";
    let options = {year: "numeric", month: "numeric", day: "numeric"};
    let ingresoPuestoDate="";

    let sepHr = puesto.ingresoPuesto.indexOf(":");
    let horas = parseInt(puesto.ingresoPuesto.substr(0,sepHr));
    let minutos = parseInt(puesto.ingresoPuesto.substr(sepHr+1,2));

    fechaPuesto.setHours(horas,minutos,0,0);

    if(fechaPuesto>horaActual){
      estado="ingreso-no-iniciado";
    }

     let rowData = {
       nc : nombreCliente,
       no : nombreObjetivo,
       pu : puesto.nombrePuesto+" - "+puesto.nombreTurno,
       fe : fechaPuesto.toLocaleDateString("es-ES",options),
       ip : puesto.ingresoPuesto,
       hi : "-",
       ep : puesto.egresoPuesto,
       he : "-",
       pe : "-",
       es : estado,
       ex : {
              np : puesto.nombrePuesto,
              nt : puesto.nombreTurno,
              ht : puesto.horasTurno,
              fp : getDateStr(fechaPuesto),
              tn : puesto.turnoNoche,
              idc : idCliente,
              ido : idObjetivo,
              idf : idFecha,
            },
     }

     table = $("#asistenciaTable").DataTable();

     let currentRow = table.row("#"+idCubrimiento);
     let row = currentRow.node();

     $(row).addClass("highlight_del",3000,"swing",function(){
       $(row).removeClass("highlight_del");
       currentRow.data(rowData).draw();
       let rows = table.rows( function ( idx, data, node ) {
               if(data.nc==rowData.nc && data.no==rowData.no && data.pu==rowData.pu  ||
                  data.nc==rowData.nc && data.no==rowData.no && data.pu==rowData.pu
                ){
                  return true;
                }else{
                  return false;
                }
           });
       if(rows.data().length>1){
        table.row("#"+idCubrimiento).remove().draw();
       }else{
        $(row).removeAttr("id");
      }
     });

     row.classList.remove("grupo-descubierto", "grupo-no-iniciado" , "grupo-cubierto-tarde" , "grupo-cubierto" , "grupo-cerrado" , "grupo-cierre-anticipado" , "grupo-cubriendose" , "grupo-no-cerrado" );
     if(rowData.es.includes('descubierto')){
       $(row).addClass("grupo-descubierto");
     } else if (rowData.es.includes('no-iniciado')){
       $(row).addClass("grupo-no-iniciado");
     } else if (rowData.es=="ingreso-cubierto-tarde"){
       $(row).addClass("grupo-cubierto-tarde");
     } else if (rowData.es=="ingreso-cubierto"){
       $(row).addClass("grupo-cubierto");
     } else if (rowData.es=="egreso-cerrado"){
       $(row).addClass("grupo-cerrado");
     } else if (rowData.es=="egreso-cierre-anticipado"){
       $(row).addClass("grupo-cierre-anticipado");
     } else if (rowData.es=="egreso-cubriendose"){
       $(row).addClass("grupo-cubriendose");
     } else if (rowData.es=="egreso-no-cerrado"){
       $(row).addClass("grupo-no-cerrado");
     }

     resolve();
  });

}

function remRowEgresos(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,idCubrimiento,fechaPuesto,horaActual){

  return new Promise(function(resolve,reject){

    let estado="egreso-descubierto";
    let sepHr = puesto.ingresoPuesto.indexOf(":");
    let horas = parseInt(puesto.ingresoPuesto.substr(0,sepHr));
    let minutos = parseInt(puesto.ingresoPuesto.substr(sepHr+1,2));
    let horaPuesto = (new Date(fechaPuesto.getTime()).setHours(horas,minutos,0,0));
    let options = {year: "numeric", month: "numeric", day: "numeric"};

    if(horaPuesto>horaActual){
      estado="egreso-no-iniciado";
    }

     let rowData = {
       nc : nombreCliente,
       no : nombreObjetivo,
       pu : puesto.nombrePuesto+" - "+puesto.nombreTurno,
       fe : fechaPuesto.toLocaleDateString("es-ES",options),
       ip : puesto.ingresoPuesto,
       hi : "-",
       ep : puesto.egresoPuesto,
       he : "-",
       pe : "-",
       es : estado,
       ex : {
              np : puesto.nombrePuesto,
              nt : puesto.nombreTurno,
              ht : puesto.horasTurno,
              fp : getDateStr(fechaPuesto),
              tn : puesto.turnoNoche,
              idc : idCliente,
              ido : idObjetivo,
              idf : idFecha,
            },
     }

     table = $("#asistenciaTable").DataTable();

     let currentRow = table.row("#"+idCubrimiento);
     let row = currentRow.node();

     $(row).addClass("highlight_del",3000,"swing",function(){
       $(row).removeClass("highlight_del");
       currentRow.data(rowData).draw();
       let rows = table.rows( function ( idx, data, node ) {
               if(data.nc==rowData.nc && data.no==rowData.no && data.pu==rowData.pu  ||
                  data.nc==rowData.nc && data.no==rowData.no && data.pu==rowData.pu
                ){
                  return true;
                }else{
                  return false;
                }
           });
       if(rows.data().length>1){
        table.row("#"+idCubrimiento).remove().draw();
       }else{
        $(row).removeAttr("id");
      }
     });

     row.classList.remove("grupo-descubierto", "grupo-no-iniciado" , "grupo-cubierto-tarde" , "grupo-cubierto" , "grupo-cerrado" , "grupo-cierre-anticipado" , "grupo-cubriendose" , "grupo-no-cerrado" );
     if(rowData.es.includes('descubierto')){
       $(row).addClass("grupo-descubierto");
     } else if (rowData.es.includes('no-iniciado')){
       $(row).addClass("grupo-no-iniciado");
     } else if (rowData.es=="ingreso-cubierto-tarde"){
       $(row).addClass("grupo-cubierto-tarde");
     } else if (rowData.es=="ingreso-cubierto"){
       $(row).addClass("grupo-cubierto");
     } else if (rowData.es=="egreso-cerrado"){
       $(row).addClass("grupo-cerrado");
     } else if (rowData.es=="egreso-cierre-anticipado"){
       $(row).addClass("grupo-cierre-anticipado");
     } else if (rowData.es=="egreso-cubriendose"){
       $(row).addClass("grupo-cubriendose");
     } else if (rowData.es=="egreso-no-cerrado"){
       $(row).addClass("grupo-no-cerrado");
     }

     resolve();
  });

}

function mostrarTurnoAsistencia(rowData,row){

  cargarTurnoAsistencia(rowData,row);
  cargarRangeSliderDetalleTurno(rowData);
  $("#detalle-turno").modal("show");

}

function cargarTurnoAsistencia(rowData,row){

  $("#titulo-modal").text(rowData.nc+" - "+rowData.no);

  $("#personalDetalleDia").text(rowData.pe);

  if(rowData.ex.est=="mod"){
    $("#estado-detalle").show();
  } else{
    $("#estado-detalle").hide();
  }

  nombreTurno="";
  if(rowData.ex.nt=="TMR"){
    nombreTurno="Turno Madrugada";
  }else if(rowData.ex.nt=="TM"){
    nombreTurno="Turno Mañana";
  }else if(rowData.ex.nt=="TT"){
    nombreTurno="Turno Tarde";
  }else if(rowData.ex.nt=="TN"){
    nombreTurno="Turno Noche";
  }
  $("#tituloPuesto").text(rowData.ex.np+" - "+nombreTurno);

  if(rowData.ex.ph!="" && rowData.ex.ph!=undefined){
    cargarImagen(rowData.ex.ph+rowData.ex.ip+"_INGRESO.jpg","foto-ingreso");
    if(rowData.he!="-"){
      cargarImagen(rowData.ex.ph+rowData.ex.ip+"_EGRESO.jpg","foto-egreso");
    } else{
      $("#foto-egreso").css('background-image', 'url(assets/img/sin-foto.png)');
    }
  }else{
    $("#foto-ingreso").css('background-image', 'url(assets/img/sin-foto.png)');
    $("#foto-egreso").css('background-image', 'url(assets/img/sin-foto.png)');
  }

  //Carga de texto en las fotos de ingreso y egreso
  if(rowData.ex.her!="" && rowData.ex.her!=undefined){
    $("#horaEgresoReal").text(rowData.ex.her);
    document.getElementById("horaEgresoReal").style.fontSize = "25px";
  } else {
    $("#horaEgresoReal").text("SIN CIERRE");
    document.getElementById("horaEgresoReal").style.fontSize = "16px";
  }

  if(rowData.ex.hir!="" && rowData.ex.hir!=undefined){
    $("#horaIngresoReal").text(rowData.ex.hir);
  }else{
    $("#horaIngresoReal").text("");
    $("#horaEgresoReal").text("");
  }

  $("#horasTurnoDetalle").text(rowData.ex.ht);

  $("#slider-detalle-turno").attr("delete","false");

  $("#guardar-cambios-detalle").click(function() {
   guardarCambiosAsistencia(rowData,row);
 });

}

function cargarRangeSliderDetalleTurno(rowData){

  let fechaIngresoPuesto = new Date(rowData.ex.fp+"T"+rowData.ip+":00");
  let fechaEgresoPuesto = new Date(rowData.ex.fp+"T"+rowData.ep+":00");
  if(compararHorasString(rowData.ip,rowData.ep)==-1){
    fechaEgresoPuesto = new Date( fechaEgresoPuesto.getTime() + 24*60*60*1000 );
  }

  if(rowData.es.includes('descubierto')){
    $("#card-contenedor").hide();
    $("#objetivoNoIniciado").hide();
    $("#seleccionPersonal").hide();
    $("#mostrar-slider").hide();
    $("#control-horas").hide();
    $("#mostrar-botones").hide();
    $("#habilitar-turno").hide();
    $("#objetivoDescubierto").show();
    $("#btn-carga-manual").show();

  }else if(rowData.es.includes('no-iniciado')){
    $("#card-contenedor").hide();
    $("#objetivoDescubierto").hide();
    $("#seleccionPersonal").hide();
    $("#mostrar-slider").hide();
    $("#control-horas").hide();
    $("#mostrar-botones").hide();
    $("#habilitar-turno").hide();
    $("#objetivoNoIniciado").show();
    $("#btn-carga-manual").show();

  }else{
    $("#objetivoDescubierto").hide();
    $("#objetivoNoIniciado").hide();
    $("#seleccionPersonal").hide();
    $("#btn-carga-manual").hide();
    $("#mostrar-slider").show();
    $("#control-horas").show();
    $("#mostrar-botones").show();
    $("#habilitar-turno").show();
    $("#card-contenedor").show();
  }

  let fechaIngresoReal="";

  if(rowData.ex.hir==undefined){
    fechaIngresoReal = new Date(rowData.ex.fp+"T"+rowData.ip+":00");
  }else{
    fechaIngresoReal = new Date(rowData.ex.fi+"T"+rowData.ex.hir+":00");
  }

  let ingresoParam = ingresoParametrizado(fechaIngresoPuesto,fechaIngresoReal);
  let fechaEgresoReal="";
  let egresoParam="";

  if(rowData.ex.her=="" || rowData.ex.her==undefined){
    egresoParam = ingresoParam;
  }else{
    fechaEgresoReal = new Date(rowData.ex.fe+"T"+rowData.ex.her+":00");
    egresoParam = egresoParametrizado(fechaIngresoPuesto,fechaEgresoPuesto,fechaEgresoReal);
  }

  let difHoras = totalHorasDetalle(ingresoParam,egresoParam);

  $("#slider-detalle-turno").attr( "from", ingresoParam );
  $("#slider-detalle-turno").attr( "to", egresoParam );
  $("#slider-detalle-turno").attr( "hours", difHoras );

  $('#dtpHIAsistencia, #dtpHEAsistencia').datetimepicker({
    format: 'HH:mm',
  });

  //Inicializar Date Time Pickers
  $("#dtpHIAsistencia").data("DateTimePicker").date(fechaIngresoReal);
  if(rowData.ex.her=="" || rowData.ex.her==undefined){
    $("#dtpHEAsistencia").data("DateTimePicker").date(fechaIngresoReal);
    $('#dtpHEAsistencia').data("DateTimePicker").clear();
  }else{
    $("#dtpHEAsistencia").data("DateTimePicker").date(fechaEgresoReal);
  }

  //Cargar las hora de ingreso y egreso originales
  if(rowData.ex.hir==undefined){
    $("#horaIngresoManual").attr( "from", "" );
  }else{
    $("#horaIngresoManual").attr( "from", fechaIngresoReal );
    $("#horaIngresoManual").attr( "hora-ingreso",fechaIngresoReal);
  }

  if(rowData.ex.her==undefined){
    $("#horaIngresoManual").attr( "to", "" );
  }else{
    $("#horaIngresoManual").attr( "to", fechaEgresoReal );
    $("#horaIngresoManual").attr( "hora-egreso",fechaEgresoReal);
  }

  //Initialise range slider instance
  $("#slider-detalle-turno").ionRangeSlider({
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
    let oldFrom = $("#slider-detalle-turno").attr("from");
    let oldTo = $("#slider-detalle-turno").attr("to");
    let oldHours = $("#slider-detalle-turno").attr("hours");
    let from = new Date(data.from);
    let to = new Date(data.to);

    let difHoras = totalHorasDetalle(new Date(data.from),new Date(data.to));
    $("#horasRegitradasDetalle").text(difHoras);

    if ( difHoras > oldHours ){
      document.getElementById('icon-informe').className = 'fas fa-angle-double-down open';
      $("#mostrarInforme").show(300);
      $("#variacion-horas").show(300);
      $("#penalizacionHora").hide(300);
      $("#penalizacionTurno").hide(300);
      $("#variacion-horas").removeClass("has-error");
      $("#variacion-horas"+" span").hide();
    } else if ( difHoras < oldHours ){
      document.getElementById('icon-informe').className = 'fas fa-angle-double-down open';
      $("#mostrarInforme").show(300);
      $("#variacion-horas").hide(300);
      $("#penalizacionHora").show(300);
      $("#penalizacionTurno").hide(300);
      $("#penalizacionHora").removeClass("has-error");
      $("#penalizacionHora"+" span").hide();
    } else {
      document.getElementById('icon-informe').className = 'fas fa-angle-double-down';
      $("#mostrarInforme").hide(300);
      $("#variacion-horas").hide(300);
      $("#penalizacionHora").hide(300);
      $("#penalizacionTurno").hide(300);
    }
  },
  onUpdate: function (data) {
    // Called then slider is changed using Update public method
    let oldFrom = $("#slider-detalle-turno").attr("from");
    let oldTo = $("#slider-detalle-turno").attr("to");
    let oldHours = $("#slider-detalle-turno").attr("hours");
    let from = new Date(data.from);
    let to = new Date(data.to);

    let difHoras = totalHorasDetalle(new Date(data.from),new Date(data.to));
    $("#horasRegitradasDetalle").text(difHoras);

    if ( difHoras > oldHours ){
      document.getElementById('icon-informe').className = 'fas fa-angle-double-down open';
      $("#mostrarInforme").show(300);
      $("#variacion-horas").show(300);
      $("#penalizacionHora").hide(300);
      $("#penalizacionTurno").hide(300);
      $("#variacion-horas").removeClass("has-error");
      $("#variacion-horas"+" span").hide();
    } else if ( difHoras < oldHours ){
      document.getElementById('icon-informe').className = 'fas fa-angle-double-down open';
      $("#mostrarInforme").show(300);
      $("#variacion-horas").hide(300);
      $("#penalizacionHora").show(300);
      $("#penalizacionTurno").hide(300);
      $("#penalizacionHora").removeClass("has-error");
      $("#penalizacionHora"+" span").hide();
    } else {
      document.getElementById('icon-informe').className = 'fas fa-angle-double-down';
      $("#mostrarInforme").hide(300);
      $("#variacion-horas").hide(300);
      $("#penalizacionHora").hide(300);
      $("#penalizacionTurno").hide(300);
    }
  },
});

  // Save instance to variable
  let my_range = $("#slider-detalle-turno").data("ionRangeSlider");
  // Update range slider content (this will change handles positions)
  my_range.update({
    min: fechaIngresoPuesto.valueOf(),
    max: fechaEgresoPuesto.valueOf(),
    from: ingresoParam.valueOf(),
    to: egresoParam.valueOf(),
    disable: false,
  });

  $("#horasRegitradasDetalle").text(difHoras);

  $("#turnoOriginalDetalle").click(function() {
    $("#horaIngresoManual").attr( "carga-manual", "false" );
    if(rowData.ex.to==undefined || rowData.ex.to=="" ){ // Hay que definir Turno Original en cubrimiento
      my_range.update({
        from: ingresoParam.valueOf(),
        to: egresoParam.valueOf(),
        disable: false,
      });
      document.getElementById('icon-informe').className = 'fas fa-angle-double-down';
      $("#mostrarInforme").hide(300);
      $("#variacion-horas").hide(300);
      $("#penalizacionHora").hide(300);
      $("#penalizacionTurno").hide(300);
      $("#horaIngresoManual").hide("slide", {direction: "right"}, 300);
      $("#horaEgresoManual").hide("slide", {direction: "left"}, 300);
      $("select[name=selectMotivo"+"]").val("0");
      $("#comment").val("");
    }else {

    }
  });

  $("#completarTurnoDetalle").click(function() {
    $("#horaIngresoManual").attr( "carga-manual", "false" );
    my_range.update({
      from: ingresoParam.valueOf(),
      to: egresoParam.valueOf(),
      disable: false,
    });
    document.getElementById('icon-informe').className = 'fas fa-angle-double-down';
    $("#mostrarInforme").hide(300);
    $("#variacion-horas").hide(300);
    $("#penalizacionHora").hide(300);
    $("#penalizacionTurno").hide(300);
    $("#horaIngresoManual").hide("slide", {direction: "right"}, 300);
    $("#horaEgresoManual").hide("slide", {direction: "left"}, 300);
    $("select[name=selectMotivo"+"]").val("0");
    $("#comment").val("");
  });

  $("#turno-completo").click(function() {
    my_range.update({
      from: fechaIngresoPuesto.valueOf(),
      to: fechaEgresoPuesto.valueOf(),
    });
    document.getElementById("icon-informe").className = "fas fa-angle-double-down open";
    $("#mostrarInforme").show(300);
    $("#variacion-horas").show(300);
    $("#penalizacionHora").hide(300);
    $("#penalizacionTurno").hide(300);
    $("select[name=selectMotivo"+"]").val("0");
    $("#comment").val("");
  });

  $("#turno-inicio").click(function() {
    my_range.update({
      from: fechaIngresoPuesto.valueOf(),
    });
    document.getElementById("icon-informe").className = "fas fa-angle-double-down open";
    $("#mostrarInforme").show(300);
    $("#variacion-horas").show(300);
    $("#penalizacionHora").hide(300);
    $("#penalizacionTurno").hide(300);
    $("select[name=selectMotivo"+"]").val("0");
    $("#comment").val("");
  });

  $("#turno-final").click(function() {
    my_range.update({
      to: fechaEgresoPuesto.valueOf(),
    });
    document.getElementById("icon-informe").className = "fas fa-angle-double-down open";
    $("#mostrarInforme").show(300);
    $("#variacion-horas").show(300);
    $("#penalizacionHora").hide(300);
    $("#penalizacionTurno").hide(300);
    $("select[name=selectMotivo"+"]").val("0");
    $("#comment").val("");
  });

  $("#carga-manual").click(function() {
    $("#horaIngresoManual").attr( "carga-manual","true");
    my_range.update({
        disable: true,
    });
    $("#horaIngresoManual").show("slide", {direction: "right"}, 300);
    $("#horaEgresoManual").show("slide", {direction: "left"}, 300);

    $("#dtpHIAsistencia").data("DateTimePicker").date(fechaIngresoReal);
    $("#horaIngresoManual").attr( "hora-ingreso", fechaIngresoReal );
    if(rowData.ex.her=="" || rowData.ex.her==undefined){
      $("#dtpHEAsistencia").data("DateTimePicker").date(fechaIngresoReal);
      $('#dtpHEAsistencia').data("DateTimePicker").clear();
      $("#horaIngresoManual").attr("hora-egreso","");
    }else{
      $("#dtpHEAsistencia").data("DateTimePicker").date(fechaEgresoReal);
      $("#horaIngresoManual").attr( "hora-egreso", fechaEgresoReal );
    }
    $("#ingresoVacioMsj").hide();
    $("#ingresoErrorMsj").hide();
    $("#ingresoInput").removeClass("has-warning");
    $("#ingresoInput").removeClass("has-error");

    $("#egresoVacioMsj").hide();
    $("#egresoErrorMsj").hide();
    $("#egresoInput").removeClass("has-warning");
    $("#egresoInput").removeClass("has-error");
  });

  $("#btnHoraIngreso").click(function() {
    if($('#horaIngreso').val()==""){
      $("#ingresoVacioMsj").show();
      $("#ingresoErrorMsj").hide();
      $("#ingresoInput").addClass("has-warning");
      $("#ingresoInput").removeClass("has-error");
      $("#dtpHIAsistencia").data("DateTimePicker").date(fechaIngresoReal);
      let ingresoParam = ingresoParametrizado(fechaIngresoPuesto,fechaIngresoReal);
      my_range.update({
        to: ingresoParam.valueOf(),
      });
    }else{
      let horaIngreso = $("#dtpHIAsistencia").find("input").val();
      let horaEgreso = $("#dtpHEAsistencia").find("input").val();
      if(compararHorasString(horaIngreso,horaEgreso)==-1 && rowData.ex.tn!=true){ // horaIngreso mayor a horaEgreso
        $("#ingresoVacioMsj").hide();
        $("#ingresoErrorMsj").show();
        $("#ingresoInput").removeClass("has-warning");
        $("#ingresoInput").addClass("has-error");
        $("#dtpHIAsistencia").data("DateTimePicker").date(fechaIngresoReal);
      }else{
        let from = new Date(my_range.result.from);
        let to = new Date(my_range.result.to);
        let ingresoParam="";
        let ingresoDate="";
        if(from.getTime()==to.getTime()){
          horaIngreso = $("#dtpHIAsistencia").find("input").val();
          ingresoDate = hourToDate(horaIngreso,rowData.ip,rowData.ep,rowData.ex.fp);
          if(ingresoDate!=false){
            ingresoParam = ingresoParametrizado(fechaIngresoPuesto,new Date(ingresoDate));
            my_range.update({
              from: ingresoParam.valueOf(),
              to: ingresoParam.valueOf(),
            });
            $("#horaIngresoManual").attr( "hora-ingreso",new Date(ingresoDate));
          }else{
            Swal.fire({
              icon: 'error',
              title: 'Fuera de Rango',
              text: 'Hora ingresada fuera de rango',
            });
            my_range.update({
              from: fechaIngresoPuesto.valueOf(),
              to: fechaIngresoPuesto.valueOf(),
            });
            $("#dtpHIAsistencia").data("DateTimePicker").date(fechaIngresoPuesto);
            $("#horaIngresoManual").attr("hora-ingreso",new Date(fechaIngresoPuesto));
          }
        }else{
          $("#ingresoVacioMsj").hide();
          $("#ingresoErrorMsj").hide();
          $("#ingresoInput").removeClass("has-warning");
          $("#ingresoInput").removeClass("has-error");
          horaIngreso = $("#dtpHIAsistencia").find("input").val();
          ingresoDate = hourToDate(horaIngreso,rowData.ip,rowData.ep,rowData.ex.fp);
          if(ingresoDate!=false){
            ingresoParam = ingresoParametrizado(fechaIngresoPuesto,new Date(ingresoDate));
            my_range.update({
              from: ingresoParam.valueOf(),
            });
            $("#horaIngresoManual").attr("hora-ingreso",new Date(ingresoDate));
          }else{
            Swal.fire({
              icon: 'error',
              title: 'Fuera de Rango',
              text: 'Hora ingresada fuera de rango',
            });
            my_range.update({
              from: fechaIngresoPuesto.valueOf(),
            });
            $("#dtpHIAsistencia").data("DateTimePicker").date(fechaIngresoPuesto);
            $("#horaIngresoManual").attr("hora-ingreso",fechaIngresoPuesto);
          }
        }
      }
    }
  });

  $("#btnHoraEgreso").click(function() {
    if($('#horaEgreso').val()==""){
      $("#egresoVacioMsj").show();
      $("#egresoErrorMsj").hide();
      $("#egresoInput").removeClass("has-error");
      $("#egresoInput").addClass("has-warning");
      let egresoParam = ingresoParametrizado(fechaIngresoPuesto,fechaIngresoReal);
      my_range.update({
        to: egresoParam.valueOf(),
      });
      $("#horaIngresoManual").attr("hora-egreso","");
    }else{
      let horaIngreso = $("#dtpHIAsistencia").find("input").val();
      let horaEgreso = $("#dtpHEAsistencia").find("input").val();
      let ingresoDate = "";
      let egresoDate = "";
      if(compararHorasString(horaIngreso,horaEgreso)==-1 && rowData.ex.tn!=true){ // horaEgreso menor a horaIngreso
        $("#egresoVacioMsj").hide();
        $("#egresoErrorMsj").show();
        $("#egresoInput").removeClass("has-warning");
        $("#egresoInput").addClass("has-error");
        $("#dtpHEAsistencia").data("DateTimePicker").date(fechaIngresoReal);
      } else {
        $("#egresoVacioMsj").hide();
        $("#egresoErrorMsj").hide();
        $("#egresoInput").removeClass("has-warning");
        $("#egresoInput").removeClass("has-error");
        horaEgreso = $("#dtpHEAsistencia").find("input").val();
        egresoDate = hourToDate(horaEgreso,rowData.ip,rowData.ep,rowData.ex.fp);
        if(egresoDate!=false){
          let egresoParam = egresoParametrizado(fechaIngresoPuesto,fechaEgresoPuesto,new Date(egresoDate));
          my_range.update({
            to: egresoParam.valueOf(),
          });
          $("#horaIngresoManual").attr("hora-egreso",new Date(egresoDate));
        }else{
          Swal.fire({
            icon: 'error',
            title: 'Fuera de Rango',
            text: 'Hora ingresada fuera de rango',
          });
          //Tendria que volver el slider a la misma hora de ingreso param
          $('#dtpHEAsistencia').data("DateTimePicker").clear();
          $("#horaIngresoManual").attr("hora-egreso","");
        }
      }
    }
  });

  $("#penalizarDetalle").click(function() {
    $("#horaIngresoManual").attr( "carga-manual", "false" );
    my_range.update({
      from: ingresoParam.valueOf(),
      to: egresoParam.valueOf(),
      disable: false,
    });
    document.getElementById('icon-informe').className = 'fas fa-angle-double-down';
    $("#mostrarInforme").hide(300);
    $("#variacion-horas").hide(300);
    $("#penalizacionHora").hide(300);
    $("#penalizacionTurno").hide(300);
    $("#horaIngresoManual").hide("slide", {direction: "right"}, 300);
    $("#horaEgresoManual").hide("slide", {direction: "left"}, 300);
    $("select[name=selectMotivo"+"]").val("0");
    $("#comment").val("");
  });

  $("#descontar-hora").click(function() {
    let horaMenos = new Date( egresoParam.getTime() - 1000 * 60 * 60 );
    if(horaMenos < ingresoParam){
      horaMenos = ingresoParam;
    }
    my_range.update({
      to: horaMenos.valueOf(),
    });
    $("select[name=selectMotivo"+"]").val("0");
    $("#comment").val("");
    let icon = document.getElementById("icon-informe");
    icon.className = 'fas fa-angle-double-down open';
    $("#mostrarInforme").show(300);
    $("#variacion-horas").hide(300);
    $("#penalizacionTurno").hide(300);
    $("#penalizacionHora").show(300);
  });

  $("#descontar-turno").click(function() {
    my_range.update({
      from: ingresoParam.valueOf(),
      to: ingresoParam.valueOf(),
    });
    $("select[name=selectMotivo"+"]").val("0");
    $("#comment").val("");
    let icon = document.getElementById("icon-informe");
    icon.className = 'fas fa-angle-double-down open';
    $("#mostrarInforme").show();
    $("#variacion-horas").hide();
    $("#penalizacionHora").hide();
    $("#penalizacionTurno").show();
  });

  $("#icon-informe").click(function() {
    let icon = document.getElementById("icon-informe");
    let open = $("#icon-informe").hasClass("open");
    if(open){
      icon.className = 'fas fa-angle-double-down';
      $("#mostrarInforme").hide(300);
    }else{
      icon.className = 'fas fa-angle-double-down open';
      $("#mostrarInforme").show(300);
    }
  });

  $("#boton-eliminar-turno").click(function() {
    $("#card-contenedor").hide();
    $("#horas-turno-detalle").hide();
    $("#mostrar-botones").hide();
    $("#mostrarInforme").hide();
    $("#boton-eliminar-turno").prop( "disabled", true );
    $("#boton-habilitar-turno").prop( "disabled", false );
    document.getElementById('icon-informe').className = 'fas fa-angle-double-down';
    my_range.update({
        from: ingresoParam.valueOf(),
        to: egresoParam.valueOf(),
        disable: true,
    });
    $("select[name=selectMotivo"+"]").val("0");
    $("#comment").val("");
    $("#variacion-horas").hide();
    $("#penalizacionHora").hide();
    $("#penalizacionTurno").hide();
    $("#slider-detalle-turno").attr("delete","true");
    $("#turno-eliminar").show();
  });

  $("#boton-habilitar-turno").click(function() {
    $("#card-contenedor").show();
    $("#horas-turno-detalle").show();
    $("#mostrar-botones").show();
    $("#boton-eliminar-turno").prop( "disabled", false );
    $("#boton-habilitar-turno").prop( "disabled", true );
    $("#slider-detalle-turno").attr( "delete", false );
    $("#turno-eliminar").hide();
    my_range.update({
        from: ingresoParam.valueOf(),
        to: egresoParam.valueOf(),
        disable: false,
    });
  });

  $("#slider-detalle-turno").attr("select-motivo","");

  $("#sel-amp-horas").change(function () {
    if ( $("#variacion-horas").hasClass("has-error") && $("#sel-amp-horas").val()!=0 ){
      $("#variacion-horas").removeClass("has-error");
      $("#variacion-horas span").hide();
      $("#slider-detalle-turno").attr( "select-motivo", $("#sel-amp-horas option:selected").text());
    }else if($("#sel-amp-horas").val()!=0){
      $("#slider-detalle-turno").attr( "select-motivo", $("#sel-amp-horas option:selected").text());
    }
  });

  $("#sel-red-horas").change(function (){
    if ( $("#penalizacionHora").hasClass("has-error") && $("#sel-red-horas").val()!=0 ){
      $("#penalizacionHora").removeClass("has-error");
      $("#penalizacionHora span").hide();
      $("#slider-detalle-turno").attr( "select-motivo", $("#sel-red-horas option:selected").text());
    }else if($("#sel-red-horas").val()!=0){
      $("#slider-detalle-turno").attr( "select-motivo", $("#sel-red-horas option:selected").text());
    }
  });

  $("#sel-eli-turno").change(function (){
    if ( $("#penalizacionTurno").hasClass("has-error") && $("#sel-eli-turno").val()!=0 ){
      $("#penalizacionTurno").removeClass("has-error");
      $("#penalizacionTurno span").hide();
      $("#slider-detalle-turno").attr( "select-motivo", $("#sel-eli-turno option:selected").text());
    }else if($("#sel-eli-turno").val()!=0){
      $("#slider-detalle-turno").attr( "select-motivo", $("#sel-eli-turno option:selected").text());
    }
  });

  $("#btn-confirma-personal").click(function(){
    if($("#selectPersonal").val()!=""){
      $("#seleccionPersonal").hide(300);
      $("#card-contenedor").show(300);
      $("#mostrar-slider").show(300);
      $("#control-horas").show(300);
      $("#mostrar-botones").show(300);
      $("#guardar-cambios-detalle").prop( "disabled", false );

      $("#personalDetalleDia").text($("#selectPersonal").val());
      let idPersonal = $("#dataListPersonal").find("option[value='"+$("#selectPersonal").val()+"']").data("id");
      $("#personalDetalleDia").data("id",idPersonal);

      $("#horaIngresoManual").attr("carga-manual","true");
      my_range.update({
          disable: true,
      });
      $("#horaIngresoManual").show("slide", {direction: "right"}, 300);
      $("#horaEgresoManual").show("slide", {direction: "left"}, 300);

      $("#dtpHIAsistencia").data("DateTimePicker").date(fechaIngresoPuesto);
      $("#horaIngresoManual").attr("hora-ingreso", fechaIngresoPuesto );

      $('#dtpHEAsistencia').data("DateTimePicker").clear();
      $("#horaIngresoManual").attr("hora-egreso", "" );

      $("#ingresoVacioMsj").hide();
      $("#ingresoErrorMsj").hide();
      $("#ingresoInput").removeClass("has-warning");
      $("#ingresoInput").removeClass("has-error");

      $("#egresoVacioMsj").hide();
      $("#egresoErrorMsj").hide();
      $("#egresoInput").removeClass("has-warning");
      $("#egresoInput").removeClass("has-error");

      $("#turnoOriginalDetalle").prop('disabled', true);
      $("#completarTurnoDetalle").prop('disabled', true);
      $("#penalizarDetalle").prop('disabled', true);

      $("#control-horas").attr("nuevo-turno","true");
    }else{
      Swal.fire({
        icon: 'warning',
        title: 'Seleccione una persona',
        text: 'Falta seleccionar una persona',
      });
    }
  });

}

function hourToDate(hourStr,ingresoPuesto,egresoPuesto,fechaPuesto){
  if(compararHorasString(ingresoPuesto,egresoPuesto)==-1){
    if( compararHorasString(ingresoPuesto,hourStr)==0 || compararHorasString(ingresoPuesto,hourStr)==1 && compararHorasString("24:00",hourStr)==-1 ){
        return new Date(fechaPuesto+"T"+hourStr+":00");
    }else if( compararHorasString(egresoPuesto,hourStr)==0 || compararHorasString("00:00",hourStr)==1 && compararHorasString(egresoPuesto,hourStr)==-1 ){
      let hourStrDate = new Date(fechaPuesto+"T"+hourStr+":00");
      return hourStrDate.getTime() + 24*60*60*1000;
    }else{
      return false;
    }
  } else {
    if( compararHorasString(ingresoPuesto,hourStr)==0 || compararHorasString(egresoPuesto,hourStr)==0 ||
        compararHorasString(ingresoPuesto,hourStr)==1 && compararHorasString(egresoPuesto,hourStr)==-1 ){
      return new Date(fechaPuesto+"T"+hourStr+":00");
    }else{
      return false;
    }
  }
}

function inicializarModalTurno(){

  $("#detalle-turno").on("hidden.bs.modal", function(){
    $("#guardar-cambios-detalle").prop( "disabled", false );
    $('#guardar-cambios-detalle').off('click');
    $('#turnoOriginalDetalle').off('click');
    $('#completarTurnoDetalle').off('click');
    $('#turno-completo').off('click');
    $('#turno-inicio').off('click');
    $('#turno-final').off('click');
    $('#carga-manual').off('click');
    $('#penalizarDetalle').off('click');
    $('#descontar-hora').off('click');
    $('#descontar-turno').off('click');
    $('#icon-informe').off('click');
    $('#boton-eliminar-turno').off('click');
    $('#boton-habilitar-turno').off('click');
    $('#btnHoraIngreso').off('click');
    $('#btnHoraEgreso').off('click');
    $('#btn-confirma-personal').off('click');

    $("#foto-ingreso").css('background-image', 'url()');
    $("#foto-egreso").css('background-image', 'url()');

    $("#card-contenedor").show();
    $("#horas-turno-detalle").show();
    $("#mostrar-botones").show();
    $("#boton-eliminar-turno").prop( "disabled", false );
    $("#boton-habilitar-turno").prop( "disabled", true );
    $("#slider-detalle-turno").attr( "delete", false );
    $("#turno-eliminar").hide();
    $("#horaIngresoManual").hide();
    $("#horaEgresoManual").hide();

    $("#turnoOriginalDetalle").prop('disabled', false);
    $("#completarTurnoDetalle").prop('disabled', false);
    $("#penalizarDetalle").prop('disabled', false);

    $("select[name=selectMotivo]").val("0");
    $("#comment").val("");
    $(".select-motivo").hide();
    $("#mostrarInforme").hide();
    document.getElementById("icon-informe").className = "fas fa-angle-double-down";

    $("#horaIngresoManual").attr( "carga-manual", "false" );
    $("#control-horas").attr("nuevo-turno","false");

    $("#ingresoVacioMsj").hide();
    $("#ingresoErrorMsj").hide();
    $("#ingresoInput").removeClass("has-warning");
    $("#ingresoInput").removeClass("has-error");

    $("#egresoVacioMsj").hide();
    $("#egresoErrorMsj").hide();
    $("#egresoInput").removeClass("has-warning");
    $("#egresoInput").removeClass("has-error");
  });

}

function guardarCambiosAsistencia(rowData,row){

  let slider = $("#slider-detalle-turno").data("ionRangeSlider");
  let from = new Date(slider.result.from);
  let to = new Date(slider.result.to);
  let oldFrom = new Date( $("#slider-detalle-turno").attr("from") );
  let oldTo = new Date ( $("#slider-detalle-turno").attr("to") );
  let oldHours = $("#slider-detalle-turno").attr("hours");
  let delTurno = $("#slider-detalle-turno").attr("delete");
  let cargaManual = $("#horaIngresoManual").attr("carga-manual");
  let nuevoTurno = $("#control-horas").attr("nuevo-turno");
  let comment = $("#comment").val();
  let motive = $("#slider-detalle-turno").attr("select-motivo");
  let difHoras = totalHorasDetalle(from,to);
  let errorMessage=false;

  if (oldHours < difHoras){
    if( $("#sel-amp-horas").val() == 0) {
      errorMessage=true;
      document.getElementById("icon-informe").className = "fas fa-angle-double-down open";
      $("#mostrarInforme").show(300);
      $("#variacion-horas").show(300);
      $("#penalizacionHora").hide(300);
      $("#penalizacionTurno").hide(300);
      $("#variacion-horas").addClass("has-error");
      $("#variacion-horas span").show(300);
    }
  } else if (oldHours > difHoras){

    if (oldFrom.getTime() == from.getTime() && oldFrom.getTime() == to.getTime()){
      if( $("#sel-eli-turno").val()=="0" && $("#sel-red-horas").val()=="0") {
        errorMessage=true;
        document.getElementById("icon-informe").className = "fas fa-angle-double-down open";
        $("#mostrarInforme").show(300);
        $("#variacion-horas").hide(300);
        $("#penalizacionHora").hide(300);
        $("#penalizacionTurno").show(300);
        $("#penalizacionTurno").addClass("has-error");
        $("#penalizacionTurno span").show(300);
      }
    } else {

      if( $("#sel-red-horas").val() == 0) {
        errorMessage=true;
        document.getElementById("icon-informe").className = "fas fa-angle-double-down open";
        $("#mostrarInforme").show(300);
        $("#variacion-horas").hide(300);
        $("#penalizacionHora").show(300);
        $("#penalizacionTurno").hide(300);
        $("#penalizacionHora").addClass("has-error");
        $("#penalizacionHora span").show(300);
      }

    }
  }

  if (errorMessage){
    Swal.fire({
      icon: 'error',
      title: 'Falta completar motivos',
      text: 'Por favor complete los motivos faltantes',
    });
  } else {
    if(delTurno=="true"){
      Swal.fire({
      title:'Esta seguro que desea eliminar este cubrimiento?',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f56954',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
      })
      .then((result) => {
        if (result.value) {

          rowData.hi = "-";
          rowData.he = "-";
          rowData.pe = "-";
          rowData.es = "-";

          db.collection("clientes").doc(rowData.ex.idc).collection("objetivos").doc(rowData.ex.ido).collection("cobertura").doc(rowData.ex.idf).collection("puestos").doc(rowData.ex.ic)
          .delete()
          .then(function() {
            $("#detalle-turno").modal("hide");
            //cargarFila(rowData,row);
            Swal.fire({
              icon: 'success',
              title: 'Cubrimiento eliminado con exito',
              showConfirmButton: false,
              timer: 1500
            })
          })
          .catch(function(){
            console.log("Error al eliminar turno");
            $("#detalle-turno").modal("hide");
          });
        }
      });
    }else if(cargaManual=="true"){

      let oldFromManual = $("#horaIngresoManual").attr("from");
      let oldToManual = $("#horaIngresoManual").attr("to");
      let fromManual = $("#horaIngresoManual").attr("hora-ingreso");
      let toManual = $("#horaIngresoManual").attr("hora-egreso");
      let oldData = {};
      let cubrimiento = {};

      if(oldFromManual!=fromManual || oldToManual!=toManual){
        if(oldFromManual!=fromManual){
            oldData.oldFrom = oldFromManual;
            cubrimiento.horaIngreso = getHoursStr(new Date (fromManual));
            cubrimiento.fechaIngreso = getDateStr(new Date (fromManual));
            let fechaIngresoPuesto = new Date(rowData.ex.fp+"T"+rowData.ip+":00");
            rowData.hi = componerHorasDate(ingresoParametrizado(fechaIngresoPuesto,new Date(fromManual)));
            rowData.ex.hir = getHoursStr(new Date (fromManual));
            rowData.ex.fi = getDateStr(new Date (fromManual));
        }
        if (oldToManual!=toManual){
            if(toManual!=""){
              oldData.oldTo = oldToManual;
              cubrimiento.horaEgreso = getHoursStr(new Date(toManual));
              cubrimiento.fechaEgreso = getDateStr(new Date(toManual));
              let fechaIngresoPuesto = new Date(rowData.ex.fp+"T"+rowData.ip+":00");
              let fechaEgresoPuesto = new Date(rowData.ex.fp+"T"+rowData.ep+":00");
              if(compararHorasString(rowData.ip,rowData.ep)==-1){
                fechaEgresoPuesto = new Date( fechaEgresoPuesto.getTime() + 24*60*60*1000 );
              }
              rowData.he = componerHorasDate(egresoParametrizado(fechaIngresoPuesto,fechaEgresoPuesto,new Date(toManual)));
              rowData.ex.her = getHoursStr(new Date(toManual));
              rowData.ex.fe = getDateStr(new Date(toManual));
            }else{
              oldData.oldTo = oldToManual;
              cubrimiento.horaEgreso = "";
              cubrimiento.fechaEgreso = "";
              rowData.he = "-"
              rowData.ex.her = "";
              rowData.ex.fe = "";
            }
        }

        if(nuevoTurno=="true"){
           cubrimiento.idPersonal = ""+$("#personalDetalleDia").data("id");
           cubrimiento.ingresoPuesto = rowData.ip;
           cubrimiento.egresoPuesto = rowData.ep;
           cubrimiento.nombrePuesto = rowData.ex.np;
           cubrimiento.nombreTurno = rowData.ex.nt;
           cubrimiento.imagePath = "";
           cubrimiento.horasTurno = rowData.ex.ht;
           cubrimiento.fechaPuesto = rowData.ex.fp;
           if(toManual==""){
             cubrimiento.horaEgreso = "";
             cubrimiento.fechaEgreso = "";
           }
           if(rowData.ex.tn==true){
             cubrimiento.turnoNoche = true;
           }else{
             cubrimiento.turnoNoche = false;
           }
           cubrimiento.cps = true;
           if(comment!=""){
             cubrimiento.comment =comment;
           }
           rowData.pe = $("#personalDetalleDia").text();
           rowData.ex.idf = rowData.ex.fp;

           db.collection("clientes").doc(rowData.ex.idc).collection("objetivos").doc(rowData.ex.ido).collection("cobertura").doc(rowData.ex.idf).collection("puestos")
           .add(cubrimiento)
           .then(function(doc) {
             rowData.ex.ic = doc.id;
             cargarFechaNueva(rowData);
             $("#detalle-turno").modal("hide");
             //cargarFila(rowData,row);
             Swal.fire({
               icon: 'success',
               title: 'Cambios guardados correctamente',
               showConfirmButton: false,
               timer: 1500
             })
           })
           .catch(function(error){
             console.log("Error al cargar turno",error);
           });

        } else {
          if(comment!=""){
            oldData.comment = comment;
          }
          oldData.motive = motive;
          //oldData.idOper = "1";
          cubrimiento.oldData = oldData;
          cubrimiento.estado = "mod";

          db.collection("clientes").doc(rowData.ex.idc).collection("objetivos").doc(rowData.ex.ido).collection("cobertura").doc(rowData.ex.idf).collection("puestos").doc(rowData.ex.ic)
          .update(cubrimiento)
          .then(function() {
            $("#detalle-turno").modal("hide");
            //cargarFila(rowData,row);
            Swal.fire({
              icon: 'success',
              title: 'Cambios guardados correctamente',
              showConfirmButton: false,
              timer: 1500
            })
          })
          .catch(function(){
            console.log("Error al cargar turno");
          });
        }
      }else{
        Swal.fire({
          icon: 'warning',
          title: 'Sin cambios',
          text: 'No se hicieron cambios para guardar',
        });
      }
    }else if(oldFrom.getTime()!=from.getTime() || oldTo.getTime()!=to.getTime()){
      let oldData = {};
      let cubrimiento = {}

      if(oldFrom!=from){
        oldData.oldFrom = oldFrom;
        cubrimiento.horaIngreso = getHoursStr(from);
        cubrimiento.fechaIngreso = getDateStr(from);
        rowData.hi = getHoursStr(from);
        rowData.ex.hir = getHoursStr(from);
        rowData.ex.fi = getDateStr(from);
      }
      if(oldTo!=to){
        oldData.oldTo = oldTo;
        cubrimiento.horaEgreso = getHoursStr(to);
        cubrimiento.fechaEgreso = getDateStr(to);
        rowData.he = getHoursStr(to);
        rowData.ex.her = getHoursStr(to);
        rowData.ex.fe = getDateStr(to);
      }
      if(comment!=""){
        oldData.comment = comment;
      }
      oldData.motive = motive;
      oldData.idOper = "1";

      cubrimiento.oldData = oldData;
      cubrimiento.estado = "mod";

      db.collection("clientes").doc(rowData.ex.idc).collection("objetivos").doc(rowData.ex.ido).collection("cobertura").doc(rowData.ex.idf).collection("puestos").doc(rowData.ex.ic)
      .update(cubrimiento)
      .then(function() {
        $("#detalle-turno").modal("hide");
        //cargarFila(rowData,row);
        Swal.fire({
          icon: 'success',
          title: 'Cambios guardados correctamente',
          showConfirmButton: false,
          timer: 1500
        })
      })
      .catch(function(){
        console.log("Error al cargar turno");
      });
    }else{
      Swal.fire({
        icon: 'warning',
        title: 'Sin cambios',
        text: 'No se hicieron cambios para guardar',
      });
    }
  }

}

function cargarFila(rowData,row){
  let tipoAsistencia = $("#asistenciaTable").data("type");
  if(tipoAsistencia=="ingreso"){
    let horaIngresoDate = new Date( Date.parse(rowData.ex.fi+"T"+rowData.hi+":00") );
    let ingresoPuestoDate = new Date( Date.parse(rowData.ex.fp+"T"+rowData.ip+":00") );
    let estado="ingreso-cubierto";
    if(horaIngresoDate>ingresoPuestoDate){
      estado="ingreso-cubierto-tarde";
    }
    rowData.es = estado;
  }else{
    let horaActual = $("#asistenciaTable").data("currentTime");
    let estado="egreso-cerrado";
    let egresoPuestoDate = "";
    let ingresoPuestoDate = new Date( Date.parse(rowData.ex.fp+"T"+rowData.ip+":00") );
    let fechaPuestoDate=new Date( Date.parse(rowData.ex.fp+"T00:00:00"));

    if (rowData.ex.tn==true) { //Si el puesto es turno noche
      egresoPuestoDate = new Date( Date.parse(rowData.ex.fp+"T"+rowData.ep+":00"));
      egresoPuestoDate.setDate(egresoPuestoDate.getDate()+1);
    }else{
      egresoPuestoDate = new Date( Date.parse(rowData.ex.fp+"T"+rowData.ep+":00") );
    }

    if(rowData.ex.her!="" && rowData.ex.her!=undefined){ // Si la hora del puesto esta cargada y no es vacia
      let horaEgresoDate = new Date( Date.parse(rowData.ex.fe+"T"+rowData.ex.her+":00") ); // Ver de generar objeto Date
      let egresoParametrizadoDate = egresoParametrizado(ingresoPuestoDate,egresoPuestoDate,horaEgresoDate)
      if(egresoParametrizadoDate<egresoPuestoDate){
        estado="egreso-cierre-anticipado";
      }
    } else if (horaActual>egresoPuestoDate){
      estado="egreso-no-cerrado";
    } else if(horaActual<egresoPuestoDate){
      estado="egreso-cubriendose"
    }
    rowData.es = estado;
  }
  table = $("#asistenciaTable").DataTable();
  table.row(row.parents("tr")).data(rowData).draw();
}

function eliminarFila(rowData,row){
  table = $("#asistenciaTable").DataTable();
  table.row(row.parents("tr")).remove().draw();
}

function cargaManual(){
  // $("#card-contenedor").hide();
  listadoPersonalAsistencia("dataListPersonal");
  $("#objetivoNoIniciado").hide(300);
  $("#objetivoDescubierto").hide(300);
  $("#btn-carga-manual").hide(300);
  $("#seleccionPersonal").show(300);
  $("#guardar-cambios-detalle").prop( "disabled", true );

}

function listadoPersonalAsistencia(idDataList){
  let listadoPersonal = [];

  $("#selectPersonal").val("");
  // $("#selectPersonal").width(170);
  $("#selectPersonal").attr("size",20);

  db.collection("users").orderBy("nombre")
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        let item = {
          no : doc.data().nombre,
          ip : doc.data().idPersonal,
        };
        listadoPersonal.push(item);
      });
      desplegablePersonalAsistencia(listadoPersonal,idDataList);
    });
}

function desplegablePersonalAsistencia(listadoPersonal,idDataList){

  var datalist = document.getElementById(idDataList);

  $("#"+idDataList).empty();

  listadoPersonal.forEach(function(item){
     var option = document.createElement("option");
     option.text = "Nro Legajo: "+item.ip;
     option.value = item.no;
     option.setAttribute("data-id",item.ip);
     datalist.appendChild(option);
  });
}

function inputSize(){
  let size = $("#selectPersonal").val().length;
  $("#selectPersonal").attr("size",size+5);
}

function cargarFechaNueva(rowData){
  let fechaNueva = new Date(rowData.ex.fp+"T00:00:00");
  db.collection("clientes").doc(rowData.ex.idc).collection("objetivos").doc(rowData.ex.ido).collection("cobertura").doc(rowData.ex.fp)
  .set({fecha : fechaNueva}, { merge: true })
  .then(function() {
  })
  .catch(function(error){
    console.log("Error la fecha",error);
  });
}

function devolverPersonal(idPersonal){
  return new Promise(function(resolve,reject){

    db.collection("users")
    .where("idPersonal","==",idPersonal)
    .get()
    .then(function(querySnapshot) {
        if (querySnapshot.empty) {
          // Si NO se encuentra el usuario se procede a la carga del turno con el nombre vacio
          resolve("Sin Identificar");
        } else {
          //Si se encuentra el nombre se procede a la carga completa del turno
          querySnapshot.forEach(function(doc) {
            resolve(doc.data().nombre);
          });
        }
    })
    .catch(function(){
      resolve("Error Personal")
    });

  });

}

function verificarEstados(){
    let month = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    momentoActual = new Date();
    hora = momentoActual.getHours();
    minuto = momentoActual.getMinutes();
    segundo = momentoActual.getSeconds();
    if( minuto==0 || minuto==15 || minuto==30 || minuto==45 ){
      let tipoAsistencia = $("#asistenciaTable").data("type");
      let table = $("#asistenciaTable").DataTable();
      if(tipoAsistencia=="ingreso"){
        table.rows().every( function () {
           let rowData = this.data();
           let ingresoPuestoDate = new Date( Date.parse(rowData.ex.fp+"T"+rowData.ip+":00") );
           if(ingresoPuestoDate<momentoActual && rowData.es=="ingreso-no-iniciado"){
             ultimaActualizacion(momentoActual);
             let row = this.node();
             rowData.es="ingreso-descubierto";
             row.classList.remove("grupo-descubierto", "grupo-no-iniciado" , "grupo-cubierto-tarde" , "grupo-cubierto" , "grupo-cerrado" , "grupo-cierre-anticipado" , "grupo-cubriendose" , "grupo-no-cerrado" );
             if(rowData.es.includes('descubierto')){
               $(row).addClass("grupo-descubierto");
             } else if (rowData.es.includes('no-iniciado')){
               $(row).addClass("grupo-no-iniciado");
             } else if (rowData.es=="ingreso-cubierto-tarde"){
               $(row).addClass("grupo-cubierto-tarde");
             } else if (rowData.es=="ingreso-cubierto"){
               $(row).addClass("grupo-cubierto");
             } else if (rowData.es=="egreso-cerrado"){
               $(row).addClass("grupo-cerrado");
             } else if (rowData.es=="egreso-cierre-anticipado"){
               $(row).addClass("grupo-cierre-anticipado");
             } else if (rowData.es=="egreso-cubriendose"){
               $(row).addClass("grupo-cubriendose");
             } else if (rowData.es=="egreso-no-cerrado"){
               $(row).addClass("grupo-no-cerrado");
             }
             $(row).addClass("highlight_mod",3000,"swing",function(){
               $(row).removeClass("highlight_mod");
             });
             this.invalidate(); // invalidate the data DataTables has cached for this row
           }
        } );
        // Draw once all updates are done
        table.draw();
      }else{
        table.rows().every( function () {
           let rowData = this.data();
           let ingresoPuestoDate = new Date( Date.parse(rowData.ex.fp+"T"+rowData.ip+":00") );
           let egresoPuestoDate = new Date( Date.parse(rowData.ex.fp+"T"+rowData.ep+":00") );
           if(egresoPuestoDate<momentoActual && rowData.es=="egreso-cubriendose"){
             ultimaActualizacion(momentoActual);
             let row = this.node();
             rowData.es="egreso-no-cerrado";
             row.classList.remove("grupo-descubierto", "grupo-no-iniciado" , "grupo-cubierto-tarde" , "grupo-cubierto" , "grupo-cerrado" , "grupo-cierre-anticipado" , "grupo-cubriendose" , "grupo-no-cerrado" );
             if(rowData.es.includes('descubierto')){
               $(row).addClass("grupo-descubierto");
             } else if (rowData.es.includes('no-iniciado')){
               $(row).addClass("grupo-no-iniciado");
             } else if (rowData.es=="ingreso-cubierto-tarde"){
               $(row).addClass("grupo-cubierto-tarde");
             } else if (rowData.es=="ingreso-cubierto"){
               $(row).addClass("grupo-cubierto");
             } else if (rowData.es=="egreso-cerrado"){
               $(row).addClass("grupo-cerrado");
             } else if (rowData.es=="egreso-cierre-anticipado"){
               $(row).addClass("grupo-cierre-anticipado");
             } else if (rowData.es=="egreso-cubriendose"){
               $(row).addClass("grupo-cubriendose");
             } else if (rowData.es=="egreso-no-cerrado"){
               $(row).addClass("grupo-no-cerrado");
             }
             $(row).addClass("highlight_mod",3000,"swing",function(){
               $(row).removeClass("highlight_mod");
             });
             this.invalidate(); // invalidate the data DataTables has cached for this row
           }else if(ingresoPuestoDate<momentoActual && rowData.es=="egreso-no-iniciado"){
             ultimaActualizacion(momentoActual);
             let row = this.node();
             rowData.es="egreso-descubierto";
             row.classList.remove("grupo-descubierto", "grupo-no-iniciado" , "grupo-cubierto-tarde" , "grupo-cubierto" , "grupo-cerrado" , "grupo-cierre-anticipado" , "grupo-cubriendose" , "grupo-no-cerrado" );
             if(rowData.es.includes('descubierto')){
               $(row).addClass("grupo-descubierto");
             } else if (rowData.es.includes('no-iniciado')){
               $(row).addClass("grupo-no-iniciado");
             } else if (rowData.es=="ingreso-cubierto-tarde"){
               $(row).addClass("grupo-cubierto-tarde");
             } else if (rowData.es=="ingreso-cubierto"){
               $(row).addClass("grupo-cubierto");
             } else if (rowData.es=="egreso-cerrado"){
               $(row).addClass("grupo-cerrado");
             } else if (rowData.es=="egreso-cierre-anticipado"){
               $(row).addClass("grupo-cierre-anticipado");
             } else if (rowData.es=="egreso-cubriendose"){
               $(row).addClass("grupo-cubriendose");
             } else if (rowData.es=="egreso-no-cerrado"){
               $(row).addClass("grupo-no-cerrado");
             }
             $(row).addClass("highlight_mod",3000,"swing",function(){
               $(row).removeClass("highlight_mod");
             });
             this.invalidate(); // invalidate the data DataTables has cached for this row
           }
        } );
        // Draw once all updates are done
        table.draw();
      }
    }
  setTimeout("verificarEstados()",1000*60);
}

function ultimaActualizacion(horaActual){
  let month = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  $("#ultima-actualizacion").text("Ultima Actualizacion "+horaActual.getDate()+" de "+month[horaActual.getMonth()]+" de "+horaActual.getFullYear()+" a las "+addZero(horaActual.getHours())+":"+addZero(horaActual.getMinutes())+" Hs.");
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
    });
  });

}

function clearOptionsFast(id){
	document.getElementById(id).innerHTML = "";
}
