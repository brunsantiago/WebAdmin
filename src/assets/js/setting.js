// -----------------------------------------------------------------
// ESQUEMA DE COBERTURA SECTION
// -----------------------------------------------------------------

var idClienteGlobal;
var idObjetivoGlobal;
var idCubrimientoGlobal;
var idDiaGlobal;
var numDiaGlobal;
var fieldNameGlobal;
var idSupervisorGlobal;
var nombreClienteGlobal;
var nombreObjetivoGlobal;

function borrarTablas(){
  document.getElementById("table_body_0").innerHTML="";
  document.getElementById("table_body_1").innerHTML="";
  document.getElementById("table_body_2").innerHTML="";
  document.getElementById("table_body_3").innerHTML="";
  document.getElementById("table_body_4").innerHTML="";
  document.getElementById("table_body_5").innerHTML="";
  document.getElementById("table_body_6").innerHTML="";
}

function cargarPuestosSetting(){

  if(validarFormulario()){

    let nombreCliente = document.getElementById("selectCliente").value;
    let nombreObjetivo = document.getElementById("selectObjetivo").value;

    idClienteGlobal="";
    idObjetivoGlobal="";
    idCubrimientoGlobal="";
    idSupervisorGlobal="";
    nombreClienteGlobal=nombreCliente;
    nombreObjetivoGlobal=nombreObjetivo;

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
                    idSupervisorGlobal=doc.data().idSupervisor;

                    db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
                    .where("estado","==","VIGENTE")
                    .get()
                    .then(function(querySnapshot) {
                        if (querySnapshot.empty) {
                          // Si NO hay esquema vigente ingresa aca
                          $("#datosObjetivo").hide();
                          $("#esquemaCobertura").show();
                          $("#contenedorEsquema").hide();
                          $("#sinEsquema").show();
                          $("#acordionEsquema").hide();
                          //cargarDatosObjetivo(nombreCliente,nombreObjetivo,idSupervisor);
                        } else {
                          // Si hay esquema vigente ingresa aca
                          querySnapshot.forEach(function(doc) {
                            //Antes de mostrar el esquema verifico que el mismo este vigente
                            if(fechaEsquemaVigente(doc.data().fechaHasta)){
                              //Si el esquema esta vigente lo muestro por pantalla
                              $("#datosObjetivo").show();
                              $("#esquemaCobertura").show();
                              $("#contenedorEsquema").show();
                              $("#sinEsquema").hide();
                              $("#acordionEsquema").show();

                              idCubrimientoGlobal=doc.id;
                              cargarDatosEsquema(nombreCliente,nombreObjetivo,doc.data().fechaDesde.toDate(),doc.data().fechaHasta.toDate(),doc.data().estado,idSupervisorGlobal);
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
                              $("#datosObjetivo").hide();
                              $("#esquemaCobertura").show();
                              $("#contenedorEsquema").hide();
                              $("#sinEsquema").show();
                              $("#acordionEsquema").hide();
                              //cargarDatosObjetivo(nombreCliente,nombreObjetivo,idSupervisor);
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

function cargarPuestosSettingNuevo(idCliente,idObjetivo,idCubrimiento,nombreCliente,nombreObjetivo,fechaDesdeNuevo,fechaHastaNuevo,estadoNuevo,idSupervisor){

  $("#datosObjetivo").show();
  $("#esquemaCobertura").show();
  $("#contenedorEsquema").show();
  $("#sinEsquema").hide();
  $("#acordionEsquema").show();

  idClienteGlobal = idCliente;
  idObjetivoGlobal = idObjetivo;
  idCubrimientoGlobal = idCubrimiento;
  idSupervisorGlobal = idSupervisor;

  cargarDatosEsquema(nombreCliente,nombreObjetivo,fechaDesdeNuevo,fechaHastaNuevo,estadoNuevo,idSupervisor);
  borrarTablas();
  for(var numeroDia=0;numeroDia<7;numeroDia++){
    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
      .doc(idCubrimiento).collection("esquema").where("documentData.numeroDia","==",numeroDia)
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
                cargarEsquemaSetting(idCliente,idObjetivo,idCubrimiento,idDia,fieldName,dia.nombrePuesto,dia.nombreTurno,dia.ingresoPuesto,dia.egresoPuesto,dia.horasTurno,dia.estado,numDia);
              }
            }
          });
      })
      .catch(function(error) {
          console.log("Error getting document:", error);
      });
  }

}

function fechaEsquemaVigente(fechaHastaEsquema) {
  let fechaActual = new Date();
  fechaActual.setHours(0,0,0,0);
  if (fechaHastaEsquema.toDate()>fechaActual){
    return true;
  } else {
    return false;
  }
}

function modificarEstadoEsquema(idEsquema){
  db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
  .doc(idEsquema)
  .update({estado:"CADUCADO"})
  .then(function() {
    console.log("Document successfully updated!");
  })
  .catch(function(error) {
      // The document probably doesn't exist.
      console.error("Error updating document: ", error);
  });

}

function cargarEsquema(){

  let nombreCliente = document.getElementById("selectCliente").value;
  let nombreObjetivo = document.getElementById("selectObjetivo").value;

  db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
  .doc(idCubrimientoGlobal)
  .get()
  .then(function(doc) {
      if (doc.exists) {
        // do something with the data

          $("#datosObjetivo").show();
          $("#esquemaCobertura").show();
          $("#contenedorEsquema").show();
          $("#sinEsquema").hide();
          $("#acordionEsquema").show();

          //cargarDatosEsquema(nombreCliente,nombreObjetivo,doc.data().fechaDesde.toDate(),doc.data().fechaHasta.toDate(),doc.data().estado,idSupervisorGlobal);
          borrarTablas();

          // for(var numeroDia=0;numeroDia<7;numeroDia++){
            //console.log(numeroDia);
            db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
              .doc(idCubrimientoGlobal).collection("esquema") //.where("documentData.numeroDia","==",numeroDia)
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
              })
              .catch(function(error){
                console.log("Error al querer obtener el documento",error);
              });
          // }
        // $("#datosObjetivo").show();
      }
    }).catch(function(error) {
        console.log("Error al obtener el documento:", error);
    });

}

function cargarDatosEsquema(nombreCliente,nombreObjetivo,fechaDesde,fechaHasta,estado,idSupervisor){

  $('#nombreCliente').text(" "+nombreCliente);
  $('#nombreObjetivo').text(" "+nombreObjetivo);
  $('#fechaDesde').text(dateToString(fechaDesde));
  $('#fechaHasta').text(dateToString(fechaHasta));

  if(estado=="VIGENTE"){
    $('#vigente').text("VIGENTE");
    $('#vigente').css('color', 'black');
    $('#tituloResultadoEsquema').text("Esquema Vigente");
    document.getElementById("esquemaCobertura").className = "panel panel-primary";
  } else if (estado=="CADUCADO"){
    $('#vigente').text("CADUCADO");
    $('#vigente').css('color', 'red');
    $('#tituloResultadoEsquema').text("Esquema Caducado");
    document.getElementById("esquemaCobertura").className = "panel panel-danger";
  } else if (estado=="PROYECTADO"){
    $('#vigente').text("PROYECTADO");
    $('#vigente').css('color', 'green');
    $('#tituloResultadoEsquema').text("Esquema Proyectado");
    document.getElementById("esquemaCobertura").className = "panel panel-success";
  }

  db.collection("users").where("idPersonal","==",idSupervisor)
    .get()
    .then(function(querySnapshot) {
      if(querySnapshot.empty){
        $('#nombreSupervisor').text(" Sin Identificar");
      }else{
        querySnapshot.forEach(function(doc) {
          $('#nombreSupervisor').text(" "+doc.data().nombre);
        });
      }
    });
}

function cargarDatosObjetivo(nombreCliente,nombreObjetivo,idSupervisor){

  $('#tituloResultadoEsquema').text("Esquema Vigente");
  $('#esquemaCobertura').removeClass("panel-danger");
  $("#esquemaCobertura").addClass("panel-primary");

  db.collection("users").where("idPersonal","==",idSupervisor)
    .get()
    .then(function(querySnapshot) {
      if(querySnapshot.empty){
        $('#nombreCliente').text(" "+nombreCliente);
        $('#nombreObjetivo').text(" "+nombreObjetivo);
        $('#nombreSupervisor').text(" "+"Sin Identificar");
      }else{
        querySnapshot.forEach(function(doc) {
          $('#nombreCliente').text(" "+nombreCliente);
          $('#nombreObjetivo').text(" "+nombreObjetivo);
          $('#nombreSupervisor').text(" "+doc.data().nombre);
        });
      }
    });

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
  fieldNameGlobal=fieldName; // Nombre de Campo del dia a Modificar
  $("#datetimepickerHIMod").data("DateTimePicker").date(horaIngreso);
  $("#datetimepickerHEMod").data("DateTimePicker").date(horaEgreso);
  asignarTurnoMod($("#datetimepickerHIMod").data("DateTimePicker").date());
  $('#nombrePuesto').val(nombrePuesto);
  $('#horasTurno').val(horasTurno);
  $('#estado').val(estado);
}

