
let objetivoObject;

function listadoSupervisores(){

  let listadoSuper = [];

  db.collection("users")
    .get()
    .then(function(querySnapshot) {
      if(querySnapshot.empty){
        desplegableSupervisoresBranch(listadoSuper);
      } else {
        querySnapshot.forEach(function(doc) {
          let item = {
            nb : doc.data().nombre,
            id : doc.data().idPersonal.toString(),
          };
          listadoSuper.push(item);
        });
        desplegableSupervisoresBranch(listadoSuper);
      }
    });
}

function desplegableSupervisoresBranch(listadoSuper){
  let datalist = document.getElementById("dataListSuper");
  $("#dataListSuper").empty();
  listadoSuper.forEach(function(item){
     let option = document.createElement("option");
     option.value = mayus(item.nb);
     option.setAttribute("data-id",item.id);
     datalist.appendChild(option);
  });
}

function mostrarObjetivoBranch(){

  allFieldsDisableBranch();

  $("#tab-objetivo").hide(200);
  $("#btnGuardarObjetivo").prop("disabled", true);
  $("#btnCancelarObjetivo").prop("disabled", true);
  $("#btnModificarObjetivo").prop("disabled", false);

  let nombreCliente = $("#selectCliente").val();
  let nombreObjetivo = $("#selectObjetivo").val();

  db.collection("clientes").where("nombreCliente","==",nombreCliente)
  .get()
  .then(function(querySnapshot) {
    if (querySnapshot.empty){
      mensajeErrorCampoVacio("Cliente no seleccionado")
    } else {
      querySnapshot.forEach(function(doc){
        let idCliente = doc.id;
        let nombreCliente = doc.data().nombreCliente;

        db.collection("clientes").doc(idCliente).collection("objetivos").where("nombreObjetivo","==",nombreObjetivo)
        .get()
        .then(function(querySnapshot) {
          if (querySnapshot.empty){
            mensajeErrorCampoVacio("Objetivo no seleccionado o inexistente")
          } else {
            querySnapshot.forEach(function(doc){
              objetivoObject = doc.data();
              objetivoObject.id = doc.id;
              cargarDatosBasicosObjetivo(nombreCliente,objetivoObject)
            });
          }
        }).
        catch(function(error){
          console.log("Error al buscar Objetivo",error);
        });

      });
    }
  }).
  catch(function(error){
    console.log("Error al buscar Cliente",error);
  });
}

function modificarDatosObjetivo(){

  allFieldsEnableBranch();

  $("#btnGuardarObjetivo").prop("disabled", false);
  $("#btnCancelarObjetivo").prop("disabled", false);
  $("#btnModificarObjetivo").prop("disabled", true);

}

function cargarDatosBasicosObjetivo(nombreCliente,doc){

  inicializarFormularioObjetivo();

  let calle = "";
  let nroPuerta = "";
  let localidad = "";
  let departamento = "";
  let provincia = "";
  let pais = "";

  $("#nombreCliente").val(asignarValores(nombreCliente));
  $("#nombreObjetivo").val(asignarValores(doc.nombreObjetivo));
  devolverNombreUser(doc.idSupervisor);
  $("#tipoObjetivo").val(asignarValores(doc.tipoObjetivo));

  if(doc.domicilio!=undefined && doc.domicilio!=""){

    calle = asignarValores(doc.domicilio.calle);
    nroPuerta = asignarValores(doc.domicilio.nroPuerta);
    localidad = asignarValores(doc.domicilio.localidad);
    departamento = asignarValores(doc.domicilio.departamento);
    provincia = asignarValores(doc.domicilio.provincia);
    pais = asignarValores(doc.domicilio.pais);

    $("#pais").val(pais);
    $("#provincia").val(provincia);
    $("#departamento").val(departamento);
    $("#localidad").val(localidad);
    $("#calle").val(calle);
    $("#nroPuerta").val(nroPuerta);
    $("#piso").val(asignarValores(doc.domicilio.piso));
    $("#depto").val(asignarValores(doc.domicilio.depto));
    $("#cp").val(asignarValores(doc.domicilio.cp));

  }

  if(doc.vigente!=undefined && doc.vigente==true){
    cambiarEstadoActivo();
  }else{
    cambiarEstadoInactivo();
  }

  let mostrarUbicacion = asignarValores(doc.mostrarUbicacion);

  let lat = "";
  let lon = "";

  if(doc.coordenadas!=undefined && doc.coordenadas!=""){
    lat = asignarValores(doc.coordenadas.lat);
    lon = asignarValores(doc.coordenadas.lon);
  }

  $("#lat").val(lat);
  $("#lon").val(lon);

  if(mostrarUbicacion=="COORDENADAS"){
    $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+lat+","+lon+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
    $("#checkCoordenadas").prop("checked", true);
  } else {
    $("#checkDomicilio").prop("checked", true);
    if(provincia=="CIUDAD AUTÓNOMA DE BUENOS AIRES"){
      provincia="CABA";
      departamento="";
    }
    $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+calle+nroPuerta+localidad+departamento+provincia+pais+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
  }

  if(doc.imei!=undefined && doc.imei!=""){
    $("#imei").val(doc.imei);
    $("#imei").prop("readonly",true);
    $("#btnHabCamImei").show();
    $("#confirmarImei").hide();
  } else {
    $("#imei").val("");
    $("#imei").prop("readonly",true);
    $("#btnHabCamImei").show();
    $("#confirmarImei").hide();
  }

  cargarDataListDomicilio();

  $("#tab-objetivo").show(200);


}

