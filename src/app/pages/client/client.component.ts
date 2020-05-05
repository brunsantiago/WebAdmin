import { Component, OnInit } from '@angular/core';

declare var jQuery: any;
declare var $: any;
declare var listadoClientesClient: any;
declare var formatoCuit: any;
declare var checkCoordenadas: any;

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    listadoClientesClient();
    formatoCuit();
    checkCoordenadas();
  }

}