function cargarPuestosEsquema(){
  //Creamos un array que almacenará los valores de los input "checked"
  let diasChecked = [];
  //Recorremos todos los input checkbox con name = diasSeleccionados y que se encuentren "checked"
  $("input[name='diasSeleccionados']:checked").each(function(){
  //Mediante la función push agregamos al arreglo los values de los checkbox
  diasChecked.push(parseInt($(this).attr("value")));
  });

  let todosLosDias = $("input[name='diasSeleccionados']:checked").val();

  if (todosLosDias=="todos"){
    diasChecked = [0,1,2,3,4,5,6];
  }

  let nombrePuesto = document.getElementById("nombrePuesto1").value;
  let nombreTurno = document.getElementById("nombreTurno1").value.split(" ",1)[0];
  let ingresoPuesto = $("#datetimepickerHI").find("input").val();
  let egresoPuesto = $("#datetimepickerHE").find("input").val();
  let horasTurno = document.getElementById("horasTurno1").value;
  let estado = document.getElementById("estado1").value;

  db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
  .doc(idCubrimientoGlobal)
  .get()
  .then(function(doc) {
    cargarTurnos(idClienteGlobal,idObjetivoGlobal,idCubrimientoGlobal,nombrePuesto,nombreTurno,ingresoPuesto,egresoPuesto,horasTurno,estado,diasChecked)
    .then(function(){
      cargarEsquema(); //Error se llama a la funcion sin todavia haber actualizado la carga de puestos.
      mensajeOk();
    })
    .catch(function(error){
      console.log("Error al intentar cargar los puestos",error);
    });

  });

  $('#carga-puesto').modal('hide');
}

function cargarTurnos(idCliente,idObjetivo,idCubrimiento,nombrePuesto,nombreTurno,ingresoPuesto,egresoPuesto,horasTurno,estado,diasChecked){

  return new Promise(function(resolve,reject){

        let turno = {
          nombrePuesto: nombrePuesto,
          nombreTurno: nombreTurno,
          ingresoPuesto: ingresoPuesto,
          egresoPuesto: egresoPuesto,
          horasTurno: horasTurno,
          estado: estado
        }

        let nombreCampo=nombrePuesto+"_"+nombreTurno;
        let comparaHoras = compararHorasString(ingresoPuesto,egresoPuesto);
        if(comparaHoras==-1){
          turno.turnoNoche=true;
        }

          const promises = [];

          diasChecked.forEach(function(i) {

            db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
              .doc(idCubrimiento).collection("esquema").where("documentData.numeroDia","==",i)
              .get()
              .then(function(querySnapshot) {
                  querySnapshot.forEach(function(doc) {
                    let docObject = doc.data();
                    let documentData = docObject["documentData"];
                    let totalHoras = doc.data().documentData.totalHoras;
                    totalHoras = sumarHoras(totalHoras,turno.horasTurno);

                    if(docObject.hasOwnProperty(nombreCampo)){
                      totalHoras = sumarHorasString(totalHoras,"-"+docObject[nombreCampo].horasTurno); //Se restan las horas del turno que van a ser pisadas
                    }

                    documentData.totalHoras = totalHoras;

                    if(turno.turnoNoche){
                      documentData.turnoNoche=true;
                    }

                    db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
                    .doc(idCubrimiento).collection("esquema").doc(doc.id)
                    .update({
                      [nombreCampo] : turno,
                      documentData : documentData,
                    })
                    .then(function(){
                      promises.push( resolve() );
                    })
                    .catch(function(){
                      promises.push( reject() );
                    });

                  });
                })
                .catch(function(error) {
                console.log("Error getting document:", error);
                promises( reject() );
                });
            });

            Promise.all(promises)
            .then(function(){
              resolve();
            })
            .catch(function(){
              reject();
            });
  });
}

function cambiarPuestosSetting(){

  let nombrePuesto = document.getElementById("nombrePuesto").value;
  let nombreTurno = document.getElementById("nombreTurno").value.split(" ",1)[0];
  let ingresoPuesto = $("#datetimepickerHIMod").find("input").val();
  let egresoPuesto = $("#datetimepickerHEMod").find("input").val();
  let horasTurno = document.getElementById("horasTurno").value;
  let estado = document.getElementById("estado").value;

  // Carga el objeto Turno
  var turno = {
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
  }

  db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
    .doc(idCubrimientoGlobal).collection("esquema").doc(idDiaGlobal)
    .get()
    .then(function(doc){

        let docObject = doc.data();
        let turnoAnterior = docObject[fieldNameGlobal];
        let documentData = docObject["documentData"];
        let totalHoras = sumarHorasString(documentData.totalHoras,"-"+turnoAnterior.horasTurno)
        totalHoras = sumarHorasString(totalHoras,horasTurno);

        if(fieldNameGlobal!=nombreCampo && docObject[nombreCampo]!=undefined){
          //Si el cambio en el turno pisa a otro ya creado, entonces debo restar esas horas tambien
          totalHoras = sumarHorasString(totalHoras,"-"+docObject[nombreCampo].horasTurno);
        }

        documentData.totalHoras = totalHoras;
        if(turno.turnoNoche){
          documentData.turnoNoche=true;
        }

        if(turno.turnoNoche!=true && unicoTurnoNoche(docObject,fieldNameGlobal)){
          // Si el turno anterior era turnoNoche y al editarse ya no lo es, entonces hay que revisar si no era el unico para cambiar el documentData.turnoNoche a false
          documentData.turnoNoche=false;
          db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
            .doc(idCubrimientoGlobal).collection("esquema").doc(idDiaGlobal)
            .update({[fieldNameGlobal]: firebase.firestore.FieldValue.delete(),
                     [nombreCampo] : turno,
                     documentData : documentData,
            })
            .then(function() {
              eliminarContenidoDia(numDiaGlobal);
              cargarDiaModificado();
            })
            .catch(function(error) {
                console.error("Error updating document: ", error);
            });
        } else {
          db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
            .doc(idCubrimientoGlobal).collection("esquema").doc(idDiaGlobal)
            .update({[fieldNameGlobal]: firebase.firestore.FieldValue.delete(),
                     [nombreCampo] : turno,
                     documentData : documentData,
            })
            .then(function() {
              eliminarContenidoDia(numDiaGlobal);
              cargarDiaModificado();
            })
            .catch(function(error) {
                console.error("Error updating document: ", error);
            });
        }
      $('#editar-puesto').modal('hide');
    })
    .catch(function(error) {
    console.log("Error al cambiar turno:", error);
    });

}

function eliminarContenidoDia(numeroDia){
    var tBody = document.getElementById("table_body_"+numeroDia);
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

function cargarDiasSemana(fechaDesdeNuevo,fechaHastaNuevo,estadoNuevo){
  //Esta funcion verificar antes de cargar los datos del esquema nuevo que el mismo no tenga conflicto de fechas con otros esquemas

  if(validarFormulario()){

    let nombreCliente = document.getElementById("selectCliente").value;
    let nombreObjetivo = document.getElementById("selectObjetivo").value;

    let idCliente="";
    let idObjetivo="";
    let idCubrimiento="";

    let esquemaData = {
      fechaDesde : fechaDesdeNuevo,
      fechaHasta : fechaHastaNuevo,
      estado : estadoNuevo
    }

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
                      let idSupervisor = doc.data().idSupervisor;

                      db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
                      .get()
                      .then(function(querySnapshot) {
                        if(querySnapshot.empty){
                          //El Objetivo no tiene esquemas cargados
                          cargarEsquemaVacio(idCliente,idObjetivo,fechaDesdeNuevo,fechaHastaNuevo,esquemaData,nombreCliente,nombreObjetivo,estadoNuevo,idSupervisor);
                        } else{
                          //Si el Objetivo tiene esquemas cargados, los recorro.
                          let esquemaEncontrado=false;
                          for (var i in querySnapshot.docs) {
                            let doc = querySnapshot.docs[i];
                            let fechaDesdeEsquema = doc.data().fechaDesde.toDate();
                            let fechaHastaEsquema = doc.data().fechaHasta.toDate();
                            if( (fechaDesdeNuevo>=fechaDesdeEsquema && fechaDesdeNuevo<=fechaHastaEsquema) ||
                                (fechaHastaNuevo>=fechaDesdeEsquema && fechaHastaNuevo<=fechaHastaEsquema) ||
                                (fechaDesdeNuevo<fechaDesdeEsquema && fechaHastaNuevo>fechaHastaEsquema)) {
                                esquemaEncontrado=true;
                                mensajeError();
                                break;
                            }
                          }
                          if(!esquemaEncontrado){
                            cargarEsquemaVacio(idCliente,idObjetivo,fechaDesdeNuevo,fechaHastaNuevo,esquemaData,nombreCliente,nombreObjetivo,estadoNuevo,idSupervisor);
                            mensajeOk();
                          }

                        }

                      });

                    });
                });
           })
        });

  }

}

function cargarEsquemaVacio(idCliente,idObjetivo,fechaDesdeNuevo,fechaHastaNuevo,esquemaData,nombreCliente,nombreObjetivo,estadoNuevo,idSupervisor){

  let documentData = {
    cantidadPuestos : 0,
    numeroDia : 0,
    totalHoras : "00:00",
    turnoNoche : false,
  }
  let idCubrimiento="";
  let diasSemana = ["DOMINGO","LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO"];

  db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
  .add(esquemaData)
  .then(function(doc){
    idCubrimiento=doc.id;
    const promises = []; //Creo el array de promesas a ejecutar
    for (var i=0;i<7;i++){
      documentData.numeroDia=i;
      promises.push(promiseDiasSemana(idCliente,idObjetivo,idCubrimiento,diasSemana[i],documentData));
    }
    Promise.all(promises)
    .then(value => { cargarPuestosSettingNuevo(idCliente,idObjetivo,idCubrimiento,nombreCliente,nombreObjetivo,fechaDesdeNuevo,fechaHastaNuevo,estadoNuevo,idSupervisor) }) //Una vez cargado todos los dias en el esquema nuevo lo muestro en pantalla
    .catch(error => { });
  })
  .catch(function(error) {
    console.error("Error adding document: ", error);
  });

}

function promiseDiasSemana(idCliente,idObjetivo,idCubrimiento,diaSemana,documentData){

 return new Promise(function(resolve,reject){
   db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
     .doc(idCubrimiento).collection("esquema").doc(diaSemana).set({documentData: documentData})
     .then(function() {
       //Si se pudo insertar correctamente el dia
       resolve();
     })
     .catch(function(error) {
        //Si se pudo insertar correctamente el dia
        console.error("Error writing document: ", error);
        reject();
     });
 })

}

