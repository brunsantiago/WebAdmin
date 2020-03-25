// Variables globales de Setting

var idClienteGlobal;
var idObjetivoGlobal;
var idCubrimientoGlobal;
var idDiaGlobal;
var numDiaGlobal;
var fieldNameGlobal;

function borrarTablas(){
  document.getElementById("table_body_0").innerHTML="";
  document.getElementById("table_body_1").innerHTML="";
  document.getElementById("table_body_2").innerHTML="";
  document.getElementById("table_body_3").innerHTML="";
  document.getElementById("table_body_4").innerHTML="";
  document.getElementById("table_body_5").innerHTML="";
  document.getElementById("table_body_6").innerHTML="";
}

function borrarFechasEspeciales(){
  document.getElementById("accordion2").innerHTML="";
}

function cargarPuestosSetting(){

  if(validarFormulario()){

    let nombreCliente = document.getElementById("selectClientes").value;
    let nombreObjetivo = document.getElementById("selectObjetivos").value;

    idClienteGlobal="";
    idObjetivoGlobal="";
    idCubrimientoGlobal="";

    db.collection("clientes").where("nombreCliente","==",nombreCliente)
      .get()
      .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            idClienteGlobal=doc.id;

              db.collection("clientes").doc(idClienteGlobal).collection("objetivos").where("nombreObjetivo","==",nombreObjetivo)
              .get()
              .then(function(querySnapshot) {
                  querySnapshot.forEach(function(doc) {
                    idObjetivoGlobal=doc.id;

                    db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
                    .where("vigente","==",true)
                    .get()
                    .then(function(querySnapshot) {
                        if (querySnapshot.empty) {
                          // Si NO hay esquema vigente ingresa aca
                          $("#datosObjetivo").show();
                          $("#esquemaCobertura").show();
                          $("#contenedorEsquema").hide();
                          $("#sinEsquema").show();
                          $("#acordionEsquema").hide();
                          cargarDatosObjetivo(nombreCliente,nombreObjetivo);
                        } else {
                          // Si hay esquema vigente ingresa aca
                          querySnapshot.forEach(function(doc) {
                            //Antes de mostrar el esquema verifico que el mismo este vigente
                            if(fechaEsquemaVigente(doc.data().fechaHastaTime)){
                              //Si el esquema esta vigente lo muestro por pantalla
                              $("#datosObjetivo").show();
                              $("#esquemaCobertura").show();
                              $("#contenedorEsquema").show();
                              $("#sinEsquema").hide();
                              $("#acordionEsquema").show();

                              idCubrimientoGlobal=doc.id;
                              cargarDatosEsquema(nombreCliente,nombreObjetivo,doc.data().fechaDesdeTime,doc.data().fechaHastaTime,doc.data().vigente);
                              borrarTablas();
                              for(var numeroDia=0;numeroDia<7;numeroDia++){
                                db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
                                  .doc(idCubrimientoGlobal).collection("esquema").where("documentData.numeroDia","==",numeroDia)
                                  .get()
                                  .then(function(querySnapshot) {
                                      querySnapshot.forEach(function(doc) {
                                        let docObject = doc.data();
                                        let idDia = doc.id;
                                        let numDia = doc.data().documentData.numeroDia;
                                        for (var fieldName in docObject) {
                                          if (fieldName=="documentData"){
                                          }else {
                                            let dia = docObject[fieldName];
                                            cargarEsquemaSetting(idClienteGlobal,idObjetivoGlobal,idCubrimientoGlobal,idDia,fieldName,dia.nombrePuesto,dia.nombreTurno,dia.ingresoPuesto,dia.egresoPuesto,dia.horasTurno,dia.estado,numDia);
                                          }
                                        }
                                      });
                                  });
                              }

                            } else {
                              // Si el esquema no esta vigente entonces modifico el estado
                              // y muestro en pantalla que no hay esquema vigente
                              modificarEstadoEsquema(doc.id);
                              $("#datosObjetivo").show();
                              $("#esquemaCobertura").show();
                              $("#contenedorEsquema").hide();
                              $("#sinEsquema").show();
                              $("#acordionEsquema").hide();
                              cargarDatosObjetivo(nombreCliente,nombreObjetivo);
                            }
                          });
                          $("#esquemaCobertura").show();
                        }
                      }).catch(function(error) {
                          console.log("Error getting document:", error);
                      });
                  });
              });
         })
      });

  }
}

function fechaEsquemaVigente(fechaHastaEsquema) {
  let fechaActual = new Date();
  fechaActual.setHours(0,0,0);
  if (fechaHastaEsquema.toDate()>fechaActual){
    return true;
  } else {
    return false;
  }
}

function modificarEstadoEsquema(idEsquema){
  db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
  .doc(idEsquema)
  .update({vigente:false})
  .then(function() {
    console.log("Document successfully updated!");
  })
  .catch(function(error) {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
  });

}

function cargarEsquema(){

   let nombreCliente = document.getElementById("selectClientes").value;
   let nombreObjetivo = document.getElementById("selectObjetivos").value;

  db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
  .doc(idCubrimientoGlobal)
  .get()
  .then(function(doc) {
      if (doc.exists) {
        // do something with the data
        $("#contenedorEsquema").show();
        $("#sinEsquema").hide();
        $("#datosEsquema").show();
        $("#acordionEsquema").show();
        $("#esquemaCobertura").show();

          cargarDatosEsquema(nombreCliente,nombreObjetivo,doc.data().fechaDesdeTime,doc.data().fechaHastaTime,doc.data().vigente);
          borrarTablas();
          for(var numeroDia=0;numeroDia<7;numeroDia++){
            db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
              .doc(idCubrimientoGlobal).collection("esquema").where("documentData.numeroDia","==",numeroDia)
              .get()
              .then(function(querySnapshot) {
                  querySnapshot.forEach(function(doc) {
                    let docObject = doc.data();
                    let idDia = doc.id;
                    let numDia = doc.data().documentData.numeroDia;
                    for (var fieldName in docObject) {
                      if (fieldName=="documentData"){
                      }else {
                        let dia = docObject[fieldName];
                        cargarEsquemaSetting(idClienteGlobal,idObjetivoGlobal,idCubrimientoGlobal,idDia,fieldName,dia.nombrePuesto,dia.nombreTurno,dia.ingresoPuesto,dia.egresoPuesto,dia.horasTurno,dia.estado,numDia);
                      }
                    }
                  });
              });
          }

        $("#datosObjetivo").show();
      }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });

}

function cargarDatosEsquema(nombreCliente,nombreObjetivo,fechaDesde,fechaHasta,vigente){

  let fechaDesdeDate = fechaDesde.toDate();
  let fechaHastaDate = fechaHasta.toDate();

  $('#nombreCliente').text(" "+nombreCliente);
  $('#nombreObjetivo').text(" "+nombreObjetivo);
  $('#fechaDesde').text(dateToString(fechaDesdeDate));
  $('#fechaHasta').text(dateToString(fechaHastaDate));
  if(vigente==true){
    $('#vigente').text("VIGENTE");
  } else {
    $('#vigente').text("CADUCADO");
  }
}

function cargarDatosObjetivo(nombreCliente,nombreObjetivo){
  $('#nombreCliente').text(" "+nombreCliente);
  $('#nombreObjetivo').text(" "+nombreObjetivo);
}