function guardarCambiosObjetivo(){

  if (verificarCamposPpalesBranch()){

    allFieldsDisableBranch();

    $("#btnGuardarObjetivo").prop("disabled", true);
    $("#btnCancelarObjetivo").prop("disabled", true);
    $("#btnModificarObjetivo").prop("disabled", false);

    let nombreObjetivo = $("#nombreObjetivo").val().toUpperCase();
    let tipoObjetivo = $("#tipoObjetivo").val().toUpperCase();
    let idSupervisor = $("#dataListSuper").find("option[value='"+$("#supervisor").val()+"']").data("id");

    let domicilio = {
      pais : $("#pais").val().toUpperCase(),
      provincia : $("#provincia").val().toUpperCase(),
      departamento : $("#departamento").val().toUpperCase(),
      localidad : $("#localidad").val().toUpperCase(),
      calle : $("#calle").val().toUpperCase(),
      nroPuerta : $("#nroPuerta").val().toUpperCase(),
      piso : $("#piso").val().toUpperCase(),
      depto : $("#depto").val().toUpperCase(),
      cp : $("#cp").val().toUpperCase(),
    }

    let coordenadas = {
        lat : $("#lat").val(),
        lon : $("#lon").val(),
      }

    let mostrarUbicacion="";

    if($("#checkCoordenadas").prop('checked')){
      mostrarUbicacion="COORDENADAS";
    } else {
      mostrarUbicacion="DOMICILIO";
    }

    let estado = "";

    if($("#estadoActivo").prop("enable")==true){
      estado = true;
    } else {
      estado = false;
    }

    if(objetivoObject!=undefined && objetivoObject!=""){

      db.collection("clientes").doc(idClienteGlobal).collection("objetivos").doc(objetivoObject.id)
      .update({ nombreObjetivo : nombreObjetivo,
                idSupervisor : idSupervisor.toString(),
                tipoObjetivo : tipoObjetivo,
                vigente: estado,
                domicilio : domicilio,
                coordenadas : coordenadas,
                mostrarUbicacion : mostrarUbicacion,
      })
      .then(function(){

        let docId = objetivoObject.id;

        objetivoObject = {
          nombreObjetivo : nombreObjetivo,
          idSupervisor : idSupervisor.toString(),
          tipoObjetivo : tipoObjetivo,
          vigente : estado,
          domicilio : domicilio,
          coordenadas : coordenadas,
          mostrarUbicacion : mostrarUbicacion,
          id: docId,
        }

        mensajeOk();
      })
      .catch(function(error){
        console.log("Error al actualizar el Objetivo",error);
      });

    } else {
      // Debe recorrer todos los objetivo para verificar que no haya alguno ya cargado con los datos principales
      // Datos principales: nombreObjetivo
      db.collection("clientes").doc(idClienteGlobal).collection("objetivos")
      .get()
      .then(function(querySnapshot){

        let encontrado=false;

        querySnapshot.forEach(function(doc){

          let docNombreObjetivo = (doc.data().nombreObjetivo).toUpperCase();
          // let docId = doc.id;

          if( docNombreObjetivo==nombreObjetivo.toUpperCase() && nombreObjetivo!=""){
            encontrado=true;
          }
        });

        if(!encontrado){
          objetivoObject = {
            nombreObjetivo : nombreObjetivo,
            idSupervisor : idSupervisor.toString(),
            tipoObjetivo : tipoObjetivo,
            vigente : estado,
            domicilio : domicilio,
            coordenadas : coordenadas,
            mostrarUbicacion : mostrarUbicacion,
          }
          db.collection("clientes").doc(idClienteGlobal).collection("objetivos")
          .add(objetivoObject)
          .then(function(doc){
            objetivoObject.id = doc.id;
            mensajeOk();
            listadoObjetivosBranch();
          })
          .catch(function(error){
            console.log("Error al intentar cargar un objetivo nuevo",error);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Nombre del objetivo ya cargado',
            text: 'Por favor ingrese otro nombre',
          })
        }
      })
      .catch(function(error){
        console.log("Error al verificar los Objetivos cargados",error);
      });

    }
  }

}

function verificarCamposPpalesBranch(){
  if ( $("#nombreObjetivo").val()=="" ){
    mensajeErrorCampoVacio("Nombre del objetivo vacio");
    return false;
  } else {
    return true;
  }
}