function eliminarTurno(idCliente,idObjetivo,idCubrimiento,idDia,fieldName,numeroDia){

  let promesa = new Promise(function(resolve, reject) {

  db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
        .doc(idCubrimiento).collection("esquema").doc(idDia)
        .get()
        .then(function(doc){
          let docObject=doc.data();
          let totalHoras=docObject["documentData"].totalHoras;
          let horasTurno=docObject[fieldName].horasTurno;
          totalHoras=sumarHorasString(totalHoras,"-"+horasTurno);

          if(docObject.documentData.turnoNoche && unicoTurnoNoche(docObject,fieldName)){
              //Si el turno que voy a eliminar tiene turno noche y era el unico entonces debo modificar el documentData.turnoNoche a false
              db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
                .doc(idCubrimiento).collection("esquema").doc(idDia)
                .update({[fieldName]: firebase.firestore.FieldValue.delete(),
                         "documentData.totalHoras" : totalHoras,
                         "documentData.turnoNoche" : false,
                })
                .then(function() {
                    resolve();
                })
                .catch(function(error) {
                    // The document probably doesn't exist.
                    console.error("Error updating document: ", error);
                    reject();
                });
          } else {
            db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("cubrimiento")
              .doc(idCubrimiento).collection("esquema").doc(idDia)
              .update({[fieldName]: firebase.firestore.FieldValue.delete(),
                       "documentData.totalHoras" : totalHoras,
              })
              .then(function() {
                  resolve();
              })
              .catch(function(error) {
                  // The document probably doesn't exist.
                  console.error("Error updating document: ", error);
                  reject();
              });
          }
        });
  });

  promesa.then(function(result) {
    eliminarContenidoDia(numeroDia);
    cargarDiaModificado2(idCliente,idObjetivo,idCubrimiento,idDia,numeroDia);
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

}

function unicoTurnoNoche(docObject,fieldNameTurno){
  let i=0;
  if(docObject[fieldNameTurno].turnoNoche){ //Si el turno a eliminar es turno noche
    for (let fieldName in docObject) {
      if(docObject[fieldName].turnoNoche && fieldName!="documentData"){
        i++; // Por cada turno noche incremento el contador
      }
    }
    if(i==1){
      return true; //Solamente hay un turno noche y el puesto a eliminar es el unico, entonces cambio el campo del DocumentData.turnoNoche a false;
    } else {
      return false;
    }
  } else {
    return false;
  }
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

  cargarPuestosModal();

  $('#nombrePuesto1').val("");
  $('#nombreTurno1').val("");
  $("#datetimepickerHI").data("DateTimePicker").clear();
  $("#datetimepickerHE").data("DateTimePicker").clear();

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
  enableCheck();
  $('input[type=checkbox]').prop('checked',false);
  $('#carga-puesto').modal('show');



}

function cargarPuestosModal(){

  db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
  .doc(idCubrimientoGlobal).collection("esquema")
  .get()
  .then(function(querySnapshot) {
    if (querySnapshot.empty) {
      // No existen puestos cargados
    }else{
      let listadoPuestosObj = [];
      querySnapshot.forEach(function(doc) {
        let docObject = doc.data();
        for (var fieldName in docObject) {
          if (fieldName!="documentData"){
            let turno = docObject[fieldName];
            listadoPuestosObj[fieldName] = {np : turno.nombrePuesto, nt : turno.nombreTurno}
          }
        }
      });
      desplegableTurnosModal(listadoPuestosObj,"dataListPuesto");
    }
  })
  .catch(function(error){
    console.log(error);
  });
}

function desplegableTurnosModal(listadoPuestosObj,idDataList){

  let datalist = document.getElementById(idDataList);

  let listadoFiltrado = removeDuplicates(listadoPuestosObj,"np");

  $("#"+idDataList).empty();

  for (var fieldName in listadoFiltrado) {
    let turno = listadoFiltrado[fieldName];
    let option = document.createElement("option");
    option.value = turno.np.toUpperCase();
    datalist.appendChild(option);
  }

}

function removeDuplicates(originalArray, prop) {
     var newArray = [];
     var lookupObject  = {};

     for(var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
     }

     for(i in lookupObject) {
         newArray.push(lookupObject[i]);
     }
      return newArray;
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

function validarFormulario2(){
  if($("#selectCliente2 option:selected").val() == 0) {
    $('#select-validate').modal('show');
    return false;
  }else if($("#selectObjetivo2 option:selected").val() == 0) {
      $('#select-validate').modal('show');
      return false;
  } else {
      return true;
  }
}

function cargarEsquemaNuevo(){
  let cliente = $("#selectCliente").val();
  let objetivo = $("#selectObjetivo").val();
  $('#datetimepicker7').data("DateTimePicker").clear();
  $('#datetimepicker8').data("DateTimePicker").clear();
  $('#estadoNuevo').val("");
  $("#tituloCargarEsquema").text("   "+cliente+" - "+objetivo);
  $("#tituloCargarEsquema").prepend('<i class="far fa-building"></i>');
  if (validarFormulario()){
    $('#cargar-esquema').modal('show');
  }
}

function cargarModalModFechas(){
  let cliente = $("#selectCliente").val(); // Ver si utilizo la variales globales
  let objetivo = $("#selectObjetivo").val(); // Ver si utilizo la variales globales
  let estado = $('#vigente').text();

  $("#dtmModFechaEsquemaFD").data("DateTimePicker").date($('#fechaDesde').text());
  $("#dtmModFechaEsquemaFH").data("DateTimePicker").date($('#fechaHasta').text());

  $('#estadoNuevoModFecha').val(estado);
  $("#tituloModFechasEsquema").text("   "+cliente+" - "+objetivo); // Ver si utilizo la variales globales
  $("#tituloModFechasEsquema").prepend('<i class="far fa-building"></i>');

  $('#modificar-fecha-esquema').modal('show');

}

function cargarNuevasFechasEsquema(){
  let fechaDesdeNuevo = new Date((new Date($("#dtmModFechaEsquemaFD").data("DateTimePicker").date())).setHours(0,0,0,0));
  let fechaHastaNuevo = new Date((new Date($("#dtmModFechaEsquemaFH").data("DateTimePicker").date())).setHours(0,0,0,0));
  let estadoNuevo = $('#estadoNuevoModFecha').val();
  cargarFechasEsquema(fechaDesdeNuevo,fechaHastaNuevo,estadoNuevo);
  $('#modificar-fecha-esquema').modal('hide');
}

function cargarFechasEsquema(fechaDesdeNuevo,fechaHastaNuevo,estadoNuevo){
//Tener en cuenta que al seleccionar el esquema ya se cargaron todas las variales globales, por lo que podria usarlas de forma directa

      db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
      .get()
      .then(function(querySnapshot) {
          //Si el Objetivo tiene esquemas cargados, los recorro.
          let esquemaEncontrado=false;
          for (var i in querySnapshot.docs) {
            let doc = querySnapshot.docs[i];
            let fechaDesdeEsquema = doc.data().fechaDesde.toDate();
            let fechaHastaEsquema = doc.data().fechaHasta.toDate();
            if( (fechaDesdeNuevo>=fechaDesdeEsquema && fechaDesdeNuevo<=fechaHastaEsquema) ||
                (fechaHastaNuevo>=fechaDesdeEsquema && fechaHastaNuevo<=fechaHastaEsquema) ||
                (fechaDesdeNuevo<fechaDesdeEsquema && fechaHastaNuevo>fechaHastaEsquema)) {
                  if(doc.id!=idCubrimientoGlobal){
                    esquemaEncontrado=true;
                    mensajeError();
                    break;
                  }
            }
          }
          if(!esquemaEncontrado){
            //cargarEsquemaVacio(idCliente,idObjetivo,fechaDesdeNuevo,fechaHastaNuevo,esquemaData,nombreCliente,nombreObjetivo,estadoNuevo,idSupervisor);
            db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento").doc(idCubrimientoGlobal)
            .update({ fechaDesde : fechaDesdeNuevo,
                      fechaHasta : fechaHastaNuevo,
                      estado : estadoNuevo,
            })
            .then(function() {
                mensajeOk();
                cargarDatosEsquema(nombreClienteGlobal,nombreObjetivoGlobal,fechaDesdeNuevo,fechaHastaNuevo,estadoNuevo,idSupervisorGlobal);
            })
            .catch(function(error) {
                // The document probably doesn't exist.
                console.error("Error updating document: ", error);
            });

          }
      });

}

function cargarEsquemaServer(){
  let fechaDesdeNuevo = new Date((new Date($("#datetimepicker7").data("DateTimePicker").date())).setHours(0,0,0,0));
  let fechaHastaNuevo = new Date((new Date($("#datetimepicker8").data("DateTimePicker").date())).setHours(0,0,0,0));
  let estadoNuevo = $('#estadoNuevo').val();
  cargarDiasSemana(fechaDesdeNuevo,fechaHastaNuevo,estadoNuevo);
  $('#cargar-esquema').modal('hide');
}

function cargarHistorial(){
  swal.close();
  let cliente = $("#selectCliente").val();
  let objetivo = $("#selectObjetivo").val();
  $("#tituloModalHistorial").text("   "+cliente+" - "+objetivo);
  $("#tituloModalHistorial").prepend('<i class="far fa-building"></i>');
  if (validarFormulario()){
    $('#cargar-historial').modal('show');
    cargarHistorialEsquemas();
  }
}

function cargarHistorialEsquemas(){

    borrarTablaHistorial();

    let diaHabilitado = "label label-success";
    let diaDeshabilitado = "label label-default";

    let nombreCliente = document.getElementById("selectCliente").value;
    let nombreObjetivo = document.getElementById("selectObjetivo").value;

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
                    let idSupervisor = doc.data().idSupervisor;

                    db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(idObjetivoGlobal).collection("cubrimiento")
                    .orderBy("fechaDesde","desc")
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
                                          if(totalHoras=="" || totalHoras==undefined || totalHoras=="00:00"){
                                            diasSemana[numeroDia]=diaDeshabilitado;
                                          } else{
                                            diasSemana[numeroDia]=diaHabilitado;
                                          }
                                        }
                                      }
                                    });
                                    cargarDatosHistorial(idClienteGlobal,idObjetivoGlobal,idCubrimiento,nombreCliente,nombreObjetivo,doc.data().fechaDesde,doc.data().fechaHasta,doc.data().estado,diasSemana,idSupervisor);
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