function cargarEsquemaSetting(idCliente,idObjetivo,idCubrimiento,idDia,fieldName,nombrePuesto,nombreTurno,horaIngreso,horaEgreso,horasTurno,estado,numeroDia){

  var iconoEditar = '<span class="glyphicon glyphicon-edit"></span>';
  var iconoEliminar = '<span class="glyphicon glyphicon-trash"></span>';

  var tBody = document.getElementById("table_body_"+numeroDia);

  var fila = document.createElement("tr");

  var celdaNombrePuesto = document.createElement("td");
  var celdaNombreTurno = document.createElement("td");
  var celdaHoraIngreso = document.createElement("td");
  var celdaHoraEgreso = document.createElement("td");
  var celdaHorasTurno = document.createElement("td");
  var celdaEstado = document.createElement("td");
  var celdaEditar = document.createElement("td");
  var celdaEliminar = document.createElement("td");

  celdaNombrePuesto.textContent = nombrePuesto;
  celdaNombreTurno.textContent = nombreTurno;
  celdaHoraIngreso.textContent = horaIngreso;
  celdaHoraEgreso.textContent = horaEgreso;
  celdaHorasTurno.textContent = horasTurno;
  celdaEstado.textContent = estado;

  celdaEditar.innerHTML = iconoEditar;
  celdaEditar.setAttribute("data-toggle", "modal");
  celdaEditar.setAttribute("data-target", "#editar-puesto");
  celdaEditar.addEventListener("click", function(){
    MostrarModalSetting(idCliente,idObjetivo,idCubrimiento,idDia,fieldName,nombrePuesto,nombreTurno,horaIngreso,horaEgreso,horasTurno,estado,numeroDia);
  });

  celdaEliminar.innerHTML = iconoEliminar;
  celdaEliminar.addEventListener("click", function(){
    mensajeEliminarTurno(idCliente,idObjetivo,idCubrimiento,idDia,fieldName,numeroDia);
  });

  fila.appendChild(celdaNombrePuesto);
  fila.appendChild(celdaNombreTurno);
  fila.appendChild(celdaHoraIngreso);
  fila.appendChild(celdaHoraEgreso);
  fila.appendChild(celdaHorasTurno);
  fila.appendChild(celdaEstado);
  fila.appendChild(celdaEditar);
  fila.appendChild(celdaEliminar);
  tBody.appendChild(fila);

}

function MostrarModalSetting(idCliente,idObjetivo,idCubrimiento,idDia,fieldName,nombrePuesto,nombreTurno,horaIngreso,horaEgreso,horasTurno,estado,numeroDia){
  idClienteGlobal=idCliente;
  idObjetivoGlobal=idObjetivo;
  idCubrimientoGlobal=idCubrimiento;
  idDiaGlobal=idDia;
  numDiaGlobal=numeroDia;
  fieldNameGlobal=fieldName; // Nombre de Campo del DIA
  $('#nombrePuesto').val(nombrePuesto);
  $('#nombreTurno').val(nombreTurno);
  $('#horaIngreso').val(horaIngreso);
  $('#horaEgreso').val(horaEgreso);
  $('#horasTurno').val(horasTurno);
  $('#estado').val(estado);
}

function MostrarModalEspeciales(idCliente,idObjetivo,idDia,fieldName,nombrePuesto,nombreTurno,horaIngreso,horaEgreso,horasTurno,estado,numeroDia){
  idClienteGlobal=idCliente;
  idObjetivoGlobal=idObjetivo;
  idDiaGlobal=idDia;
  numDiaGlobal=numeroDia;
  fieldNameGlobal=fieldName; // Nombre de Puesto-Turno
  $('#nombrePuesto3').val(nombrePuesto);
  $('#nombreTurno3').val(nombreTurno);
  $('#ingresoPuesto3').val(horaIngreso);
  $('#egresoPuesto3').val(horaEgreso);
  $('#horasTurno3').val(horasTurno);
  $('#estado3').val(estado);
}

function cargarPuestosEsquema(){
  //Creamos un array que almacenará los valores de los input "checked"
  let diasChecked = [];
  //Recorremos todos los input checkbox con name = diasSeleccionados y que se encuentren "checked"
  $("input[name='diasSeleccionados']:checked").each(function(){
  //Mediante la función push agregamos al arreglo los values de los checkbox
  diasChecked.push(($(this).attr("value")));
  });

  let nombrePuesto = document.getElementById("nombrePuesto1").value;
  let nombreTurno = document.getElementById("nombreTurno1").value;
  let ingresoPuesto = document.getElementById("ingresoPuesto1").value;
  let egresoPuesto = document.getElementById("egresoPuesto1").value;
  let horasTurno = document.getElementById("horasTurno1").value;
  let estado = document.getElementById("estado1").value;

  db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
  .doc(idCubrimientoGlobal)
  .get()
  .then(function(doc) {
    cargarTurnos(idClienteGlobal,idObjetivoGlobal,idCubrimientoGlobal,nombrePuesto,nombreTurno,ingresoPuesto,egresoPuesto,horasTurno,estado,diasChecked);
    cargarEsquema();
    mensajeOk();
  });

  $('#carga-puesto').modal('hide');
}

function cargarTurnos(idCliente,idObjetivo,idCubrimiento,nombrePuesto,nombreTurno,ingresoPuesto,egresoPuesto,horasTurno,estado,diasChecked){

    var nombreCampo=nombrePuesto+"_"+nombreTurno;

    var turno = {
      nombrePuesto: nombrePuesto,
      nombreTurno: nombreTurno,
      ingresoPuesto: ingresoPuesto,
      egresoPuesto: egresoPuesto,
      horasTurno: horasTurno,
      estado: estado
    };

    let comparaHoras = compararHorasString(ingresoPuesto,egresoPuesto);
    if(comparaHoras==-1){
      turno.turnoNoche=true;
      turno.nombreTurno="TN";
    }

    if (diasChecked[0]=="todos"){
        for(var i=0;i<7;i++){
          db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
            .doc(idCubrimiento).collection("esquema").where("documentData.numeroDia","==",i)
            .get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
                      .doc(idCubrimiento).collection("esquema").doc(doc.id).update({[nombreCampo]:turno});
                });
            })
        }
    } else{
      diasChecked.forEach(function(i) {
        let numDia=parseInt(i);
        db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
          .doc(idCubrimiento).collection("esquema").where("documentData.numeroDia","==",numDia)
          .get()
          .then(function(querySnapshot) {
              querySnapshot.forEach(function(doc) {
                  db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
                    .doc(idCubrimiento).collection("esquema").doc(doc.id).update({[nombreCampo]:turno});
              });
          })
      });
    }
}

