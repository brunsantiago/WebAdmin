
// Listado Desplegable de Clientes Nombre Cliente + Razon social (data: IdCliente)
function listadoClientesClient(idDataList,nombreCliente,allClients){
  let listadoClientes = [];
  if (nombreCliente=="TODOS"){
    db.collection("clientes").orderBy("nombreCliente")
    .get()
    .then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
          let item = {
            nc : doc.data().nombreCliente,
            rs : doc.data().razonSocial,
            id : doc.id,
          };
          listadoClientes.push(item);
        });
        desplegableClientesClient(listadoClientes,idDataList,allClients);
      });
  }else{
    db.collection("clientes").where("nombreCliente","==",nombreCliente)
    .get()
    .then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
          let item = {
            nc : doc.data().nombreCliente,
            rs : doc.data().razonSocial,
            id : doc.id,
          };
          listadoClientes.push(item);
        });
        desplegableClientesClient(listadoClientes,idDataList,allClients);
      });
  }

}

function desplegableClientesClient(listadoClientes,idDataList,allClients){

  var datalist = document.getElementById(idDataList);

  $("#"+idDataList).empty();

  if(allClients){
    var option = document.createElement("option");
    option.value = "TODOS";
    datalist.appendChild(option);
  }

  listadoClientes.forEach(function(item){
     var option = document.createElement("option");
     option.text = item.rs;
     option.value = item.nc;
     option.setAttribute("data-id",item.id);
     datalist.appendChild(option);
  });
}

// Listado desplegable de Objetivos Nombre Objetivo (data: IdObjetivo)
function listadoObjetivosBranch(idSelectClient,idSelectBranch,idDataList,nombreObjetivo,allBranch){

  let listadoObjetivos = [];
  let nombreCliente = $("#"+idSelectClient).val();

  $("#"+idSelectBranch).val("");

  db.collection("clientes").where("nombreCliente","==",nombreCliente)
    .get()
    .then(function(querySnapshot) {
      if(querySnapshot.empty){
        desplegableObjetivosBranch(listadoObjetivos,idSelectClient,idSelectBranch,idDataList);
      }else{
        querySnapshot.forEach(function(doc) {
          idClienteGlobal = doc.id;
          if(nombreObjetivo=="TODOS"){
            db.collection("clientes").doc(doc.id).collection("objetivos")
            .get()
            .then(function(querySnapshot) {
              querySnapshot.forEach(function(doc) {
                let item = {
                  no : doc.data().nombreObjetivo,
                  id : doc.id,
                };
                listadoObjetivos.push(item);
              });
              desplegableObjetivosBranch(listadoObjetivos,idSelectClient,idSelectBranch,idDataList,allBranch);
            });
          }else{
            db.collection("clientes").doc(doc.id).collection("objetivos").where("nombreObjetivo","==",nombreObjetivo)
            .get()
            .then(function(querySnapshot) {
              querySnapshot.forEach(function(doc) {
                let item = {
                  no : doc.data().nombreObjetivo,
                  id : doc.id,
                };
                listadoObjetivos.push(item);
              });
              desplegableObjetivosBranch(listadoObjetivos,idSelectClient,idSelectBranch,idDataList,allBranch);
            });
          }

        })
      }
    });
}

function desplegableObjetivosBranch(listadoObjetivos,idSelectClient,idSelectBranch,idDataList,allBranch){

  let datalist = document.getElementById(idDataList);
  $("#"+idDataList).empty();

  if($("#"+idSelectClient).val()=="TODOS"){
    $("#"+idSelectBranch).val("TODOS");
  } else if($("#"+idSelectClient).val()==""){
    $("#"+idSelectBranch).attr("placeholder", "Esperando un cliente...");
  } else if(listadoObjetivos.length==0){
    $("#"+idSelectBranch).attr("placeholder", "Sin objetivos");
  } else {
      $("#"+idSelectBranch).attr("placeholder", "Seleccione un objetivo");
      if(allBranch==true){
        let option = document.createElement("option");
        option.value = "TODOS";
        datalist.appendChild(option);
      }
      listadoObjetivos.forEach(function(item){
         let option = document.createElement("option");
         option.value = mayus(item.no);
         option.setAttribute("data-id",item.id);
         datalist.appendChild(option);
      });
  }
}