function cargarDatosHistorial(idCliente,idObjetivo,idCubrimiento,nombreCliente,nombreObjetivo,fechaDesde,fechaHasta,estado,diasSemana,idSupervisor){

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

  if(estado=="VIGENTE"){
    celdaEstado.textContent = "Vigente";
  }else if(estado=="CADUCADO"){
    celdaEstado.textContent = "Caducado";
  }else if(estado=="PROYECTADO"){
    celdaEstado.textContent = "Proyectado";
  }


  celdaEditar.innerHTML = iconoEditar;
  celdaEditar.addEventListener("click", function(){
    cargarPuestosHistorial(idCliente,idObjetivo,idCubrimiento,nombreCliente,nombreObjetivo,idSupervisor);
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

function cargarPuestosHistorial(idCliente,idObjetivo,idCubrimiento,nombreCliente,nombreObjetivo,idSupervisor){

    idClienteGlobal=idCliente;
    idObjetivoGlobal=idObjetivo;
    idCubrimientoGlobal=idCubrimiento;
    nombreClienteGlobal=nombreCliente;
    nombreObjetivoGlobal=nombreObjetivo;

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

              cargarDatosEsquema(nombreCliente,nombreObjetivo,doc.data().fechaDesde.toDate(),doc.data().fechaHasta.toDate(),doc.data().estado,idSupervisor);
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
    icon: 'success',
    title: 'Cambios Actualizados Correctamente',
    showConfirmButton: false,
    timer: 1500
  })
}

function mensajeError(){
  Swal.fire({
  icon: 'error',
  title: 'Oops...',
  text: 'Las fechas del nuevo esquema tienen conflicto con esquemas anteriores',
  footer: '<a href="javascript:cargarHistorial()" >Consultar Historial de Esquemas ?</a>'
  })
}

function mensajeEliminarEsquema(idCliente,idObjetivo,idCubrimiento){
  Swal.fire({
  title:'Esta seguro que desea eliminar este Esquema de Cobertura?',
  text: '',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#f56954',
  cancelButtonColor: '#3085d6',
  confirmButtonText: 'Aceptar',
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
  text: '',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#f56954',
  cancelButtonColor: '#3085d6',
  confirmButtonText: 'Aceptar',
  cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.value) {
      eliminarTurno(idCliente,idObjetivo,idCubrimiento,idDia,fieldName,numeroDia);
    }
  })
}

function cargarListadoClientes2(){
  var listadoClientes = [];
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
  let selectClientes = document.getElementById('selectCliente2');
  for(var i = 0; i < listadoClientes.length; i++){
    var option = listadoClientes[i];
    selectClientes.options.add( new Option(option) );
  }
}