function cambiarPuestosSetting(){
  // Return a new promise.
  let promesa = new Promise(function(resolve, reject) {
      // do a thing, possibly async, then…

  var nombrePuesto = document.getElementById("nombrePuesto").value;
  var nombreTurno = document.getElementById("nombreTurno").value;
  var ingresoPuesto = document.getElementById("horaIngreso").value;
  var egresoPuesto = document.getElementById("horaEgreso").value;
  var horasTurno = document.getElementById("horasTurno").value;
  var estado = document.getElementById("estado").value;

  let nombreCampo = nombrePuesto+"_"+nombreTurno;

  var turno = {
    nombrePuesto: nombrePuesto,
    nombreTurno: nombreTurno,
    ingresoPuesto: ingresoPuesto,
    egresoPuesto: egresoPuesto,
    horasTurno: horasTurno,
    estado: estado
  };

  let comparaHoras = compararHorasString(ingresoPuesto,egresoPuesto);
  if(comparaHoras==-1){
    turno.TurnoNoche=true;
    turno.nombreTurno="TN";
    nombreCampo = nombrePuesto+"_TN";
  }

  db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
    .doc(idCubrimientoGlobal).collection("esquema").doc(idDiaGlobal)
    .get()
    .then(function(doc){
      if (doc.exists) {
        let docObject = doc.data();
        let turnoAnterior = docObject[fieldNameGlobal];
        let docDataAnterior = docObject["documentData"];
        //console.log(turnoAnterior.horasTurno);
        let totalHoras = sumarHorasString(docDataAnterior.totalHoras,"-"+turnoAnterior.horasTurno)
        totalHoras = sumarHorasString(totalHoras,horasTurno);

        documentData = {
          cantidadPuestos : docDataAnterior.cantidadPuestos,
          numeroDia : docDataAnterior.numeroDia,
          totalHoras : totalHoras
        }

        //Elimina el turno modificado
        db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
          .doc(idCubrimientoGlobal).collection("esquema").doc(idDiaGlobal)
          .update({[fieldNameGlobal]: firebase.firestore.FieldValue.delete()});

        //Agrega el turno modificado
        db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
          .doc(idCubrimientoGlobal).collection("esquema").doc(idDiaGlobal)
          .update({
            [nombreCampo] : turno,
            documentData : documentData
          })

      } else {
        console.log("No se encontro el turno a modificar");
      }

      eliminarContenidoDia(numDiaGlobal);
      $('#editar-puesto').modal('hide');
      resolve();

    })
    .catch(function(error) {
    // The document probably doesn't exist.
    //console.log("Error getting document:", error);
    reject(Error(error));
    });

  });

  promesa.then(function(result) {
    console.log(result); // "Stuff worked!"
    cargarDiaModificado();
  }, function(err) {
    console.log(err); // Error: "It broke"
  });
}

function eliminarContenidoDia(numeroDia){
    var tBody = document.getElementById("table_body_"+numeroDia);
    tBody.innerHTML="";
}

function eliminarContenidoDiaEspecial(numeroDia){
    var tBody = document.getElementById("table_body"+numeroDia);
    tBody.innerHTML="";
}

function cargarDiaModificado(){

  db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
    .doc(idCubrimientoGlobal).collection("esquema").doc(idDiaGlobal)
    .get()
    .then(function(doc) {
        if (doc.exists) {
          var docObject = doc.data();
          for (var fieldName in docObject) {
            if (fieldName=="documentData"){
            }else {
              var dia = docObject[fieldName];
              cargarEsquemaSetting(idClienteGlobal,idObjetivoGlobal,idCubrimientoGlobal,idDiaGlobal,fieldName,dia.nombrePuesto,dia.nombreTurno,dia.ingresoPuesto,dia.egresoPuesto,dia.horasTurno,dia.estado,numDiaGlobal);
            }
          }
          mensajeOk();
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });

}

function cargarDiasSemana(fechaDesdeNuevo,fechaHastaNuevo,vigente){

  if(validarFormulario()){

    let cliente = document.getElementById("selectClientes").value;
    let objetivo = document.getElementById("selectObjetivos").value;

    let idCliente="";
    let idObjetivo="";
    let idCubrimiento="";

    let esquemaData = {
      fechaDesde : fechaDesdeNuevo,
      fechaHasta : fechaHastaNuevo,
      vigente : vigente
    }

    let documentData = {
      cantidadPuestos : "",
      numeroDia : "",
      totalHoras : ""
    }

    let diasSemana = ["DOMINGO","LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO"];

      db.collection("clientes").where("nombreCliente","==",cliente)
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
              idCliente=doc.id;
                db.collection("clientes").doc(idCliente).collection("objetivos").where("nombreObjetivo","==",objetivo)
                .get()
                .then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                      idObjetivo=doc.id;
                        db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
                        .add(esquemaData)
                        .then(function(docRef) {
                          //console.log("Document written with ID: ", docRef.id);
                          idCubrimiento=docRef.id;
                          console.log("Document written with ID: ", idCubrimiento);

                          for (var i=0;i<7;i++){
                          documentData.numeroDia=i;
                          db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
                            .doc(idCubrimiento).collection("esquema").doc(diasSemana[i]).set({documentData: documentData})
                            .then(function() {
                                console.log("Document successfully written!");
                            })
                            .catch(function(error) {
                                console.error("Error writing document: ", error);
                            });
                          }

                        })
                        .catch(function(error) {
                          console.error("Error adding document: ", error);
                        });

                    });
                });
           })
        });

  }

}

function eliminarTurno(idCliente,idObjetivo,idCubrimiento,idDia,fieldName,numeroDia){
  db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
        .doc(idCubrimiento).collection("esquema").doc(idDia)
        .update({[fieldName]: firebase.firestore.FieldValue.delete()});

  eliminarContenidoDia(numeroDia);
  cargarDiaModificado2(idCliente,idObjetivo,idCubrimiento,idDia,numeroDia);

}

function eliminarTurnoEspecial(idCliente,idObjetivo,idDia,fieldName,numeroDia){

  db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("temporales")
        .doc(idDia)
        .get()
        .then(function(doc){
          if(doc.data().documentData.cantidadPuestos == 1){
            //Si es el unico turno que queda, elimino directamente el documento
            db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("temporales")
            .doc(idDia)
            .delete()
            .then(function() {
                console.log("Document successfully deleted!");
                borrarFechasEspeciales();
                $("#acordionDiasEspeciales").hide();
                $("#sinDiasEspeciales").show();
                mensajeOk();
            }).catch(function(error) {
                console.error("Error removing document: ", error);
            });
          } else {
            db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("temporales")
                  .doc(idDia)
                  .update({[fieldName]: firebase.firestore.FieldValue.delete()});

            const decrement = firebase.firestore.FieldValue.increment(-1);

            db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("temporales")
                  .doc(idDia)
                  .update({"documentData.cantidadPuestos": decrement });
          }
          eliminarContenidoDiaEspecial(numeroDia);
          cargarDiaEspecial(idCliente,idObjetivo,idDia,numeroDia);
        });

}

function MostrarModalDelete(idCliente,idObjetivo,idCubrimiento,idDia,fieldName,nombrePuesto,nombreTurno,horaIngreso,horaEgreso,horasTurno,estado,numeroDia){

  idClienteGlobal=idCliente;
  idObjetivoGlobal=idObjetivo;
  idCubrimientoGlobal=idCubrimiento;
  idDiaGlobal=idDia;
  numDiaGlobal=numeroDia;
  fieldNameGlobal=fieldName; // Nombre de Campo del DIA

  $('#nombrePuesto').val(nombrePuesto);
  $('#nombreTurno').val(nombreTurno);
  $('#horaIngreso').val(horaIngreso);
  $('#horaEgreso').val(horaEgreso);
  $('#horasTurno').val(horasTurno);
  $('#estado').val(estado);
}

