
var arrayPuestosAsistencia = [];

function cargarPuestosAsistencia(button){

  limpiarTabla();

  arrayPuestosAsistencia = [];
  tipoAsistencia="";

  if(validarFormularioAsistencia()){

    loaderState();

    let nombreCliente = document.getElementById("selectCliente").value;
    let nombreObjetivo = document.getElementById("selectObjetivo").value;
    tipoAsistencia = button.value;
    $("#asistenciaTable").data("type", button.value );

    let numeroDia = 6; // 06 - Sabado
    let numeroDiaAnterior = restarNumeroDia(numeroDia);
    let fechaActual = new Date(2020,2,14,0,0,0,0); // 14/03/2020
    let fechaAyer = fechaAyerDate(fechaActual);
    let horaActual = new Date(2020,2,14,13,20,20,0);
    $("#asistenciaTable").data("currentTime", horaActual );
    let month = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    $("#ultima-actualizacion").text("Ultima Actualizacion "+horaActual.getDate()+" de "+month[horaActual.getMonth()]+" de "+horaActual.getFullYear()+" a las "+addZero(horaActual.getHours())+":"+addZero(horaActual.getMinutes())+" Hs.");

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

    // Ejecuto la Promisa
    promiseAsistencia.then(function(result) {
      console.log("SE EJECUTARON TODAS LAS PROMESAS");
      cargarCubrimientoAsistencia(arrayPuestosAsistencia);
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
                  if(dentroRangoHoras(dia.egresoPuesto,horaDesde,horaHasta) && dia.turnoNoche==true){ // Cargo solamente los turnos noche del dia anterior
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

    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
    .where("fecha","==",fechaActual)
    .get()
    .then(function(querySnapshot) {
        if (querySnapshot.empty) {
          // Si NO hay un puesto cargado para esta fecha
          cargarTurnoAsistenciaIngresosVacio(nombreCliente,nombreObjetivo,puesto,fechaActual,horaActual)
          .then(function(){
            resolve();
          });
        } else {
          // Si hay un puesto para esa fecha
          querySnapshot.forEach(function(doc) {
            let idFecha=doc.id;
            db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura").doc(idFecha).collection("puestos")
            .where("nombrePuesto","==",puesto.nombrePuesto).where("ingresoPuesto","==",puesto.ingresoPuesto)
            .get()
            .then(function(querySnapshot) {
                if (querySnapshot.empty) {
                  // Si NO hay un puesto cargado que coincida con el nombrePuesto e ingresoPuesto
                  cargarTurnoAsistenciaIngresosVacio(nombreCliente,nombreObjetivo,puesto,fechaActual,horaActual)
                  .then(function(){
                    resolve();
                  });
                } else {
                  // Si hay un puesto cargado que coincida con el nombrePuesto e ingresoPuesto recorro el resultado

                  const promises = [];
                  querySnapshot.forEach(function(doc) {
                    let cubrimiento=doc.data();
                    cubrimiento.id=doc.id;
                    promises.push( cargarTurnoAsistenciaIngresos(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,cubrimiento) );
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
                  console.log("Error al obtener una fecha de cobertura:", error);
                  reject(error);
              });
          });
        }
      }).catch(function(error) {
          console.log("Error al obtener una fecha de cobertura:", error);
          reject(error);
      });
  });

}

function cargarCoberturaEgresos(nombreCliente,nombreObjetivo,idCliente,idObjetivo,fechaActual,puesto,horaActual){
//fecha Actual es igual a la fecha del puesto a cargar, esta si puede variar al ingresar como parametro cuando se analiza el dia anterior fechaAyer
  return new Promise(function(resolve,reject){

    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura")
    .where("fecha","==",fechaActual)
    .get()
    .then(function(querySnapshot) {
        if (querySnapshot.empty) {
          // Si NO hay ningun puesto cargado para esta fecha
          cargarTurnoAsistenciaEgresosVacio(nombreCliente,nombreObjetivo,puesto,fechaActual,horaActual)
          .then(function(){
            resolve();
          });
        } else {
          // Si hay un puesto para esa fecha
          querySnapshot.forEach(function(doc) {
            let idFecha=doc.id;
            db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cobertura").doc(idFecha).collection("puestos")
            .where("nombrePuesto","==",puesto.nombrePuesto).where("egresoPuesto","==",puesto.egresoPuesto)
            .get()
            .then(function(querySnapshot) {
                if (querySnapshot.empty) {
                  // Si NO hay un puesto cargado que coincida con el nombrePuesto y egresoPuesto
                  cargarTurnoAsistenciaEgresosVacio(nombreCliente,nombreObjetivo,puesto,fechaActual,horaActual)
                  .then(function(){
                    resolve();
                  });
                } else {
                  // Si hay un puesto cargado que coincida con el nombrePuesto y egresoPuesto recorro el resultado
                  const promises = [];
                  querySnapshot.forEach(function(doc) {
                    let cubrimiento = doc.data();
                    cubrimiento.id = doc.id;
                    promises.push( cargarTurnoAsistenciaEgresos(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,cubrimiento,horaActual) );
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
                  console.log("Error al obtener una fecha de cobertura:", error);
                  reject(error);
              });
          });
        }
      }).catch(function(error) {
          console.log("Error al obtener una fecha de cobertura:", error);
          reject(error);
      });

  });

}

function cargarTurnoAsistenciaIngresos(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,cubrimiento){

  return new Promise(function(resolve,reject){

    let horaIngresoDate = new Date( Date.parse(cubrimiento.fechaIngreso+"T"+cubrimiento.horaIngreso+":00") );
    let ingresoPuestoDate = new Date( Date.parse(cubrimiento.fechaPuesto+"T"+puesto.ingresoPuesto+":00") );
    let egresoPuestoDate = new Date( Date.parse(cubrimiento.fechaPuesto+"T"+puesto.egresoPuesto+":00") );
    let horaRegistradaIngreso = componerHorasDate(ingresoParametrizado(ingresoPuestoDate,horaIngresoDate));
    let horaRegistradaEgreso = "-";
    let estado="ingreso-cubierto";
    let options = {year: "numeric", month: "numeric", day: "numeric"};

    if (puesto.turnoNoche) { //Si el puesto es turno noche
      egresoPuestoDate.setDate(egresoPuestoDate.getDate()+1);
    }

    if(cubrimiento.horaEgreso!=""){ // Si la hora del puesto esta cargada y no es vacia
      let horaEgresoDate = new Date( Date.parse(cubrimiento.fechaEgreso+"T"+cubrimiento.horaEgreso+":00") ); // Ver de generar objeto Date
      let egresoParametrizadoDate = egresoParametrizado(ingresoPuestoDate,egresoPuestoDate,horaEgresoDate)
      horaRegistradaEgreso = componerHorasDate(egresoParametrizadoDate);
    }

    if(horaIngresoDate>ingresoPuestoDate){
      estado="ingreso-cubierto-tarde";
    }

     let turnoPuesto = {
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
              est : cubrimiento.estado,
              idc : idCliente,
              ido : idObjetivo,
              idf : idFecha,
            },
     }

     devolverPersonal(cubrimiento.idPersonal)
     .then(function(result){
       turnoPuesto.pe=result;
       arrayPuestosAsistencia.push(turnoPuesto);
       resolve();
     })
     .catch(function(result){
       turnoPuesto.pe=result;
       arrayPuestosAsistencia.push(turnoPuesto);
       resolve();
     });

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

function cargarTurnoAsistenciaIngresosVacio(nombreCliente,nombreObjetivo,puesto,fechaPuesto,horaActual){

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

     let turnoPuesto = {
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
       ex : "",
     }
     arrayPuestosAsistencia.push(turnoPuesto);
     resolve();
  });

}

function cargarTurnoAsistenciaEgresos(idCliente,idObjetivo,idFecha,nombreCliente,nombreObjetivo,puesto,cubrimiento,horaActual){

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

  if(cubrimiento.horaEgreso!=""){ // Si la hora del puesto esta cargada y no es vacia
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

   let turnoPuesto = {
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
            est : cubrimiento.estado,
            idc : idCliente,
            ido : idObjetivo,
            idf : idFecha,
          },
   }

   devolverPersonal(cubrimiento.idPersonal)
   .then(function(result){
     turnoPuesto.pe=result;
     arrayPuestosAsistencia.push(turnoPuesto);
     resolve();
   })
   .catch(function(result){
     turnoPuesto.pe=result;
     arrayPuestosAsistencia.push(turnoPuesto);
     resolve();
   });

  });

}

function cargarTurnoAsistenciaEgresosVacio(nombreCliente,nombreObjetivo,puesto,fechaPuesto,horaActual){

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

     let turnoPuesto = {
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
       ex : "",
     }
     arrayPuestosAsistencia.push(turnoPuesto);
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
  cargarCubrimientoAsistencia([]);
  inicializarModalTurno();
}

function cargarCubrimientoAsistencia(listaPuestos){

  let table="";

  if ( $.fn.dataTable.isDataTable("#asistenciaTable") ) {
    table = $("#asistenciaTable").DataTable();
    table.clear();
  }
  else {
    table = $("#asistenciaTable").DataTable({
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
                  return '<span class="label" style="background-color:#FF6347;">Descubiertos</span>';
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

  listaPuestos.forEach(function(item){
    let currentRow = table.row.add(item).draw();
    let row = currentRow.node();
    if(item.es=="Descubierto"){
      $(row).addClass("grupo-descubierto");
    }else if(item.es=="No Iniciado"){
      $(row).addClass("grupo-no-iniciado");
    } else if (item.es=="Cubierto Tarde"){
      $(row).addClass("grupo-cubierto-tarde");
    } else if (item.es=="Cubierto"){
      $(row).addClass("grupo-cubierto");
    } else if (item.es=="Cerrado"){
      $(row).addClass("grupo-cerrado");
    } else if (item.es=="Cierre Anticipado"){
      $(row).addClass("grupo-cierre-anticipado");
    } else if (item.es=="Cubriendose"){
      $(row).addClass("grupo-cubriendose");
    } else if (item.es=="No Cerrado"){
      $(row).addClass("grupo-no-cerrado");
    }
  })

  $('#asistenciaTable tbody').off('click', 'span.editar');

  $('#asistenciaTable tbody').on('click', 'span.editar', function () {
    let row = $(this);
    let data = table.row(row.parents("tr")).data();
    if(data.es.includes('descubierto')){
      Swal.fire({
        icon: 'error',
        title: 'Objetivo descubierto',
        text: 'El objetivo esta descubierto',
      });
    }else if(data.es.includes('no-iniciado')){
      Swal.fire({
        icon: 'error',
        title: 'Objetivo no iniciado',
        text: 'El objetivo aun no ha iniciado',
      });
    } else {
      mostrarTurnoAsistencia(data,row);
    }
  });

}

function mostrarTurnoAsistencia(rowData,row){

  cargarTurnoAsistencia(rowData,row);
  cargarRangeSliderDetalleTurno(rowData);
  $("#detalle-turno").modal("show");

}

function cargarTurnoAsistencia(rowData,row){

  $("#nombreDetalleDia").text(rowData.pe);

  if(rowData.ex.est=="mod"){
    $("#estado-detalle").show();
  } else{
    $("#estado-detalle").hide();
  }

  nombreTurno ="";
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

  if(rowData.ex.ph!=""){
    cargarImagen(rowData.ex.ph+rowData.ex.ip+"_INGRESO.jpg","foto-ingreso");
  } else{
    $("#foto-ingreso").css('background-image', 'url(assets/img/sin-foto.png)');
  }
  if(rowData.he!=""){
    cargarImagen(rowData.ex.ph+rowData.ex.ip+"_EGRESO.jpg","foto-egreso");
  } else{
    $("#foto-egreso").css('background-image', 'url(assets/img/sin-foto.png)');
  }

  $("#horaIngresoReal").text(rowData.ex.hir);
  if(rowData.ex.her!=""){
    $("#horaEgresoReal").text(rowData.ex.her);
    document.getElementById("horaEgresoReal").style.fontSize = "25px";
  } else {
    $("#horaEgresoReal").text("SIN CIERRE");
    document.getElementById("horaEgresoReal").style.fontSize = "16px";
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
  let fechaIngresoReal = new Date(rowData.ex.fi+"T"+rowData.ex.hir+":00");

  let ingresoParam = ingresoParametrizado(fechaIngresoPuesto,fechaIngresoReal);
  let fechaEgresoReal="";
  let egresoParam="";

  if(rowData.ex.her==""){
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
    // minDate:fechaIngresoPuesto,
    // maxDate:fechaEgresoPuesto,
  });

  //Inicializar Date Time Pickers
  $("#dtpHIAsistencia").data("DateTimePicker").date(fechaIngresoReal);
  if(rowData.ex.her==""){
    $("#dtpHEAsistencia").data("DateTimePicker").date(fechaIngresoReal);
    $('#dtpHEAsistencia').data("DateTimePicker").clear();
  }else{
    $("#dtpHEAsistencia").data("DateTimePicker").date(fechaEgresoReal);
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
    // let oldHours = $("#slider-detalle-turno").attr("hours");
    let from = new Date(data.from);
    let to = new Date(data.to);
    let difHoras = totalHorasDetalle(new Date(data.from),new Date(data.to));

    $("#horasRegitradasDetalle").text(difHoras);

    // if(oldFrom!=from){
    //   $("#dtpHIAsistencia").data("DateTimePicker").date(from);
    // }else{
    //   $("#dtpHIAsistencia").data("DateTimePicker").date(fechaIngresoReal);
    // }
    // if(oldTo!=to){
    //   $("#dtpHEAsistencia").data("DateTimePicker").date(to);
    // }else{
    //   if(rowData.ex.her==""){
    //     $("#dtpHEAsistencia").data("DateTimePicker").date(fechaIngresoReal);
    //     $('#dtpHEAsistencia').data("DateTimePicker").clear();
    //   }else{
    //     $("#dtpHEAsistencia").data("DateTimePicker").date(fechaEgresoReal);
    //   }
    // }
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
    if(rowData.ex.to==undefined || rowData.ex.to=="" ){ // Hay que definir Turno Original en cubrimiento
      my_range.update({
        from: ingresoParam.valueOf(),
        to: egresoParam.valueOf(),
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
    my_range.update({
      from: ingresoParam.valueOf(),
      to: egresoParam.valueOf(),
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
    my_range.update({
        disable: true,
    });
    $("#horaIngresoManual").show("slide", {direction: "right"}, 300);
    $("#horaEgresoManual").show("slide", {direction: "left"}, 300);
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
      console.log(horaIngreso,horaEgreso);
      if(compararHorasString(horaIngreso,horaEgreso)==-1){ // horaIngreso mayor a horaEgreso
        $("#ingresoVacioMsj").hide();
        $("#ingresoErrorMsj").show();
        $("#ingresoInput").removeClass("has-warning");
        $("#ingresoInput").addClass("has-error");
        $("#dtpHIAsistencia").data("DateTimePicker").date(fechaIngresoReal);
      }else{
        $("#ingresoVacioMsj").hide();
        $("#ingresoErrorMsj").hide();
        $("#ingresoInput").removeClass("has-warning");
        $("#ingresoInput").removeClass("has-error");
        horaIngreso = $("#dtpHIAsistencia").find("input").val();
        let ingresoDate = new Date (rowData.ex.fp+"T"+horaIngreso+":00");
        // let horaIngreso = $("#dtpHIAsistencia").data("DateTimePicker").date().valueOf();
        console.log(ingresoDate);
        let ingresoParam = ingresoParametrizado(fechaIngresoPuesto,new Date(ingresoDate));
        my_range.update({
          from: ingresoParam.valueOf(),
        });
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
    }else{
      let horaIngreso = $("#dtpHIAsistencia").find("input").val();
      let horaEgreso = $("#dtpHEAsistencia").find("input").val();
      if(compararHorasString(horaIngreso,horaEgreso)==-1){ // horaEgreso menor a horaIngreso
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
        let egresoDate = new Date (rowData.ex.fp+"T"+horaEgreso+":00");
        // let horaEgreso = $("#dtpHEAsistencia").data("DateTimePicker").date();
        let fechaEgresoPuesto = new Date(rowData.ex.fp+"T"+rowData.ep+":00");
        if(compararHorasString(rowData.ip,rowData.ep)==-1){
          fechaEgresoPuesto = new Date( fechaEgresoPuesto.getTime() + 24*60*60*1000 );
        }
        let egresoParam = egresoParametrizado(fechaIngresoPuesto,fechaEgresoPuesto,egresoDate);
        my_range.update({
          to: egresoParam.valueOf(),
        });
        //$("#dtpHEAsistencia").data("DateTimePicker").date(new Date(horaEgreso.valueOf()));
        //$('#dtpHIAsistencia').data("DateTimePicker").maxDate(egresoDate);
      }
    }
  });

  $("#penalizarDetalle").click(function() {
    console.log("Penalizar Turno");
    my_range.update({
      from: ingresoParam.valueOf(),
      to: egresoParam.valueOf(),
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
    $("#mostrarInforme").show(300);
    $("#variacion-horas").hide(300);
    $("#penalizacionHora").hide(300);
    $("#penalizacionTurno").show(300);
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
    $("#card-contenedor").hide(300);
    $("#horas-turno-detalle").hide(300);
    $("#mostrar-botones").hide(300);
    $("#mostrarInforme").hide(300);
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
    $("#card-contenedor").show(300);
    $("#horas-turno-detalle").show(300);
    $("#mostrar-botones").show(300);
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
      console.log($("#sel-amp-horas option:selected").text());
    }else if($("#sel-amp-horas").val()!=0){
      $("#slider-detalle-turno").attr( "select-motivo", $("#sel-amp-horas option:selected").text());
      console.log($("#sel-amp-horas option:selected").text());
    }
  });

  $("#sel-red-horas").change(function (){
    if ( $("#penalizacionHora").hasClass("has-error") && $("#sel-red-horas").val()!=0 ){
      $("#penalizacionHora").removeClass("has-error");
      $("#penalizacionHora span").hide();
      $("#slider-detalle-turno").attr( "select-motivo", $("#sel-red-horas option:selected").text());
      console.log($("#sel-red-horas option:selected").text());
    }else if($("#sel-red-horas").val()!=0){
      $("#slider-detalle-turno").attr( "select-motivo", $("#sel-red-horas option:selected").text());
      console.log($("#sel-red-horas option:selected").text());
    }
  });

  $("#sel-eli-turno").change(function (){
    if ( $("#penalizacionTurno").hasClass("has-error") && $("#sel-eli-turno").val()!=0 ){
      $("#penalizacionTurno").removeClass("has-error");
      $("#penalizacionTurno span").hide();
      $("#slider-detalle-turno").attr( "select-motivo", $("#sel-eli-turno option:selected").text());
    }else if($("#sel-eli-turno").val()!=0){
      $("#slider-detalle-turno").attr( "select-motivo", $("#sel-eli-turno option:selected").text());
      console.log($("#sel-eli-turno option:selected").text());
    }
  });

}

function inicializarModalTurno(){

  $("#detalle-turno").on("hidden.bs.modal", function(){
    console.log("Se cerro el modal");
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

    $("select[name=selectMotivo]").val("0");
    $("#comment").val("");
    $(".select-motivo").hide();
    $("#mostrarInforme").hide();
    document.getElementById("icon-informe").className = "fas fa-angle-double-down";
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
    if (oldFrom == from && oldFrom == to){
      if( $("#sel-eli-turno").val() == 0 && $("#sel-red-horas").val() == 0) {
        errorMessage=true;
        document.getElementById("icon-informe").className = "fas fa-angle-double-down open";
        $("#mostrarInforme").show(300);
        $("#variacion-horas").hide(300);
        $("#penalizacionHora").hide(300);
        $("#penalizacionTurno").show(300);
        $("#penalizacionTurno").addClass("has-error");
        $("#penalizacionTurno span").show(300);
      }
    }else {
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
          db.collection("clientes").doc(rowData.ex.idc).collection("objetivos").doc(rowData.ex.ido).collection("cobertura").doc(rowData.ex.idf).collection("puestos").doc(rowData.ex.ic)
          .delete()
          .then(function() {
            $("#detalle-turno").modal("hide");
            eliminarFila(rowData,row);
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

    }else if(oldFrom>from || oldFrom<from || oldTo>to || oldTo<to){
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
        cargarFila(rowData,row);
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

    if(rowData.ex.her!=""){ // Si la hora del puesto esta cargada y no es vacia
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
