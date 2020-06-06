import { Component, OnInit } from '@angular/core';

declare var jQuery: any;
declare var $: any;
declare var inicializarFuncionesDispositivos: any;

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css']
})
export class DeviceComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    inicializarFuncionesDispositivos();
  }

}