function cargarDiaModificado2(idCliente,idObjetivo,idCubrimiento,idDia,numeroDia){

    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
      .doc(idCubrimiento).collection("esquema").doc(idDia)
      .get()
      .then(function(doc) {
          if (doc.exists) {
            var docObject = doc.data();
            //let idDiaLocal = doc.id;
            //var num = doc.data().documentData.numeroDia;
            for (var fieldName in docObject) {
              if (fieldName=="documentData"){
              }else {
                var dia = docObject[fieldName];
                cargarEsquemaSetting(idCliente,idObjetivo,idCubrimiento,idDia,fieldName,dia.nombrePuesto,dia.nombreTurno,dia.ingresoPuesto,dia.egresoPuesto,dia.horasTurno,dia.estado,numeroDia);
              }
            }
            mensajeOk();
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
      }).catch(function(error) {
          console.log("Error getting document:", error);
      });
}

function cargarDiaEspecial(idCliente,idObjetivo,idDia,i){

    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("temporales")
      .doc(idDia)
      .get()
      .then(function(doc) {
          if (doc.exists) {
            var docObject = doc.data();
            //let idDiaLocal = doc.id;
            //var num = doc.data().documentData.numeroDia;
            for (var fieldName in docObject) {
              if (fieldName=="documentData"){
                // No procesar nada
              }else {
                let turno = docObject[fieldName];
                cargarFechasEspeciales(idCliente,idObjetivo,idDia,fieldName,turno.nombrePuesto,turno.nombreTurno,turno.ingresoPuesto,turno.egresoPuesto,turno.horasTurno,turno.estado,i);
              }
            }
            mensajeOk();
          } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
      }).catch(function(error) {
          console.log("Error getting document:", error);
      });
}

function diasSeleccionados(){
  //Creamos un array que almacenará los valores de los input "checked"
  var checked = [];
  //Recorremos todos los input checkbox con name = Colores y que se encuentren "checked"
  $("input[name='diasSeleccionados']:checked").each(function ()
  {
  //Mediante la función push agregamos al arreglo los values de los checkbox
  checked.push(($(this).attr("value")));
  });
  // Utilizamos console.log para ver comprobar que en realidad contiene algo el arreglo
  console.log(checked);
}

function cargarModalPuestos(){
  if (validarFormulario()){
    $('#carga-puesto').modal('show');
    var checkbox = document.getElementById("todosCheck");
    checkbox.addEventListener( 'change', function() {
        if(this.checked) {
            // Checkbox is checked..
            disableCheck();
        } else {
            // Checkbox is not checked..
            enableCheck();
        }
    });
  }

}

function enableCheck() {
  document.getElementById("lunesCheck").disabled= false;
  document.getElementById("martesCheck").disabled= false;
  document.getElementById("miercolesCheck").disabled= false;
  document.getElementById("juevesCheck").disabled= false;
  document.getElementById("viernesCheck").disabled= false;
  document.getElementById("sabadoCheck").disabled= false;
  document.getElementById("domingoCheck").disabled= false;
}

function disableCheck() {
  document.getElementById("lunesCheck").disabled= true;
    document.getElementById("lunesCheck").checked= false;
  document.getElementById("martesCheck").disabled= true;
    document.getElementById("martesCheck").checked= false;
  document.getElementById("miercolesCheck").disabled= true;
    document.getElementById("miercolesCheck").checked= false;
  document.getElementById("juevesCheck").disabled= true;
    document.getElementById("juevesCheck").checked= false;
  document.getElementById("viernesCheck").disabled= true;
    document.getElementById("viernesCheck").checked= false;
  document.getElementById("sabadoCheck").disabled= true;
    document.getElementById("sabadoCheck").checked= false;
  document.getElementById("domingoCheck").disabled= true;
    document.getElementById("domingoCheck").checked= false;
}

function validarFormulario(){
  if($("#selectClientes option:selected").val() == 0) {
    $('#select-validate').modal('show');
    return false;
  }else if($("#selectObjetivos option:selected").val() == 0) {
      // alert("Debe seleccionar un Objetivo");
      $('#select-validate').modal('show');
      return false;
  } else {
      return true;
  }
}

function cargarEsquemaNuevo(){
  //Inicializo los input del formulario
  $('#fechaDesdeNuevo').val("");
  $('#fechaHastaNuevo').val("");
  $('#estadoNuevo').val("");
  $('#cargar-esquema').modal('show');
}

function cargarEsquemaServer(){

  let fechaDesdeNuevo = $('#fechaDesdeNuevo').val();
  let fechaHastaNuevo = $('#fechaHastaNuevo').val();
  let estadoNuevo = $('#estadoNuevo').val();
  let vigente=false;

  if(estadoNuevo=="vigente"){
    vigente=true;
  }

  cargarDiasSemana(fechaDesdeNuevo,fechaHastaNuevo,vigente);

  $('#cargar-esquema').modal('hide');

  cargarPuestosSetting();
}

function cargarHistorial(){
  if (validarFormulario()){
    $('#cargar-historial').modal('show');
    cargarHistorialEsquemas();
  }
}

function cargarHistorialEsquemas(){

    borrarTablaHistorial();

    let diaHabilitado = "label label-success";
    let diaDeshabilitado = "label label-default";

    let nombreCliente = document.getElementById("selectClientes").value;
    let nombreObjetivo = document.getElementById("selectObjetivos").value;

    db.collection("clientes").where("nombreCliente","==",nombreCliente)
      .get()
      .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            idClienteGlobal=doc.id;

              db.collection("clientes").doc(idClienteGlobal).collection("objetivos").where("nombreObjetivo","==",nombreObjetivo)
              .get()
              .then(function(querySnapshot) {
                  querySnapshot.forEach(function(doc) {
                    idObjetivoGlobal=doc.id;

                    db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
                    .orderBy("fechaDesdeTime","desc")
                    .get()
                    .then(function(querySnapshot) {
                        if (querySnapshot.empty) {
                        } else {
                          querySnapshot.forEach(function(doc) {
                            let idCubrimiento=doc.id;
                            let diasSemana = [];
                              db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
                                .doc(idCubrimiento).collection("esquema")
                                .get()
                                .then(function(querySnapshot) {
                                    //Recorro todos los dias de cada esquema de cubrimiento
                                    querySnapshot.forEach(function(doc) {
                                      let docObject = doc.data();
                                      let idDia = doc.id;
                                      let numeroDia = doc.data().documentData.numeroDia;
                                      for (var fieldName in docObject) {
                                        if (fieldName=="documentData"){
                                          let documentData = docObject[fieldName];
                                          let totalHoras = documentData.totalHoras;
                                          if(totalHoras=="" || totalHoras==undefined || totalHoras=="0"){
                                            diasSemana[numeroDia]=diaDeshabilitado;
                                          } else{
                                            diasSemana[numeroDia]=diaHabilitado;
                                          }
                                        }
                                      }
                                    });
                                    cargarDatosHistorial(idClienteGlobal,idObjetivoGlobal,idCubrimiento,nombreCliente,nombreObjetivo,doc.data().fechaDesdeTime,doc.data().fechaHastaTime,doc.data().vigente,diasSemana);
                                });
                            //}
                          });
                        }
                      }).catch(function(error) {
                          console.log("Error getting document:", error);
                      });
                  });
              });
         })
      });

}

function borrarTablaHistorial(){
  document.getElementById("table_body_historial").innerHTML="";
}

