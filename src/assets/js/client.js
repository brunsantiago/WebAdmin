
//Carga Inicial

let clienteObject;

function formatoInputs(){

  new Cleave('.input-cuit', {
      delimiter: '-',
      blocks: [2, 8, 1],
      uppercase: true,
      });
}

// Fin Carga Inicial

// Funciones Tab Datos Basicos

function mostrarCliente(){

  allFieldsDisable();

  $("#tab-cliente").hide(200);
  $("#btnGuardarCliente").prop("disabled", true);
  $("#btnCancelarCliente").prop("disabled", true);
  $("#btnModificarCliente").prop("disabled", false);

  let nombreCliente = $("#selectCliente").val();

  db.collection("clientes").where("nombreCliente","==",nombreCliente)
  .get()
  .then(function(querySnapshot) {
    if (querySnapshot.empty){
      mensajeErrorCampoVacio("Cliente no seleccionado")
    } else {
      querySnapshot.forEach(function(doc){
        clienteObject = doc.data();
        clienteObject.id = doc.id;
        cargarDatosBasicosCliente(clienteObject)
      });
    }
  }).
  catch(function(error){
    console.log("Error al buscar Cliente",error);
  });

}

function agregarCliente(){

  $("#tab-cliente").hide(200);
  $("#btnGuardarCliente").prop("disabled", false);
  $("#btnCancelarCliente").prop("disabled", false);
  $("#btnModificarCliente").prop("disabled", true);
  inicializarFormularioCliente();
  allFieldsEnable();
  clienteObject="";
  cargarDataListDomicilio();
  $("#tab-cliente").show(200);

}

function cargarDatosBasicosCliente(doc){

  inicializarFormularioCliente();

  let calle = "";
  let nroPuerta = "";
  let localidad = "";
  let departamento = "";
  let provincia = "";
  let pais = "";

  $("#nombreCliente").val(asignarValores(doc.nombreCliente));
  $("#cuit").val(asignarValores(doc.cuit));
  $("#razonSocial").val(asignarValores(doc.razonSocial));

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

  cargarDataListDomicilio();

  $("#tab-cliente").show(200);

}

function modificarDatosCliente(){

  allFieldsEnable();

  $("#btnGuardarCliente").prop("disabled", false);
  $("#btnCancelarCliente").prop("disabled", false);
  $("#btnModificarCliente").prop("disabled", true);

}

