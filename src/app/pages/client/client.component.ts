import { Component, OnInit } from '@angular/core';

declare var jQuery: any;
declare var $: any;
declare var inicializarFuncionesClient: any;

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    inicializarFuncionesClient();
  }

}