function cargarDatosHistorial(idCliente,idObjetivo,idCubrimiento,nombreCliente,nombreObjetivo,fechaDesde,fechaHasta,estado,diasSemana){

  let spanText;

  let iconoEditar = '<span class="glyphicon glyphicon-edit"></span>';
  let iconoEliminar = '<span class="glyphicon glyphicon-trash"></span>';

  let tBody = document.getElementById("table_body_historial");

  let fila = document.createElement("tr");

  let celdaFechaDesde = document.createElement("td");
  let celdaFechaHasta = document.createElement("td");
  let celdaDias = document.createElement("td");
  let celdaHorasMensuales = document.createElement("td");
  let celdaEstado = document.createElement("td");
  let celdaEditar = document.createElement("td");
  let celdaEliminar = document.createElement("td");

  let spanDo = document.createElement("span");
  spanText = document.createTextNode("Do");
  spanDo.appendChild(spanText);

  let spanLu = document.createElement("span");
  spanText = document.createTextNode("Lu");
  spanLu.appendChild(spanText);

  let spanMa = document.createElement("span");
  spanText = document.createTextNode("Ma");
  spanMa.appendChild(spanText);

  let spanMi = document.createElement("span");
  spanText = document.createTextNode("Mi");
  spanMi.appendChild(spanText);

  let spanJu = document.createElement("span");
  spanText = document.createTextNode("Ju");
  spanJu.appendChild(spanText);

  let spanVi = document.createElement("span");
  spanText = document.createTextNode("Vi");
  spanVi.appendChild(spanText);

  let spanSa = document.createElement("span");
  spanText = document.createTextNode("Sa");
  spanSa.appendChild(spanText);

  let espacioNuevo = document.createElement("span");
  spanText = document.createTextNode(" ");
  espacioNuevo.appendChild(spanText);

  spanDo.className=diasSemana[0];
  spanLu.className=diasSemana[1];
  spanMa.className=diasSemana[2];
  spanMi.className=diasSemana[3];
  spanJu.className=diasSemana[4];
  spanVi.className=diasSemana[5];
  spanSa.className=diasSemana[6];

  celdaFechaDesde.textContent = dateToString(fechaDesde.toDate());
  celdaFechaHasta.textContent = dateToString(fechaHasta.toDate());

  celdaDias.appendChild(spanDo);
  celdaDias.appendChild(document.createTextNode(" "));
  celdaDias.appendChild(spanLu);
  celdaDias.appendChild(document.createTextNode(" "));
  celdaDias.appendChild(spanMa);
  celdaDias.appendChild(document.createTextNode(" "));
  celdaDias.appendChild(spanMi);
  celdaDias.appendChild(document.createTextNode(" "));
  celdaDias.appendChild(spanJu);
  celdaDias.appendChild(document.createTextNode(" "));
  celdaDias.appendChild(spanVi);
  celdaDias.appendChild(document.createTextNode(" "));
  celdaDias.appendChild(spanSa);

  celdaHorasMensuales.textContent = "744";
  if(estado==true){
    celdaEstado.textContent = "Vigente";
  }else{
    celdaEstado.textContent = "Caducado";
  }

  celdaEditar.innerHTML = iconoEditar;
  celdaEditar.setAttribute("data-toggle", "modal");
  celdaEditar.setAttribute("data-target", "#cargar-historial");
  celdaEditar.addEventListener("click", function(){
    cargarPuestosHistorial(idCliente,idObjetivo,idCubrimiento,nombreCliente,nombreObjetivo);
  });

  celdaEliminar.innerHTML = iconoEliminar;
  celdaEliminar.addEventListener("click", function(){
    mensajeEliminarEsquema(idCliente,idObjetivo,idCubrimiento);
  });

  fila.appendChild(celdaFechaDesde);
  fila.appendChild(celdaFechaHasta);
  fila.appendChild(celdaDias);
  fila.appendChild(celdaHorasMensuales);
  fila.appendChild(celdaEstado);
  fila.appendChild(celdaEditar);
  fila.appendChild(celdaEliminar);
  tBody.appendChild(fila);

}

function cargarPuestosHistorial(idCliente,idObjetivo,idCubrimiento,nombreCliente,nombreObjetivo){

    idCubrimientoGlobal=idCubrimiento; //Se asigna el Id de Cubrimiento que se quiere Editar como Global

    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento").doc(idCubrimiento)
    .get()
    .then(function(doc) {

        if (doc.exists) {
            // do something with the data
            $("#contenedorEsquema").show();
            $("#sinEsquema").hide();
            $("#datosEsquema").show();
            $("#acordionEsquema").show();
            $("#esquemaCobertura").show();

              cargarDatosEsquema(nombreCliente,nombreObjetivo,doc.data().fechaDesdeTime,doc.data().fechaHastaTime,doc.data().vigente);
              borrarTablas();
              for(var numeroDia=0;numeroDia<7;numeroDia++){
                db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
                  .doc(idCubrimiento).collection("esquema").where("documentData.numeroDia","==",numeroDia)
                  .get()
                  .then(function(querySnapshot) {
                      querySnapshot.forEach(function(doc) {
                        var docObject = doc.data();
                        let idDia = doc.id;
                        var num = doc.data().documentData.numeroDia;
                        for (var fieldName in docObject) {
                          if (fieldName=="documentData"){
                          }else {
                            var dia = docObject[fieldName];
                            cargarEsquemaSetting(idCliente,idObjetivo,idCubrimiento,idDia,fieldName,dia.nombrePuesto,dia.nombreTurno,dia.ingresoPuesto,dia.egresoPuesto,dia.horasTurno,dia.estado,num);
                          }
                        }
                      });
                  });
              }
            $("#datosObjetivo").show();

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
            $("#contenedorEsquema").show();
            $("#sinEsquema").show();
            $("#datosEsquema").hide();
            $("#acordionEsquema").hide();
        }

        $('#cargar-historial').modal('hide');

      })
      .catch(function(error) {
          console.log("Error getting document:", error);
      });
}

function mostrarModalDeleteEquema(idCliente,idObjetivo,idCubrimiento){
  //Asigno las variables ingresadas como parametro a variables globales
  idClienteGlobal=idCliente;
  idObjetivoGlobal=idObjetivo;
  idCubrimientoGlobal=idCubrimiento;
  $('#cargar-historial').modal('hide');
}

function eliminarEsquema(idCliente,idObjetivo,idCubrimiento){
  db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento").doc(idCubrimiento)
  .delete()
  .then(function() {
      console.log("Document successfully borrado");
      mensajeOk();
  }).catch(function(error) {
      console.error("Error removing document: ", error);
  });
}

function mensajeOk(){
  Swal.fire({
    //position: 'top-end',
    type: 'success',
    title: 'Cambios Actualizados Correctamente',
    showConfirmButton: false,
    timer: 1500
  })
}

function mensajeEliminarEsquema(idCliente,idObjetivo,idCubrimiento){
  Swal.fire({
  title:'Esta seguro que desea eliminar este Esquema de Cobertura?',
  text: 'Esta accion no podra restablecerse!',
  type: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#f56954',
  confirmButtonText: 'Si, borrarlo!',
  cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.value) {
      $('#cargar-historial').modal('hide');
      eliminarEsquema(idCliente,idObjetivo,idCubrimiento);
    }
  })
}