function allFieldsEnable(){
  $("#nombreCliente").prop("readonly",false);
  $("#razonSocial").prop("readonly",false);
  $("#cuit").prop("readonly",false);
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

function allFieldsDisable(){
  $("#nombreCliente").prop("readonly",true);
  $("#razonSocial").prop("readonly",true);
  $("#cuit").prop("readonly",true);
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

function verificarCamposPpales(){

  if ( $("#nombreCliente").val()=="" ){
    mensajeErrorCampoVacio("Nombre del cliente vacio");
    return false;
  } else if ( $("#razonSocial").val()=="" ){
    mensajeErrorCampoVacio("Razon social vacia");
    return false;
  } else if ( $("#cuit").val()=="" ){
    mensajeErrorCampoVacio("CUIT vacio");
    return false;
  } else {
    return true;
  }

}

function guardarCambiosCliente(){

  if (verificarCamposPpales()){

    allFieldsDisable();

    $("#btnGuardarCliente").prop("disabled", true);
    $("#btnCancelarCliente").prop("disabled", true);
    $("#btnModificarCliente").prop("disabled", false);

    let nombreCliente = $("#nombreCliente").val().toUpperCase();
    let razonSocial = $("#razonSocial").val().toUpperCase();
    let cuit = $("#cuit").val().toUpperCase();
    let estado = "";

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
      mostrarUbicacion="coordenadas";
    } else {
      mostrarUbicacion="domicilio";
    }

    if($("#estadoActivo").prop("enable")==true){
      estado = true;
    } else {
      estado = false;
    }

    if(clienteObject!=undefined && clienteObject!=""){

      db.collection("clientes").doc(clienteObject.id)
      .update({ nombreCliente : nombreCliente,
                razonSocial : razonSocial,
                cuit : cuit,
                vigente: estado,
                domicilio : domicilio,
                coordenadas : coordenadas,
                mostrarUbicacion : mostrarUbicacion,
      })
      .then(function(){

        let docId = clienteObject.id;

        clienteObject = {
          nombreCliente : nombreCliente,
          razonSocial : razonSocial,
          cuit : cuit,
          vigente : estado,
          domicilio : domicilio,
          coordenadas : coordenadas,
          mostrarUbicacion : mostrarUbicacion,
          id: docId,
        }

        mensajeOk();
      })
      .catch(function(error){
        console.log("Error al actualizar el Cliente",error);
      });

    } else {
      // Debe recorrer todos los clientes para verificar que no haya alguno ya cargado con los datos principales
      // Datos principales: nombreCliente - razon Social - cuit
      db.collection("clientes")
      .get()
      .then(function(querySnapshot){
        let listaClientes = [];
        querySnapshot.forEach(function(doc){

          let docNombreCliente = (doc.data().nombreCliente).toUpperCase();
          let docRazonSocial = (doc.data().razonSocial).toUpperCase();
          let docCuit = (doc.data().cuit).toUpperCase();
          let docId = doc.id;

          if(docNombreCliente.includes(nombreCliente.toUpperCase()) && nombreCliente!=""){
            listaClientes.push({nc:docNombreCliente,rz:docRazonSocial,c:docCuit,id:docId})
          } else if (docRazonSocial.includes(razonSocial.toUpperCase()) && razonSocial!=""){
            listaClientes.push({nc:docNombreCliente,rz:docRazonSocial,c:docCuit,id:docId})
          } else if (docCuit.includes(cuit.toUpperCase()) && cuit!=""){
            listaClientes.push({nc:docNombreCliente,rz:docRazonSocial,c:docCuit,id:docId})
          }

        });

        if(listaClientes.length>0){
          cargarCoincidenciasClientes(listaClientes);
        } else {
          clienteObject = {
            nombreCliente : nombreCliente,
            razonSocial : razonSocial,
            cuit : cuit,
            vigente : estado,
            domicilio : domicilio,
            coordenadas : coordenadas,
            mostrarUbicacion : mostrarUbicacion,
          }
          db.collection("clientes")
          .add(clienteObject)
          .then(function(doc){
            clienteObject.id = doc.id;
            mensajeOk();
            listadoClientesClient();
          })
          .catch(function(error){
            console.log("Error al intentar cargar cliente nuevo",error);
          });
        }
      })
      .catch(function(error){
        console.log("Error al verificar los Clientes cargados",error);
      });

    }
  }

}

function cargarCoincidenciasClientes(listaClientes){

  let table="";

  if ( $.fn.dataTable.isDataTable("#tabla-coincidencia") ) {
    table = $("#tabla-coincidencia").DataTable();
    table.clear();
  }
  else {
    table = $("#tabla-coincidencia").DataTable({
      paging: false,
      searching: false,
      ordering:  false,
      info: false,
      columns: [
          { data: 'nc' },
          { data: 'rz' },
          { data: 'c' },
          {
              data: 'id',
              render: function ( data, type, row ) {
                  return "<a href='javascript:void(0)'>Ver Cliente</a>";
              }
          }
      ],
    });
  }

  listaClientes.forEach(function(item){
    table.row.add(item).draw();
  })

  $('#tabla-coincidencia tbody').on( 'click', 'td', function () {
      let idCliente = table.cell(this).data();
      $("#coincidencia-clientes").modal("hide");
      mostrarClienteDesdeTabla(idCliente);
  });

  $("#coincidencia-clientes").modal("show");
}

function mostrarClienteDesdeTabla(idCliente){

  $("#tab-cliente").hide(200);

  db.collection("clientes").doc(idCliente)
  .get()
  .then(function(doc) {
    clienteObject = doc.data();
    clienteObject.id = doc.id;
    cargarDatosBasicosCliente(clienteObject)
  }).
  catch(function(error){
    console.log("Error al buscar Cliente",error);
  });

  $("#btnModificarCliente").prop("disabled", false);
}

function cancelarCambiosCliente(){
  $("#tab-cliente").hide(300);
}

function checkCoordenadas(){

  $("#checkDomicilio").change(function(){
    cargarCoordMapa();
  });

  $("#checkCoordenadas").change(function(){
    cargarCoordMapa();
  });
}

function cargarCoordMapa(){

  if($("#checkDomicilio").prop("checked")){
    let provincia="";
    let departamento="";
    if($("#provincia").val()=="CIUDAD AUTÓNOMA DE BUENOS AIRES"){
      provincia="CABA";
      departamento="";
    } else {
      provincia=$("#provincia").val();
      departamento=$("#departamento").val();
    }
    $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+$("#calle").val()+$("#nroPuerta").val()
    +$("#localidad").val()+departamento+provincia+$("#pais").val()+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
  } else {
    $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+$("#lat").val()+","+$("#lon").val()+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
  }

}

function cargarCoordenadas(){
  if($("#checkCoordenadas").is(':checked')) {
      let lat = $("#lat").val();
      let lon = $("#lon").val();
      $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+lat+","+lon+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
  }
}

function cargarProvincia(){

  return new Promise(function(resolve,reject){
    fetch("https://apis.datos.gob.ar/georef/api/provincias?&orden=nombre")
      .then(res => res.json())
      .then((out) => {
          desplegableProvincia(out.provincias);
          resolve();
      }).catch(err => {
        console.error(err);
        resolve();
      });
  });

}

function desplegableProvincia(listaProvincias){

  let datalist = document.getElementById("dataListPcia");

  $("#dataListPcia").empty();

  listaProvincias.forEach(function(item){
     let option = document.createElement("option");
     option.value = mayus(item.nombre);
     datalist.appendChild(option);
  });

}

function cargarDepartamentos(){

  return new Promise(function(resolve,reject){

  let provincia = $("#provincia").val();

  if(provincia!=""){
    if(provincia=="CIUDAD AUTÓNOMA DE BUENOS AIRES"){
      $("#departamento").val("Ciudad Autónoma de Buenos Aires")
      desplegableDepartamentos([{nombre : "Ciudad Autónoma de Buenos Aires"}]);
      resolve();
    } else {
      fetch("https://apis.datos.gob.ar/georef/api/departamentos?provincia="+provincia+"&orden=nombre&max=150&exacto=true")
        .then(res => res.json())
        .then((out) => {
            desplegableDepartamentos(out.departamentos);
            resolve();
        }).catch(err => {
          console.error(err);
          resolve();
        });
    }
  } else {
    mensajeErrorShow(0);
    resolve();
    $("#dataListDepto").empty();
  }

  });

}

function desplegableDepartamentos(listaDepartamentos){

  let datalist = document.getElementById("dataListDepto");

  $("#dataListDepto").empty();

  listaDepartamentos.forEach(function(item){
     let option = document.createElement("option");
     option.value = mayus(item.nombre);
     datalist.appendChild(option);
  });

}

function cargarLocalidades(){

  return new Promise(function(resolve,reject){

  let provincia = $("#provincia").val();
  let departamento = $("#departamento").val();

  if (provincia!="" && departamento!=""){
    if(provincia=="CIUDAD AUTÓNOMA DE BUENOS AIRES"){
      fetch("https://apis.datos.gob.ar/georef/api/localidades?provincia="+provincia+"&orden=nombre&max=150&exacto=true")
        .then(res => res.json())
        .then((out) => {
          if(out.localidades.length==0){
            mensajeErrorShow(1);
            $("#dataListLocal").empty();
            resolve();
          } else {
            mensajeErrorHide();
            desplegableLocalidades(out.localidades);
            resolve();
          }

        }).catch(err => {
          console.error(err);
          resolve();
        });
    } else {
      fetch("https://apis.datos.gob.ar/georef/api/localidades?provincia="+provincia+"&departamento="+departamento+"&orden=nombre&max=150&exacto=true")
        .then(res => res.json())
        .then((out) => {
          if(out.localidades.length==0){
            mensajeErrorShow(1);
            $("#dataListLocal").empty();
            resolve();
          } else {
            mensajeErrorHide();
            desplegableLocalidades(out.localidades);
            resolve();
          }
        }).catch(err => {
          console.error(err);
          resolve();
        });
    }
  } else {
    mensajeErrorShow(0);
    $("#dataListLocal").empty();
    resolve();
  }

  });

}

function desplegableLocalidades(listaLocalidades){

  let datalist = document.getElementById("dataListLocal");

  $("#dataListLocal").empty();

  listaLocalidades.forEach(function(item){
     let option = document.createElement("option");
     option.value = mayus(item.nombre);
     datalist.appendChild(option);
  });

}

function cargarCalles(){

  return new Promise(function(resolve,reject){

  let provincia = $("#provincia").val();
  let departamento = $("#departamento").val();

  if (provincia!="" && departamento!=""){
    if(provincia=="CIUDAD AUTÓNOMA DE BUENOS AIRES"){
      fetch("https://apis.datos.gob.ar/georef/api/calles?provincia="+provincia+"&orden=nombre&max=3000&exacto=true")
        .then(res => res.json())
        .then((out) => {
            if(out.calles.length==0){
              mensajeErrorShow(1);
              $("#dataListCalles").empty();
              resolve();
            } else {
              mensajeErrorHide();
              desplegableCalles(out.calles);
              resolve();
            }

        }).catch(err => {
          console.error(err);
          resolve();
        });
    } else {
      fetch("https://apis.datos.gob.ar/georef/api/calles?provincia="+provincia+"&departamento="+departamento+"&orden=nombre&max=1000&exacto=true")
        .then(res => res.json())
        .then((out) => {
            if(out.calles.length==0){
              mensajeErrorShow(1);
              $("#dataListCalles").empty();
              resolve();
            } else {
              mensajeErrorHide();
              desplegableCalles(out.calles);
              resolve();
            }

        }).catch(err => {
          console.error(err);
          resolve();
        });
    }
  } else {
    mensajeErrorShow(0);
    $("#dataListCalles").empty();
    resolve();
  }

  });

}

function desplegableCalles(listadoCalles){

  let datalist = document.getElementById("dataListCalles");

  $("#dataListCalles").empty();

  listadoCalles.forEach(function(item){
     let option = document.createElement("option");
     option.value = mayus(item.nombre);
     datalist.appendChild(option);
  });

}

function cargarDeptoLocalCalles(){
    cargarDepartamentos()
    .then(function(){
        cargarLocalidades()
        .then(function(){
            cargarCalles();
        });
    });
}

function cargarLocalCalles(){
    cargarLocalidades()
    .then(function(){
        cargarCalles();
    });
}

function mensajeErrorCampoVacio(title){
  Swal.fire({
    icon: 'error',
    title: title,
    text: 'Por favor complete el campo faltante',
    // footer: '<a href>Why do I have this issue?</a>'
  })
}

function mensajeErrorShow(error){

  if (error==0){
    $("#mensajeError").text('Falta ingresar la Provincia o Departamento');
    $("#mensajeError").show(300);
    console.log('Falta ingresar la Provincia o Departamento');
  } else if (error==1){
    $("#mensajeError").text('No existen localidades o calles con esta combinacion de Provincia y Departamento');
    $("#mensajeError").show(300);
    console.log('No existen localidades ni calles con esta combinacion de Provincia y Departamento');
  } else if (error==2){
    $("#mensajeError").text('Debe ingresar un Estado VIGENTE o NO VIGENTE');
    $("#mensajeError").show(300);
  }

}

function mensajeErrorHide(){
  $("#mensajeError").hide(300);
}

function validarEstado(){

  if( $("#estado").val()!="VIGENTE" && $("#estado").val()!="NO VIGENTE"){
    mensajeErrorShow(2);
  } else {
    mensajeErrorHide();
  }
}

function cambiarEstadoInactivo(){

  $("#estadoActivo").prop("enable",false);
  $("#estadoActivo").removeClass("btn-success");
  $("#estadoActivo").addClass("btn-default");

  $("#estadoInactivo").prop("enable",true);
  $("#estadoInactivo").removeClass("btn-default");
  $("#estadoInactivo").addClass("btn-danger");

}

function cambiarEstadoActivo(){

  $("#estadoInactivo").prop("enable",false);
  $("#estadoInactivo").removeClass("btn-danger");
  $("#estadoInactivo").addClass("btn-default");

  $("#estadoActivo").prop("enable",true);
  $("#estadoActivo").removeClass("btn-default");
  $("#estadoActivo").addClass("btn-success");

}

function inicializarFormularioCliente(){

  $("#nombreCliente").val("");
  $("#razonSocial").val("");
  $("#cuit").val("");
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
  $("#checkCoordenadas").prop("checked", false);
  $("#checkDomicilio").prop("checked", true);
  $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&ie=UTF8&t=&z=14&iwloc=B&output=embed");

}

function cerrarModalCoincidencia(){
  allFieldsEnable();
  $("#btnGuardarCliente").prop("disabled", false);
  $("#btnCancelarCliente").prop("disabled", false);
  $("#btnModificarCliente").prop("disabled", true);
}

function mayus(str) {
    return str.toUpperCase();
}

function asignarValores(value){

  if(value===undefined){
    return "";
  } else {
    return mayus(value);
  }

}

function cargarDataListDomicilio(){
  cargarProvincia()
  .then(function(){
    cargarDepartamentos()
    .then(function(){
        cargarLocalidades()
        .then(function(){
            cargarCalles()
            .then(function(){
              mensajeErrorHide();
            });
        });
    });
  });
}

function inicializarFuncionesClient(){
  listadoClientesClient("dataListClient","TODOS",false);
  formatoInputs();
  checkCoordenadas();
  enforcingValueDataList();
}

// Fin Funciones Tab Datos Basicos
