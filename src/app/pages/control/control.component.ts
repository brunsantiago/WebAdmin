import { Component, OnInit, AfterViewInit } from '@angular/core';

import { BsDatepickerConfig, BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';

import { FormControl, FormGroup, FormsModule } from '@angular/forms';

declare var jQuery: any;
declare var $: any;
declare var inicializarFuncionesControl: any;

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.css']
})

export class ControlComponent implements OnInit {

  ngOnInit() {
    inicializarFuncionesControl();
  }

}