function mensajeEliminarTurno(idCliente,idObjetivo,idCubrimiento,idDia,fieldName,numeroDia){
  Swal.fire({
  title:'Esta seguro que desea eliminar este Turno?',
  text: 'Esta accion no podra restablecerse!',
  type: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#f56954',
  confirmButtonText: 'Si, borrarlo!',
  cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.value) {
      eliminarTurno(idCliente,idObjetivo,idCubrimiento,idDia,fieldName,numeroDia);
    }
  })
}

function mensajeEliminarTurnoEspecial(idCliente,idObjetivo,idDia,fieldName,i){
  Swal.fire({
  title:'Esta seguro que desea eliminar este Turno?',
  text: 'Esta accion no podra restablecerse!',
  type: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#f56954',
  confirmButtonText: 'Si, borrarlo!',
  cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.value) {
      eliminarTurnoEspecial(idCliente,idObjetivo,idDia,fieldName,i);
    }
  })
}

function cargarDatePicker(){
  $('.datepicker').datepicker({
  clearBtn: true,
  language: "es",
  multidate: true
  });
}

function cargarDiasEspeciales(){
  if (validarFormulario()){
    $('#carga-dias').modal('show');
  }
}

function cargarPuestoTemporal(){

  // asignar valores de los campos del formulario
  let nombrePuesto = document.getElementById("nombrePuesto2").value;
  let nombreTurno = document.getElementById("nombreTurno2").value;
  let ingresoPuesto = document.getElementById("ingresoPuesto2").value;
  let egresoPuesto = document.getElementById("egresoPuesto2").value;
  let horasTurno = document.getElementById("horasTurno2").value;
  let estado = document.getElementById("estado2").value;
  // recorrer el array de fechas y llamar a la funcion cargarPuesto por cada iteracion
  let selectedDates = $('.datepicker:first').datepicker('getDates');
  selectedDates.forEach(function(fecha){
    cargarPuestoEspecial(fecha,nombrePuesto,nombreTurno,ingresoPuesto,egresoPuesto,horasTurno,estado);
  });
  $('#carga-dias').modal('hide');
  mensajeOk();

}

function modificarPuestoTemporal(){
  // Return a new promise.
  let promesa = new Promise(function(resolve, reject) {
  // asignar valores de los campos del formulario
  let nombrePuesto = document.getElementById("nombrePuesto3").value;
  let nombreTurno = document.getElementById("nombreTurno3").value;
  let ingresoPuesto = document.getElementById("ingresoPuesto3").value;
  let egresoPuesto = document.getElementById("egresoPuesto3").value;
  let horasTurno = document.getElementById("horasTurno3").value;
  let estado = document.getElementById("estado3").value;
  // recorrer el array de fechas y llamar a la funcion cargarPuesto por cada iteracion
  //modificarPuestoEspecial(nombrePuesto,nombreTurno,ingresoPuesto,egresoPuesto,horasTurno,estado);

  // Carga el objeto Turno
  let turno = {
    nombrePuesto: nombrePuesto,
    nombreTurno: nombreTurno,
    ingresoPuesto: ingresoPuesto,
    egresoPuesto: egresoPuesto,
    horasTurno: horasTurno,
    estado: estado
  };
  let nombreCampo = nombrePuesto+"_"+nombreTurno;
  let comparaHoras = compararHorasString(ingresoPuesto,egresoPuesto);
  if(comparaHoras==-1){
    turno.turnoNoche=true;
    turno.nombreTurno="TN";
    nombreCampo = nombrePuesto+"_TN";
  }

  db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("temporales")
    .doc(idDiaGlobal)
    .get()
    .then(function(doc){
      if (doc.exists) {
        let docObject = doc.data();
        let turnoAnterior = docObject[fieldNameGlobal];
        let documentData = docObject["documentData"];
        let totalHoras = sumarHorasString(documentData.totalHoras,"-"+turnoAnterior.horasTurno)
        totalHoras = sumarHorasString(totalHoras,horasTurno);

        documentData = {
          cantidadPuestos : doc.data().documentData.cantidadPuestos,
          fecha : doc.data().documentData.fecha,
          totalHoras : totalHoras
        }

        //Elimina el turno modificado
        db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("temporales")
          .doc(idDiaGlobal)
          .update({[fieldNameGlobal]: firebase.firestore.FieldValue.delete()});

        //Agrega el turno modificado
        db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("temporales")
          .doc(idDiaGlobal)
          .update({
            [nombreCampo] : turno,
            documentData : documentData
          })

      } else {
        console.log("No se encontro el turno a modificar");
      }
      $('#modificar-dias').modal('hide');
      mensajeOk();
      resolve();
    })
    .catch(function(error) {
    // The document probably doesn't exist.
    console.log("Error getting document:", error);
    reject();
    });

  });

  promesa.then(function(result) {
    console.log(result); // "Stuff worked!"
    recargarDiasEspeciales();
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

}

function cargarPuestoEspecial(fecha,nombrePuesto,nombreTurno,ingresoPuesto,egresoPuesto,horasTurno,estado){
  // Carga el objeto Turno
  let turno = {
    nombrePuesto: nombrePuesto,
    nombreTurno: nombreTurno,
    ingresoPuesto: ingresoPuesto,
    egresoPuesto: egresoPuesto,
    horasTurno: horasTurno,
    estado: estado
  };
  let nombreCampo = nombrePuesto+"_"+nombreTurno;
  let idDate = idDateToString(fecha);

  db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("temporales")
    .doc(idDate)
    .get()
    .then(function(doc){
      if (doc.exists) {
        //Si encuentra al documento extraigo el total de horas del documentData y le sumo las del nuevo turno
        //luego se hace un update del turno y el DocumentData
        let totalHoras = doc.data().documentData.totalHoras;
        totalHoras = sumarHorasString(totalHoras,horasTurno);
        let documentData = {
          cantidadPuestos : doc.data().documentData.cantidadPuestos+1,
          fecha : doc.data().documentData.fecha,
          totalHoras : totalHoras
        }

        // Se chequea si el nombre del campo ya existe o es nuevo
        let docObject = doc.data();
        //let encontrado = false;

        for (var fieldName in docObject) {
          if (fieldName==nombreCampo){
            console.log("Ya existe un Puesto con esos datos");
            //encontrado = true;
            //Resto uno en cantidadPuestos porque el turno ya Existe
            documentData.cantidadPuestos--;
          }
        }

        db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("temporales")
          .doc(idDate)
          .update({
            [nombreCampo] : turno,
            documentData : documentData
          });

      } else {
        // doc.data() will be undefined in this case
        let documentData = {
          cantidadPuestos : 1,
          fecha : fecha,
          totalHoras : horasTurno
        }
        db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("temporales")
          .doc(idDate)
          .set({
            [nombreCampo] : turno,
            documentData : documentData
          })
      }
    })
    .catch(function(error) {
    // The document probably doesn't exist.
    console.log("Error getting document:", error);
    });
}

function modificarPuestoEspecial(nombrePuesto,nombreTurno,ingresoPuesto,egresoPuesto,horasTurno,estado){
  // Carga el objeto Turno
  let turno = {
    nombrePuesto: nombrePuesto,
    nombreTurno: nombreTurno,
    ingresoPuesto: ingresoPuesto,
    egresoPuesto: egresoPuesto,
    horasTurno: horasTurno,
    estado: estado
  };
  let nombreCampo = nombrePuesto+"_"+nombreTurno;
  let comparaHoras = compararHorasString(ingresoPuesto,egresoPuesto);
  if(comparaHoras==-1){
    turno.turnoNoche=true;
    turno.nombreTurno="TN";
    nombreCampo = nombrePuesto+"_TN";
  }

  db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("temporales")
    .doc(idDiaGlobal)
    .get()
    .then(function(doc){
      if (doc.exists) {
        let docObject = doc.data();
        let turnoAnterior = docObject[fieldNameGlobal];
        let documentData = docObject["documentData"];
        let totalHoras = sumarHorasString(documentData.totalHoras,"-"+turnoAnterior.horasTurno)
        totalHoras = sumarHorasString(totalHoras,horasTurno);

        documentData = {
          cantidadPuestos : doc.data().documentData.cantidadPuestos,
          fecha : doc.data().documentData.fecha,
          totalHoras : totalHoras
        }

        //Elimina el turno modificado
        db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("temporales")
          .doc(idDiaGlobal)
          .update({[fieldNameGlobal]: firebase.firestore.FieldValue.delete()});

        //Agrega el turno modificado
        db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("temporales")
          .doc(idDiaGlobal)
          .update({
            [nombreCampo] : turno,
            documentData : documentData
          })

      } else {
        console.log("No se encontro el turno a modificar");
      }
    })
    .catch(function(error) {
    // The document probably doesn't exist.
    console.log("Error getting document:", error);
    });
}

function tablaDiasEspeciales(){

  if(validarFormulario()){

    let nombreCliente = document.getElementById("selectClientes").value;
    let nombreObjetivo = document.getElementById("selectObjetivos").value;

    idClienteGlobal="";
    idObjetivoGlobal="";
    idCubrimientoGlobal="";

    db.collection("clientes").where("nombreCliente","==",nombreCliente)
      .get()
      .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            idClienteGlobal=doc.id;

              db.collection("clientes").doc(idClienteGlobal).collection("objetivos").where("nombreObjetivo","==",nombreObjetivo)
              .get()
              .then(function(querySnapshot) {
                  querySnapshot.forEach(function(doc) {
                    idObjetivoGlobal=doc.id;
                    let date = new Date();
                    // if(visual == "mensual" && date!=""){
                    let fechaInicial = new Date(date.getFullYear(), date.getMonth(), 1); // El primer dia del mes en curso
                    let fechaFinal = new Date(date.getFullYear(), date.getMonth() + 1, 0); // El ultimo dia del mes en curso
                    // } else if(visual == "dias25" && date!=""){
                    //   fechaInicial = new Date(date.getFullYear(), date.getMonth()-1, 26);
                    //   fechaFinal = new Date(date.getFullYear(), date.getMonth(), 25);
                    // }
                    let month = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
                    let tituloDiasEspeciales = month[date.getMonth()] +" "+ date.getFullYear();
                    // let rangoDiasEspeciales = "("+dateToString(fechaInicial)  +" - "+ dateToString(fechaFinal)+")";
                    db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("temporales")
                    .where("documentData.fecha",">=",fechaInicial).where("documentData.fecha","<=",fechaFinal)
                    .get()
                    .then(function(querySnapshot) {
                        if (querySnapshot.empty) {
                            console.log("No se encontro ninguna fecha en este rango");
                            borrarFechasEspeciales();
                            cargarDatosObjetivo(nombreCliente,nombreObjetivo);
                            $("#acordionDiasEspeciales").hide();
                            $("#sinDiasEspeciales").show();
                            $("#diasEspeciales").show();
                            $("#datosObjetivo").show();
                        } else {
                          //Si hay fechas en el rango
                          borrarFechasEspeciales();
                          cargarDatosObjetivo(nombreCliente,nombreObjetivo);
                          $("#sinDiasEspeciales").hide();
                          $("#acordionDiasEspeciales").show();
                          $("#diasEspeciales").show();
                          $("#datosObjetivo").show();
                          $("#tituloDiasEspeciales").text(tituloDiasEspeciales);
                          let i=1;
                          querySnapshot.forEach(function(doc) {
                            let fecha = doc.data().documentData.fecha.toDate(); // toDate convierte Timestamp to Date Object
                            clonar(i,fecha);
                            let docObject = doc.data();
                            let idDia = doc.id;
                            //let numDia = doc.data().documentData.numeroDia;
                            for (var fieldName in docObject) {
                              if (fieldName=="documentData"){
                                // No procesar nada
                              }else {
                                let turno = docObject[fieldName];
                                cargarFechasEspeciales(idClienteGlobal,idObjetivoGlobal,idDia,fieldName,turno.nombrePuesto,turno.nombreTurno,turno.ingresoPuesto,turno.egresoPuesto,turno.horasTurno,turno.estado,i);
                              }
                            }
                            i++;
                          });
                        }
                      }).catch(function(error) {
                          console.log("Error getting document:", error);
                      });
                  });
              });
         })
      });

  }

}