function cargarListadoObjetivos2(){

  var listadoObjetivos = [];
  var nombreCliente = document.getElementById("selectCliente2").value;

  db.collection("clientes").where("nombreCliente","==",nombreCliente)
    .get()
    .then(function(querySnapshot) {
      if(querySnapshot.empty){
        console.log("No se econtro el Cliente");
        cargarDesplegableObjetivos2(listadoObjetivos);
      }else{
        querySnapshot.forEach(function(doc) {
          idCliente=doc.id;
            db.collection("clientes").doc(idCliente).collection("objetivos")
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

function cargarDesplegableObjetivos2(listadoObjetivos){
  var selectObjetivos = document.getElementById('selectObjetivo2');

  while (selectObjetivos.length > 1) {
    selectObjetivos.remove(1);
  }

  for(var i = 0; i < listadoObjetivos.length; i++){
    let option = listadoObjetivos[i];
    selectObjetivos.options.add( new Option(option) );
  }
}

function inicializarFuncionesSetting(){
  listadoClientesClient("dataListClient","TODOS",false);
  listadoClientesClient("dataListClient2","TODOS",false);
  $('.box').boxWidget();
  toggleAccordion();
  cargarTodosDatePicker();
  enforcingValueDataList();
}

function agregarPuestoModal(){

  let nombrePuesto = "Puesto "+(document.getElementById("dataListPuesto").options.length + 1);

  Swal.fire({
  // icon: 'warning',
  title: 'Agregar Nuevo Puesto',
  html : '<input id="nroPuesto" class="swal2-input" value="'+nombrePuesto+'" disabled>',
  input: 'text',
  inputPlaceholder: 'Denominacion / Ubicacion del Puesto',
  showCancelButton: true,
  confirmButtonColor: '#3c8dbc',
  cancelButtonColor: '#e5e5e5',
  confirmButtonText: 'Agregar',
  cancelButtonText: 'Cerrar'
  })
  .then((result) => {
    if (result.isConfirmed) {
      if(result.value!=""){
        nombrePuesto+=" - "+result.value;
      }
      desplegablePuestosSetting([(nombrePuesto).toUpperCase()],"dataListPuesto");
    }
  });
}

function desplegablePuestosSetting(listadoPersonal,idDataList){

  var datalist = document.getElementById(idDataList);
  //$("#"+idDataList).empty();
  listadoPersonal.forEach(function(item){
     var option = document.createElement("option");
     option.value = item;
     datalist.appendChild(option);
  });
}

// -----------------------------------------------------------------
// DIAS ESPECIALES SECTION
// -----------------------------------------------------------------

var idClienteGlobalEsp;
var idObjetivoGlobalEsp;
var idCubrimientoGlobalEsp;
var idSupervisorGlobalEsp;
var monthGlobalEsp;
var yearGlobalEsp;
var idDiaGlobalEsp;
var numDiaGlobalEsp;
var fieldNameGlobalEsp;

function MostrarModalEspeciales(idCliente,idObjetivo,idDia,fieldName,nombrePuesto,nombreTurno,horaIngreso,horaEgreso,horasTurno,estado,numeroDia){
  idClienteGlobalEsp=idCliente;
  idObjetivoGlobalEsp=idObjetivo;
  idDiaGlobalEsp=idDia;
  numDiaGlobalEsp=numeroDia;
  fieldNameGlobalEsp=fieldName; // Nombre de Puesto-Turno
  $('#nombrePuesto3').val(nombrePuesto);
  $("#datetimepickerHIModEsp").data("DateTimePicker").date(horaIngreso);
  $("#datetimepickerHEModEsp").data("DateTimePicker").date(horaEgreso);
  asignarTurnoMod($("#datetimepickerHIModEsp").data("DateTimePicker").date());
  $('#horasTurno3').val(horasTurno);
  $('#estado3').val(estado);
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
            for (let fieldName in docObject) {
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

function eliminarContenidoDiaEspecial(numeroDia){
    var tBody = document.getElementById("table_body"+numeroDia);
    tBody.innerHTML="";
}

function mensajeEliminarTurnoEspecial(idCliente,idObjetivo,idDia,fieldName,i){
  Swal.fire({
  title:'Esta seguro que desea eliminar este Turno?',
  // text: 'Esta accion no podra restablecerse!',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#dd4b39',
  cancelButtonColor: '#3c8dbc',
  confirmButtonText: 'Aceptar',
  cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.value) {
      eliminarTurnoEspecial(idCliente,idObjetivo,idDia,fieldName,i);
    }
  })
}

function borrarFechasEspeciales(){
  document.getElementById("accordion2").innerHTML="";
}

function cargarDiasEspeciales(){
  // if (validarFormulario2()){
  $('#nombrePuesto2').val("");
  $('#nombreTurno2').val("");
  $("#datetimepickerHIEspecial").data("DateTimePicker").clear();
  $("#datetimepickerHEEspecial").data("DateTimePicker").clear();
  cargarDatePicker();
  $('#carga-dias').modal('show');
  // }
}

function eliminarTurnoEspecial(idCliente,idObjetivo,idDia,fieldName,numeroDia){

  db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("temporales")
        .doc(idDia)
        .get()
        .then(function(doc){
          let docObject = doc.data();
          let objectLength = Object.keys(docObject).length;

          if (objectLength==2) {
            //Significa que es el ultimo campo junto al Document Data, se elimina el documento completo
            db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("temporales")
            .doc(idDia)
            .delete()
            .then(function() {
                borrarFechasEspeciales();
                $("#acordionDiasEspeciales").hide();
                recargarDiasEspeciales();
                mensajeOk();
            }).catch(function(error) {
                console.error("Error removing document: ", error);
            });

          } else {

            let totalHoras = sumarHorasString(doc.data().documentData.totalHoras,"-"+docObject[fieldName].horasTurno);

            if(docObject.documentData.turnoNoche && unicoTurnoNoche(docObject,fieldName)){
                //Si el turno que voy a eliminar tiene turno noche y era el unico entonces debo modificar el documentData.turnoNoche a false
                db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("temporales")
                  .doc(idDia)
                  .update({[fieldName]: firebase.firestore.FieldValue.delete(),
                           "documentData.totalHoras" : totalHoras,
                           "documentData.turnoNoche" : false,
                  })
                  .then(function() {
                    eliminarContenidoDiaEspecial(numeroDia);
                    cargarDiaEspecial(idCliente,idObjetivo,idDia,numeroDia);
                  })
                  .catch(function(error) {
                      console.error("Error updating document: ", error);
                  });

            } else {
              db.collection("clientes").doc(idCliente).collection("objetivos").doc(idObjetivo).collection("temporales")
                .doc(idDia)
                .update({[fieldName]: firebase.firestore.FieldValue.delete(),
                         "documentData.totalHoras" : totalHoras,
                })
                .then(function() {
                  eliminarContenidoDiaEspecial(numeroDia);
                  cargarDiaEspecial(idCliente,idObjetivo,idDia,numeroDia);
                })
                .catch(function(error) {
                    console.error("Error updating document: ", error);
                });

          }
        }

        });

}

function cargarPuestoTemporal(){

  let nombrePuesto = document.getElementById("nombrePuesto2").value;
  let nombreTurno = document.getElementById("nombreTurno2").value.split(" ",1)[0];
  let ingresoPuesto = $("#datetimepickerHIEspecial").find("input").val();
  let egresoPuesto = $("#datetimepickerHEEspecial").find("input").val();
  let horasTurno = document.getElementById("horasTurno2").value;
  let estado = document.getElementById("estado2").value;
  // recorrer el array de fechas y llamar a la funcion cargarPuesto por cada iteracion
  let selectedDates = $('.datepicker:first').datepicker('getDates');
  selectedDates.forEach(function(fecha){
    cargarPuestoEspecial(fecha,nombrePuesto,nombreTurno,ingresoPuesto,egresoPuesto,horasTurno,estado);
  });
  $('#carga-dias').modal('hide');
  destroyDatePicker();
}

function modificarPuestoTemporal(){

  let nombrePuesto = document.getElementById("nombrePuesto3").value;
  let nombreTurno = document.getElementById("nombreTurno3").value.split(" ",1)[0];
  let ingresoPuesto = $("#datetimepickerHIModEsp").find("input").val();
  let egresoPuesto = $("#datetimepickerHEModEsp").find("input").val();
  let horasTurno = document.getElementById("horasTurno3").value;
  let estado = document.getElementById("estado3").value;

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
  }

  db.collection("clientes").doc(idClienteGlobalEsp).collection("objetivos").doc(idObjetivoGlobalEsp).collection("temporales")
    .doc(idDiaGlobalEsp)
    .get()
    .then(function(doc){

        let docObject = doc.data();
        let turnoAnterior = docObject[fieldNameGlobalEsp];
        let documentData = docObject["documentData"];
        let totalHoras = sumarHorasString(documentData.totalHoras,"-"+turnoAnterior.horasTurno);
        totalHoras = sumarHorasString(totalHoras,horasTurno);

        if(fieldNameGlobalEsp!=nombreCampo && docObject[nombreCampo]!=undefined){
          //Si el cambio en el turno pisa a otro ya creado, entonces debo restar esas horas tambien
          totalHoras = sumarHorasString(totalHoras,"-"+docObject[nombreCampo].horasTurno);
        }

        documentData.totalHoras = totalHoras;
        if(turno.turnoNoche){
          documentData.turnoNoche=true;
        }

        if(turno.turnoNoche!=true && unicoTurnoNoche(docObject,fieldNameGlobalEsp)){
        // Si el turno anterior era turnoNoche y al editarse ya no lo es, entonces hay que revisar si no era el unico para cambiar el documentData.turnoNoche a false
        documentData.turnoNoche=false;
        db.collection("clientes").doc(idClienteGlobalEsp).collection("objetivos").doc(idObjetivoGlobalEsp).collection("temporales")
          .doc(idDiaGlobalEsp)
          .update({[fieldNameGlobalEsp]: firebase.firestore.FieldValue.delete(),
                    [nombreCampo] : turno,
                    documentData : documentData,
          })
          .then(function() {
            mensajeOk();
            recargarDiasEspeciales();
          })
          .catch(function(error) {
            console.error("Error updating document: ", error);
            recargarDiasEspeciales();
          });
        } else {
          db.collection("clientes").doc(idClienteGlobalEsp).collection("objetivos").doc(idObjetivoGlobalEsp).collection("temporales")
            .doc(idDiaGlobalEsp)
            .update({[fieldNameGlobalEsp]: firebase.firestore.FieldValue.delete(),
                      [nombreCampo] : turno,
                      documentData : documentData,
            })
            .then(function() {
              mensajeOk();
              recargarDiasEspeciales();
            })
            .catch(function(error) {
                console.error("Error updating document: ", error);
                recargarDiasEspeciales();
            });
        }

    })
    .catch(function(error) {
    console.log("Error getting document:", error);
    recargarDiasEspeciales();
    });
  $('#modificar-dias').modal('hide');
}

function cargarPuestoEspecial(fecha,nombrePuesto,nombreTurno,ingresoPuesto,egresoPuesto,horasTurno,estado){

  let turno = {
    nombrePuesto: nombrePuesto,
    nombreTurno: nombreTurno,
    ingresoPuesto: ingresoPuesto,
    egresoPuesto: egresoPuesto,
    horasTurno: horasTurno,
    estado: estado
  }

  let nombreCampo = nombrePuesto+"_"+nombreTurno;
  let comparaHoras = compararHorasString(ingresoPuesto,egresoPuesto);
  if(comparaHoras==-1){
    turno.turnoNoche=true;
  }

  let idDate = idDateToString(fecha);

  db.collection("clientes").doc(idClienteGlobalEsp).collection("objetivos").doc(idObjetivoGlobalEsp).collection("temporales")
    .doc(idDate)
    .get()
    .then(function(doc){
      if (doc.exists) {
        let docObject = doc.data();
        let documentData = docObject["documentData"];
        let totalHoras = documentData.totalHoras;
        totalHoras = sumarHorasString(totalHoras,horasTurno);

        if(docObject.hasOwnProperty(nombreCampo)){
          totalHoras = sumarHorasString(totalHoras,"-"+docObject[nombreCampo].horasTurno); //Se restan las horas del turno que van a ser pisadas
        }

        documentData.totalHoras = totalHoras;

        if(turno.turnoNoche){
          documentData.turnoNoche=true;
        }

        db.collection("clientes").doc(idClienteGlobalEsp).collection("objetivos").doc(idObjetivoGlobalEsp).collection("temporales")
          .doc(idDate)
          .update({
            [nombreCampo] : turno,
            documentData : documentData,
          })
          .then(function(){
            borrarFechasEspeciales();
            $("#acordionDiasEspeciales").hide();
            recargarDiasEspeciales();
            mensajeOk();
          }).catch(function(error) {
              console.error("No se pudo cargar el Turno: ", error);
          });

      } else {
        // Si no encuentra el dia, genera uno nuevo con la carga inicial del DocumentData
        let documentData = {
          cantidadPuestos : 1,
          fecha : fecha,
          totalHoras : horasTurno,
          turnoNoche : false,
        }

        if(turno.turnoNoche){
          documentData.turnoNoche=true;
        }

        db.collection("clientes").doc(idClienteGlobalEsp).collection("objetivos").doc(idObjetivoGlobalEsp).collection("temporales")
          .doc(idDate)
          .set({
            [nombreCampo] : turno,
            documentData : documentData
          })
          .then(function() {
              borrarFechasEspeciales();
              $("#acordionDiasEspeciales").hide();
              recargarDiasEspeciales();
              mensajeOk();
          }).catch(function(error) {
              console.error("No se pudo cargar el Turno: ", error);
          });
      }
    })
    .catch(function(error) {
    console.log("Error getting document:", error);
    });
}

function tablaDiasEspeciales(){

  if(validarFormulario2()){

    let nombreCliente = document.getElementById("selectCliente2").value;
    let nombreObjetivo = document.getElementById("selectObjetivo2").value;
    let datePickerValue = $("#datetimepicker10").find("input").val();
    let sep = datePickerValue.indexOf("/");
    monthGlobalEsp = parseInt(datePickerValue.substr(0,sep));
    yearGlobalEsp = parseInt(datePickerValue.substr(sep+1,4));

    // if(visual == "mensual" && date!=""){

    let fechaInicial = new Date(yearGlobalEsp,(monthGlobalEsp-1),1);
    let fechaFinal = new Date(yearGlobalEsp,monthGlobalEsp,0);

    // } else if(visual == "dias25" && date!=""){
    //   primerDia = new Date(date.getFullYear(), date.getMonth()-1, 26);
    //   ultimoDia = new Date(date.getFullYear(), date.getMonth(), 25);
    // }

    idClienteGlobalEsp="";
    idObjetivoGlobalEsp="";

    db.collection("clientes").where("nombreCliente","==",nombreCliente)
      .get()
      .then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
            idClienteGlobalEsp=doc.id;

              db.collection("clientes").doc(idClienteGlobalEsp).collection("objetivos").where("nombreObjetivo","==",nombreObjetivo)
              .get()
              .then(function(querySnapshot) {
                  querySnapshot.forEach(function(doc) {
                    idObjetivoGlobalEsp=doc.id;
                    idSupervisorGlobalEsp = doc.data().idSupervisor;
                    let mes = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
                    let tituloDiasEspeciales = mes[monthGlobalEsp-1] +" "+ yearGlobalEsp;

                    db.collection("clientes").doc(idClienteGlobalEsp).collection("objetivos").doc(idObjetivoGlobalEsp).collection("temporales")
                    .where("documentData.fecha",">=",fechaInicial).where("documentData.fecha","<=",fechaFinal)
                    .get()
                    .then(function(querySnapshot) {
                        if (querySnapshot.empty) {
                            console.log("No se encontro ninguna fecha en este rango");
                            borrarFechasEspeciales();
                            //cargarDatosObjetivo(nombreCliente,nombreObjetivo,idSupervisorGlobalEsp);
                            $("#acordionDiasEspeciales").hide();
                            $("#sinDiasEspeciales").show();
                            $("#diasEspeciales").show();
                            //$("#datosObjetivo").show();
                        } else {
                          //Si hay fechas en el rango
                          borrarFechasEspeciales();
                          //cargarDatosObjetivo(nombreCliente,nombreObjetivo,idSupervisor);
                          $("#sinDiasEspeciales").hide();
                          $("#acordionDiasEspeciales").show();
                          $("#diasEspeciales").show();
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
                                cargarFechasEspeciales(idClienteGlobalEsp,idObjetivoGlobalEsp,idDia,fieldName,turno.nombrePuesto,turno.nombreTurno,turno.ingresoPuesto,turno.egresoPuesto,turno.horasTurno,turno.estado,i);
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
  // let date = new Date();
  // if(visual == "mensual" && date!=""){
  let fechaInicial = new Date(yearGlobalEsp,(monthGlobalEsp-1),1); // El primer dia del mes seleccionado
  let fechaFinal = new Date(yearGlobalEsp,monthGlobalEsp,0); // El ultimo dia del mes seleccionado

  db.collection("clientes").doc(idClienteGlobalEsp).collection("objetivos").doc(idObjetivoGlobalEsp).collection("temporales")
  .where("documentData.fecha",">=",fechaInicial).where("documentData.fecha","<=",fechaFinal)
  .get()
  .then(function(querySnapshot) {
      if (querySnapshot.empty) {
          console.log("No se encontro ninguna fecha en este rango");
          $("#sinDiasEspeciales").show();
      } else {
        //Si hay fechas en el rango
        borrarFechasEspeciales();
        $("#sinDiasEspeciales").hide();
        $("#acordionDiasEspeciales").show();
        $("#diasEspeciales").show();
        //$("#datosObjetivo").show();
        let i=1;
        querySnapshot.forEach(function(doc) {
          let fecha = doc.data().documentData.fecha.toDate();
          clonar(i,fecha);
          let docObject = doc.data();
          let idDia = doc.id;
          //let numDia = doc.data().documentData.numeroDia;
          for (var fieldName in docObject) {
            if (fieldName=="documentData"){
              // No procesar nada
            }else {
              let turno = docObject[fieldName];
              cargarFechasEspeciales(idClienteGlobalEsp,idObjetivoGlobalEsp,idDia,fieldName,turno.nombrePuesto,turno.nombreTurno,turno.ingresoPuesto,turno.egresoPuesto,turno.horasTurno,turno.estado,i);
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

function listadoClientesEsquema(){
  var listadoClientes = [];
  db.collection("clientes")
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
          listadoClientes.push(doc.data().nombreCliente);
      });
      desplegableClientesEsquema(listadoClientes);
    });
}

function desplegableClientesEsquema(listadoClientes){
  let selectClientes = document.getElementById('selectCliente');
  for(var i = 0; i < listadoClientes.length; i++){
    var option = listadoClientes[i];
    selectClientes.options.add( new Option(option) );
  }
}

function listadoObjetivosEsquema(){

  var listadoObjetivos = [];
  var nombreCliente = document.getElementById("selectCliente").value;

  db.collection("clientes").where("nombreCliente","==",nombreCliente)
    .get()
    .then(function(querySnapshot) {
      if(querySnapshot.empty){
        console.log("No se econtro el Cliente");
        desplegableObjetivosEsquema(listadoObjetivos);
      }else{
        querySnapshot.forEach(function(doc) {
          idCliente=doc.id;
            db.collection("clientes").doc(idCliente).collection("objetivos")
            .get()
            .then(function(querySnapshot) {
              querySnapshot.forEach(function(doc) {
                  listadoObjetivos.push(doc.data().nombreObjetivo);
                });
                desplegableObjetivosEsquema(listadoObjetivos);
            });
       })
      }

    });

}

function desplegableObjetivosEsquema(listadoObjetivos){
  var selectObjetivos = document.getElementById('selectObjetivo');
  while (selectObjetivos.length > 1) {
    selectObjetivos.remove(1);
  }
  for(var i = 0; i < listadoObjetivos.length; i++){
    let option = listadoObjetivos[i];
    selectObjetivos.options.add( new Option(option) );
  }
}

// -----------------------------------------------------------------
// END DIAS ESPECIALES SECTION
// -----------------------------------------------------------------

function cargarDTPPuestoModificado(){
  $('#datetimepickerHIMod, #datetimepickerHEMod').datetimepicker({
    format: 'HH:mm'
  });
  $("#datetimepickerHIMod").on("dp.change", function (e) {
      asignarTurnoMod(e.date);
      calcularHorasTurnoMod();
  });
  $("#datetimepickerHEMod").on("dp.change", function (e) {
      calcularHorasTurnoMod();
  });
}

function asignarTurnoMod(horaIngreso){
  let date = new Date();
  const tMRDesde = date.setHours(0,0,0,0); // Desde las 00:00
  const tMRHasta = date.setHours(5,59,59,999); // Hasta las 05:59
  const tMDesde = date.setHours(6,0,0,0); // Desde las 06:00
  const tMHasta = date.setHours(11,59,59,999); // Hasta las 11:59
  const tTDesde = date.setHours(12,0,0,0); // Desde las 12:00
  const tTHasta = date.setHours(18,59,59,999); // Hasta las 18:59
  const tNDesde = date.setHours(19,0,0,0); // Desde las 19:00
  const tNHasta = date.setHours(23,59,59,999); // Hasta las 23:59

  if(horaIngreso>=tMRDesde && horaIngreso<=tMRHasta){
    $("#nombreTurno").val("TMR - Turno Madrugada");
  } else if(horaIngreso>=tMDesde && horaIngreso<=tMHasta){
    $("#nombreTurno").val("TM - Turno Mañana");
  } else if(horaIngreso>=tTDesde && horaIngreso<=tTHasta){
    $("#nombreTurno").val("TT - Turno Tarde");
  } else if(horaIngreso>=tNDesde && horaIngreso<=tNHasta){
    $("#nombreTurno").val("TN - Turno Noche");
  }
}

function calcularHorasTurnoMod(){

  let horaIngreso = new Date($("#datetimepickerHIMod").data("DateTimePicker").date());
  let horaEgreso = new Date($("#datetimepickerHEMod").data("DateTimePicker").date());
  let resultado,hora,minutos="";

  let inputHoraIngreso = $("#datetimepickerHIMod").find("input").val();
  let inputHoraEgreso = $("#datetimepickerHEMod").find("input").val();

  if(inputHoraIngreso!="" && inputHoraEgreso!=""){
    if(horaIngreso<=horaEgreso){
      resultado = horaEgreso.getTime() - horaIngreso.getTime();
      hora = Math.trunc(resultado/1000/60/60);
      minutos = resultado/1000/60-(hora*60);
      if(hora<10){
        hora = "0"+hora;
      }
      if(minutos<10){
        minutos = "0"+minutos;
      }
      $("#horasTurno").val(hora+":"+minutos);
    } else if (horaIngreso>horaEgreso){
      horaEgreso = new Date(horaEgreso.getTime()+1000*60*60*24);
      resultado = horaEgreso.getTime() - horaIngreso.getTime();
      hora = Math.trunc(resultado/1000/60/60);
      minutos = resultado/1000/60-(hora*60);
      if(hora<10){
        hora = "0"+hora;
      }
      if(minutos<10){
        minutos = "0"+minutos;
      }
      $("#horasTurno").val(hora+":"+minutos);
    }
  } else {
    $("#horasTurno").val("");
  }
}

function calcularEstado(){
  let fechaActual = new Date(new Date().setHours(0,0,0,0));
  let fechaDesdeNuevo = new Date((new Date($("#datetimepicker7").data("DateTimePicker").date())).setHours(0,0,0,0));
  let fechaHastaNuevo = new Date((new Date($("#datetimepicker8").data("DateTimePicker").date())).setHours(0,0,0,0));
  let estado="";

  let inputFechaDesde = $("#datetimepicker7").find("input").val();
  let inputFechaHasta = $("#datetimepicker8").find("input").val();

  if(inputFechaDesde!="" && inputFechaHasta!=""){
    if (fechaActual>=fechaDesdeNuevo && fechaActual.getTime()<=fechaHastaNuevo.getTime()) {
      estado = "VIGENTE";
    } else if (fechaActual<fechaDesdeNuevo){
      estado = "PROYECTADO";
    } else if (fechaActual>fechaHastaNuevo){
      estado = "CADUCADO";
    }
    $('#estadoNuevo').val(estado);
  }
}

function calcularEstadoModFechas(idFechaDesde,idFechaHasta,idEstadoNuevo){
  let fechaActual = new Date(new Date().setHours(0,0,0,0));
  let fechaDesdeNuevo = new Date((new Date($(idFechaDesde).data("DateTimePicker").date())).setHours(0,0,0,0));
  let fechaHastaNuevo = new Date((new Date($(idFechaHasta).data("DateTimePicker").date())).setHours(0,0,0,0));
  let estado="";

  let inputFechaDesde = $(idFechaDesde).find("input").val();
  let inputFechaHasta = $(idFechaHasta).find("input").val();

  if(inputFechaDesde!="" && inputFechaHasta!=""){
    if (fechaActual>=fechaDesdeNuevo && fechaActual.getTime()<=fechaHastaNuevo.getTime()) {
      estado = "VIGENTE";
    } else if (fechaActual<fechaDesdeNuevo){
      estado = "PROYECTADO";
    } else if (fechaActual>fechaHastaNuevo){
      estado = "CADUCADO";
    }
    $(idEstadoNuevo).val(estado);
  }
}

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
      return -1; // Hora inicial es mayor a la final
    }
    else if (horaIniDate<horaFinDate){
      return 1;
    } else {
      return 0;
    }
}

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
    if (horas.length < 2) {
      horas = "0"+horas;
    }
    if (minutos.length < 2) {
      minutos = "0"+minutos;
    }
  return horas+":"+minutos;
}

// -----------------------------------------------------------------
// DATE PICKERS SECTION
// -----------------------------------------------------------------

function cargarTodosDatePicker(){
  cargarDateTimePicker();
  cargarDTPEsquemaNuevo();
  cargarDTPPuestoNuevo();
  cargarDTPPuestoModificado();
  cargarDTPModFechasEsquema();
  cargarDTPDiasEspeciales();
  cargarDTPModDiasEspeciales()

  validateFormCargarTurno();
  validateFormModificarTurno();
  validateFormEsquemaNuevo();
  validateFormModFechasEsquema();
  validateFormModDiasEspeciales();

  validateFormDiasEspeciales();
  validateFormModDiasEspeciales();

}

function cargarDatePicker(){
  $('.datepicker').datepicker({
  clearBtn: true,
  language: 'es',
  multidate: true,
  format: 'dd/mm/yyyy',
});
}

function cargarDateTimePicker(){
  $('#datetimepicker10').datetimepicker({
      defaultDate: new Date(),
      locale: 'es',
      viewMode: 'years',
      useCurrent: true,
      format: 'MM/YYYY',
  });
}

function cargarDTPEsquemaNuevo(){
  $('#datetimepicker7').datetimepicker({
      viewMode: 'years',
      format: 'DD/MM/YYYY',
      locale: 'es',
  });
  $('#datetimepicker8').datetimepicker({
      viewMode: 'years',
      format: 'DD/MM/YYYY',
      locale: 'es',
      useCurrent: false, //Important! See issue #1075
  });
  $("#datetimepicker7").on("dp.change", function (e) {
      $('#datetimepicker8').data("DateTimePicker").minDate(e.date);
      calcularEstado();
  });
  $("#datetimepicker8").on("dp.change", function (e) {
      $('#datetimepicker7').data("DateTimePicker").maxDate(e.date);
      calcularEstado();
  });
}

function cargarDTPModFechasEsquema(){
  $('#dtmModFechaEsquemaFD').datetimepicker({
      viewMode: 'years',
      format: 'DD/MM/YYYY',
      locale: 'es',
  });
  $('#dtmModFechaEsquemaFH').datetimepicker({
      viewMode: 'years',
      format: 'DD/MM/YYYY',
      locale: 'es',
      useCurrent: false, //Important! See issue #1075
  });
  $("#dtmModFechaEsquemaFD").on("dp.change", function (e) {
      $("#dtmModFechaEsquemaFH").data("DateTimePicker").minDate(e.date);
      calcularEstadoModFechas("#dtmModFechaEsquemaFD","#dtmModFechaEsquemaFH","#estadoNuevoModFecha");
  });
  $("#dtmModFechaEsquemaFH").on("dp.change", function (e) {
      $("#dtmModFechaEsquemaFD").data("DateTimePicker").maxDate(e.date);
      calcularEstadoModFechas("#dtmModFechaEsquemaFD","#dtmModFechaEsquemaFH","#estadoNuevoModFecha");
  });
}

function cargarDTPPuestoNuevo(){
  $('#datetimepickerHI, #datetimepickerHE').datetimepicker({
    format: 'HH:mm'
  });
  $("#datetimepickerHI").on("dp.change", function (e) {
      asignarTurno(e.date);
      calcularHorasTurno();
  });
  $("#datetimepickerHE").on("dp.change", function (e) {
      calcularHorasTurno();
  });
}

function cargarDTPDiasEspeciales(){
  $('#datetimepickerHIEspecial, #datetimepickerHEEspecial').datetimepicker({
    format: 'HH:mm'
  });
  $("#datetimepickerHIEspecial").on("dp.change", function (e) {
      asignarTurnoEspecial(e.date);
      calcularHorasTurnoEspecial();
  });
  $("#datetimepickerHEEspecial").on("dp.change", function (e) {
      calcularHorasTurnoEspecial();
  });
}

function cargarDTPModDiasEspeciales(){
  $('#datetimepickerHIModEsp, #datetimepickerHEModEsp').datetimepicker({
    format: 'HH:mm'
  });
  $("#datetimepickerHIModEsp").on("dp.change", function (e) {
      asignarTurnoModEsp(e.date);
      calcularHorasTurnoModEsp();
  });
  $("#datetimepickerHEModEsp").on("dp.change", function (e) {
      calcularHorasTurnoModEsp();
  });
}

// Auxiliares Date Pickers

function asignarTurno(horaIngreso){
  let date = new Date();
  const tMRDesde = date.setHours(0,0,0,0); // Desde las 00:00
  const tMRHasta = date.setHours(5,59,59,999); // Hasta las 05:59
  const tMDesde = date.setHours(6,0,0,0); // Desde las 06:00
  const tMHasta = date.setHours(11,59,59,999); // Hasta las 11:59
  const tTDesde = date.setHours(12,0,0,0); // Desde las 12:00
  const tTHasta = date.setHours(18,59,59,999); // Hasta las 18:59
  const tNDesde = date.setHours(19,0,0,0); // Desde las 19:00
  const tNHasta = date.setHours(23,59,59,999); // Hasta las 23:59

  if(horaIngreso>=tMRDesde && horaIngreso<=tMRHasta){
    $("#nombreTurno1").val("TMR - Turno Madrugada");
  } else if(horaIngreso>=tMDesde && horaIngreso<=tMHasta){
    $("#nombreTurno1").val("TM - Turno Mañana");
  } else if(horaIngreso>=tTDesde && horaIngreso<=tTHasta){
    $("#nombreTurno1").val("TT - Turno Tarde");
  } else if(horaIngreso>=tNDesde && horaIngreso<=tNHasta){
    $("#nombreTurno1").val("TN - Turno Noche");
  }
}

function asignarTurnoEspecial(horaIngreso){
  let date = new Date();
  const tMRDesde = date.setHours(0,0,0,0); // Desde las 00:00
  const tMRHasta = date.setHours(5,59,59,999); // Hasta las 05:59
  const tMDesde = date.setHours(6,0,0,0); // Desde las 06:00
  const tMHasta = date.setHours(11,59,59,999); // Hasta las 11:59
  const tTDesde = date.setHours(12,0,0,0); // Desde las 12:00
  const tTHasta = date.setHours(18,59,59,999); // Hasta las 18:59
  const tNDesde = date.setHours(19,0,0,0); // Desde las 19:00
  const tNHasta = date.setHours(23,59,59,999); // Hasta las 23:59

  if(horaIngreso>=tMRDesde && horaIngreso<=tMRHasta){
    $("#nombreTurno2").val("TMR - Turno Madrugada");
  } else if(horaIngreso>=tMDesde && horaIngreso<=tMHasta){
    $("#nombreTurno2").val("TM - Turno Mañana");
  } else if(horaIngreso>=tTDesde && horaIngreso<=tTHasta){
    $("#nombreTurno2").val("TT - Turno Tarde");
  } else if(horaIngreso>=tNDesde && horaIngreso<=tNHasta){
    $("#nombreTurno2").val("TN - Turno Noche");
  }
}

function asignarTurnoModEsp(horaIngreso){
  let date = new Date();
  const tMRDesde = date.setHours(0,0,0,0); // Desde las 00:00
  const tMRHasta = date.setHours(5,59,59,999); // Hasta las 05:59
  const tMDesde = date.setHours(6,0,0,0); // Desde las 06:00
  const tMHasta = date.setHours(11,59,59,999); // Hasta las 11:59
  const tTDesde = date.setHours(12,0,0,0); // Desde las 12:00
  const tTHasta = date.setHours(18,59,59,999); // Hasta las 18:59
  const tNDesde = date.setHours(19,0,0,0); // Desde las 19:00
  const tNHasta = date.setHours(23,59,59,999); // Hasta las 23:59

  if(horaIngreso>=tMRDesde && horaIngreso<=tMRHasta){
    $("#nombreTurno3").val("TMR - Turno Madrugada");
  } else if(horaIngreso>=tMDesde && horaIngreso<=tMHasta){
    $("#nombreTurno3").val("TM - Turno Mañana");
  } else if(horaIngreso>=tTDesde && horaIngreso<=tTHasta){
    $("#nombreTurno3").val("TT - Turno Tarde");
  } else if(horaIngreso>=tNDesde && horaIngreso<=tNHasta){
    $("#nombreTurno3").val("TN - Turno Noche");
  }
}

function calcularHorasTurno(){

  let horaIngreso = new Date($("#datetimepickerHI").data("DateTimePicker").date());
  let horaEgreso = new Date($("#datetimepickerHE").data("DateTimePicker").date());
  let resultado,hora,minutos="";

  let inputHoraIngreso = $("#datetimepickerHI").find("input").val();
  let inputHoraEgreso = $("#datetimepickerHE").find("input").val();

  if(inputHoraIngreso!="" && inputHoraEgreso!=""){
    if(horaIngreso<=horaEgreso){
      resultado = horaEgreso.getTime() - horaIngreso.getTime();
      hora = Math.trunc(resultado/1000/60/60);
      minutos = resultado/1000/60-(hora*60);
      if(hora<10){
        hora = "0"+hora;
      }
      if(minutos<10){
        minutos = "0"+minutos;
      }
      $("#horasTurno1").val(hora+":"+minutos);
    } else if (horaIngreso>horaEgreso){
      horaEgreso = new Date(horaEgreso.getTime()+1000*60*60*24);
      resultado = horaEgreso.getTime() - horaIngreso.getTime();
      hora = Math.trunc(resultado/1000/60/60);
      minutos = resultado/1000/60-(hora*60);
      if(hora<10){
        hora = "0"+hora;
      }
      if(minutos<10){
        minutos = "0"+minutos;
      }
      $("#horasTurno1").val(hora+":"+minutos);
    }
  } else {
    $("#horasTurno1").val("");
  }
}

function calcularHorasTurnoEspecial(){

  let horaIngreso = new Date($("#datetimepickerHIEspecial").data("DateTimePicker").date());
  let horaEgreso = new Date($("#datetimepickerHEEspecial").data("DateTimePicker").date());
  let resultado,hora,minutos="";

  let inputHoraIngreso = $("#datetimepickerHIEspecial").find("input").val();
  let inputHoraEgreso = $("#datetimepickerHEEspecial").find("input").val();

  if(inputHoraIngreso!="" && inputHoraEgreso!=""){
    if(horaIngreso<=horaEgreso){
      resultado = horaEgreso.getTime() - horaIngreso.getTime();
      hora = Math.trunc(resultado/1000/60/60);
      minutos = resultado/1000/60-(hora*60);
      if(hora<10){
        hora = "0"+hora;
      }
      if(minutos<10){
        minutos = "0"+minutos;
      }
      $("#horasTurno2").val(hora+":"+minutos);
    } else if (horaIngreso>horaEgreso){
      horaEgreso = new Date(horaEgreso.getTime()+1000*60*60*24);
      resultado = horaEgreso.getTime() - horaIngreso.getTime();
      hora = Math.trunc(resultado/1000/60/60);
      minutos = resultado/1000/60-(hora*60);
      if(hora<10){
        hora = "0"+hora;
      }
      if(minutos<10){
        minutos = "0"+minutos;
      }
      $("#horasTurno2").val(hora+":"+minutos);
    }
  } else {
    $("#horasTurno2").val("");
  }
}

function calcularHorasTurnoModEsp(){

  let horaIngreso = new Date($("#datetimepickerHIModEsp").data("DateTimePicker").date());
  let horaEgreso = new Date($("#datetimepickerHEModEsp").data("DateTimePicker").date());
  let resultado,hora,minutos="";

  let inputHoraIngreso = $("#datetimepickerHIModEsp").find("input").val();
  let inputHoraEgreso = $("#datetimepickerHEModEsp").find("input").val();

  if(inputHoraIngreso!="" && inputHoraEgreso!=""){
    if(horaIngreso<=horaEgreso){
      resultado = horaEgreso.getTime() - horaIngreso.getTime();
      hora = Math.trunc(resultado/1000/60/60);
      minutos = resultado/1000/60-(hora*60);
      if(hora<10){
        hora = "0"+hora;
      }
      if(minutos<10){
        minutos = "0"+minutos;
      }
      $("#horasTurno3").val(hora+":"+minutos);
    } else if (horaIngreso>horaEgreso){
      horaEgreso = new Date(horaEgreso.getTime()+1000*60*60*24);
      resultado = horaEgreso.getTime() - horaIngreso.getTime();
      hora = Math.trunc(resultado/1000/60/60);
      minutos = resultado/1000/60-(hora*60);
      if(hora<10){
        hora = "0"+hora;
      }
      if(minutos<10){
        minutos = "0"+minutos;
      }
      $("#horasTurno3").val(hora+":"+minutos);
    }
  } else {
    $("#horasTurno3").val("");
  }
}

function destroyDatePicker(){
  $('.datepicker').datepicker('destroy');
  $('#datepicker').val('');
}

// -----------------------------------------------------------------
// END DATE PICKERS SECTION
// -----------------------------------------------------------------

// -----------------------------------------------------------------
// VALIDATION AND DISABLE VALIDATION SECTION
// -----------------------------------------------------------------

function validateFormEsquemaNuevo(){

  $("form[name='formEsquemaNuevo']").validate({
    rules: {
      fechaDesdeNuevoEsquema: "required",
      fechaHastaNuevoEsquema: "required",
    },
    messages: {
      fechaDesdeNuevoEsquema: "Por favor ingrese una fecha valida",
      fechaHastaNuevoEsquema: "Por favor ingrese una fecha valida",
    },
    highlight: function(element) {
        jQuery(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
        jQuery(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'label label-danger',
    errorPlacement: function(error, element) {
        if(element.parent('.input-group').length) {
            error.insertAfter(element.parent());
        } else {
          // This is the default behavior
            error.insertAfter(element);
        }
    },
    // Make sure the form is submitted to the destination defined
    // in the "action" attribute of the form when valid
    submitHandler: function(form) {
      cargarEsquemaServer();
    }
  });
}

function validateFormModFechasEsquema(){

  $("form[name='formModFechasEsquema']").validate({
    rules: {
      fechaDesdeModEsquema: "required",
      fechaHastaModEsquema: "required",
    },
    messages: {
      fechaDesdeModEsquema: "Por favor ingrese una fecha valida",
      fechaHastaModEsquema: "Por favor ingrese una fecha valida",
    },
    highlight: function(element) {
        jQuery(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
        jQuery(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'label label-danger',
    errorPlacement: function(error, element) {
        if(element.parent('.input-group').length) {
            error.insertAfter(element.parent());
        } else {
          // This is the default behavior
            error.insertAfter(element);
        }
    },
    // Make sure the form is submitted to the destination defined
    // in the "action" attribute of the form when valid
    submitHandler: function(form) {
      cargarNuevasFechasEsquema();
    }
  });
}

function validateFormCargarTurno(){

  $("form[name='formCargarPuesto']").validate({
    rules: {
      nombrePuesto1: "required",
      horaIngreso1: "required",
      horaEgreso1: "required",
      diasSeleccionados: "required",
    },
    messages: {
      nombrePuesto1: "Por favor ingrese un Nombre del Puesto",
      horaIngreso1: "Por favor ingrese una Hora de Ingreso Valida",
      horaEgreso1: "Por favor ingrese una Hora de Egreso Valida",
      diasSeleccionados : "Por favor indique en que dias cargar el turno",
    },
    highlight: function(element) {
        jQuery(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
        jQuery(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'label label-danger',
    errorPlacement: function(error, element) {
        if(element.parent('.input-group').length) {
            error.insertAfter(element.parent());
        } else if ( element.is(":checkbox") ){
          error.appendTo( element.parents('.requestTypeGroup') );
        } else {
          // This is the default behavior
            error.insertAfter(element);
        }
    },
    // Make sure the form is submitted to the destination defined
    // in the "action" attribute of the form when valid
    submitHandler: function(form) {
      //form.submit();
      //alert("Submitted!");
      cargarPuestosEsquema();
    }
  });

}

function validateFormModificarTurno(){

  $("form[name='formModificarTurno']").validate({
    rules: {
      nombrePuesto: "required",
      horaIngreso: "required",
      horaEgreso: "required",
    },
    messages: {
      nombrePuesto: "Por favor ingrese un Nombre del Puesto",
      horaIngreso: "Por favor ingrese una Hora de Ingreso Valida",
      horaEgreso: "Por favor ingrese una Hora de Egreso Valida",
    },
    highlight: function(element) {
        jQuery(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
        jQuery(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'label label-danger',
    errorPlacement: function(error, element) {
        if(element.parent('.input-group').length) {
            error.insertAfter(element.parent());
        } else {
          // This is the default behavior
            error.insertAfter(element);
        }
    },
    // Make sure the form is submitted to the destination defined
    // in the "action" attribute of the form when valid
    submitHandler: function(form) {
      //form.submit();
      cambiarPuestosSetting();
    }
  });

}

function validateFormDiasEspeciales(){

  $("form[name='formDiasEspeciales']").validate({
    rules: {
      nombrePuesto2: "required",
      horaIngresoEspecial: "required",
      horaEgresoEspecial: "required",
      datepicker: "required", //Dias Seleccionados
    },
    messages: {
      nombrePuesto2: "Por favor ingrese un Nombre del Puesto",
      horaIngresoEspecial: "Por favor ingrese una Hora de Ingreso Valida",
      horaEgresoEspecial: "Por favor ingrese una Hora de Egreso Valida",
      datepicker : "Por favor indique en que dias cargar el turno",
    },
    highlight: function(element) {
        jQuery(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
        jQuery(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'label label-danger',
    errorPlacement: function(error, element) {
        if(element.parent('.input-group').length) {
            error.insertAfter(element.parent());
        } else {
          // This is the default behavior
            error.insertAfter(element);
        }
    },
    // Make sure the form is submitted to the destination defined
    // in the "action" attribute of the form when valid
    submitHandler: function(form) {
      cargarPuestoTemporal();
    }
  });

}

function validateFormModDiasEspeciales(){

  $("form[name='formModDiasEspeciales']").validate({
    rules: {
      nombrePuesto3: "required",
      horaIngresoModEsp: "required",
      horaEgresoModEsp: "required",
    },
    messages: {
      nombrePuesto3: "Por favor ingrese un Nombre del Puesto",
      horaIngresoModEsp: "Por favor ingrese una Hora de Ingreso Valida",
      horaEgresoModEsp: "Por favor ingrese una Hora de Egreso Valida",
    },
    highlight: function(element) {
        jQuery(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
        jQuery(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'label label-danger',
    errorPlacement: function(error, element) {
        if(element.parent('.input-group').length) {
            error.insertAfter(element.parent());
        } else {
          // This is the default behavior
            error.insertAfter(element);
        }
    },
    // Make sure the form is submitted to the destination defined
    // in the "action" attribute of the form when valid
    submitHandler: function(form) {
      modificarPuestoTemporal();
    }
  });

}

function disableValidateFormModificarTurno(){
  $("form[name='formModificarTurno']").validate().resetForm();
}

function disableValidateFormCargarTurno(){
  $("form[name='formCargarPuesto']").validate().resetForm();
}

function disableValidateFormEsquemaNuevo(){
  $("form[name='formEsquemaNuevo']").validate().resetForm();
}

function disableValidateFormModFechasEsquema(){
  $("form[name='formModFechasEsquema']").validate().resetForm();
}

function disableValidateFormDiasEspeciales(){
  $("form[name='formDiasEspeciales']").validate().resetForm();
  $('.datepicker').datepicker('destroy');
  $('#datepicker').val('');
}

function disableValidateFormModDiasEspeciales(){
  $("form[name='formModDiasEspeciales']").validate().resetForm();
}

// -----------------------------------------------------------------
// END VALIDATION AND DISABLE VALIDATION SECTION
// -----------------------------------------------------------------
