
//Carga Inicial

let clienteObject;

function listadoClientesClient(){
  let listadoClientes = [];
  db.collection("clientes").orderBy("nombreCliente")
  .get()
  .then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        let item = {
          nc : doc.data().nombreCliente,
          rs : doc.data().razonSocial,
        };
        listadoClientes.push(item);
      });
      desplegableClientesClient(listadoClientes);
    });
    //Se cargan los listados de los select departamento, localidades
    //cargarDepartamentos();
}

function desplegableClientesClient(listadoClientes){
  var datalist = document.getElementById("dataListClient");
  listadoClientes.forEach(function(item){
     var option = document.createElement("option");
     option.text = item.rs;
     option.value = item.nc;
     datalist.appendChild(option);
  });
}

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

  $("#tab-cliente").hide(200);

  let cliente = $("#cliente").val();

  db.collection("clientes").where("nombreCliente","==",cliente)
  .get()
  .then(function(querySnapshot) {
    if (querySnapshot.empty){
      console.log("No se econtro el Cliente");
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

  vaciarFormularioCliente();

  $("#tab-cliente").show(200);

}

function cargarDatosBasicosCliente(doc){

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

  if(doc.coordenadas!=undefined && doc.coordenadas!=""){
    let lat = asignarValores(doc.coordenadas.lat);
    let lon = asignarValores(doc.coordenadas.lon);
    $("#lat").val(lat);
    $("#lon").val(lon);
    $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+lat+","+lon+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
    $("#checkCoordenadas").prop("checked", true);
  } else {
    if(provincia=="CIUDAD AUTÓNOMA DE BUENOS AIRES"){
      provincia="CABA";
    }
    $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+calle+nroPuerta+localidad+departamento+provincia+pais+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
  }

  $("#tab-cliente").show(200);

}

function modificarDatosCliente(){

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
  $("#estadoActivo").prop("disabled",false);
  $("#estadoInactivo").prop("disabled",false);
  $("#checkCoordenadas").prop("disabled", false);
  $("#btnGuardarCliente").prop("disabled", false);
  $("#btnCancelarCliente").prop("disabled", false);

  cargarProvincia();

  cargarDepartamentos();

  cargarLocalidades();

  cargarCalles();

}

function guardarCambiosCliente(){

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
  $("#estadoActivo").prop("disabled",true);
  $("#estadoInactivo").prop("disabled",true);
  $("#checkCoordenadas").prop("disabled", true);
  $("#btnGuardarCliente").prop("disabled", true);
  $("#btnCancelarCliente").prop("disabled", true);


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

  let coordenadas="";

  if($("#checkCoordenadas").prop('checked')){
    coordenadas = {
      lat : $("#lat").val(),
      lon : $("#lon").val(),
    }
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
        }

        db.collection("clientes")
        .add(clienteObject)
        .then(function(doc){
          clienteObject.id=doc.id;
          mensajeOk();
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
}

function cancelarCambiosCliente(){

  cargarDatosBasicosCliente(clienteObject)

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
  $("#estadoActivo").prop("disabled",true);
  $("#estadoInactivo").prop("disabled",true);
  $("#checkCoordenadas").prop("disabled", true);
  $("#btnGuardarCliente").prop("disabled", true);
  $("#btnCancelarCliente").prop("disabled", true);

}

function checkCoordenadas(){
  $("#checkCoordenadas").change(function(){
    if($(this).is(':checked')) {
        // Checkbox is checked..
        let lat = $("#lat").val();
        let lon = $("#lon").val();
        $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+lat+","+lon+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
    } else {
        // Checkbox is not checked..
        let provincia="";
        if($("#provincia").val()=="CIUDAD AUTÓNOMA DE BUENOS AIRES"){
          provincia="CABA";
        } else {
          provincia=$("#provincia").val();
        }

        $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+$("#calle").val()+" "+$("#nroPuerta").val()
        +" "+$("#localidad").val()+" "+$("#departamento").val()+" "+provincia+" "+$("#pais").val()+" "+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
    }
  });
}

function cargarCoordDomicilio(){
  let provincia="";
  if($("#provincia").val()=="CIUDAD AUTÓNOMA DE BUENOS AIRES"){
    provincia="CABA";
  } else {
    provincia=$("#provincia").val();
  }

  $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+$("#calle").val()+$("#nroPuerta").val()
  +$("#localidad").val()+$("#departamento").val()+provincia+$("#pais").val()+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
}

function cargarCoordenadas(){
  if($("#checkCoordenadas").is(':checked')) {
      // Checkbox is checked..
      let lat = $("#lat").val();
      let lon = $("#lon").val();
      $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&q="+lat+","+lon+"&ie=UTF8&t=&z=14&iwloc=B&output=embed");
  }
}

function cargarProvincia(){

  fetch("https://apis.datos.gob.ar/georef/api/provincias?&orden=nombre")
    .then(res => res.json())
    .then((out) => {
        desplegableProvincia(out.provincias);
    }).catch(err => console.error(err));

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

  let provincia = $("#provincia").val();

  if(provincia!=""){
    fetch("https://apis.datos.gob.ar/georef/api/departamentos?provincia="+provincia+"&orden=nombre&max=150&exacto=true")
      .then(res => res.json())
      .then((out) => {
          desplegableDepartamentos(out.departamentos);
      }).catch(err => console.error(err));
  } else {
    mensajeErrorShow(0);
  }

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

  let provincia = $("#provincia").val();
  let departamento = $("#departamento").val();

  if (provincia!="" && departamento!=""){
    fetch("https://apis.datos.gob.ar/georef/api/localidades?provincia="+provincia+"&departamento="+departamento+"&orden=nombre&max=150&exacto=true")
      .then(res => res.json())
      .then((out) => {
        if(out.localidades.length==0){
          mensajeErrorShow(1);
        } else {
          mensajeErrorHide();
          desplegableLocalidades(out.localidades);
        }

      }).catch(err => console.error(err));
  } else {
    mensajeErrorShow(0);
  }

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

  let provincia = $("#provincia").val();
  let departamento = $("#departamento").val();

  if (provincia!="" && departamento!=""){
    fetch("https://apis.datos.gob.ar/georef/api/calles?provincia="+provincia+"&departamento="+departamento+"&orden=nombre&max=1000&exacto=true")
      .then(res => res.json())
      .then((out) => {
          if(out.calles.length==0){
            mensajeErrorShow(1);
          } else {
            mensajeErrorHide();
            desplegableCalles(out.calles);
          }

      }).catch(err => console.error(err));
  } else {
    mensajeErrorShow(0);
  }

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
  cargarDepartamentos();
  cargarLocalidades();
  cargarCalles();
}

function cargarLocalCalles(){
  cargarLocalidades();
  cargarCalles();
}

function mensajeErrorShow(error){
  if (error==0){
    $("#mensajeError").text('Falta ingresar la Provincia o Departamento');
    $("#mensajeError").show(300);
  } else if (error==1){
    $("#mensajeError").text('No existen localidades ni calles con esta combinacion de Provincia y Departamento');
    $("#mensajeError").show(300);
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

function vaciarFormularioCliente(){

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
  $("#estadoActivo").prop("disabled",false);
  $("#estadoInactivo").prop("disabled",false);
  $("#checkCoordenadas").prop("disabled", false);
  $("#btnGuardarCliente").prop("disabled", false);

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
  $("#googleMap").attr("src", "https://maps.google.com/maps?&hl=es&ie=UTF8&t=&z=14&iwloc=B&output=embed");

  clienteObject=""; // Se vacia la variable global clienteObject

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

// Fin Funciones Tab Datos Basicos