function recargarDiasEspeciales(){
  let date = new Date();
  // if(visual == "mensual" && date!=""){
  let fechaInicial = new Date(date.getFullYear(), date.getMonth(), 1); // El primer dia del mes en curso
  let fechaFinal = new Date(date.getFullYear(), date.getMonth() + 1, 0); // El ultimo dia del mes en curso
  // } else if(visual == "dias25" && date!=""){
  //   fechaInicial = new Date(date.getFullYear(), date.getMonth()-1, 26);
  //   fechaFinal = new Date(date.getFullYear(), date.getMonth(), 25);
  // }
  db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("temporales")
  .where("documentData.fecha",">=",fechaInicial).where("documentData.fecha","<=",fechaFinal)
  .get()
  .then(function(querySnapshot) {
      if (querySnapshot.empty) {
          console.log("No se encontro ninguna fecha en este rango");
      } else {
        //Si hay fechas en el rango
        borrarFechasEspeciales();
        $("#sinDiasEspeciales").hide();
        $("#acordionDiasEspeciales").show();
        $("#diasEspeciales").show();
        $("#datosObjetivo").show();
        let i=1;
        querySnapshot.forEach(function(doc) {
          let fecha = doc.data().documentData.fecha;
          clonar(i,fecha);
          let docObject = doc.data();
          let idDia = doc.id;
          //let numDia = doc.data().documentData.numeroDia;
          for (var fieldName in docObject) {
            if (fieldName=="documentData"){
              // No procesar nada
            }else {
              let turno = docObject[fieldName];
              cargarFechasEspeciales(idClienteGlobal,idObjetivoGlobal,idDia,fieldName,turno.nombrePuesto,turno.nombreTurno,turno.ingresoPuesto,turno.egresoPuesto,turno.horasTurno,turno.estado,i);
            }
          }
          i++;
        });
      }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

function clonar(i,fecha) {

  let panel = document.getElementById("panelFecha");
  let clon = panel.cloneNode("panelFecha");
  let namePanel = "panel"+i;
  clon.id = namePanel;

  let accordion2 = document.getElementById("accordion2");
  accordion2.appendChild(clon);

  let namePanelId="#panel"+i;
  let collapse = "collapse"+i;
  let collapseId = "#collapse"+i;
  let heading = "heading"+i;
  let tableBody = "table_body"+i

  let meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  let dias = ["Domingo","Lunes","Martes","Miercoles","Jueves","Viernes","Sabado"];
  let fechaString = dias[fecha.getDay()] + ", " + fecha.getDate() + " de " + meses[fecha.getMonth()] +" "+ fecha.getFullYear();

  $(namePanelId).show();

  $(namePanelId).find("#heading").attr("id",heading);

  $(namePanelId).find("#titleHeading").attr("href",collapseId);
  $(namePanelId).find("#titleHeading").attr("aria-controls",collapse);
  $(namePanelId).find("#titleHeading").text(fechaString);

  $(namePanelId).find("#collapse").attr("aria-labelledby",heading);
  $(namePanelId).find("#collapse").attr("id",collapse);

  $(namePanelId).find("#table_body").attr("id",tableBody);

}

function cargarFechasEspeciales(idCliente,idObjetivo,idDia,fieldName,nombrePuesto,nombreTurno,horaIngreso,horaEgreso,horasTurno,estado,i){

  var iconoEditar = '<span class="glyphicon glyphicon-edit"></span>';
  var iconoEliminar = '<span class="glyphicon glyphicon-trash"></span>';

  var tBody = document.getElementById("table_body"+i);

  var fila = document.createElement("tr");

  var celdaNombrePuesto = document.createElement("td");
  var celdaNombreTurno = document.createElement("td");
  var celdaHoraIngreso = document.createElement("td");
  var celdaHoraEgreso = document.createElement("td");
  var celdaHorasTurno = document.createElement("td");
  var celdaEstado = document.createElement("td");
  var celdaEditar = document.createElement("td");
  var celdaEliminar = document.createElement("td");

  celdaNombrePuesto.textContent = nombrePuesto;
  celdaNombreTurno.textContent = nombreTurno;
  celdaHoraIngreso.textContent = horaIngreso;
  celdaHoraEgreso.textContent = horaEgreso;
  celdaHorasTurno.textContent = horasTurno;
  celdaEstado.textContent = estado;

  celdaEditar.innerHTML = iconoEditar;
  celdaEditar.setAttribute("data-toggle", "modal");
  celdaEditar.setAttribute("data-target", "#modificar-dias");
  celdaEditar.addEventListener("click", function(){
    MostrarModalEspeciales(idCliente,idObjetivo,idDia,fieldName,nombrePuesto,nombreTurno,horaIngreso,horaEgreso,horasTurno,estado,i);
  });

  celdaEliminar.innerHTML = iconoEliminar;
  celdaEliminar.addEventListener("click", function(){
    mensajeEliminarTurnoEspecial(idCliente,idObjetivo,idDia,fieldName,i);
  });

  fila.appendChild(celdaNombrePuesto);
  fila.appendChild(celdaNombreTurno);
  fila.appendChild(celdaHoraIngreso);
  fila.appendChild(celdaHoraEgreso);
  fila.appendChild(celdaHorasTurno);
  fila.appendChild(celdaEstado);
  fila.appendChild(celdaEditar);
  fila.appendChild(celdaEliminar);
  tBody.appendChild(fila);

}


// -----------------------------------------------------------------
function idDateToString(date){
  let day = date.getDate();
  let month = date.getMonth()+1;
  let year = date.getFullYear();
  if(day<10) {
    day = '0' + day;
  }
  if(month<10) {
    month = '0' + month;
  }
  return year+"-"+month+"-"+day;
}

function dateToString(date){
  let day = date.getDate();
  let month = date.getMonth()+1;
  let year = date.getFullYear();
  if(day<10) {
    day = '0' + day;
  }
  if(month<10) {
    month = '0' + month;
  }
  return day+"/"+month+"/"+year;
}

function toggleAccordion() {

  $(".toggle-accordion").on("click", function() {
    var accordionId = $(this).attr("accordion-id"),
      numPanelOpen = $(accordionId + ' .collapse.in').length;

    $(this).toggleClass("active");

    if (numPanelOpen == 0) {
      openAllPanels(accordionId);
    } else {
      closeAllPanels(accordionId);
    }
  });

  openAllPanels = function(aId) {
    console.log("setAllPanelOpen");
    $(aId + ' .panel-collapse:not(".in")').collapse('show');
  }
  closeAllPanels = function(aId) {
    console.log("setAllPanelclose");
    $(aId + ' .panel-collapse.in').collapse('hide');
  }
}

function compararHorasString(horaInicial,horaFinal){

let horaIniDate = (new Date("2019-01-01T"+horaInicial+":00.0000z")).getTime();
let horaFinDate = (new Date("2019-01-01T"+horaFinal+":00.0000z")).getTime();

    if (horaIniDate>horaFinDate){
      console.log("Hora inicial mas grande que la final");
      return -1;
    }
    else if (horaIniDate<horaFinDate){
      console.log("Hora inicial mas chica que la final");
      return 1;
    } else {
      return 0;
    }
}

// Suma dos horas tipo 00:00 (String) se repite en cobertura.js
function sumarHorasString(horaInicial,horaASumar){
  if(horaInicial.length == 0){
    horaInicial = "00:00";
  }
  if(horaASumar.length == 0){
    horaASumar = "00:00";
  }
  var totalHoras,totalMinutos;
  var sepHrIni = horaInicial.indexOf(":");
  var sepHrSum = horaASumar.indexOf(":");
  var inicioHoras = parseInt(horaInicial.substr(0,sepHrIni));
  var inicioMinutos = parseInt(horaInicial.substr(sepHrIni+1,2));
  var finHoras = parseInt(horaASumar.substr(0,sepHrSum));
  var finMinutos = parseInt(horaASumar.substr(sepHrSum+1,2));
  //Si las dos horas son negativas ingresa al If
  if (horaInicial.charAt(0)=="-" && horaASumar.charAt(0)=="-"){
    totalHoras = inicioHoras + finHoras;
    totalMinutos = finMinutos + inicioMinutos;
    if (totalMinutos >= 60) {
       totalHoras--;
       totalMinutos = totalMinutos - 60;
     }
  // Si alguna de las dos horas es negativa ingresa al If
  } else if (horaInicial.charAt(0)=="-" || horaASumar.charAt(0)=="-"){
    totalHoras = inicioHoras + finHoras;
    if (horaInicial.charAt(0)=="-"){
      inicioMinutos = inicioMinutos * -1;
    } else {
      finMinutos = finMinutos * -1;
    }
    totalMinutos = finMinutos + inicioMinutos;
    if (totalHoras<0 && totalMinutos<0){
      totalMinutos = totalMinutos * -1;
    } else if (totalHoras<0 && totalMinutos>0){
      totalHoras ++;
      totalMinutos = 60 - totalMinutos;
    } else if (totalHoras>0 && totalMinutos<0){
      totalHoras --;
      totalMinutos = 60 + totalMinutos;
    } else if (totalHoras==0 && totalMinutos<0){
        totalMinutos = totalMinutos * -1;
        totalHoras="-"+totalHoras;
    } // Si totalHoras y totalMinutos es positivo entonces no hago ningun cambio
  } else {
    totalHoras = inicioHoras + finHoras;
    totalMinutos = finMinutos + inicioMinutos;
    if (totalMinutos >= 60) {
       totalHoras++;
       totalMinutos = totalMinutos - 60;
     }
  }
    var horas = totalHoras.toString();
    var minutos = totalMinutos.toString();
    if (minutos.length < 2) {
      minutos = "0"+minutos;
    }
  return horas+":"+minutos;
}