function allFieldsEnableBranch(){
  $("#nombreObjetivo").prop("readonly",false);
  $("#supervisor").prop("readonly",false);
  $("#tipoObjetivo").prop("readonly",false);
  $("#pais").prop("readonly",false);
  $("#provincia").prop("readonly",false);
  $("#departamento").prop("readonly",false);
  $("#localidad").prop("readonly",false);
  $("#calle").prop("readonly",false);
  $("#nroPuerta").prop("readonly",false);
  $("#piso").prop("readonly",false);
  $("#depto").prop("readonly",false);
  $("#cp").prop("readonly",false);
  $("#lat").prop("readonly",false);
  $("#lon").prop("readonly",false);
  $("#estadoActivo").attr("disabled",false);
  $("#estadoInactivo").attr("disabled",false);
  $("#checkCoordenadas").prop("disabled", false);
  $("#checkDomicilio").prop("disabled", false);

}

function allFieldsDisableBranch(){
  $("#nombreObjetivo").prop("readonly",true);
  $("#supervisor").prop("readonly",true);
  $("#tipoObjetivo").prop("readonly",true);
  $("#pais").prop("readonly",true);
  $("#provincia").prop("readonly",true);
  $("#departamento").prop("readonly",true);
  $("#localidad").prop("readonly",true);
  $("#calle").prop("readonly",true);
  $("#nroPuerta").prop("readonly",true);
  $("#piso").prop("readonly",true);
  $("#depto").prop("readonly",true);
  $("#cp").prop("readonly",true);
  $("#lat").prop("readonly",true);
  $("#lon").prop("readonly",true);
  $("#estadoActivo").attr("disabled",true);
  $("#estadoInactivo").attr("disabled",true);
  $("#checkCoordenadas").prop("disabled", true);
  $("#checkDomicilio").prop("disabled", true);
}

function inicializarFormularioObjetivo(){

  $("#nombreObjetivo").val("");
  $("#supervisor").val("");
  $("#tipoObjetivo").val("");
  $("#pais").val("");
  $("#provincia").val("");
  $("#departamento").val("");
  $("#localidad").val("");
  $("#calle").val("");
  $("#nroPuerta").val("");
  $("#piso").val("");
  $("#depto").val("");
  $("#cp").val("");
  $("#lat").val("");
  $("#lon").val("");
  cambiarEstadoActivo();
  $("#checkDomicilio").prop("checked", true);
  $("#checkCoordenadas").prop("checked", false);
  $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&ie=UTF8&t=&z=14&iwloc=B&output=embed");

}

function agregarObjetivoBranch(){

  if( $("#selectCliente").val()=="" ){
    $("#selectObjetivo").val("");
    Swal.fire({
      icon: 'error',
      title: 'Cliente vacio',
      text: 'Por favor seleccion un cliente',
    })
  } else {
    $("#tab-objetivo").hide(200);
    $("#selectObjetivo").val("");
    $("#nombreCliente").val($("#selectCliente").val());
    $("#btnGuardarObjetivo").prop("disabled", false);
    $("#btnCancelarObjetivo").prop("disabled", false);
    $("#btnModificarObjetivo").prop("disabled", true);
    inicializarFormularioObjetivo();
    allFieldsEnableBranch();
    objetivoObject="";
    cargarDataListDomicilio();
    $("#tab-objetivo").show(200);
  }
}

function cancelarCambiosObjetivo(){
    $("#tab-objetivo").hide(300);
}

function devolverNombreUser(idPersonal){

  if(idPersonal!=undefined && idPersonal!=""){
    db.collection("users").where("idPersonal","==",idPersonal)
    .get()
    .then(function(querySnapshot) {
        if (querySnapshot.empty) {
          console.log("No such document!");
          $("#supervisor").val("");
        } else {
          querySnapshot.forEach(function(doc) {
          $("#supervisor").val(doc.data().nombre);
          });
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
        $("#supervisor").val("");
    });
  } else {
    $("#supervisor").val("");
  }

}

function habilitarCambioImei(){
  $("#imei").prop("readonly",false);
  $("#btnHabCamImei").hide();
  $("#confirmarImei").show(300);
}

function listadoImei(){
  let listadoImei = [];
  db.collection("devices").orderBy("imei")
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        listadoImei.push(doc.data().imei);
      });
      desplegableImei(listadoImei);
    });
}

function desplegableImei(listadoImei){

  var datalist = document.getElementById("dataListImei");

  $("#dataListImei").empty();

  listadoImei.forEach(function(item){
     var option = document.createElement("option");
     option.value = item;
     datalist.appendChild(option);
  });
}

function inicializarFuncionesBranch(){
  listadoClientesClient("dataListClient","TODOS",false);
  checkCoordenadas();
  listadoSupervisores();
  enforcingValueDataList();
}
